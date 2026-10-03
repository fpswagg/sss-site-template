# Sign in with SSS

Visitors can sign in on this site with their **SSS account**, the way "Sign in with
Google" works. SSS is an OAuth 2.0 server; this site is an app registered by the
business. Nobody types a password here, and the site never sees one.

It is **off** until you set `SSS_OAUTH_CLIENT_ID`. When it is on, the menu shows
**Account**, which leads to `/account` and its **Sign in with SSS** button.

The full protocol (every endpoint, scope, and error) is in the SSS server repo:
`server/OAUTH.md`. This page covers what the template does and how to use it.

## Set it up

1. In SSS, open **Business → API → Sign in with SSS** (owner only) and register an app:
   - **Name**: what visitors see on the SSS consent screen, for example your site's name.
   - **Website**: this site's address.
   - **Redirect URLs**: `{SITE_URL}/auth/sss/callback`, one per environment, for example
     ```
     https://koto-market.com/auth/sss/callback
     http://localhost:3000/auth/sss/callback
     ```
   - **Type**: *Server app* (the template exchanges the code on its server).
2. Copy the **client ID** and the **client secret**. The secret is shown only once.
3. Fill in `.env.local` (or the host's environment variables):

   ```bash
   SITE_URL=http://localhost:3000            # must match the redirect URL's origin
   SSS_OAUTH_CLIENT_ID=sssapp_…
   SSS_OAUTH_CLIENT_SECRET=sssecret_…
   SSS_OAUTH_SCOPE=profile email             # see "Scopes"
   SESSION_SECRET=…                          # openssl rand -hex 32
   ```

4. Restart. Open `/account` and click **Sign in with SSS**.

In development, if `SESSION_SECRET` is empty, a fixed development key is used. In
production it is **required** (at least 32 characters). Without it, `/account` says what
is missing and nobody can sign in.

## What happens

```
Visitor            This site                         SSS API                SSS app
───────            ─────────                         ───────                ───────
clicks "Sign in" → GET /auth/sss
                   state + PKCE verifier → cookie sss_oauth (10 min, encrypted)
                   302 ────────────────────────────► /api/v1/oauth/authorize
                                                     checks client + redirect
                                                     302 ──────────────────► consent page
                                                                            (sign in if needed,
                                                                             Allow / Cancel)
                   GET /auth/sss/callback?code&state ◄──────────────────────┘
                   checks state, POST /oauth/token (secret + verifier)
                   GET /oauth/userinfo
                   tokens + profile → cookie sss_session (encrypted, HttpOnly)
                   302 → next (default /account)
```

- **PKCE** (S256) and **state** are always used, even with a client secret.
- If the visitor already allowed this site with the same scopes, SSS sends them straight
  back without asking again.
- **Cancel** brings the visitor back to `/account` with a message.

## Files

| File | Role |
| --- | --- |
| `src/lib/sss-auth.ts` | Everything: authorize URL, PKCE, encrypted cookies, token exchange, refresh, userinfo, revoke |
| `src/app/auth/sss/route.ts` | `GET /auth/sss?next=/path`: starts the sign-in |
| `src/app/auth/sss/callback/route.ts` | `GET /auth/sss/callback`: SSS sends the visitor back here |
| `src/app/auth/sss/sign-out/route.ts` | `POST /auth/sss/sign-out`: signs out here **and** revokes on SSS |
| `src/app/auth/sss/me/route.ts` | `GET /auth/sss/me`: the visitor's fresh profile as JSON (`401` when signed out) |
| `src/app/account/page.tsx` | The account page: sign-in button, or the profile and sign-out |

## Where the tokens live

The site has **no database**. The session is a cookie, `sss_session`:

- encrypted and signed with **AES-256-GCM** (key derived from `SESSION_SECRET`), so it
  cannot be read or changed in the browser;
- `HttpOnly`, `SameSite=Lax`, and `Secure` when `SITE_URL` is `https://`;
- 60 days long, like the SSS refresh token.

It holds the access token (1 hour), the refresh token (60 days, rotated on each use), and
the profile as it was at sign-in. **No token is ever sent to the browser.**

Changing `SESSION_SECRET` signs everyone out (their cookies can no longer be read).

## Use it in your own code

**In a page (Server Component).** Read the visitor as saved at sign-in:

```tsx
import { getSession } from "@/lib/sss-auth";

export default async function Page() {
  const session = await getSession();
  return session ? <p>Hello {session.user.name}</p> : <a href="/auth/sss?next=/my-page">Sign in with SSS</a>;
}
```

Reading the cookie makes that page dynamic (rendered per request). That is why the
header only shows a plain **Account** link: every other page stays static and cached.

**Calling SSS as the visitor (route handlers and Server Functions).** `sssFetch` adds the
access token and refreshes it first when it has run out. SSS rotates refresh tokens, so
the new pair is saved back into the cookie, and that is why it cannot run in a page:

```ts
// src/app/api/my-products/route.ts (scope business:read: the business picked at consent)
import { NextResponse } from "next/server";
import { getSession, sssFetch, SssAuthError } from "@/lib/sss-auth";

export async function GET() {
  try {
    const business = (await getSession())?.user.business;
    if (!business) return NextResponse.json({ error: "No business connected" }, { status: 403 });
    const res = await sssFetch(`/api/v1/stores/${business.id}/products`);
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    if (err instanceof SssAuthError) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
    throw err;
  }
}
```

**From a client component**, call your own route: `fetch("/auth/sss/me")` returns
`{ user }`, or `401`.

**Linking a visitor to your own data.** Use `user.sub` (the SSS user id, which never
changes) as the key, not the email.

## Scopes

Set `SSS_OAUTH_SCOPE` (separated by spaces). Ask for as little as you need. Visitors see
the list on the consent screen.

| Scope | `user` gets | API access |
| --- | --- | --- |
| `profile` (always) | `sub`, `name`, `picture` | `/oauth/userinfo` |
| `email` | `email`, `email_verified` | |
| `businesses` | `businesses[]`: each `{ id, slug, name, logoUrl, role }` | `GET /stores` (read) |
| `business:read` | `business`: the **one** business they pick on the consent screen | read everything in it: `GET /stores/:id/…` |
| `business` | same | read **and** write in it, with their own role there |

A visitor's customers (people buying from the business) usually just need
`profile email`. The `business*` scopes are for tools that work **for** SSS businesses,
such as a dashboard, an integration, or a partner site. An app token can never reach
account settings, billing, the team, API keys, or OAuth apps.

## When access ends

- The visitor clicks **Sign out** here: the cookie is deleted and the refresh token is
  revoked on SSS.
- The visitor disconnects the site in **SSS → Settings → Connected apps**, the business
  deletes the app, or (`business*` scopes) the visitor leaves that business. The next
  refresh then fails with `invalid_grant`, and the site deletes the cookie, so they are
  signed out.
- A replayed (stolen) refresh token makes SSS cancel the whole connection.

The saved profile can be up to an hour old. `/auth/sss/me` (and `refreshUser()`) fetch a
fresh one and update the cookie.

## Troubleshooting

| You see | Fix |
| --- | --- |
| SSS: "asked to send you back to an address it did not register" | `SITE_URL` + `/auth/sss/callback` must be **exactly** one of the app's redirect URLs (scheme, host, port, no trailing slash) |
| SSS: "This app is not registered" | Wrong `SSS_OAUTH_CLIENT_ID`, or `SSS_API_URL` points at another SSS |
| `/account?error=invalid_client` | Wrong or rotated `SSS_OAUTH_CLIENT_SECRET` |
| `/account?error=expired` | The visitor took more than 10 minutes, or the cookie was blocked (check `SITE_URL` uses the same host as in the browser) |
| `/account?error=invalid_scope` | `SSS_OAUTH_SCOPE` has a word SSS does not know |
| Signed out right after signing in, in production | `SITE_URL` is `https://` but the site is served over `http://`, so the `Secure` cookie is dropped |
| `/account` is a 404 | `SSS_OAUTH_CLIENT_ID` is empty (the feature is off) |
