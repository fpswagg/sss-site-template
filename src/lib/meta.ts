import type { Business, Metadata, Product, SastoRecord } from "./types";

/**
 * Metadata conventions: keys a business sets in SSS (Settings → Developer mode,
 * then the Metadata section of a product, service… or of the business) that
 * this site understands. Full list and examples: docs/metadata.md.
 * Unknown keys are ignored, so a business can store anything else for its own tools.
 */

function str(meta: Metadata | undefined, key: string): string {
  const value = meta?.[key];
  return typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "";
}

function bool(meta: Metadata | undefined, key: string): boolean {
  const value = meta?.[key];
  return value === true || value === "true" || value === 1;
}

function num(meta: Metadata | undefined, key: string): number | null {
  const value = Number(meta?.[key]);
  return Number.isFinite(value) && meta?.[key] !== "" && meta?.[key] != null ? value : null;
}

type WithMeta = { metadata?: Metadata };

/** `hidden: true` keeps an item off this site (it stays in SSS and in the SSS public page). */
export const isHidden = (item: WithMeta) => bool(item.metadata, "hidden");
/** `featured: true` puts it on the home page and first in lists. */
export const isFeatured = (item: WithMeta) => bool(item.metadata, "featured");
/** `badge: "New"` shows a small label on the card. */
export const badgeOf = (item: WithMeta) => str(item.metadata, "badge");
/** `subtitle: "…"` a short line under the name. */
export const subtitleOf = (item: WithMeta) => str(item.metadata, "subtitle");

/** Visible items, featured first, then by `order` (lower first), then as SSS sent them. */
export function arrange<T extends WithMeta>(items: T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !isHidden(item))
    .sort((a, b) => {
      const featured = Number(isFeatured(b.item)) - Number(isFeatured(a.item));
      if (featured) return featured;
      const oa = num(a.item.metadata, "order");
      const ob = num(b.item.metadata, "order");
      if (oa != null || ob != null) return (oa ?? Number.MAX_SAFE_INTEGER) - (ob ?? Number.MAX_SAFE_INTEGER);
      return a.index - b.index;
    })
    .map(({ item }) => item);
}

/** Home-page picks: featured items, or the first ones when nothing is featured. */
export function highlights<T extends WithMeta>(items: T[], limit: number): T[] {
  const visible = arrange(items);
  const featured = visible.filter(isFeatured);
  return (featured.length ? featured : visible).slice(0, limit);
}

/** Product `buyUrl`: an outside checkout link (Jumia, a payment page…) shown as the main button. */
export function buyLinkOf(product: Product): { url: string; label: string } | null {
  const url = str(product.metadata, "buyUrl");
  if (!/^https?:\/\//i.test(url)) return null;
  return { url, label: str(product.metadata, "buyLabel") };
}

/** Product `specs: { "Weight": "200 g", … }`: a facts table on the product page. */
export function specsOf(product: Product): Array<[string, string]> {
  const specs = product.metadata?.specs;
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
  return Object.entries(specs as Record<string, unknown>)
    .filter(([, v]) => v != null && v !== "" && typeof v !== "object")
    .map(([k, v]) => [k, String(v)] as [string, string])
    .slice(0, 24);
}

/** Business-level overrides for this site only (the SSS public page keeps its own look). */
export function siteOverrides(business: Business) {
  const meta = business.metadata;
  return {
    theme: str(meta, "siteTheme"),
    accent: str(meta, "siteAccent"),
    tagline: str(meta, "tagline"),
    /** WhatsApp order text; {product}, {price} and {business} are filled in. */
    orderMessage: str(meta, "orderMessage"),
    /** `assistant: false` hides the assistant on this site. */
    assistantOff: business.metadata?.assistant === false,
  };
}

export function recordImage(record: SastoRecord): string | null {
  const data = record.data;
  if (typeof data.image === "string" && data.image) return data.image;
  const first = Array.isArray(data.images) ? data.images[0] : undefined;
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && typeof (first as { url?: unknown }).url === "string") return (first as { url: string }).url;
  return null;
}
