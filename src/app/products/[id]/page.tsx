import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/sss";
import { arrange, badgeOf, buyLinkOf, isHidden, siteOverrides, specsOf, subtitleOf } from "@/lib/meta";
import { money, orderText, productImage, whatsappLink } from "@/lib/format";
import { config } from "@/lib/config";
import { AskButton } from "@/components/ask-button";
import { Gallery } from "@/components/gallery";
import { ProductCard } from "@/components/cards";
import { Badge, ButtonLink } from "@/components/ui";

type Props = { params: Promise<{ id: string }> };

async function find(id: string) {
  const site = await getSite();
  const product = site.products.find((p) => p.id === id);
  return product && !isHidden(product) ? { site, product } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hit = await find((await params).id);
  if (!hit) return { title: "Product not found" };
  const image = productImage(hit.product);
  return {
    title: hit.product.name,
    description: hit.product.description ?? undefined,
    openGraph: { images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const hit = await find((await params).id);
  if (!hit) notFound();
  const { site, product } = hit;
  const { business, showcase } = site;
  const d = showcase.design;
  const buy = buyLinkOf(product);
  const wa = d.whatsappOrder ? whatsappLink(business, orderText(business, product, siteOverrides(business).orderMessage)) : null;
  const specs = specsOf(product);
  const badge = badgeOf(product);
  const soldOut = product.inStock === false;
  const related = arrange(site.products.filter((p) => p.id !== product.id && p.category && p.category === product.category)).slice(0, 4);
  const images = (product.images ?? []).map((i) => i.url).filter((u): u is string => Boolean(u));

  // Structured data so search engines show price and availability.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: images,
    sku: product.sku,
    brand: { "@type": "Brand", name: business.name },
    offers: d.showPrices
      ? {
          "@type": "Offer",
          price: product.price,
          priceCurrency: product.currency === "FCFA" ? "XAF" : product.currency,
          availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          url: `${config.siteUrl}/products/${product.id}`,
        }
      : undefined,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/products" className="hover:text-fg">
          Products
        </Link>
        {product.category ? <span> / {product.category}</span> : null}
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <Gallery images={images} name={product.name} />
        <div>
          <div className="flex flex-wrap gap-2">
            {badge ? <Badge>{badge}</Badge> : null}
            {soldOut ? <Badge tone="neutral">Sold out</Badge> : null}
          </div>
          <h1 className="mt-3 font-heading text-4xl font-semibold">{product.name}</h1>
          {subtitleOf(product) ? <p className="mt-2 text-lg text-secondary">{subtitleOf(product)}</p> : null}
          {d.showPrices ? <p className="mt-5 font-heading text-3xl font-bold">{money(product.price, product.currency)}</p> : null}
          {d.showStock && !product.unlimitedStock && typeof product.quantity === "number" ? (
            <p className="mt-1 text-sm text-muted">{product.quantity} in stock</p>
          ) : null}
          {product.description ? <p className="mt-6 whitespace-pre-line leading-relaxed text-secondary">{product.description}</p> : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {buy ? (
              <ButtonLink href={buy.url} external>
                {buy.label || "Buy now"}
              </ButtonLink>
            ) : null}
            {wa && !soldOut ? (
              <ButtonLink href={wa} external variant={buy ? "secondary" : "primary"}>
                Order on WhatsApp
              </ButtonLink>
            ) : null}
            {site.assistant ? <AskButton question={`I have a question about "${product.name}": `}>Ask about this product</AskButton> : null}
            {!wa && !buy && !site.assistant ? <ButtonLink href={`/contact?about=${encodeURIComponent(product.name)}`}>Ask about this product</ButtonLink> : null}
          </div>

          {specs.length ? (
            <dl className="mt-10 divide-y divide-border rounded-card border border-border">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {product.tags?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-secondary">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {related.length ? (
        <section className="mt-20">
          <h2 className="font-heading text-2xl font-semibold">You may also like</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} design={d} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
