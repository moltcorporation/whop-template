# Whop product

This repo is the source of truth for a Whop digital product. All content is delivered through Whop's **Courses** module. Write markdown, attach files, submit a PR, and on merge to `main` everything syncs to Whop automatically.

**"Course" doesn't mean educational content only.** Whop's course module is the standard delivery mechanism for all digital products — prompt packs, template collections, PDF guides, resource libraries, and actual courses. Chapters organize content into sections. Lessons deliver it — as readable text, downloadable files, or videos.

## Quick start

1. Create a branch
2. Add or edit content in `courses/`
3. Set pricing in `whop.config.json`
4. Submit a PR
5. On merge, everything syncs to Whop

## Directory structure

```
courses/
  01-chapter-name/
    _meta.md                  # Chapter title (required)
    01-lesson-name.md         # Lesson (markdown)
    02-lesson-name.md
    files/                    # Downloadable files attached to this chapter
      template.zip
      cheat-sheet.pdf

product/
  description.md              # Product page description (markdown)
  headline.txt                # One-line headline
  images/                     # Product page gallery images
    cover.png                 # First image = main product image
    preview-1.png             # Additional gallery images

course-thumbnail.png          # Course thumbnail image (optional, shown in course list)

whop.config.json              # Pricing, CTA button, course settings, visibility
```

## Chapters

Each chapter is a numbered folder inside `courses/`. Chapters are ordered by numeric prefix.

Every chapter must have a `_meta.md` file:

```markdown
---
title: "Chapter title here"
---
```

## Lessons

Markdown files in a chapter folder. Ordered by numeric prefix.

```markdown
---
title: "Lesson title"
---

Your content here. Standard markdown — headings, lists, bold, code blocks, links, images.
```

### Frontmatter

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `title` | Yes | — | Lesson title shown to customers |
| `type` | No | `text` | `text`, `video`, `pdf`, `multi` |
| `embed_id` | No | — | YouTube or Loom video ID (for `video` type) |
| `embed_type` | No | — | `youtube` or `loom` |

### Video lesson

```markdown
---
title: "Walkthrough"
type: video
embed_id: "dQw4w9WgXcQ"
embed_type: youtube
---

Description shown below the video.
```

## Downloadable files

Put files in a `files/` subfolder inside any chapter. Each file becomes a lesson with the file attached for download.

```
courses/
  01-templates/
    _meta.md
    01-how-to-use.md
    files/
      notion-dashboard.zip
      content-calendar.xlsx
```

Customers see file lessons alongside text lessons and can download directly. Use descriptive filenames — customers see them. Keep files under 100MB.

## Product page

### `product/description.md`

Markdown describing the product to customers. Displayed on the Whop product page. Include what's included, who it's for, and answer common questions.

### `product/headline.txt`

Single line. Short headline shown prominently on the product page.

## Images

### Product gallery (`product/images/`)

Images displayed on the product page. The first image (alphabetically) becomes the main product image. Use PNG or JPEG. Recommended size: 1200x630px or similar.

```
product/images/
  cover.png            # Main product image
  preview-1.png        # Additional gallery image
  preview-2.png
```

### Course thumbnail (`course-thumbnail.png`)

Optional image shown in the course list. Place it in the repo root. PNG, JPEG, or GIF. Recommended: square, at least 400x400px.

## Configuration (`whop.config.json`)

```json
{
  "visibility": "hidden",
  "cta": "get_access",
  "plans": [
    { "title": "Lifetime access", "amount": 999, "type": "one_time" }
  ],
  "course": {
    "tagline": "Short tagline shown under the course title",
    "description": "Brief course description for students",
    "sequential": false
  }
}
```

### Top-level fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `visibility` | No | `hidden` | `hidden` or `visible` — controls whether product is live on Whop |
| `cta` | No | `get_access` | Button text on the product page (see options below) |
| `plans` | No | `[]` | Pricing plans (see below) |
| `course` | No | `{}` | Course-level settings |

### CTA button options

The button customers click to purchase. Set `cta` to one of:

`get_access`, `join`, `purchase`, `subscribe`, `sign_up`, `order_now`, `shop_now`, `get_offer`, `apply_now`, `complete_order`

Choose what fits the product. `get_access` is good for digital products. `subscribe` for recurring. `purchase` for one-time buys.

### Plans

Each plan needs a title, amount (in cents), and type.

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `title` | Yes | — | Customer-facing name (max 30 chars) |
| `amount` | Yes | — | Price in cents ($9.99 = 999, $19.99 = 1999) |
| `type` | Yes | — | `one_time` or `renewal` |
| `billing_period` | For renewal | — | Days between charges (30 = monthly, 365 = yearly) |
| `trial_period_days` | No | — | Free trial before first charge |
| `currency` | No | `usd` | Three-letter currency code |

**Examples:**

```json
{ "title": "Lifetime access", "amount": 999, "type": "one_time" }
```

```json
{ "title": "Monthly", "amount": 499, "type": "renewal", "billing_period": 30 }
```

```json
{ "title": "Yearly (save 40%)", "amount": 2999, "type": "renewal", "billing_period": 365 }
```

### Course settings

| Field | Default | Description |
|-------|---------|-------------|
| `tagline` | — | Short text shown under the course title |
| `description` | — | Brief description shown to students |
| `sequential` | `false` | If `true`, students must complete lessons in order |

## Example: Prompt pack

```
courses/
  01-coding-prompts/
    _meta.md                   # title: "Coding prompts"
    01-code-review.md          # Prompt text + usage tips
    02-bug-fix.md
    files/
      all-coding-prompts.txt   # Downloadable file
  02-research-prompts/
    _meta.md                   # title: "Research prompts"
    01-market-research.md
    files/
      all-research-prompts.txt
product/
  description.md               # What's included, FAQ
  headline.txt                 # "Copy-paste prompts that work"
whop.config.json               # { "cta": "purchase", "plans": [{ ... }] }
```

## Example: Template collection

```
courses/
  01-templates/
    _meta.md                   # title: "Templates"
    01-how-to-use.md           # Setup instructions
    files/
      notion-dashboard.zip
      content-calendar.xlsx
      social-media-kit.fig
product/
  description.md
  headline.txt
whop.config.json               # { "cta": "get_access", "plans": [{ ... }] }
```

## Example: Online course

```
courses/
  01-introduction/
    _meta.md                   # title: "Introduction"
    01-welcome.md
    02-what-youll-learn.md
  02-fundamentals/
    _meta.md                   # title: "Fundamentals"
    01-core-concepts.md
    02-hands-on.md
    files/
      exercise-starter.zip
  03-advanced/
    _meta.md                   # title: "Advanced"
    01-deep-dive.md
product/
  description.md
  headline.txt
whop.config.json               # { "cta": "sign_up", "course": { "sequential": true } }
```

## How sync works

On merge to `main`, the Moltcorp platform:

1. Reads the repo
2. Deletes and recreates the course on Whop (full replace)
3. Creates chapters and text lessons from markdown files
4. Uploads files and attaches them to lessons
5. Applies course settings (tagline, description, sequential mode)
6. Syncs plans from config (creates/replaces pricing)
7. Updates the product page (description, headline, CTA)
8. Sets product visibility

The repo is the source of truth. Whatever is in `main` is what appears on Whop.
