import type { Design } from "./types";

/**
 * The SSS showcase themes and fonts, as CSS variables. Same palettes as the SSS
 * public page so the business's choices in SSS → Showcase carry over.
 * Fonts are system stacks: nothing is fetched from Google at build or run time.
 */
export const THEMES: Record<string, Record<string, string>> = {
  midnight: { bg: "#0B0D0C", surface: "#111512", elevated: "#1A1F1B", card: "#151916", text: "#F2F4F0", "text-secondary": "#A2AAA3", muted: "#6E776F", border: "#262B27", "border-strong": "#3A413B" },
  light: { bg: "#FFFFFF", surface: "#F6F6F3", elevated: "#EFEFEA", card: "#FFFFFF", text: "#151515", "text-secondary": "#555555", muted: "#8A8A85", border: "#E6E6E1", "border-strong": "#CFCFC8" },
  sand: { bg: "#F7F1E7", surface: "#EFE5D4", elevated: "#E8DCC7", card: "#FCF8F1", text: "#2A2118", "text-secondary": "#5E4E3C", muted: "#8C7A64", border: "#E3D5BE", "border-strong": "#CDBB9D" },
  forest: { bg: "#0E1B15", surface: "#13241C", elevated: "#1B3127", card: "#172B22", text: "#EAF3EC", "text-secondary": "#A8BDB0", muted: "#7A9384", border: "#244032", "border-strong": "#335845" },
  ocean: { bg: "#F3F8FC", surface: "#E6EFF7", elevated: "#DAE7F2", card: "#FFFFFF", text: "#0F2233", "text-secondary": "#3F5569", muted: "#6F8499", border: "#D3E1EC", "border-strong": "#B6CCDD" },
  rose: { bg: "#FFF7F8", surface: "#FBEBEE", elevated: "#F6DDE2", card: "#FFFFFF", text: "#2B1418", "text-secondary": "#5E3A41", muted: "#946B73", border: "#F1D5DA", "border-strong": "#E2B5BE" },
};

const FONTS: Record<Design["font"], { heading: string; body: string }> = {
  modern: { heading: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", body: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  classic: { heading: "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif", body: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  rounded: { heading: "ui-rounded, 'SF Pro Rounded', 'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", body: "ui-rounded, 'SF Pro Rounded', 'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
  mono: { heading: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace", body: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif" },
};

const RADIUS: Record<Design["buttons"], string> = { pill: "999px", rounded: "10px", square: "2px" };

function isDark(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return true;
  const n = parseInt(m[1]!, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b < 150;
}

/** CSS custom properties for <body style>. */
export function themeVars(theme: string, accent: string, design: Design): Record<string, string> {
  const palette = THEMES[theme] ?? THEMES.midnight!;
  const font = FONTS[design.font] ?? FONTS.modern;
  const safeAccent = /^#[0-9a-f]{6}$/i.test(accent) ? accent : "#0EE556";
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(palette)) vars[`--${key}`] = value;
  vars["--accent"] = safeAccent;
  vars["--on-accent"] = isDark(safeAccent) ? "#FFFFFF" : "#111111";
  vars["--heading-font"] = font.heading;
  vars["--body-font"] = font.body;
  vars["--button-radius"] = RADIUS[design.buttons] ?? RADIUS.pill;
  vars["--card-radius"] = design.cards === "sharp" ? "4px" : "16px";
  vars.colorScheme = isDark(palette.bg!) ? "dark" : "light";
  return vars;
}
