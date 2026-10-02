/** Site settings from the environment (see .env.example). Server-only. */

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

export const config = {
  /** The SSS business shown by this site. Empty = demo data. */
  storeSlug: clean(process.env.SSS_STORE_SLUG),
  /** SSS API origin, without a trailing slash. */
  apiUrl: (clean(process.env.SSS_API_URL) || "https://sss-api.fpswagg.site").replace(/\/+$/, ""),
  /** Seconds before SSS data is fetched again. */
  revalidate: Math.max(30, Number(process.env.SSS_REVALIDATE) || 300),
  revalidateSecret: clean(process.env.REVALIDATE_SECRET),
  siteUrl: (clean(process.env.SITE_URL) || "http://localhost:3000").replace(/\/+$/, ""),
  /** Overrides the assistant key published with the showcase. */
  botKey: clean(process.env.SSS_BOT_KEY),
};

/** Cache tag on every SSS fetch: POST /api/revalidate clears it. */
export const SSS_TAG = "sss";
