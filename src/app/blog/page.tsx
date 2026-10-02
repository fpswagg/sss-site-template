import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Empty, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "News" };

/** Posts are markdown files in content/posts (see docs/content.md). */
export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHeader title="News" intro="Updates, tips and stories from the shop." />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {posts.length ? (
          <ul className="divide-y divide-border">
            {posts.map((post) => (
              <li key={post.slug} className="py-6">
                <Link href={`/blog/${post.slug}`} className="group block">
                  <p className="text-sm text-muted">{formatDate(post.date)}</p>
                  <h2 className="mt-1 font-heading text-2xl font-semibold group-hover:text-accent">{post.title}</h2>
                  {post.description ? <p className="mt-2 text-secondary">{post.description}</p> : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No posts yet.</Empty>
        )}
      </div>
    </>
  );
}
