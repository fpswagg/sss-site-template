import { NextResponse } from "next/server";
import { sendContact, SssUnavailableError } from "@/lib/sss";

/**
 * Contact form → SSS (POST /api/v1/stores/:slug/showcase/contact). Done on the
 * server because SSS does not accept that call from other websites' browsers.
 */
// Best-effort per-visitor limit (per server instance): 5 messages / 10 minutes.
const WINDOW_MS = 10 * 60_000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many messages. Please wait a few minutes." }, { status: 429 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const text = (key: string, max: number) => (typeof body?.[key] === "string" ? (body[key] as string).trim().slice(0, max) : "");

  // Honeypot: real visitors leave it empty.
  if (text("website", 200)) return NextResponse.json({ ok: true });

  const name = text("name", 160);
  const message = text("message", 4000);
  const email = text("email", 160);
  const phone = text("phone", 40);
  if (!name || !message) return NextResponse.json({ error: "Name and message are required." }, { status: 400 });
  if (!email && !phone) return NextResponse.json({ error: "Leave an email or a phone number." }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "That email does not look right." }, { status: 400 });

  try {
    const result = await sendContact({ name, message, ...(email ? { email } : {}), ...(phone ? { phone } : {}) });
    return NextResponse.json({ ok: true, demo: result.demo });
  } catch (err) {
    const status = err instanceof SssUnavailableError && err.status < 500 ? err.status : 502;
    const message = err instanceof SssUnavailableError && status === 400 ? err.message : "Could not send your message. Please try again or call us.";
    return NextResponse.json({ error: message }, { status });
  }
}
