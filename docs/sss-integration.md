# How the site talks to SSS

The site has no database. Everything about the business comes from four public SSS API
routes. `SSS_API_URL` sets the API origin (default: production) and `SSS_STORE_SLUG`
chooses the business.

```
                      ┌───────────────── server (Next.js) ─────────────────┐
 visitor ─ page ────▶ │ getSite() ── GET  /api/v1/stores/:slug/showcase ───┼──▶ SSS
         ─ form ────▶ │ /api/contact ─ POST /api/v1/stores/:slug/showcase/contact ─▶ SSS
                      └────────────────────────────────────────────────────┘
 visitor ─ chat ─────────────────── /api/v1/bot/:publicKey/messages ─────────▶ SSS
                       (straight from the browser: the only cross-site route)
```

## 1. The showcase: everything public in one call

`GET /api/v1/stores/:slug/showcase` (in [`src/lib/sss.ts`](../src/lib/sss.ts))

| Field | Content |
| --- | --- |
| `store` | name, slug, logo, banner, phone, WhatsApp, email, address, description, website, `metadata` |
| `showcase` | theme, accent, hero texts and image, `sections` (order + on/off), about markdown, SEO texts, `contactFormEnabled`, `design` (font, buttons, CTA, hours, FAQ, testimonials, stats, socials…) |
| `products` | active products (up to 96): price, pictures, category, tags, `inStock`, `metadata` |
| `services`, `promotions`, `projects` | SASTO records: `{ id, name, data, metadata }` |
| `members` | team names and roles (never their contacts) |
| `links` | the business's links (Instagram, website…) |
| `chatbot` | the customer assistant's public profile with its `publicKey`, or `null` |

The route answers **404 until the business publishes its showcase** in SSS. The site then
shows "This site is not published yet".

### Why server-side

SSS allows cross-site browser calls only on `/api/v1/bot/*`. Every other route answers
the SSS web app's origin alone, so the showcase is read during server rendering and the
contact form goes through this site's own `/api/contact` route.

### Freshness

Showcase fetches are cached for `SSS_REVALIDATE` seconds (default 300) and tagged `sss`.

- **Automatic:** a visit after the delay serves the cached page and refreshes it in the background.
- **Right away:** `POST /api/revalidate?secret=<REVALIDATE_SECRET>` marks the data stale, so
  the next visit fetches it again. Use it from a bookmark, a cron job or a webhook after
  editing products in SSS.

  ```bash
  curl -X POST "https://your-site.com/api/revalidate?secret=…"
  ```

## 2. Contact form → lead

`POST /api/v1/stores/:slug/showcase/contact` with `{ name, email?, phone?, message, createClient: true }`.

In SSS, the message:

- is saved under **Feedback** ("Contact from …"),
- shows in the business's notifications,
- adds the sender to **Clients**, or links them when a client with the same phone or email already exists.

The site route [`src/app/api/contact/route.ts`](../src/app/api/contact/route.ts):

- checks the fields,
- drops bot submissions caught by a hidden honeypot field,
- limits each visitor to 5 messages per 10 minutes.

The form shows only when the business keeps the contact form on in SSS → Showcase.

## 3. The AI assistant

`GET | POST | DELETE /api/v1/bot/:publicKey/messages`, called from the browser. See
[assistant.md](assistant.md).

## 4. STYLE.md (optional, needs a key)

SSS does not publish the business's `STYLE.md` (brand voice and rules), so reading it
needs a business **API key**: SSS → Business → API → create a key, then
`SSS_API_KEY=sss_…` on the server. Without it, `getStyle()` returns an empty string and
nothing breaks.

```ts
import { getStyle } from "@/lib/sss";
const style = await getStyle();     // "GET /api/v1/stores/:slug/docs/style", cached like the showcase
```

In a markdown page, `{{style}}` is replaced by it. Only add it to a page if the business
really wants its style guide public. The key has owner-level access to that business, so
keep it in the server environment and never in client components.

## 5. Metadata

Each entity carries a free `metadata` object that SSS never interprets. This site reads
a few conventional keys from it. See [metadata.md](metadata.md).

## Security notes

- No secret is ever sent to the browser. The assistant's `publicKey` is public by
  design: it only reaches that bot, and SSS rate-limits it per visitor.
- Markdown from SSS and from `content/` is rendered with raw HTML escaped. Only `http(s)`,
  `mailto`, `tel` and relative links are kept, and images must be `http(s)` or relative.
- JSON-LD is serialized with `<` escaped.
