"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function MobileNav({
  nav,
  cta,
}: {
  nav: Array<{ href: string; label: string }>;
  cta: { href: string; label: string; external: boolean } | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="ml-auto md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-button border border-border text-fg"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open ? (
        <div id="mobile-menu" className="absolute inset-x-0 top-16 border-b border-border bg-bg px-4 pb-5 pt-2 shadow-xl">
          <nav aria-label="Mobile" className="flex flex-col">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="border-b border-border py-3 text-base text-fg">
                {item.label}
              </Link>
            ))}
          </nav>
          {cta ? (
            <a
              href={cta.href}
              {...(cta.external ? { target: "_blank", rel: "noopener" } : {})}
              className="mt-4 flex w-full items-center justify-center rounded-button bg-accent px-5 py-3 text-sm font-semibold text-on-accent"
            >
              {cta.label}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
