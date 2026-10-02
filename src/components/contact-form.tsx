"use client";

import { useState } from "react";

/**
 * Posts to this site's /api/contact, which forwards to SSS. The message shows
 * up in the business's SSS notifications and the sender becomes a client (lead).
 */
export function ContactForm({ subject }: { subject?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(form: HTMLFormElement) {
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (!data.email?.trim() && !data.phone?.trim()) {
      setState("error");
      setError("Leave an email or a phone number so we can answer you.");
      return;
    }
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(body?.error || "Could not send your message.");
      form.reset();
      setState("sent");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not send your message.");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-card border border-accent bg-card p-6" role="status">
        <p className="font-heading text-xl font-semibold">Thank you!</p>
        <p className="mt-2 text-secondary">Your message reached our team. We will get back to you soon.</p>
        <button type="button" className="mt-4 text-sm text-accent underline" onClick={() => setState("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  const field = "w-full rounded-xl border border-border-strong bg-bg px-4 py-3 text-fg placeholder:text-muted focus:border-accent focus:outline-none";
  return (
    <form
      className="grid gap-4 rounded-card border border-border bg-card p-5 sm:grid-cols-2 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        void submit(e.currentTarget);
      }}
    >
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium">Your name</span>
        <input name="name" required maxLength={160} autoComplete="name" className={field} />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Phone / WhatsApp</span>
        <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={field} />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Email</span>
        <input name="email" type="email" maxLength={160} autoComplete="email" className={field} />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium">Message</span>
        <textarea name="message" required maxLength={4000} rows={5} defaultValue={subject ? `About: ${subject}\n\n` : ""} className={field} />
      </label>
      {/* Bots fill every field; people never see this one. */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-button bg-accent px-6 py-3 text-sm font-semibold text-on-accent disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Send message"}
        </button>
        {state === "error" ? (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
