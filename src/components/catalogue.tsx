"use client";

import { useMemo, useState } from "react";
import type { Design, Product } from "@/lib/types";
import { gridCols, ProductCard } from "./cards";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

/** Product grid with search, category chips and sort, all in the browser. */
export function Catalogue({ products, design }: { products: Product[]; design: Design }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const visible = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (inStockOnly && p.inStock === false) return false;
      if (!words.length) return true;
      const hay = [p.name, p.description, p.category, p.sku, ...(p.tags ?? [])].join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    // "featured" keeps the order SSS metadata gave (featured first, then `order`).
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [category, inStockOnly, products, query, sort]);

  const field = "rounded-button border border-border-strong bg-bg px-4 py-2.5 text-sm text-fg focus:border-accent focus:outline-none";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {design.search ? (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className={`${field} min-w-0 flex-1 sm:max-w-sm`}
          />
        ) : null}
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className={field}>
          <option value="featured">Recommended</option>
          {design.showPrices ? <option value="price-asc">Price: low to high</option> : null}
          {design.showPrices ? <option value="price-desc">Price: high to low</option> : null}
          <option value="name">Name</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-secondary">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          In stock only
        </label>
      </div>
      {categories.length > 1 ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Category">
          {[["", products.length] as [string, number], ...categories].map(([name, count]) => {
            const active = category === name;
            return (
              <button
                key={name || "all"}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setCategory(name)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active ? "border-accent bg-accent text-on-accent" : "border-border text-secondary hover:border-border-strong hover:text-fg"
                }`}
              >
                {name || "All"} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      <p className="mt-4 text-sm text-muted">
        {visible.length === products.length ? `${products.length} products` : `${visible.length} of ${products.length} products`}
      </p>
      {visible.length ? (
        <div className={`mt-4 grid gap-4 ${gridCols(design.productColumns)}`}>
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} design={design} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-card border border-dashed border-border-strong p-10 text-center">
          <p className="text-secondary">Nothing matches your search.</p>
          <button
            type="button"
            className="mt-3 text-sm text-accent underline"
            onClick={() => {
              setQuery("");
              setCategory("");
              setInStockOnly(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
