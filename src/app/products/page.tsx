import type { Metadata } from "next";
import { getSite } from "@/lib/sss";
import { arrange } from "@/lib/meta";
import { Catalogue } from "@/components/catalogue";
import { Empty, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const { products, showcase } = await getSite();
  const visible = arrange(products);
  return (
    <>
      <PageHeader title="Products" intro="Everything in stock right now, straight from our shop." />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {visible.length ? <Catalogue products={visible} design={showcase.design} /> : <Empty>No products online yet. Come back soon.</Empty>}
      </div>
    </>
  );
}
