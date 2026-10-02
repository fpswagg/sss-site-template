# Deploying

The site is a standard Next.js app. It needs Node 20+ and outbound HTTPS access to the
SSS API.

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `SSS_STORE_SLUG` | yes | The business slug. Empty = demo data (with a visible banner). |
| `SSS_API_URL` | no | Default `https://sss-api.fpswagg.site` |
| `SITE_URL` | yes in production | Public URL, used in the sitemap, canonical and social links |
| `SSS_REVALIDATE` | no | Cache seconds, default 300, minimum 30 |
| `REVALIDATE_SECRET` | recommended | Enables `POST /api/revalidate` |
| `SSS_BOT_KEY` | no | Use another assistant key than the published one |

## Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Add the variables above in **Project → Settings → Environment Variables**.
3. Deploy. Add the business's domain in **Domains**.

## Your own server

```bash
npm ci
npm run build
PORT=3000 npm start          # behind nginx / Caddy for HTTPS
```

Example with pm2: `pm2 start npm --name koto-site -- start`.

## Before going live

- [ ] The showcase is **published** in SSS (otherwise the site shows "not published yet")
- [ ] The customer bot and website widget are on, if you want the assistant
- [ ] `SITE_URL` is the real domain
- [ ] `content/pages/privacy.md` is replaced with the business's real policy
- [ ] A test message from `/contact` shows up in SSS Feedback, notifications and Clients
- [ ] `REVALIDATE_SECRET` is set, and the owner knows the refresh link

## One template, many businesses

Deploy the same repo once per business, with a different `SSS_STORE_SLUG`, `SITE_URL`
and `content/`. Keep business-specific changes in `content/` and SSS metadata, not in
code, so template updates merge cleanly.
