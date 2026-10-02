import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { config, SSS_TAG } from "@/lib/config";

/**
 * POST /api/revalidate?secret=REVALIDATE_SECRET — fetch fresh SSS data on the
 * next visit instead of waiting SSS_REVALIDATE seconds. Call it after editing
 * products or the showcase in SSS (a bookmark, a cron, or a webhook).
 */
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret") ?? request.headers.get("x-revalidate-secret") ?? "";
  if (!config.revalidateSecret || secret !== config.revalidateSecret) {
    return NextResponse.json({ error: "Wrong or missing secret" }, { status: 401 });
  }
  revalidateTag(SSS_TAG, "max");
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
