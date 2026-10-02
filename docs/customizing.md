# Customizing

Most changes need no code: they are made in SSS (design, sections, texts) or in
`content/`. When you do change code, here is the map.

```
src/
  app/
    layout.tsx            loads the business (getSite), theme, header, footer, assistant
    page.tsx              home: hero + one block per SSS section
    products/             catalogue and product pages
    services/ work/       services (+ live offers), projects
    blog/ [slug]/         markdown posts and pages
    contact/              contact page; api/contact forwards to SSS
    api/revalidate/       refresh the SSS cache on demand
    sitemap.ts robots.ts  SEO
  components/             header, footer, cards, catalogue, assistant, contact form…
  lib/
    sss.ts                SSS client (fetch, cache, normalize)  ← the only place that calls SSS
    types.ts              shapes of the SSS payload
    meta.ts               metadata conventions (featured, badge…)
    theme.ts              SSS themes and fonts → CSS variables
    content.ts markdown.ts  content/ loader, safe markdown renderer
    demo.ts               demo business (no SSS_STORE_SLUG)
```

## Look and feel

- **Colors:** pick the theme and accent in SSS → Showcase. To use different colors on
  this site only, set the business metadata `siteTheme` / `siteAccent`. For a brand-new
  palette, add an entry to `THEMES` in `src/lib/theme.ts`.
- **Fonts:** the SSS font choice maps to system font stacks in `theme.ts`, so nothing is
  downloaded. To use your own font, put the `.woff2` in `public/fonts`, add an
  `@font-face` in `globals.css`, and use it in `FONTS`. Don't use `next/font/google`:
  builds must not depend on Google.
- **Utilities:** Tailwind classes read the theme variables: `bg-bg`, `bg-surface`,
  `bg-card`, `text-fg`, `text-secondary`, `text-muted`, `border-border`, `bg-accent`,
  `text-on-accent`, `rounded-button`, `rounded-card`, `font-heading`.

## Home page sections

The home page renders `showcase.sections` in order, skipping disabled ones and empty
ones. Supported types:

`about`, `products`, `services`, `promotions`, `projects`, `gallery`, `team`, `stats`,
`testimonials`, `faq`, `hours`, `map`, `links`, `cta`, `contact`.

To add a block, handle a new `case` in `Block` (`src/app/page.tsx`). New SSS section
types appear here as soon as SSS sends them; until a `case` exists they're skipped.

## A new page from SSS data

```tsx
// src/app/offers/page.tsx
import { getSite } from "@/lib/sss";
import { arrange } from "@/lib/meta";

export default async function OffersPage() {
  const { promotions } = await getSite(); // cached, no extra SSS call
  return <ul>{arrange(promotions).map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

Call `getSite()` as often as you like: it is deduplicated per request and cached across
requests.

## Text and language

Interface strings are in English inside the components. For a French site, translate
them in place (search for the quoted strings in `src/components` and `src/app`) and set
`<html lang="fr">` in `layout.tsx`.

## Checks

```bash
npm run typecheck && npm run lint && npm run build
```
