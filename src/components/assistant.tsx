"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Assistant as AssistantProfile } from "@/lib/types";
import { renderMarkdown } from "@/lib/markdown";

/**
 * The business's AI customer assistant (SSS → Customer bot). It talks to the
 * public bot API straight from the browser — `/api/v1/bot/:publicKey` is the
 * one SSS route open to any website. The key only reaches this bot; answers
 * count on the business's SSS assistant credits.
 *
 * Open it from anywhere: a link to `#assistant`, or
 *   window.dispatchEvent(new CustomEvent("sss:ask", { detail: "Is it in stock?" }))
 * (see AskButton).
 */

type ChatFile = { name: string; mediaType: string; url?: string };
type Choices = { question: string; options: string[]; multiple: boolean };
type Message = { role: "user" | "assistant"; content: string; files?: ChatFile[]; choices?: Choices; pending?: boolean };

const VISITOR_KEY = "sss_visitor_id";

/** Demo data only: canned answers so the widget can be tried without SSS. */
function demoReply(message: string): string {
  const m = message.toLowerCase();
  if (/deliver|livr/.test(m)) return "We deliver everywhere in Douala within **24 hours**, free over 10,000 FCFA in Akwa.";
  if (/pay|momo|orange|cash/.test(m)) return "You can pay with **Orange Money**, **MTN MoMo** or cash on delivery.";
  if (/sell|product|price|prix/.test(m)) return "We sell natural soaps (from 1,200 FCFA), shea butter (3,500 FCFA), palm oil, rice and honey. See the [products page](/products).";
  return "This is the **demo assistant**. Connect the site to your SSS business (`SSS_STORE_SLUG`) and your real AI assistant answers here, with your catalogue, prices and hours.";
}

