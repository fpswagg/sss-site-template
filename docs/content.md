# Markdown content

SSS holds the business data. Everything else, like long texts, legal pages and news,
lives in this repo as markdown under [`content/`](../content).

```
content/
  pages/        one file = one page: about.md → /about
  posts/        one file = one news post: 2026-10-01-welcome.md → /blog/2026-10-01-welcome
```

Files starting with `_` are ignored.

## Pages

```markdown
---
title: Delivery & returns
description: Where we deliver and how returns work.   # under the title, and for search engines
nav: true                                            # show in the header menu
order: 2                                             # menu and footer position
draft: false                                         # true = only in `npm run dev`
---

Your text in **markdown**: lists, tables, links, images…
```

Every page also gets a link in the footer.

Two placeholders are filled in from SSS:

| Placeholder | Becomes |
| --- | --- |
| `{{about}}` | The about text written in SSS → Showcase |
| `{{business}}` | The business name |

The sample `about.md` uses `{{about}}`, so the owner keeps editing that text in SSS.

## Posts

```markdown
---
title: New shea butter arrived
description: Raw, unrefined, straight from the north.
date: 2026-10-12            # newest first
image: https://…/shea.jpg   # optional cover
---

Text…
```

The three newest posts show on the home page. The **News** menu entry appears as soon
as there is one post.

## What markdown can do

GitHub-flavoured markdown: headings, lists, tables, links, images, quotes, code.
Raw HTML is shown as text, not run, so pasted snippets can't break or attack the site.
To use a component, add a page in `src/app` instead ([customizing.md](customizing.md)).
