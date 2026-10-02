import "server-only";
import { cache } from "react";
import { config, SSS_TAG } from "./config";
import { demoData } from "./demo";
import { DEFAULT_DESIGN } from "./design";
import type { Assistant, Design, Product, SastoRecord, Showcase, SiteData } from "./types";

/**
 * Reads the business from SSS. One call — GET /api/v1/stores/:slug/showcase —
 * returns everything public: profile, page design, products, services,
 * promotions, projects, team, links and the customer assistant.
 *
 * It runs on the server only: SSS answers that route to the SSS app's own
 * origin (CORS), not to browsers on other sites. Results are cached for
 * SSS_REVALIDATE seconds and tagged "sss" (POST /api/revalidate clears them).
 */


const DEFAULT_SECTIONS = ["about", "products", "services", "promotions", "projects", "testimonials", "faq", "hours", "contact"];

export class SssUnavailableError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeShowcase(raw: unknown): Showcase {
  const rec = asObject(raw);
  const design = { ...DEFAULT_DESIGN, ...asObject(rec.design) } as Design;
  const sections = asArray<{ type?: unknown; enabled?: unknown; title?: unknown }>(rec.sections)
    .filter((s) => typeof s?.type === "string")
    .map((s) => ({ type: String(s.type), enabled: s.enabled !== false, ...(typeof s.title === "string" && s.title ? { title: s.title } : {}) }));
  return {
    published: rec.published !== false,
    theme: typeof rec.theme === "string" ? rec.theme : "midnight",
    accent: typeof rec.accent === "string" && rec.accent ? rec.accent : "#0EE556",
    heroTitle: (rec.heroTitle as string | null) ?? null,
    heroSubtitle: (rec.heroSubtitle as string | null) ?? null,
    heroImageUrl: (rec.heroImageUrl as string | null) ?? null,
    sections: sections.length ? sections : DEFAULT_SECTIONS.map((type) => ({ type, enabled: true })),
    aboutMarkdown: typeof rec.aboutMarkdown === "string" ? rec.aboutMarkdown : "",
    seoTitle: (rec.seoTitle as string | null) ?? null,
    seoDescription: (rec.seoDescription as string | null) ?? null,
    ogImageUrl: (rec.ogImageUrl as string | null) ?? null,
    contactFormEnabled: rec.contactFormEnabled !== false,
    design,
  };
}

function normalizeRecords(value: unknown): SastoRecord[] {
  return asArray<SastoRecord>(value)
    .filter((r) => r && typeof r.id === "string")
    .map((r) => ({ ...r, data: asObject(r.data), metadata: asObject(r.metadata) }));
}

function normalizeProducts(value: unknown): Product[] {
  return asArray<Product>(value)
    .filter((p) => p && typeof p.id === "string")
    .map((p) => ({ ...p, price: Number(p.price) || 0, currency: p.currency || "FCFA", metadata: asObject(p.metadata) }));
}

function normalizeAssistant(value: unknown): Assistant | null {
  const rec = asObject(value);
  const key = config.botKey || (typeof rec.publicKey === "string" ? rec.publicKey : "");
  if (!key) return null;
  return {
    publicKey: key,
    name: typeof rec.name === "string" && rec.name ? rec.name : "Assistant",
    avatarUrl: (rec.avatarUrl as string | null) ?? null,
    greeting: typeof rec.greeting === "string" ? rec.greeting : "",
    suggestions: asArray<string>(rec.suggestions).filter((s) => typeof s === "string").slice(0, 6),
    accent: (rec.accent as string | null) ?? null,
  };
}

async function fetchShowcase(slug: string): Promise<SiteData> {
  const url = `${config.apiUrl}/api/v1/stores/${encodeURIComponent(slug)}/showcase`;
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: config.revalidate, tags: [SSS_TAG] },
  });
  const body = (await res.json().catch(() => null)) as { data?: unknown; error?: { message?: string } } | null;
  if (!res.ok || !body?.data) {
    throw new SssUnavailableError(body?.error?.message ?? `SSS answered ${res.status}`, res.status);
  }
  const data = asObject(body.data);
  return {
    business: { ...(asObject(data.store) as SiteData["business"]), metadata: asObject(asObject(data.store).metadata) },
    showcase: normalizeShowcase(data.showcase),
    products: normalizeProducts(data.products),
    services: normalizeRecords(data.services),
    promotions: normalizeRecords(data.promotions),
    projects: normalizeRecords(data.projects),
    members: asArray(data.members),
    links: asArray(data.links),
    assistant: normalizeAssistant(data.chatbot),
    source: "sss",
  };
}

/**
 * The whole site's data, once per request (React cache) and cached across
 * requests by the fetch cache. No SSS_STORE_SLUG → demo data.
 */
export const getSite = cache(async (): Promise<SiteData> => {
  if (!config.storeSlug) return demoData();
  return fetchShowcase(config.storeSlug);
});

/**
 * Sends a contact-form message to SSS. It lands in the business's SSS
 * notifications and, with createClient, becomes a client (lead) in SASTO.
 */
export async function sendContact(input: { name: string; email?: string; phone?: string; message: string }) {
  if (!config.storeSlug) return { demo: true as const };
  const res = await fetch(`${config.apiUrl}/api/v1/stores/${encodeURIComponent(config.storeSlug)}/showcase/contact`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ ...input, createClient: true }),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
  if (!res.ok) throw new SssUnavailableError(body?.error?.message ?? `SSS answered ${res.status}`, res.status);
  return { demo: false as const };
}
