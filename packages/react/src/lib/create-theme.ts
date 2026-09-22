import { isDarkTheme, isThemeId, type BuiltinThemeId, type ThemeId } from "./themes";

/** Color tokens that map 1:1 onto Spatika CSS variables. */
export type ThemePalette = {
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  accentForeground?: string;
  destructive?: string;
  destructiveForeground?: string;
  border?: string;
  input?: string;
  inputBackground?: string;
  switchBackground?: string;
  ring?: string;
  sidebar?: string;
  sidebarForeground?: string;
  sidebarPrimary?: string;
  sidebarPrimaryForeground?: string;
  sidebarAccent?: string;
  sidebarAccentForeground?: string;
  sidebarBorder?: string;
  sidebarRing?: string;
  accentInfo?: string;
  accentInfoBg?: string;
  accentHighlight?: string;
  accentHighlightBg?: string;
  accentWarm?: string;
  accentWarmBg?: string;
  accentDangerBg?: string;
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
};

export type ThemeGlass = {
  bg?: string;
  panelBg?: string;
  mutedBg?: string;
  headerBg?: string;
  border?: string;
  blur?: string;
  headerBlur?: string;
  menuBlur?: string;
  saturate?: string;
  shadow?: string;
  highlight?: string;
  overlayBg?: string;
  overlayBlur?: string;
};

export type ThemeShape = {
  radius?: string;
  radiusCard?: string;
  radiusControl?: string;
  radiusPill?: string;
};

export type ThemeTypography = {
  fontFamily?: string;
};

export type CreateThemeOptions = {
  /** Unique id written to `data-spk-theme`. Must not collide with a built-in id. */
  id: string;
  label?: string;
  /** Built-in theme whose CSS variables are inherited, then overlaid. */
  extends?: BuiltinThemeId;
  colorScheme?: "light" | "dark";
  palette?: ThemePalette;
  glass?: ThemeGlass;
  shape?: ThemeShape;
  typography?: ThemeTypography;
  /** Escape hatch: raw CSS custom properties, e.g. `{ "--shadow-soft": "none" }`. */
  vars?: Record<string, string>;
};

export type SpatikaTheme = {
  id: string;
  label: string;
  extends: BuiltinThemeId;
  colorScheme: "light" | "dark";
  vars: Record<string, string>;
};

export const PALETTE_CSS_VARS = {
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  destructive: "--destructive",
  destructiveForeground: "--destructive-foreground",
  border: "--border",
  input: "--input",
  inputBackground: "--input-background",
  switchBackground: "--switch-background",
  ring: "--ring",
  sidebar: "--sidebar",
  sidebarForeground: "--sidebar-foreground",
  sidebarPrimary: "--sidebar-primary",
  sidebarPrimaryForeground: "--sidebar-primary-foreground",
  sidebarAccent: "--sidebar-accent",
  sidebarAccentForeground: "--sidebar-accent-foreground",
  sidebarBorder: "--sidebar-border",
  sidebarRing: "--sidebar-ring",
  accentInfo: "--accent-info",
  accentInfoBg: "--accent-info-bg",
  accentHighlight: "--accent-highlight",
  accentHighlightBg: "--accent-highlight-bg",
  accentWarm: "--accent-warm",
  accentWarmBg: "--accent-warm-bg",
  accentDangerBg: "--accent-danger-bg",
  chart1: "--chart-1",
  chart2: "--chart-2",
  chart3: "--chart-3",
  chart4: "--chart-4",
  chart5: "--chart-5",
} as const satisfies Record<keyof ThemePalette, string>;

export const GLASS_CSS_VARS = {
  bg: "--glass-bg",
  panelBg: "--glass-panel-bg",
  mutedBg: "--glass-muted-bg",
  headerBg: "--glass-header-bg",
  border: "--glass-border",
  blur: "--glass-blur",
  headerBlur: "--glass-header-blur",
  menuBlur: "--glass-menu-blur",
  saturate: "--glass-saturate",
  shadow: "--glass-shadow",
  highlight: "--glass-highlight",
  overlayBg: "--modal-overlay-bg",
  overlayBlur: "--modal-overlay-blur",
} as const satisfies Record<keyof ThemeGlass, string>;

export const SHAPE_CSS_VARS = {
  radius: "--radius",
  radiusCard: "--radius-card",
  radiusControl: "--radius-control",
  radiusPill: "--radius-pill",
} as const satisfies Record<keyof ThemeShape, string>;

const CUSTOM_THEME_STYLE_ID = "spk-custom-themes";

function assignMappedVars<T extends Record<string, string>>(
  vars: Record<string, string>,
  source: object | undefined,
  map: T,
) {
  if (!source) return;
  for (const [key, cssVar] of Object.entries(map)) {
    const value = (source as Record<string, string | undefined>)[key];
    if (typeof value === "string" && value.length > 0) vars[cssVar] = value;
  }
}

/** Build a custom theme that overlays CSS variables on a built-in Spatika theme. */
export function createTheme(options: CreateThemeOptions): SpatikaTheme {
  const id = options.id.trim();
  if (!id) {
    throw new Error("createTheme: `id` is required.");
  }
  if (isThemeId(id)) {
    throw new Error(`createTheme: "${id}" is a built-in theme. Choose a different id.`);
  }

  const base: BuiltinThemeId = options.extends ?? "mukta";
  const colorScheme = options.colorScheme ?? (isDarkTheme(base) ? "dark" : "light");
  const vars: Record<string, string> = {};

  assignMappedVars(vars, options.palette, PALETTE_CSS_VARS);
  assignMappedVars(vars, options.glass, GLASS_CSS_VARS);
  assignMappedVars(vars, options.shape, SHAPE_CSS_VARS);

  if (options.typography?.fontFamily) {
    vars["--font-sans"] = options.typography.fontFamily;
  }
  if (options.vars) {
    for (const [key, value] of Object.entries(options.vars)) {
      if (value) vars[key] = value;
    }
  }

  return {
    id,
    label: options.label?.trim() || id,
    extends: base,
    colorScheme,
    vars,
  };
}

/** Serialize a custom theme as an attribute selector rule. */
export function themeToCss(theme: SpatikaTheme): string {
  const entries = Object.entries(theme.vars);
  if (!entries.length) {
    return `[data-spk-theme="${theme.id}"] {\n}\n`;
  }
  const decls = entries.map(([key, value]) => `  ${key}: ${value};`).join("\n");
  const font = theme.vars["--font-sans"]
    ? `\n  font-family: var(--font-sans);`
    : "";
  return `[data-spk-theme="${theme.id}"] {\n${decls}${font}\n}\n`;
}

/** Inject (or replace) a single stylesheet for every registered custom theme. */
export function injectCustomThemeStyles(themes: readonly SpatikaTheme[]): void {
  if (typeof document === "undefined") return;
  let el = document.getElementById(CUSTOM_THEME_STYLE_ID) as HTMLStyleElement | null;
  if (!themes.length) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("style");
    el.id = CUSTOM_THEME_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = themes.map(themeToCss).join("\n");
}

export function findCustomTheme(
  theme: ThemeId,
  customThemes: readonly SpatikaTheme[] | undefined,
): SpatikaTheme | undefined {
  return customThemes?.find((item) => item.id === theme);
}
