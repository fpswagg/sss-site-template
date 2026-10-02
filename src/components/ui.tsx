import Link from "next/link";
import type { ReactNode } from "react";

const BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold transition-[filter,background-color,border-color] duration-150";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external,
  className = "",
}: {
  href: string;
  children: ReactNode;
  /** "light": outlined white, for photos and dark banners. */
  variant?: "primary" | "secondary" | "light";
  external?: boolean;
  className?: string;
}) {
  const cls = `${BUTTON} ${
    variant === "primary"
      ? "bg-accent text-on-accent hover:brightness-110"
      : variant === "light"
        ? "border border-white/60 text-white hover:bg-white/10"
        : "border border-border-strong text-fg hover:bg-elevated"
  } ${className}`;
  if (external || /^(https?:|tel:|mailto:)/.test(href)) {
    return (
      <a href={href} className={cls} {...(/^https?:/.test(href) ? { target: "_blank", rel: "noopener" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  action,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20 ${className}`}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p> : null}
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">{title}</h2>
          {intro ? <p className="mt-3 text-secondary">{intro}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-heading text-4xl font-semibold sm:text-5xl">{title}</h1>
        {intro ? <p className="mt-3 max-w-2xl text-lg text-secondary">{intro}</p> : null}
        {children}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "neutral" | "danger" }) {
  const cls =
    tone === "accent"
      ? "bg-accent text-on-accent"
      : tone === "danger"
        ? "bg-red-600 text-white"
        : "border border-border-strong bg-bg/80 text-secondary";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-card border border-dashed border-border-strong p-10 text-center text-secondary">{children}</p>;
}
