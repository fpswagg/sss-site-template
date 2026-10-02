import Link from "next/link";
import type { Design, Product, SastoRecord } from "@/lib/types";
import { badgeOf, recordImage, subtitleOf } from "@/lib/meta";
import { formatDate, money, productImage } from "@/lib/format";
import { Badge } from "./ui";

export function ProductCard({ product, design }: { product: Product; design: Design }) {
  const image = productImage(product);
  const badge = badgeOf(product);
  const subtitle = subtitleOf(product) || product.category || "";
  const soldOut = product.inStock === false;
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-card transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-elevated">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.images?.[0]?.alt || product.name} loading="lazy" className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${soldOut ? "opacity-60 grayscale" : ""}`} />
        ) : (
          <div className="flex h-full items-center justify-center font-heading text-4xl text-muted">{product.name.slice(0, 1)}</div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {badge ? <Badge>{badge}</Badge> : null}
          {soldOut ? <Badge tone="neutral">Sold out</Badge> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-semibold leading-snug group-hover:text-accent">{product.name}</p>
        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
        {design.showPrices ? <p className="mt-auto pt-3 font-semibold">{money(product.price, product.currency)}</p> : null}
      </div>
    </Link>
  );
}

export function ServiceCard({ record }: { record: SastoRecord }) {
  const d = record.data;
  const image = recordImage(record);
  const badge = badgeOf(record);
  const price = Number(d.price);
  const minutes = Number(d.durationMin);
  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-border bg-card">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-xl font-semibold">{record.name}</h3>
          {badge ? <Badge>{badge}</Badge> : null}
        </div>
        {typeof d.description === "string" && d.description ? <p className="mt-2 text-sm text-secondary">{d.description}</p> : null}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-sm">
          {Number.isFinite(price) && price > 0 ? <span className="font-semibold">{money(price, String(d.currency || "FCFA"))}</span> : null}
          {Number.isFinite(minutes) && minutes > 0 ? <span className="text-muted">{minutes} min</span> : null}
          {typeof d.area === "string" && d.area ? <span className="text-muted">{d.area}</span> : null}
        </div>
      </div>
    </article>
  );
}

/** Live or upcoming promotion. Ended ones are filtered out by livePromotions(). */
export function PromotionCard({ record }: { record: SastoRecord }) {
  const d = record.data;
  const image = recordImage(record);
  const pct = Number(d.discountPct);
  return (
    <article className="relative flex min-h-56 flex-col justify-end overflow-hidden rounded-card border border-border bg-elevated p-6">
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </>
      ) : null}
      <div className={`relative ${image ? "text-white" : ""}`}>
        {Number.isFinite(pct) && pct > 0 ? <p className="font-heading text-4xl font-bold text-accent">−{pct}%</p> : null}
        <h3 className="mt-1 font-heading text-2xl font-semibold">{record.name}</h3>
        {typeof d.description === "string" && d.description ? <p className={`mt-1 text-sm ${image ? "text-white/80" : "text-secondary"}`}>{d.description}</p> : null}
        {d.endsAt ? <p className={`mt-3 text-xs ${image ? "text-white/70" : "text-muted"}`}>Until {formatDate(d.endsAt)}</p> : null}
      </div>
    </article>
  );
}

export function ProjectCard({ record }: { record: SastoRecord }) {
  const d = record.data;
  const image = recordImage(record);
  return (
    <article className="overflow-hidden rounded-card border border-border bg-card">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
      ) : null}
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold">{record.name}</h3>
        {typeof d.description === "string" && d.description ? <p className="mt-2 text-sm text-secondary">{d.description}</p> : null}
      </div>
    </article>
  );
}

/** Promotions still running or coming, soonest end first. */
export function livePromotions(records: SastoRecord[]): SastoRecord[] {
  const today = new Date().toISOString().slice(0, 10);
  return records
    .filter((r) => {
      const end = typeof r.data.endsAt === "string" ? r.data.endsAt.slice(0, 10) : "";
      return !end || end >= today;
    })
    .sort((a, b) => String(a.data.endsAt ?? "9999").localeCompare(String(b.data.endsAt ?? "9999")));
}

export function gridCols(columns: Design["productColumns"]): string {
  return columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
}
