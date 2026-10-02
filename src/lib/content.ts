import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

/**
 * Markdown content that lives in this repo (content/pages, content/posts):
 * everything SSS does not hold — long about text, legal pages, news, guides.
 * Each file starts with a small front matter block:
 *
 *   ---
 *   title: Delivery
 *   description: Where and when we deliver.
 *   nav: true          # pages only: show in the header menu
 *   order: 2           # pages only: menu position
 *   date: 2026-10-01   # posts only
 *   ---
 *
 * See docs/content.md.
 */

export type Doc = {
  slug: string;
  title: string;
  description: string;
  date: string;
  nav: boolean;
  order: number;
  draft: boolean;
  image: string;
  body: string;
};

const ROOT = path.join(process.cwd(), "content");

/** Tiny front matter reader: `key: value` lines between two `---` lines. */
export function parseFrontMatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of match[1]!.split(/\r?\n/)) {
    const m = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.replace(/\s+#.*$/, ""));
    if (m) data[m[1]!] = m[2]!.trim().replace(/^["']|["']$/g, "");
  }
  return { data, body: raw.slice(match[0].length) };
}

async function readDir(dir: "pages" | "posts"): Promise<Doc[]> {
  const folder = path.join(ROOT, dir);
  let files: string[] = [];
  try {
    files = (await readdir(folder)).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  } catch {
    return [];
  }
  const docs = await Promise.all(
    files.map(async (file) => {
      const { data, body } = parseFrontMatter(await readFile(path.join(folder, file), "utf8"));
      const slug = file.replace(/\.md$/, "");
      return {
        slug,
        title: data.title || slug.replace(/-/g, " "),
        description: data.description ?? "",
        date: data.date ?? "",
        nav: data.nav === "true",
        order: Number(data.order) || 100,
        draft: data.draft === "true",
        image: data.image ?? "",
        body,
      } satisfies Doc;
    })
  );
  return docs.filter((d) => !d.draft || process.env.NODE_ENV === "development");
}

export const getPages = cache(async () => (await readDir("pages")).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)));

export const getPosts = cache(async () => (await readDir("posts")).sort((a, b) => b.date.localeCompare(a.date)));

export async function getPage(slug: string) {
  return (await getPages()).find((p) => p.slug === slug) ?? null;
}

export async function getPost(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug) ?? null;
}
