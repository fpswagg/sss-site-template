/**
 * Shapes of the SSS public payloads this site reads.
 * Source of truth: GET /api/v1/stores/:slug/showcase (see docs/sss-integration.md).
 * Every field may be missing on an older SSS, so readers stay defensive.
 */

export type Metadata = Record<string, unknown>;

export type ProductImage = { url?: string; key?: string; alt?: string };

export type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  currency: string;
  description?: string | null;
  category?: string | null;
  tags?: string[];
  unit?: string;
  images?: ProductImage[];
  active?: boolean;
  unlimitedStock?: boolean;
  quantity?: number;
  inStock?: boolean;
  metadata?: Metadata;
};

/** Services, promotions and projects are SASTO records: a name plus free data. */
export type SastoRecord = {
  id: string;
  kind: string;
  name: string;
  data: Record<string, unknown>;
  metadata?: Metadata;
  createdAt?: string;
  updatedAt?: string;
};

export type Member = { id: string; name: string; role: string };

export type StoreLink = { id: string; label: string; url: string; kind?: string };

export type Social = "facebook" | "instagram" | "tiktok" | "youtube" | "x" | "linkedin" | "telegram";

export type Design = {
  font: "modern" | "classic" | "rounded" | "mono";
  hero: "banner" | "split" | "centered" | "minimal";
  cards: "soft" | "sharp";
  announcement: string;
  announcementLink: string;
  cta: "whatsapp" | "phone" | "contact" | "link" | "none";
  ctaLabel: string;
  ctaLink: string;
  showPrices: boolean;
  showStock: boolean;
  whatsappOrder: boolean;
  floatingChat: boolean;
  search: boolean;
  socials: Partial<Record<Social, string>>;
  hours: Array<{ days: string; time: string }>;
  faq: Array<{ q: string; a: string }>;
  testimonials: Array<{ name: string; text: string }>;
  stats: Array<{ value: string; label: string }>;
  ctaBanner: { title: string; text: string; button: string; link: string };
  buttons: "pill" | "rounded" | "square";
  heroAlign: "left" | "center";
  heroOverlay: number;
  productColumns: 2 | 3 | 4;
  logoShape: "square" | "circle";
  footerText: string;
};

export type Section = { type: string; enabled: boolean; title?: string };

export type Showcase = {
  published?: boolean;
  theme: string;
  accent: string;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImageUrl?: string | null;
  sections: Section[];
  aboutMarkdown: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  contactFormEnabled: boolean;
  design: Design;
};

export type Business = {
  slug: string;
  name: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  website?: string | null;
  metadata?: Metadata;
};

/** The customer assistant SSS publishes with the showcase (SSS → Customer bot → Website). */
export type Assistant = {
  publicKey: string;
  name: string;
  avatarUrl?: string | null;
  greeting?: string;
  suggestions?: string[];
  accent?: string | null;
};

export type SiteData = {
  business: Business;
  showcase: Showcase;
  products: Product[];
  services: SastoRecord[];
  promotions: SastoRecord[];
  projects: SastoRecord[];
  members: Member[];
  links: StoreLink[];
  assistant: Assistant | null;
  /** "sss": live data. "demo": built-in sample (no SSS_STORE_SLUG). */
  source: "sss" | "demo";
};
