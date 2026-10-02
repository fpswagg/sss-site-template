import type { SiteData } from "./types";
import { DEFAULT_DESIGN } from "./design";

/**
 * Sample business used when SSS_STORE_SLUG is empty, so the template runs
 * right after `npm install`. It has the exact shape SSS returns.
 */
export function demoData(): SiteData {
  const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;
  return {
    source: "demo",
    business: {
      slug: "demo",
      name: "Koto Market",
      description: "Natural soaps, oils and grains from Douala, delivered across the city.",
      phone: "+237 650 00 00 00",
      whatsapp: "+237650000000",
      email: "hello@koto.example",
      address: "Rue Joss, Akwa",
      city: "Douala",
      country: "Cameroon",
      logoUrl: null,
      bannerUrl: img("koto-banner"),
      metadata: { tagline: "Good things, made here." },
    },
    showcase: {
      published: true,
      theme: "sand",
      accent: "#C2410C",
      heroTitle: "Natural care, local grains",
      heroSubtitle: "Handmade black soap, pure shea butter and the best rice in Akwa. Order on WhatsApp or ask our assistant.",
      heroImageUrl: img("koto-hero"),
      sections: ["about", "products", "promotions", "services", "projects", "stats", "testimonials", "faq", "hours", "contact"].map((type) => ({ type, enabled: true })),
      aboutMarkdown:
        "Koto Market started in 2019 as a stall at the Akwa market.\n\nWe work with **twelve producers** around Douala and sell only what we use at home.",
      seoTitle: "Koto Market — soaps, oils and grains in Douala",
      seoDescription: "Natural soaps, shea butter and grains, delivered in Douala.",
      ogImageUrl: null,
      contactFormEnabled: true,
      design: {
        ...DEFAULT_DESIGN,
        font: "classic",
        announcement: "Free delivery in Akwa this week",
        socials: { instagram: "https://instagram.com/", facebook: "https://facebook.com/" },
        hours: [
          { days: "Mon – Fri", time: "8:00 – 19:00" },
          { days: "Saturday", time: "9:00 – 17:00" },
        ],
        faq: [
          { q: "Do you deliver?", a: "Yes, everywhere in Douala within 24 hours." },
          { q: "How do I pay?", a: "Orange Money, MTN MoMo or cash on delivery." },
        ],
        testimonials: [
          { name: "Awa", text: "The black soap changed my skin. I order every month." },
          { name: "Jean", text: "Fast delivery and very kind on WhatsApp." },
        ],
        stats: [
          { value: "12", label: "local producers" },
          { value: "2,400+", label: "orders delivered" },
          { value: "24 h", label: "delivery in Douala" },
        ],
        ctaBanner: { title: "Not sure what to choose?", text: "Our assistant knows every product and answers day and night.", button: "Ask the assistant", link: "#assistant" },
      },
    },
    products: [
      { id: "p1", sku: "SOAP-1", name: "Black soap 200g", price: 1500, currency: "FCFA", category: "Soap", images: [{ url: img("soap") }], description: "Traditional black soap with plantain ash and palm oil.", inStock: true, metadata: { featured: true, badge: "Best seller", specs: { Weight: "200 g", Origin: "Bafoussam" } } },
      { id: "p2", sku: "OIL-1", name: "Shea butter 250g", price: 3500, currency: "FCFA", category: "Oil", images: [{ url: img("shea") }], description: "Raw unrefined shea butter.", inStock: true, metadata: { featured: true, badge: "New" } },
      { id: "p3", sku: "GR-1", name: "Rice 5kg", price: 6500, currency: "FCFA", category: "Grain", images: [{ url: img("rice") }], description: "Long-grain local rice.", inStock: true, metadata: { featured: true } },
      { id: "p4", sku: "OIL-2", name: "Palm oil 1L", price: 2200, currency: "FCFA", category: "Oil", images: [{ url: img("palm") }], inStock: false },
      { id: "p5", sku: "SOAP-2", name: "Coconut soap", price: 1200, currency: "FCFA", category: "Soap", images: [{ url: img("coco") }], inStock: true },
      { id: "p6", sku: "GR-2", name: "Honey jar", price: 4000, currency: "FCFA", category: "Grain", images: [{ url: img("honey") }], inStock: true, metadata: { buyUrl: "https://example.com/checkout", buyLabel: "Buy online" } },
    ],
    services: [
      { id: "s1", kind: "service", name: "Home delivery", data: { description: "Anywhere in Douala within 24 hours.", price: 1000, currency: "FCFA", area: "Douala" } },
      { id: "s2", kind: "service", name: "Gift boxes", data: { description: "Soaps and oils wrapped for birthdays and weddings.", price: 8000, currency: "FCFA", image: img("gift") }, metadata: { badge: "Popular" } },
    ],
    promotions: [
      { id: "pr1", kind: "promotion", name: "Soap week", data: { description: "Every soap at −20% until the end of the month.", discountPct: 20, endsAt: "2099-12-31", image: img("promo") } },
    ],
    projects: [
      { id: "pj1", kind: "project", name: "Hotel Akwa Palace amenities", data: { description: "Soaps for 120 rooms, refilled every month.", status: "active", images: [img("hotel")] } },
    ],
    members: [
      { id: "m1", name: "Mireille", role: "owner" },
      { id: "m2", name: "Paul", role: "staff" },
    ],
    links: [],
    // "demo" key: the widget answers locally (see components/assistant.tsx), no SSS call.
    assistant: {
      publicKey: "demo",
      name: "Koto assistant",
      greeting: "Hello! I am the Koto Market assistant. Ask me about our soaps, oils, grains, prices or delivery.",
      suggestions: ["What do you sell?", "Do you deliver?", "How can I pay?"],
      accent: null,
    },
  };
}
