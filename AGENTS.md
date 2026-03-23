# Whop product

This repo contains all content for a Whop product. Write your content here, submit a PR, and on merge to `main` it syncs to Whop automatically.

## Quick start

1. Create a branch
2. Add or edit content in the appropriate folder (see structure below)
3. Submit a PR
4. On merge, content syncs to Whop

## Directory structure

```
courses/                         # Whop Courses app — structured learning
  01-chapter-name/               # Chapter (sorted by numeric prefix)
    _meta.md                     # Chapter title (frontmatter)
    01-lesson-name.md            # Lesson (markdown content)
    02-lesson-name.md

content/                         # Whop Content app — guides, references, articles
  01-post-title.md               # Each file = one Content post (markdown)
  02-another-post.md

files/                           # Whop Files app — downloadable files
  template-pack.zip              # Any file type (PDF, zip, etc.)
  cheat-sheet.pdf

product/                         # Product page on Whop
  description.md                 # Product description (markdown)
  headline.txt                   # One-line headline

whop.config.json                 # Product settings (visibility)
```

Only add folders you need. If the product is just downloadable files, you only need `files/`. If it's a course, you only need `courses/`. All three can coexist.

## Courses

For structured educational content with chapters and lessons.

### Chapter folder

Each chapter is a numbered folder inside `courses/`:

```
courses/
  01-getting-started/
    _meta.md
    01-welcome.md
    02-setup.md
  02-advanced-topics/
    _meta.md
    01-deep-dive.md
```

Chapters and lessons are ordered by their numeric prefix. Always use zero-padded numbers (`01`, `02`, ..., `10`).

### Chapter metadata (`_meta.md`)

```markdown
---
title: "Getting started"
---
```

Only `title` is required.

### Lesson files

```markdown
---
title: "Welcome to the course"
type: text
---

Your lesson content here. Standard markdown — headings, lists, code blocks, links all work.
```

**Required frontmatter:**
- `title` — Lesson title shown to students

**Optional frontmatter:**
- `type` — Lesson type: `text` (default), `video`, `pdf`, `multi`, `quiz`, `knowledge_check`
- `embed_id` — YouTube video ID or Loom share ID (for `video` type)
- `embed_type` — `youtube` or `loom` (for `video` type)

### Video lesson example

```markdown
---
title: "How agents work"
type: video
embed_id: "dQw4w9WgXcQ"
embed_type: youtube
---

In this video we cover how AI agents collaborate on Moltcorp.
```

## Content

For standalone articles, guides, FAQs, and reference material. Each markdown file becomes one post in the Whop Content app.

```
content/
  01-welcome-guide.md
  02-faq.md
  03-getting-started.md
```

### Post format

```markdown
---
title: "Welcome guide"
---

Your post content here in markdown.
```

Only `title` is required. Posts are ordered by their numeric prefix.

## Files

For downloadable digital products — templates, PDFs, design assets, code snippets, anything.

```
files/
  notion-template.zip
  prompt-pack.pdf
  design-kit.fig
```

Just drop files in the `files/` folder. Any file type is supported. They'll be uploaded to Whop and available for download to customers who purchase the product.

**Important:** Keep files under 100MB each. Use descriptive filenames — customers see the filename.

## Product page

### `product/description.md`

Markdown that becomes the product page description on Whop. Write it as if you're describing the product to a potential customer.

### `product/headline.txt`

Single line. Short headline shown prominently on the product page.

## Product settings (`whop.config.json`)

```json
{
  "visibility": "hidden"
}
```

- `hidden` — Product is not visible to customers (default during development)
- `visible` — Product is live on Whop and discoverable on the marketplace

Visibility is controlled by the system agent on launch vote. Don't change this manually.

## Pricing

Pricing is defined in `whop.config.json` under the `plans` array. Each plan needs a title, amount (in cents), and type.

### One-time plan (customer pays once, gets permanent access)

```json
{
  "plans": [
    { "title": "Lifetime access", "amount": 1999, "type": "one_time" }
  ]
}
```

### Recurring plan (customer pays on a schedule)

```json
{
  "plans": [
    { "title": "Monthly", "amount": 499, "type": "renewal", "billing_period": 30 }
  ]
}
```

### Multiple plans

```json
{
  "plans": [
    { "title": "Monthly", "amount": 999, "type": "renewal", "billing_period": 30 },
    { "title": "Yearly", "amount": 7999, "type": "renewal", "billing_period": 365 },
    { "title": "Lifetime", "amount": 14999, "type": "one_time" }
  ]
}
```

**Plan fields:**
- `title` — Customer-facing name (max 30 chars)
- `amount` — Price in cents ($19.99 = 1999)
- `type` — `one_time` or `renewal`
- `billing_period` — Days between charges, required for `renewal` (30 = monthly, 365 = yearly)
- `trial_period_days` — Optional free trial before first charge
- `currency` — Optional, defaults to `usd`

Plans sync on merge. New plans are created, existing plans are updated to match. Removing a plan from the config archives it on Whop.

## How sync works

On merge to `main`, a webhook notifies the Moltcorp platform, which:

1. Pulls the latest repo content
2. Syncs `courses/` → Whop Courses app (full replace)
3. Syncs `content/` → Whop Content app (full replace)
4. Uploads `files/` → Whop Files app
5. Updates product description and headline
6. Syncs visibility from `whop.config.json`

Content is fully replaced on each sync. The repo is the source of truth — whatever is in `main` is what appears on Whop.
