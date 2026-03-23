#!/usr/bin/env node

/**
 * Syncs content from this repo to Whop.
 *
 * V1: Full replace — deletes all existing content and recreates from repo state.
 * This is stateless and simple. Future V2 could diff and update selectively.
 *
 * Required env vars:
 * - WHOP_API_KEY
 * - WHOP_PRODUCT_ID
 * - WHOP_COMPANY_ID
 *
 * Usage: node scripts/sync-to-whop.mjs
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { join, basename, extname } from "node:path";

const API_BASE = "https://api.whop.com/api/v1";
const API_KEY = process.env.WHOP_API_KEY;
const PRODUCT_ID = process.env.WHOP_PRODUCT_ID;
const COMPANY_ID = process.env.WHOP_COMPANY_ID;

if (!API_KEY || !PRODUCT_ID || !COMPANY_ID) {
  console.error(
    "Missing required env vars: WHOP_API_KEY, WHOP_PRODUCT_ID, WHOP_COMPANY_ID",
  );
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// ======================================================
// Whop API helpers
// ======================================================

async function whopFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { headers, ...options });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Whop API ${options.method ?? "GET"} ${path} failed (${res.status}): ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

async function whopPost(path, body) {
  return whopFetch(path, { method: "POST", body: JSON.stringify(body) });
}

async function whopPatch(path, body) {
  return whopFetch(path, { method: "PATCH", body: JSON.stringify(body) });
}

async function whopDelete(path) {
  return whopFetch(path, { method: "DELETE" });
}

// ======================================================
// Parse frontmatter from markdown files
// ======================================================

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return { meta, body: match[2] };
}

// ======================================================
// Read course content from filesystem
// ======================================================

async function readCourseContent() {
  const courseDir = join(process.cwd(), "content", "course");
  const chapters = [];

  let chapterDirs;
  try {
    chapterDirs = (await readdir(courseDir)).sort();
  } catch {
    console.log("No content/course directory found, skipping course sync.");
    return [];
  }

  for (const chapterDirName of chapterDirs) {
    const chapterPath = join(courseDir, chapterDirName);
    const chapterStat = await stat(chapterPath);
    if (!chapterStat.isDirectory()) continue;

    // Read chapter metadata
    let chapterMeta = { title: chapterDirName, description: "" };
    try {
      const chapterFile = await readFile(join(chapterPath, "_chapter.md"), "utf-8");
      const { meta } = parseFrontmatter(chapterFile);
      chapterMeta = { ...chapterMeta, ...meta };
    } catch {
      // No _chapter.md, use directory name as title
    }

    // Read lessons
    const files = (await readdir(chapterPath)).sort();
    const lessons = [];
    for (const file of files) {
      if (file === "_chapter.md") continue;
      if (extname(file) !== ".md") continue;

      const content = await readFile(join(chapterPath, file), "utf-8");
      const { meta, body } = parseFrontmatter(content);

      lessons.push({
        title: meta.title ?? basename(file, ".md"),
        type: meta.type ?? "text",
        content: body.trim(),
        embed_id: meta.embed_id,
        embed_type: meta.embed_type,
      });
    }

    chapters.push({ ...chapterMeta, lessons });
  }

  return chapters;
}

// ======================================================
// Sync to Whop
// ======================================================

async function deleteExistingCourses() {
  // List existing courses for this product's experiences
  const coursesRes = await whopFetch(`/courses?company_id=${COMPANY_ID}`);
  const courses = coursesRes?.data ?? [];

  for (const course of courses) {
    try {
      await whopDelete(`/courses/${course.id}`);
      console.log(`  Deleted course: ${course.id}`);
    } catch (err) {
      console.warn(`  Warning: Could not delete course ${course.id}:`, err.message);
    }
  }
}

async function createCourse(chapters) {
  if (chapters.length === 0) {
    console.log("No chapters to create.");
    return;
  }

  // Create a course
  const course = await whopPost("/courses", {
    company_id: COMPANY_ID,
    title: "Course",
  });
  console.log(`  Created course: ${course.id}`);

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];

    // Create chapter
    const createdChapter = await whopPost("/course-chapters", {
      course_id: course.id,
      title: chapter.title,
      ...(chapter.description && { description: chapter.description }),
    });
    console.log(`  Created chapter: ${createdChapter.id} — ${chapter.title}`);

    for (let j = 0; j < chapter.lessons.length; j++) {
      const lesson = chapter.lessons[j];

      const lessonPayload = {
        chapter_id: createdChapter.id,
        title: lesson.title,
        lesson_type: lesson.type,
        ...(lesson.content && { content: lesson.content }),
        ...(lesson.embed_id && { embed_id: lesson.embed_id }),
        ...(lesson.embed_type && { embed_type: lesson.embed_type }),
      };

      const createdLesson = await whopPost("/course-lessons", lessonPayload);
      console.log(`    Created lesson: ${createdLesson.id} — ${lesson.title}`);
    }
  }
}

async function updateProductDescription() {
  try {
    const description = await readFile(
      join(process.cwd(), "product", "description.md"),
      "utf-8",
    );
    const headline = (
      await readFile(join(process.cwd(), "product", "headline.txt"), "utf-8")
    ).trim();

    await whopPatch(`/products/${PRODUCT_ID}`, {
      ...(description && { description: description.trim() }),
      ...(headline && { headline }),
    });
    console.log("  Updated product description and headline.");
  } catch (err) {
    console.warn("  Warning: Could not update product description:", err.message);
  }
}

async function syncVisibility() {
  try {
    const configRaw = await readFile(
      join(process.cwd(), "whop.config.json"),
      "utf-8",
    );
    const config = JSON.parse(configRaw);

    if (config.visibility) {
      await whopPatch(`/products/${PRODUCT_ID}`, {
        visibility: config.visibility,
      });
      console.log(`  Set product visibility to: ${config.visibility}`);
    }
  } catch (err) {
    console.warn("  Warning: Could not sync visibility:", err.message);
  }
}

// ======================================================
// Main
// ======================================================

async function main() {
  console.log("Syncing content to Whop...");
  console.log(`  Product: ${PRODUCT_ID}`);
  console.log(`  Company: ${COMPANY_ID}`);

  console.log("\n1. Reading course content from filesystem...");
  const chapters = await readCourseContent();
  console.log(`  Found ${chapters.length} chapter(s)`);

  console.log("\n2. Deleting existing courses on Whop...");
  await deleteExistingCourses();

  console.log("\n3. Creating courses on Whop...");
  await createCourse(chapters);

  console.log("\n4. Updating product description...");
  await updateProductDescription();

  console.log("\n5. Syncing visibility...");
  await syncVisibility();

  console.log("\nSync complete.");
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
