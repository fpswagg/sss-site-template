# Brief for AI coding agents

This repo is a **website template for one business on Sarena Shooting Star (SSS)**.
SSS is the backend: the site has no database and must not grow one.

## Rules

1. **All SSS calls go through `src/lib/sss.ts`.** Pages call `getSite()` (cached,
   deduplicated) and never `fetch` SSS themselves. The exceptions: the assistant
   widget, which calls the public bot API from the browser, and "Sign in with SSS",
   which lives in `src/lib/sss-auth.ts` (docs/oauth.md). Calls made *as a visitor* go
   through its `sssFetch`; tokens stay in the encrypted cookie and never reach the browser.
2. **SSS answers browsers on other sites only for `/api/v1/bot/*`.** Anything else (the
   showcase, the contact form) must run on the server: in a Server Component or a route
   handler.
3. **Every SSS field may be missing.** The site must work against older SSS versions and
   half-filled businesses. Normalize in `sss.ts` and hide empty blocks instead of
   rendering empty shells.
4. **No secrets in client components.** `config` (`src/lib/config.ts`) is server-only;
   pass only what the browser needs, such as the API origin and the bot public key.
5. **Markdown goes through `renderMarkdown`** (`src/lib/markdown.ts`), which escapes raw
   HTML and filters links. Never `dangerouslySetInnerHTML` unrendered text.
6. **Metadata conventions live in `src/lib/meta.ts`** and are documented in
   `docs/metadata.md`. Add a key in both places, or in neither.
7. **No Google Fonts or `next/font/google`**: builds must not depend on Google. Use
   system stacks or self-hosted files in `public/fonts`.
8. **Business content belongs in SSS or `content/`, not in code.** Don't hard-code a
   business's name, texts or prices.
9. This is **Next.js 16**. Route `params` and `searchParams` are Promises.
   `revalidateTag(tag, "max")` takes two arguments. When unsure, read
   `node_modules/next/dist/docs/`.

## Where things are

See [docs/customizing.md](docs/customizing.md) for the file map, and
[docs/sss-integration.md](docs/sss-integration.md) for the API contract.

## Checks before finishing

```bash
npm run typecheck && npm run lint && npm run build
```

Then run `npm run dev` without `SSS_STORE_SLUG` (demo data) and check the home page,
`/products`, a product page, `/contact` and the assistant, on desktop and phone widths.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
