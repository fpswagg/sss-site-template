import type { MetadataRoute } from "next";
import { config } from "@/lib/config";
import { getSite } from "@/lib/sss";
import { arrange } from "@/lib/meta";
import { getPages, getPosts } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.siteUrl;
  const [site, pages, posts] = await Promise.all([getSite().catch(() => null), getPages(), getPosts()]);
  const url = (path: string) => `${base}${path}`;
  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    ...(site?.products.length ? [{ url: url("/products"), changeFrequency: "daily" as const, priority: 0.9 }] : []),
    ...(site ? arrange(site.products).map((p) => ({ url: url(`/products/${p.id}`), changeFrequency: "weekly" as const, priority: 0.7 })) : []),
    ...(site?.services.length ? [{ url: url("/services"), priority: 0.7 }] : []),
    ...(site?.projects.length ? [{ url: url("/work"), priority: 0.6 }] : []),
    { url: url("/contact"), priority: 0.6 },
    ...pages.map((p) => ({ url: url(`/${p.slug}`), priority: 0.5 })),
    ...(posts.length ? [{ url: url("/blog"), priority: 0.6 }] : []),
    ...posts.map((p) => ({ url: url(`/blog/${p.slug}`), lastModified: p.date || undefined, priority: 0.5 })),
  ];
}
