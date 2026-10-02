"use client";

import type { ReactNode } from "react";

/** Opens the assistant with a question already typed (e.g. about one product). */
export function AskButton({
  question,
  children,
  className = "",
  light,
}: {
  question?: string;
  children: ReactNode;
  className?: string;
  /** Outlined white, for photos and dark banners. */
  light?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("sss:ask", { detail: question ?? "" }))}
      className={
        className ||
        `inline-flex items-center justify-center gap-2 rounded-button border px-5 py-2.5 text-sm font-semibold ${
          light ? "border-white/60 text-white hover:bg-white/10" : "border-border-strong text-fg hover:bg-elevated"
        }`
      }
    >
      {children}
    </button>
  );
}
