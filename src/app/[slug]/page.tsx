import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getPages } from "@/lib/content";
import { getSite, getStyle } from "@/lib/sss";
import { excerpt, renderMarkdown } from "@/lib/markdown";
import { PageHeader } from "@/components/ui";

/**
 * Any markdown file in content/pages becomes a page: content/pages/delivery.md → /delivery.
 * In a page, {{about}} is replaced by the about text written in SSS → Showcase, and {{style}}
 * by the business's STYLE.md (needs SSS_API_KEY, see docs/sss-integration.md).
 */
type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPages()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug);
  return page ? { title: page.title, description: page.description || excerpt(page.body) } : { title: "Not found" };
}

export default async function MarkdownPage({ params }: Props) {
  const page = await getPage((await params).slug);
  if (!page) notFound();
  const { showcase, business } = await getSite();
  const style = page.body.includes("{{style}}") ? await getStyle() : "";
  const body = page.body
    .replaceAll("{{style}}", style)
    .replaceAll("{{about}}", showcase.aboutMarkdown || business.description || "")
    .replaceAll("{{business}}", business.name);
  return (
    <>
      <PageHeader title={page.title} intro={page.description || undefined} />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }} />
      </div>
    </>
  );
}
