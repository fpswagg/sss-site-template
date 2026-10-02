import Link from "next/link";
import type { Business, Design } from "@/lib/types";
import { whatsappLink } from "@/lib/format";
import { MobileNav } from "./mobile-nav";
import { ButtonLink } from "./ui";

export function Header({ business, design, nav }: { business: Business; design: Design; nav: Array<{ href: string; label: string }> }) {
  const cta = mainCta(business, design);
  return (
    <>
      {design.announcement ? (
        <div className="bg-accent px-4 py-2 text-center text-sm font-medium text-on-accent">
          {design.announcementLink ? (
            <a href={design.announcementLink} className="underline-offset-4 hover:underline">
              {design.announcement}
            </a>
          ) : (
            design.announcement
          )}
        </div>
      ) : null}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logoUrl}
                alt=""
                className={`h-9 w-9 shrink-0 border border-border object-cover ${design.logoShape === "circle" ? "rounded-full" : "rounded-lg"}`}
              />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent font-heading text-lg font-bold text-on-accent">
                {business.name.slice(0, 1)}
              </span>
            )}
            <span className="truncate font-heading text-lg font-semibold">{business.name}</span>
          </Link>
          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-button px-3 py-2 text-sm text-secondary transition-colors hover:bg-elevated hover:text-fg">
                {item.label}
              </Link>
            ))}
          </nav>
          {cta ? (
            <div className="hidden md:block">
              <ButtonLink href={cta.href} external={cta.external}>
                {cta.label}
              </ButtonLink>
            </div>
          ) : null}
          <MobileNav nav={nav} cta={cta} />
        </div>
      </header>
    </>
  );
}

/** The main button chosen in SSS → Showcase (WhatsApp, call, contact form or a link). */
export function mainCta(business: Business, design: Design): { href: string; label: string; external: boolean } | null {
  switch (design.cta) {
    case "none":
      return null;
    case "phone":
      return business.phone ? { href: `tel:${business.phone.replace(/\s+/g, "")}`, label: design.ctaLabel || "Call us", external: false } : null;
    case "contact":
      return { href: "/contact", label: design.ctaLabel || "Contact us", external: false };
    case "link":
      return design.ctaLink ? { href: design.ctaLink, label: design.ctaLabel || "Learn more", external: /^https?:/.test(design.ctaLink) } : null;
    default: {
      const wa = whatsappLink(business);
      return wa
        ? { href: wa, label: design.ctaLabel || "Order on WhatsApp", external: true }
        : { href: "/contact", label: design.ctaLabel || "Contact us", external: false };
    }
  }
}
