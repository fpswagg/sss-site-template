import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/content";
import { excerpt, renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.description || excerpt(post.body), openGraph: { images: post.image ? [post.image] : undefined, type: "article" } };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/blog" className="text-sm text-muted hover:text-fg">← All news</Link>
      <p className="mt-6 text-sm text-muted">{formatDate(post.date)}</p>
      <h1 className="mt-2 font-heading text-4xl font-semibold sm:text-5xl">{post.title}</h1>
      {post.description ? <p className="mt-4 text-xl text-secondary">{post.description}</p> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {post.image ? <img src={post.image} alt="" className="mt-8 w-full rounded-card border border-border object-cover" /> : null}
      <div className="prose mt-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
    </article>
  );
}
