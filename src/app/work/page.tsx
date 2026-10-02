import type { Metadata } from "next";
import { getSite } from "@/lib/sss";
import { arrange } from "@/lib/meta";
import { ProjectCard } from "@/components/cards";
import { Empty, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Our work" };

/** Projects from SSS (SASTO → Projects). Use metadata `hidden: true` for private jobs. */
export default async function WorkPage() {
  const { projects } = await getSite();
  const visible = arrange(projects);
  return (
    <>
      <PageHeader title="Our work" intro="A few of the jobs we are proud of." />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {visible.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <ProjectCard key={p.id} record={p} />
            ))}
          </div>
        ) : (
          <Empty>Nothing to show yet.</Empty>
        )}
      </div>
    </>
  );
}
