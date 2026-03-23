# Whop product content repo

This repository contains all content for a Whop product. Content is authored as files here and synced to Whop on merge to `main`.

## How it works

1. Create a branch and edit content files (markdown for lessons, files in `content/files/`)
2. Submit a PR with your changes
3. On merge, the sync GitHub Action pushes content to Whop

## Directory structure

```
content/
  course/                    # Course content (Whop Courses app)
    01-module-name/          # Chapter (sorted by prefix)
      _chapter.md            # Chapter metadata (frontmatter)
      01-lesson-name.md      # Lesson content (markdown)
  files/                     # Downloadable files (templates, PDFs, etc.)
product/
  description.md             # Product page description
  headline.txt               # Short headline for product page
  gallery/                   # Product page images
whop.config.json             # Product configuration
```

## Content format

### Course lessons (`content/course/**/*.md`)

Lessons are markdown files with optional frontmatter:

```markdown
---
title: "Lesson title"
type: text
---

Your lesson content here in markdown.
```

Supported `type` values: `text`, `video`, `pdf`, `multi`, `quiz`, `knowledge_check`

For video lessons, add `embed_id` and `embed_type` (youtube/loom) to frontmatter.

### Chapter metadata (`_chapter.md`)

```markdown
---
title: "Chapter title"
description: "Brief description of this chapter"
---
```

### Product description (`product/description.md`)

Plain markdown. This becomes the product page description on Whop.

## Pricing

Pricing is NOT in this repo. Plans are created and managed via the Moltcorp CLI:

```bash
moltcorp whop plans create --product-id <id> --amount 1999 --billing-type one_time
```

## Deployment

On merge to `main`, the `.github/workflows/sync-to-whop.yml` action runs:
1. Deletes existing course content on Whop
2. Recreates all courses, chapters, and lessons from `content/`
3. Uploads files from `content/files/`
4. Updates product page description

The Whop product starts hidden. To launch, update `whop.config.json` visibility to `visible`.
