import type { ReactNode } from "react";
import { getSite } from "@/lib/sss";
import { getPosts } from "@/lib/content";
import { arrange, highlights, siteOverrides } from "@/lib/meta";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/format";
import type { Section as SectionConfig, SiteData } from "@/lib/types";
import { mainCta } from "@/components/header";
import { ButtonLink, Section } from "@/components/ui";
import { AskButton } from "@/components/ask-button";
import { ContactForm } from "@/components/contact-form";
import { gridCols, livePromotions, ProductCard, ProjectCard, PromotionCard, ServiceCard } from "@/components/cards";
import Link from "next/link";

/**
 * Home page. Its blocks follow the order and on/off switches the business set
 * in SSS → Showcase → Sections; each block hides itself when it has nothing to show.
 */
export default async function HomePage() {
  const site = await getSite();
  const posts = await getPosts();
  const sections = site.showcase.sections.filter((s) => s.enabled);
  return (
    <>
      <Hero site={site} />
      {sections.map((section) => (
        <Block key={section.type} section={section} site={site} />
      ))}
      {posts.length ? (
        <Section eyebrow="News" title="Latest from us" action={<ButtonLink href="/blog" variant="secondary">All posts</ButtonLink>}>
          <div className="grid gap-4 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-card border border-border bg-card p-5 hover:border-accent">
                <p className="text-xs text-muted">{formatDate(post.date)}</p>
                <p className="mt-2 font-heading text-lg font-semibold">{post.title}</p>
                {post.description ? <p className="mt-2 text-sm text-secondary">{post.description}</p> : null}
              </Link>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}

function Hero({ site }: { site: SiteData }) {
  const { business, showcase } = site;
  const d = showcase.design;
  const tagline = siteOverrides(business).tagline;
  const title = showcase.heroTitle || business.name;
  const subtitle = showcase.heroSubtitle || business.description || "";
  const image = showcase.heroImageUrl || business.bannerUrl || null;
  const cta = mainCta(business, d);
  const centered = d.heroAlign === "center" || d.hero === "centered";
  const buttons = (dark: boolean) => (
    <div className={`mt-8 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}>
      {cta ? (
        <ButtonLink href={cta.href} external={cta.external}>
          {cta.label}
        </ButtonLink>
      ) : null}
      {site.products.length ? (
        <ButtonLink href="/products" variant={dark ? "light" : "secondary"}>
          See products
        </ButtonLink>
      ) : null}
      {site.assistant ? <AskButton light={dark}>Ask our assistant</AskButton> : null}
    </div>
  );
  const text = (dark: boolean) => (
    <>
      {tagline ? <p className={`mb-3 text-sm font-semibold uppercase tracking-[0.18em] ${dark ? "text-white/80" : "text-accent"}`}>{tagline}</p> : null}
      <h1 className={`font-heading text-4xl font-bold leading-[1.05] sm:text-6xl ${dark ? "text-white" : ""}`}>{title}</h1>
      {subtitle ? <p className={`mt-5 max-w-xl text-lg ${centered ? "mx-auto" : ""} ${dark ? "text-white/85" : "text-secondary"}`}>{subtitle}</p> : null}
      {buttons(dark)}
    </>
  );

  if (d.hero === "split" && image) {
    return (
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
        <div>{text(false)}</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="aspect-[4/3] w-full rounded-card border border-border object-cover" />
      </section>
    );
  }
  if ((d.hero === "banner" || d.hero === "centered") && image) {
    return (
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-black" style={{ opacity: Math.min(0.9, Math.max(0, d.heroOverlay / 100)) }} />
        <div className={`mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 ${centered ? "text-center" : ""}`}>{text(true)}</div>
      </section>
    );
  }
  return (
    <section className={`mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 ${centered ? "text-center" : ""}`}>{text(false)}</section>
  );
}

function Block({ section, site }: { section: SectionConfig; site: SiteData }): ReactNode {
  const { business, showcase } = site;
  const d = showcase.design;
  const t = (fallback: string) => section.title || fallback;

  switch (section.type) {
    case "about":
      return showcase.aboutMarkdown ? (
        <Section id="about" eyebrow="About" title={t(`About ${business.name}`)}>
          <div className="prose max-w-3xl" dangerouslySetInnerHTML={{ __html: renderMarkdown(showcase.aboutMarkdown) }} />
        </Section>
      ) : null;

    case "products": {
      const picks = highlights(site.products, d.productColumns * 2);
      return picks.length ? (
        <Section
          id="products"
          eyebrow="Shop"
          title={t("Our products")}
          action={<ButtonLink href="/products" variant="secondary">All products</ButtonLink>}
        >
          <div className={`grid gap-4 ${gridCols(d.productColumns)}`}>
            {picks.map((p) => (
              <ProductCard key={p.id} product={p} design={d} />
            ))}
          </div>
        </Section>
      ) : null;
    }

    case "services": {
      const items = highlights(site.services.filter((s) => s.data.active !== false), 6);
      return items.length ? (
        <Section id="services" eyebrow="Services" title={t("What we do")} action={<ButtonLink href="/services" variant="secondary">All services</ButtonLink>}>
          <div className="grid gap-4 md:grid-cols-3">
            {items.map((s) => (
              <ServiceCard key={s.id} record={s} />
            ))}
          </div>
        </Section>
      ) : null;
    }

    case "promotions": {
      const items = arrange(livePromotions(site.promotions));
      return items.length ? (
        <Section id="promotions" eyebrow="Offers" title={t("Current offers")}>
          <div className="grid gap-4 md:grid-cols-2">
            {items.slice(0, 4).map((p) => (
              <PromotionCard key={p.id} record={p} />
            ))}
          </div>
        </Section>
      ) : null;
    }

    case "projects":
    case "gallery": {
      if (section.type === "gallery" && sectionsHave(site, "projects")) return null;
      const items = highlights(site.projects, 6);
      return items.length ? (
        <Section id="work" eyebrow="Portfolio" title={t("Our work")} action={<ButtonLink href="/work" variant="secondary">See all</ButtonLink>}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <ProjectCard key={p.id} record={p} />
            ))}
          </div>
        </Section>
      ) : null;
    }

    case "team":
      return site.members.length ? (
        <Section id="team" eyebrow="Team" title={t("The people behind it")}>
          <ul className="flex flex-wrap gap-3">
            {site.members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-card border border-border bg-card px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-semibold text-on-accent">{m.name.slice(0, 1)}</span>
                <span>
                  <span className="block font-medium">{m.name}</span>
                  <span className="block text-xs capitalize text-muted">{m.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null;

    case "stats":
      return d.stats.length ? (
        <section className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
            {d.stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-heading text-4xl font-bold text-accent">{s.value}</p>
                <p className="mt-1 text-sm text-secondary">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null;

    case "testimonials":
      return d.testimonials.length ? (
        <Section id="testimonials" eyebrow="Reviews" title={t("What clients say")}>
          <div className="grid gap-4 md:grid-cols-3">
            {d.testimonials.map((r, i) => (
              <figure key={i} className="rounded-card border border-border bg-card p-6">
                <blockquote className="text-lg leading-relaxed">“{r.text}”</blockquote>
                {r.name ? <figcaption className="mt-4 text-sm text-muted">— {r.name}</figcaption> : null}
              </figure>
            ))}
          </div>
        </Section>
      ) : null;

    case "faq":
      return d.faq.length ? (
        <Section id="faq" eyebrow="FAQ" title={t("Questions & answers")} intro={site.assistant ? "Something else? Our assistant answers any time." : undefined}>
          <div className="max-w-3xl divide-y divide-border rounded-card border border-border bg-card">
            {d.faq.map((item, i) => (
              <details key={i} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {item.q}
                  <span className="text-accent transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 text-secondary">{item.a}</p>
              </details>
            ))}
          </div>
          {site.assistant ? (
            <div className="mt-5">
              <AskButton>Ask the assistant</AskButton>
            </div>
          ) : null}
        </Section>
      ) : null;

    case "hours":
      return d.hours.length ? (
        <Section id="hours" eyebrow="Visit us" title={t("Opening hours")}>
          <ul className="max-w-md divide-y divide-border rounded-card border border-border bg-card">
            {d.hours.map((h, i) => (
              <li key={i} className="flex justify-between gap-4 px-5 py-3">
                <span className="text-secondary">{h.days}</span>
                <span className="font-medium">{h.time}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null;

    case "map": {
      const place = [business.address, business.city, business.country].filter(Boolean).join(", ");
      return place ? (
        <Section id="map" eyebrow="Find us" title={t("Where we are")} intro={place}>
          <ButtonLink href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${place}`)}`} variant="secondary">
            Open in Maps
          </ButtonLink>
        </Section>
      ) : null;
    }

    case "links":
      return site.links.length ? (
        <Section id="links" title={t("Find us online")}>
          <div className="flex flex-wrap gap-2">
            {site.links.map((l) => (
              <ButtonLink key={l.id} href={l.url} variant="secondary">
                {l.label}
              </ButtonLink>
            ))}
          </div>
        </Section>
      ) : null;

    case "cta":
      return d.ctaBanner.title ? (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-card bg-accent p-8 text-on-accent sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2 className="font-heading text-3xl font-semibold">{d.ctaBanner.title}</h2>
              {d.ctaBanner.text ? <p className="mt-2 max-w-xl opacity-85">{d.ctaBanner.text}</p> : null}
            </div>
            {d.ctaBanner.button ? (
              d.ctaBanner.link === "#assistant" && site.assistant ? (
                <AskButton className="rounded-button bg-on-accent px-6 py-3 text-sm font-semibold text-accent">{d.ctaBanner.button}</AskButton>
              ) : (
                <a href={d.ctaBanner.link || "/contact"} className="rounded-button bg-on-accent px-6 py-3 text-sm font-semibold text-accent">
                  {d.ctaBanner.button}
                </a>
              )
            ) : null}
          </div>
        </section>
      ) : null;

    case "contact":
      return showcase.contactFormEnabled ? (
        <Section id="contact" eyebrow="Contact" title={t("Write to us")} intro="We answer quickly. Your message goes straight to our team.">
          <div className="max-w-2xl">
            <ContactForm />
          </div>
        </Section>
      ) : null;

    default:
      return null;
  }
}

function sectionsHave(site: SiteData, type: string) {
  return site.showcase.sections.some((s) => s.type === type && s.enabled);
}
