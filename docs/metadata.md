# Metadata: special features without code

Every SSS entity (the business, products, categories, suppliers, clients, invoices,
orders, services, promotions, projects, illustrations) has a **metadata** field: free
key/values that SSS stores but never interprets. Websites and integrations give them
meaning. This template understands the keys below.

## How to edit it

1. In SSS: **Settings → Developer → Developer mode** (off by default).
2. Open a product, service, promotion or project, or **Business → Profile**. A
   **Metadata (Dev)** section appears in the create and edit forms.
3. Add keys in the **Keys** view, or paste an object in the **JSON** view.

Values are read as JSON when possible (`true`, `3`, `["a"]`, `{"a":1}`); anything else
is kept as text. Limits: 100 keys and 16 KB per entity.

The site shows changes after the cache delay, or right away with
[`/api/revalidate`](sss-integration.md#freshness).

## Products

| Key | Example | Effect |
| --- | --- | --- |
| `featured` | `true` | Shown on the home page ("Our products"); first in the catalogue. When no product is featured, the home page shows the first ones. |
| `badge` | `"New"` | Label on the card and the product page |
| `subtitle` | `"Cold-pressed, 250 ml"` | Line under the name (replaces the category) |
| `hidden` | `true` | Off this site; still sold in SSS and on the SSS public page |
| `order` | `1` | Position in lists, lower first (after featured items) |
| `specs` | `{"Weight": "200 g", "Origin": "Bafoussam"}` | Facts table on the product page |
| `buyUrl` | `"https://pay.example.com/soap"` | Main **Buy now** button to an outside checkout |
| `buyLabel` | `"Buy on Jumia"` | Text of that button |

## Services, promotions, projects

| Key | Effect |
| --- | --- |
| `featured` | Shown on the home page, first in lists |
| `badge` | Label on the card (services) |
| `hidden` | Off this site |
| `order` | Position, lower first |

A promotion with an `endsAt` date in the past is never shown.

## The business (Business → Profile)

| Key | Example | Effect |
| --- | --- | --- |
| `siteTheme` | `"ocean"` | Theme on this site only: `midnight`, `light`, `sand`, `forest`, `ocean`, `rose` |
| `siteAccent` | `"#C2410C"` | Accent color on this site only |
| `tagline` | `"Good things, made here."` | Small line above the home title |
| `orderMessage` | `"Hi {business}! I want {product} ({price})."` | WhatsApp order text. `{product}`, `{price}` and `{business}` are filled in. |
| `assistant` | `false` | Hide the AI assistant on this site |

The SSS public page (`/b/<slug>`) keeps the theme set in SSS → Showcase, so the business
can have one look in SSS and another on its own site.

## Add your own keys

Read them anywhere from the data returned by `getSite()`:

```ts
const site = await getSite();
const halal = site.products.filter((p) => p.metadata?.halal === true);
```

Put shared helpers in [`src/lib/meta.ts`](../src/lib/meta.ts) and document the key here, so
the business knows it exists.
