import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { signOut } from "@/lib/sss-auth";

/** POST only (a form button), so another site cannot sign visitors out with a link. */
export async function POST() {
  await signOut();
  return NextResponse.redirect(new URL("/account", config.siteUrl), 303);
}
