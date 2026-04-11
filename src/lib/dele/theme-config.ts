/**
 * DELE Dark Mode Semantic Palette — WCAG 2.1/2.2 Compliant
 * Spanish cultural identity: warm red + gold, deep navy
 */

export const DELE_DARK_PALETTE = {
  bg: {
    primary: "#121212",
    secondary: "#1E1E1E",
    tertiary: "#2A2A2A",
    overlay: "#1F1F1F",
    input: "#252525",
    hover: "#333333",
    active: "#3A3A3A",
  },
  text: {
    primary: "#F5F5F5",
    secondary: "#E0E0E0",
    muted: "#B0B0B0",
    disabled: "#787878",
    inverse: "#121212",
  },
  accent: {
    primary: "#EF4444",     // warm red
    primaryHover: "#F87171",
    gold: "#FBBF24",        // Spanish flag gold
    navy: "#3B82F6",        // deep navy
    success: "#34D399",
    error: "#FF7A7A",
    warning: "#FFB74D",
    info: "#90CAF9",
  },
  border: {
    subtle: "#2F2F2F",
    default: "#404040",
    strong: "#555555",
    focus: "#EF4444",
  },
  levels: {
    A1: "#4ADE80",
    A2: "#22C55E",
    B1: "#60A5FA",
    B2: "#3B82F6",
    C1: "#C084FC",
    C2: "#A855F7",
  } as Record<string, string>,
} as const;

export const DELE_LIGHT_PALETTE = {
  bg: {
    primary: "#FAFAFA",
    secondary: "#FFFFFF",
    tertiary: "#FFF7ED",
    overlay: "#FFFFFF",
    input: "#FFFFFF",
    hover: "#F0F0F0",
    active: "#E8E8E8",
  },
  text: {
    primary: "#1A1A1A",
    secondary: "#4A4A4A",
    muted: "#717171",
    disabled: "#A0A0A0",
    inverse: "#FFFFFF",
  },
  accent: {
    primary: "#DC2626",     // warm red
    primaryHover: "#B91C1C",
    gold: "#F59E0B",        // Spanish flag gold
    navy: "#1E3A5F",        // deep navy
    success: "#059669",
    error: "#DC2626",
    warning: "#D97706",
    info: "#2563EB",
  },
  border: {
    subtle: "#E5E7EB",
    default: "#D1D5DB",
    strong: "#9CA3AF",
    focus: "#DC2626",
  },
  levels: {
    A1: "#22C55E",
    A2: "#16A34A",
    B1: "#2563EB",
    B2: "#1D4ED8",
    C1: "#9333EA",
    C2: "#7C3AED",
  } as Record<string, string>,
} as const;

export function generateCSSVariables(mode: "dark" | "light"): Record<string, string> {
  const palette = mode === "dark" ? DELE_DARK_PALETTE : DELE_LIGHT_PALETTE;
  const vars: Record<string, string> = {};

  for (const [key, val] of Object.entries(palette.bg)) {
    vars[`--dele-bg-${key}`] = val;
  }
  for (const [key, val] of Object.entries(palette.text)) {
    vars[`--dele-text-${key}`] = val;
  }
  for (const [key, val] of Object.entries(palette.accent)) {
    vars[`--dele-accent-${key}`] = val;
  }
  for (const [key, val] of Object.entries(palette.border)) {
    vars[`--dele-border-${key}`] = val;
  }
  for (const [key, val] of Object.entries(palette.levels)) {
    vars[`--dele-level-${key.toLowerCase()}`] = val;
  }

  return vars;
}
