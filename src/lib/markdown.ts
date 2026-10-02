import { Marked } from "marked";

/**
 * Markdown → HTML. Raw HTML inside markdown is escaped, so text typed in SSS
 * (the about text, FAQ…) can never inject scripts into the site. Links that
 * are not http(s), mailto, tel or relative are dropped.
 */
const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    link({ href, title, tokens }) {
      const label = this.parser.parseInline(tokens);
      if (!/^(https?:|mailto:|tel:|\/|#)/i.test(href)) return label;
      const external = /^https?:/i.test(href);
      return `<a href="${escapeAttr(href)}"${title ? ` title="${escapeAttr(title)}"` : ""}${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
    },
    image({ href, title, text }) {
      if (!/^(https?:|\/)/i.test(href)) return escapeHtml(text);
      return `<img src="${escapeAttr(href)}" alt="${escapeAttr(text)}"${title ? ` title="${escapeAttr(title)}"` : ""} loading="lazy" />`;
    },
  },
});

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/"/g, "&quot;");
}

export function renderMarkdown(source: string): string {
  return marked.parse(source ?? "", { async: false }) as string;
}

/** Plain text excerpt for descriptions and cards. */
export function excerpt(source: string, max = 160): string {
  const text = (source ?? "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
