import type { Business, Product } from "./types";

/** "FCFA" is how SSS spells the Central African franc (ISO XAF). */
export function money(amount: number, currency = "FCFA"): string {
  const code = !currency || currency === "FCFA" || currency === "XAF" ? "XAF" : currency;
  try {
    const text = new Intl.NumberFormat("fr-FR", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(amount);
    return code === "XAF" ? text.replace("FCFA", "").replace("XAF", "").trim() + " FCFA" : text;
  } catch {
    return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
  }
}

export function digits(phone?: string | null): string {
  return (phone ?? "").replace(/[^\d]/g, "");
}

export function whatsappLink(business: Business, text?: string): string | null {
  const number = digits(business.whatsapp || business.phone);
  if (!number) return null;
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function orderText(business: Business, product: Product, template: string): string {
  const price = money(product.price, product.currency);
  const fallback = `Hello ${business.name}, I would like to order: ${product.name} (${price}).`;
  return (template || fallback)
    .replaceAll("{product}", product.name)
    .replaceAll("{price}", price)
    .replaceAll("{business}", business.name);
}

export function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function productImage(product: Product): string | null {
  return product.images?.find((img) => img.url)?.url ?? null;
}
