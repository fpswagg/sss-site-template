import { NextResponse } from "next/server";
import { refreshUser } from "@/lib/sss-auth";

/**
 * The signed-in visitor, fresh from SSS (the access token is refreshed when needed).
 * For your own client components: fetch("/auth/sss/me"). No token ever reaches the browser.
 */
export async function GET() {
  const user = await refreshUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
}
