import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import "./globals.css";
import { config } from "@/lib/config";
import { getSite, SssUnavailableError } from "@/lib/sss";
import { getPages, getPosts } from "@/lib/content";
import { authEnabled } from "@/lib/sss-auth";
import { siteOverrides } from "@/lib/meta";
import { themeVars } from "@/lib/theme";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Assistant } from "@/components/assistant";
import { DemoBanner } from "@/components/demo-banner";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { business, showcase } = await getSite();
    const title = showcase.seoTitle || business.name;
    const description = showcase.seoDescription || showcase.heroSubtitle || business.description || undefined;
    const image = showcase.ogImageUrl || showcase.heroImageUrl || business.bannerUrl || undefined;
    return {
      metadataBase: new URL(config.siteUrl),
      title: { default: title, template: `%s · ${business.name}` },
      description,
      icons: business.logoUrl ? { icon: business.logoUrl } : undefined,
      openGraph: { title, description, siteName: business.name, images: image ? [image] : undefined, type: "website" },
    };
  } catch {
    return { title: "Website unavailable" };
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  let site;
  try {
    site = await getSite();
  } catch (err) {
    return (
      <html lang="en">
        <body>
          <Unavailable error={err} />
        </body>
      </html>
    );
  }

  const { business, showcase } = site;
  const overrides = siteOverrides(business);
  const theme = overrides.theme || showcase.theme;
  const accent = overrides.accent || showcase.accent;
  const [pages, posts] = await Promise.all([getPages(), getPosts()]);

  const nav = [
    { href: "/", label: "Home" },
    ...(site.products.length ? [{ href: "/products", label: "Products" }] : []),
    ...(site.services.length ? [{ href: "/services", label: "Services" }] : []),
    ...(site.projects.length ? [{ href: "/work", label: "Our work" }] : []),
    ...pages.filter((p) => p.nav).map((p) => ({ href: `/${p.slug}`, label: p.title })),
    ...(posts.length ? [{ href: "/blog", label: "News" }] : []),
    { href: "/contact", label: "Contact" },
    // Sign in with SSS (docs/oauth.md). A plain link: reading the visitor here would make every page dynamic.
    ...(authEnabled() ? [{ href: "/account", label: "Account" }] : []),
  ];

  const showAssistant = Boolean(site.assistant) && !overrides.assistantOff;

  return (
    <html lang="en">
      <body style={themeVars(theme, accent, showcase.design) as CSSProperties} className="min-h-dvh bg-bg text-fg">
        {site.source === "demo" ? <DemoBanner /> : null}
        <Header business={business} design={showcase.design} nav={nav} />
        <main id="content">{children}</main>
        <Footer business={business} design={showcase.design} links={site.links} pages={pages} />
        {showAssistant && site.assistant ? (
          <Assistant apiUrl={config.apiUrl} assistant={site.assistant} businessName={business.name} floating={showcase.design.floatingChat} />
        ) : null}
      </body>
    </html>
  );
}

function Unavailable({ error }: { error: unknown }) {
  const notPublished = error instanceof SssUnavailableError && error.status === 404;
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 560, margin: "15vh auto", padding: "0 24px", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 28 }}>{notPublished ? "This site is not published yet" : "This site is temporarily unavailable"}</h1>
      <p style={{ color: "#666" }}>
        {notPublished
          ? "The business has not published its page in SSS yet (SSS → Showcase → Publish), or SSS_STORE_SLUG is wrong."
          : "We could not reach SSS. Please try again in a minute."}
      </p>
    </main>
  );
}
