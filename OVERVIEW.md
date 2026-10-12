# SSS Site Template

A ready-to-deploy Next.js website for **one business** that runs on Sarena Shooting Star (SSS).
SSS is the backend: the site reads the business's public showcase (identity, design, sections,
products, services, promotions, projects, team, links) and sends contact-form leads back to SSS.
It exists so a business on SSS can have its own branded site, on its own domain, without
re-entering anything.

See [README.md](README.md) for setup and [AGENTS.md](AGENTS.md) for the coding rules.

## Status
Prototype, functionally rich. Last updated 2026-10-04.
- Works: home page built from SSS sections, products (list + detail), services, work/portfolio,
  contact form → SSS lead, AI assistant widget (SSS customer bot), markdown pages and blog in
  `content/`, entity metadata (featured, badges, hidden…), optional "Sign in with SSS" (OAuth),
  revalidation endpoint, sitemap/robots, demo mode when no slug is set.
- Not decided yet: how the template is delivered to businesses (see Open questions).

## Goals and non-goals
- Goal: a business edits everything in SSS; the site follows within minutes.
- Goal: works against half-filled businesses and older SSS versions (hide empty blocks).
- Non-goal: its own database. Non-goal: tracking or anything loaded from Google.

## Architecture
```
visitor ─ page ─▶ Next.js server ─ GET  /api/v1/stores/:slug/showcase ─────▶ SSS API
        ─ form ─▶ /api/contact   ─ POST /api/v1/stores/:slug/showcase/contact ▶ SSS API
        ─ chat ─────────────────── /api/v1/bot/:publicKey/messages (browser) ─▶ SSS API
```
- All server calls to SSS go through `src/lib/sss.ts` (`getSite()`, cached, tag `sss`).
- Only `/api/v1/bot/*` is callable cross-site from the browser.
- OAuth sign-in in `src/lib/sss-auth.ts`; tokens stay in an encrypted cookie.
- Details: [docs/sss-integration.md](docs/sss-integration.md).

## Relationship with SSS
- SSS already serves a public showcase at `/b/:slug` (web app). This template is the
  "own domain, customizable" version of the same data.
- Config is per deployment: `SSS_STORE_SLUG`, `SSS_API_URL`, optional `SSS_API_KEY`,
  `REVALIDATE_SECRET`, `SSS_REVALIDATE`.

## Stack and infrastructure
Next.js 16 (App Router), React 19, Tailwind CSS 4, `marked`. Deploy on Vercel or own server
([docs/deploy.md](docs/deploy.md)).

## Decisions
- 2026-10-04: (recorded from the code) SSS is the only backend; no database in the site.

## Open questions
- Delivery model: one deployment per business (clone + env), or one multi-tenant app serving
  many businesses by domain?
- Who deploys it: the owner for clients, or the businesses themselves?
- How does it differ from the built-in `/b/:slug` showcase, and is that worth selling as a plan
  feature?

## Next steps
- Decide the delivery model.
