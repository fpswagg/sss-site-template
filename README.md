# SSS Site Template

A ready-to-deploy website for a business that runs on **Sarena Shooting Star (SSS)**.
Point it at a business and it builds its pages from what the business manages in SSS,
plus a few markdown files of your own.

| On the site | Comes from |
| --- | --- |
| Name, logo, contacts, address, about text | SSS → Business, Showcase |
| Colors, font, buttons, hero, announcement bar, main button | SSS → Showcase → Design |
| Home page blocks and their order | SSS → Showcase → Sections |
| Products, stock, prices, pictures | SASTO → Products |
| Services, promotions, projects (portfolio) | SASTO → Services, Promotions, Projects |
| Team, links, socials, hours, FAQ, testimonials, stats | SSS → Business / Showcase |
| **AI assistant** (chat bubble on every page) | SSS → Customer bot |
| Contact form → message + new client (lead) | Sent to SSS: lands in Feedback, notifications and Clients |
| Featured items, badges, hidden items, specs, buy links | Entity **metadata** (SSS → Settings → Developer mode) |
| About, delivery, legal pages, news posts | Markdown in [`content/`](content) |

Change something in SSS and the site follows within minutes (or right away, see
[revalidation](docs/sss-integration.md#freshness)).

## Quick start

```bash
npm install
cp .env.example .env.local      # leave SSS_STORE_SLUG empty to see the demo
npm run dev                     # http://localhost:3000
```

With no business set, the site runs on **demo data**, with a demo assistant, so you can
try everything first. To show a real business:

1. In SSS, open **Showcase**, set it up and **Publish** it.
2. In **Customer bot**, turn the bot on and enable **Website widget**: that is the AI assistant.
3. Put the business slug in `.env.local`. The slug is the end of its SSS public link
   `…/b/<slug>`:

   ```bash
   SSS_STORE_SLUG=koto-market
   ```

4. Restart `npm run dev`.

## Documentation

| Read this | To |
| --- | --- |
| [docs/sss-integration.md](docs/sss-integration.md) | Understand which SSS endpoints are used, caching, and security |
| [docs/assistant.md](docs/assistant.md) | Set up and customize the AI assistant |
| [docs/metadata.md](docs/metadata.md) | Use entity metadata to feature, badge, hide or enrich items |
| [docs/content.md](docs/content.md) | Write pages and news posts in markdown |
| [docs/customizing.md](docs/customizing.md) | Change the look, add sections or pages |
| [docs/deploy.md](docs/deploy.md) | Put the site online (Vercel or your own server) |
| [AGENTS.md](AGENTS.md) | Brief for AI coding agents working on this repo |

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · `marked` for markdown.
There's no database and no tracking, and nothing loads from Google: SSS is the backend.
