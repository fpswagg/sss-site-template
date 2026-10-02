"use client";

import { useState } from "react";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) {
    return <div className="flex aspect-square items-center justify-center rounded-card border border-border bg-elevated font-heading text-6xl text-muted">{name.slice(0, 1)}</div>;
  }
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[active]} alt={name} className="aspect-square w-full rounded-card border border-border object-cover" />
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Picture ${i + 1}`}
              aria-current={i === active}
              className={`shrink-0 overflow-hidden rounded-xl border-2 ${i === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