function visitorId(): string {
  try {
    const saved = localStorage.getItem(VISITOR_KEY);
    if (saved) return saved;
    const id = `v_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    // Private mode: a new conversation per page load.
    return `v_${Math.random().toString(36).slice(2, 14)}${Date.now().toString(36)}`;
  }
}

export function Assistant({
  apiUrl,
  assistant,
  businessName,
  floating = true,
}: {
  apiUrl: string;
  assistant: AssistantProfile;
  businessName: string;
  floating?: boolean;
}) {
  const base = `${apiUrl}/api/v1/bot/${encodeURIComponent(assistant.publicKey)}/messages`;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const visitor = useRef<string>("");
  const historyRequested = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const accent = assistant.accent && /^#[0-9a-f]{6}$/i.test(assistant.accent) ? assistant.accent : undefined;

  const demo = assistant.publicKey === "demo";

  const loadHistory = useCallback(async () => {
    if (demo) {
      setLoaded(true);
      return;
    }
    visitor.current ||= visitorId();
    try {
      const res = await fetch(`${base}?source=widget&visitorId=${encodeURIComponent(visitor.current)}`);
      const body = (await res.json()) as { data?: Message[] };
      if (res.ok && Array.isArray(body.data)) setMessages(body.data.map((m) => ({ ...m, content: m.content ?? "" })));
    } catch {
      /* the greeting still shows */
    } finally {
      setLoaded(true);
    }
  }, [base, demo]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || busy) return;
      visitor.current ||= visitorId();
      setError(null);
      setDraft("");
      setPicked([]);
      setBusy(true);
      setMessages((prev) => [...prev.map((m) => ({ ...m, choices: undefined })), { role: "user", content: message }, { role: "assistant", content: "", pending: true }]);
      try {
        if (demo) {
          await new Promise((r) => setTimeout(r, 600));
          setMessages((prev) => [...prev.filter((m) => !m.pending), { role: "assistant", content: demoReply(message) }]);
          return;
        }
        const res = await fetch(base, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message, visitorId: visitor.current, source: "widget" }),
        });
        const body = (await res.json().catch(() => null)) as {
          data?: { reply: string; files?: ChatFile[]; choices?: Choices };
          error?: { code?: string; message?: string };
        } | null;
        if (!res.ok || !body?.data) {
          throw new Error(
            body?.error?.code === "RATE_LIMITED"
              ? "You are sending messages quickly. Wait a moment and try again."
              : body?.error?.message || "The assistant is not available right now."
          );
        }
        const reply = body.data;
        setMessages((prev) => [...prev.filter((m) => !m.pending), { role: "assistant", content: reply.reply, files: reply.files, choices: reply.choices }]);
      } catch (err) {
        setMessages((prev) => prev.filter((m) => !m.pending));
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setDraft(message);
      } finally {
        setBusy(false);
      }
    },
    [base, busy, demo]
  );

  /** Opens the panel; the first time, also loads the saved conversation. */
  const openPanel = useCallback(() => {
    setOpen(true);
    if (!historyRequested.current) {
      historyRequested.current = true;
      void loadHistory();
    }
  }, [loadHistory]);

  const reset = useCallback(async () => {
    visitor.current ||= visitorId();
    setMessages([]);
    setError(null);
    if (demo) return;
    await fetch(`${base}?source=widget&visitorId=${encodeURIComponent(visitor.current)}`, { method: "DELETE" }).catch(() => undefined);
  }, [base, demo]);

  // Open on #assistant links and on "sss:ask" events (product pages, banners…).
  useEffect(() => {
    const fromHash = () => {
      if (window.location.hash === "#assistant") {
        openPanel();
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };
    const onAsk = (event: Event) => {
      openPanel();
      const text = (event as CustomEvent<string>).detail;
      if (typeof text === "string" && text.trim()) setDraft(text);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("sss:ask", onAsk);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener("sss:ask", onAsk);
    };
  }, [openPanel]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const last = messages[messages.length - 1];
  const choices = !busy && last?.role === "assistant" ? last.choices : undefined;
  const showSuggestions = loaded && messages.length === 0 && (assistant.suggestions?.length ?? 0) > 0;

  return (
    <div id="assistant" style={accent ? ({ "--accent": accent } as React.CSSProperties) : undefined}>
      {!open && floating ? (
        <button
          type="button"
          onClick={openPanel}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-accent py-3 pl-3 pr-5 text-sm font-semibold text-on-accent shadow-2xl transition-transform hover:scale-[1.03]"
          aria-label={`Chat with ${assistant.name}`}
        >
          <Avatar assistant={assistant} size={32} />
          Ask {assistant.name}
        </button>
      ) : null}

      {open ? (
        <section
          role="dialog"
          aria-label={`Chat with ${assistant.name}`}
          className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col overflow-hidden border border-border-strong bg-bg shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[min(640px,calc(100dvh-2.5rem))] sm:w-[400px] sm:rounded-card"
        >
          <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
            <Avatar assistant={assistant} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{assistant.name}</p>
              <p className="truncate text-xs text-muted">AI assistant · {businessName}</p>
            </div>
            {messages.length ? (
              <button type="button" onClick={() => void reset()} className="rounded-button px-2 py-1 text-xs text-muted hover:bg-elevated hover:text-fg">
                New chat
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-secondary hover:bg-elevated hover:text-fg"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            <Bubble role="assistant" content={assistant.greeting || `Hello! I am the assistant of ${businessName}. Ask me about our products, prices or opening hours.`} />
            {messages.map((m, i) => (
              <Bubble key={i} {...m} />
            ))}
            {showSuggestions ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {assistant.suggestions!.map((s) => (
                  <button key={s} type="button" onClick={() => void send(s)} className="rounded-full border border-border-strong px-3 py-1.5 text-left text-xs text-fg hover:border-accent">
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
            {choices ? (
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap gap-2">
                  {choices.options.map((option) => {
                    const on = picked.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={choices.multiple ? on : undefined}
                        onClick={() =>
                          choices.multiple ? setPicked((p) => (on ? p.filter((x) => x !== option) : [...p, option])) : void send(option)
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs ${on ? "border-accent bg-accent text-on-accent" : "border-border-strong text-fg hover:border-accent"}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {choices.multiple && picked.length ? (
                  <button type="button" onClick={() => void send(picked.join(", "))} className="rounded-button bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent">
                    Send
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {error ? <p className="border-t border-border bg-surface px-4 py-2 text-xs text-red-500">{error}</p> : null}

          <form
            className="flex items-end gap-2 border-t border-border bg-surface p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              maxLength={2000}
              placeholder="Write a message…"
              aria-label="Message"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(draft);
                }
              }}
              className="max-h-32 min-h-[42px] flex-1 resize-none rounded-2xl border border-border-strong bg-bg px-3.5 py-2.5 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              aria-label="Send"
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-accent text-on-accent disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}

function Avatar({ assistant, size }: { assistant: AssistantProfile; size: number }) {
  if (assistant.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={assistant.avatarUrl} alt="" width={size} height={size} className="shrink-0 rounded-full border border-border object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-on-accent/15" style={{ width: size, height: size }} aria-hidden>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z" />
      </svg>
    </span>
  );
}

function Bubble({ role, content, files, pending }: Message) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${mine ? "rounded-br-md bg-accent text-on-accent" : "rounded-bl-md bg-elevated text-fg"}`}>
        {pending ? (
          <span className="inline-flex gap-1 py-1" aria-label="Typing">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </span>
        ) : mine ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="chat-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
        )}
        {files?.length ? (
          <div className="mt-2 grid gap-2">
            {files.map((file, i) =>
              file.url && file.mediaType.startsWith("image/") ? (
                <a key={i} href={file.url} target="_blank" rel="noopener">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.url} alt={file.name} className="max-h-56 w-full rounded-xl object-cover" />
                </a>
              ) : file.url ? (
                <a key={i} href={file.url} target="_blank" rel="noopener" className="underline">
                  {file.name}
                </a>
              ) : null
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
