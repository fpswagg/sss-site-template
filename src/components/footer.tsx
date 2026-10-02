import Link from "next/link";
import type { Doc } from "@/lib/content";
import type { Business, Design, Social, StoreLink } from "@/lib/types";
import { whatsappLink } from "@/lib/format";

const SOCIAL_LABEL: Record<Social, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  x: "X",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  telegram: "Telegram",
};

export function Footer({ business, design, links, pages }: { business: Business; design: Design; links: StoreLink[]; pages: Doc[] }) {
  const wa = whatsappLink(business);
  const place = [business.address, business.city, business.country].filter(Boolean).join(", ");
  const socials = Object.entries(design.socials ?? {}).filter(([, url]) => url) as Array<[Social, string]>;
  return (
    <footer className="mt-10 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-heading text-xl font-semibold">{business.name}</p>
          {business.description ? <p className="mt-3 max-w-sm text-sm text-secondary">{business.description}</p> : null}
          {socials.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noopener" className="rounded-button border border-border px-3 py-1.5 text-xs text-secondary hover:text-fg">
                  {SOCIAL_LABEL[key] ?? key}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-secondary">
            {business.phone ? (
              <li>
                <a href={`tel:${business.phone.replace(/\s+/g, "")}`} className="hover:text-fg">
                  {business.phone}
                </a>
              </li>
            ) : null}
            {wa ? (
              <li>
                <a href={wa} target="_blank" rel="noopener" className="hover:text-fg">
                  WhatsApp
                </a>
              </li>
            ) : null}
            {business.email ? (
              <li>
                <a href={`mailto:${business.email}`} className="hover:text-fg">
                  {business.email}
                </a>
              </li>
            ) : null}
            {place ? <li>{place}</li> : null}
          </ul>
          {design.hours.length ? (
            <ul className="mt-5 space-y-1 text-sm text-secondary">
              {design.hours.map((h, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>{h.days}</span>
                  <span className="text-fg">{h.time}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">More</p>
          <ul className="mt-4 space-y-2 text-sm text-secondary">
            {pages.map((page) => (
              <li key={page.slug}>
                <Link href={`/${page.slug}`} className="hover:text-fg">
                  {page.title}
                </Link>
              </li>
            ))}
            {links.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noopener" className="hover:text-fg">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-muted sm:px-6">
          <span>{design.footerText || `© ${new Date().getFullYear()} ${business.name}`}</span>
          <span>Powered by Sarena Shooting Star</span>
        </div>
      </div>
    </footer>
  );
}
