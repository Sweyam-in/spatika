/**
 * The default theme: Tailwind-compatible scales with every named value pointed at a Spatika
 * token. Colour, radius, shadow, type and motion names resolve to `--spk-*` variables, so a
 * utility such as `bg-surface` or `rounded-lg` re-themes with Mukta, Neelam, Usha, Sandhya
 * and any `createTheme` overlay. Unmapped Tailwind defaults (the colour palette, `text-2xl` …)
 * keep their Tailwind CSS v4 values so existing markup renders unchanged (see NOTICE.md).
 */
import { PALETTE } from "./palette";

export type FontSizeValue = {
  size: string;
  lineHeight?: string;
  letterSpacing?: string;
  fontWeight?: string;
};

export type AnimationValue = {
  /** The `animation` shorthand. */
  value: string;
  /** Keyframes the animation needs, emitted once when a class uses it. */
  keyframes?: string;
};

export type Theme = {
  /** Colour name → CSS colour (`bg-*`, `text-*`, `border-*`, `ring-*` …). */
  colors: Record<string, string>;
  /** One spacing step; `p-4` is four steps. */
  spacing: string;
  /** Breakpoint name → min-width, for `sm:` … `2xl:` and `max-*:` variants. */
  breakpoints: Record<string, string>;
  /** Named widths for `max-w-*`, `w-*`, `basis-*` and `@container` sizes. */
  containers: Record<string, string>;
  fontSize: Record<string, FontSizeValue>;
  fontFamily: Record<string, string>;
  fontWeight: Record<string, string>;
  tracking: Record<string, string>;
  leading: Record<string, string>;
  /** Key `""` is the bare `rounded` class. */
  radius: Record<string, string>;
  /** Key `""` is the bare `shadow` class. */
  shadow: Record<string, string>;
  insetShadow: Record<string, string>;
  dropShadow: Record<string, string>;
  textShadow: Record<string, string>;
  blur: Record<string, string>;
  perspective: Record<string, string>;
  aspect: Record<string, string>;
  ease: Record<string, string>;
  animate: Record<string, AnimationValue>;
  /** Default `transition` duration and timing. */
  transition: { duration: string; timing: string };
  /** Selector condition for the `dark:` variant, applied as `&:is(…)`. */
  darkSelector: string;
  /** Colour of `ring` / `ring-2` when no `ring-*` colour is set (Spatika's focus colour). */
  ringColor: string;
};

export const SPATIKA_COLORS: Record<string, string> = {
  "canvas": "var(--spk-canvas)",
  "surface": "var(--spk-surface)",
  "surface-raised": "var(--spk-surface-raised)",
  "surface-overlay": "var(--spk-surface-overlay)",
  "surface-subtle": "var(--spk-surface-subtle)",
  "surface-sunken": "var(--spk-surface-sunken)",
  "surface-inverse": "var(--spk-surface-inverse)",
  "fg": "var(--spk-text-primary)",
  "fg-secondary": "var(--spk-text-secondary)",
  "fg-tertiary": "var(--spk-text-tertiary)",
  "fg-disabled": "var(--spk-text-disabled)",
  "fg-inverse": "var(--spk-text-inverse)",
  "line": "var(--spk-border)",
  "line-subtle": "var(--spk-border-subtle)",
  "line-strong": "var(--spk-border-strong)",
  "hover": "var(--spk-state-hover)",
  "pressed": "var(--spk-state-active)",
  "accent-solid": "var(--spk-accent)",
  "accent-hover": "var(--spk-accent-hover)",
  "accent-active": "var(--spk-accent-active)",
  "accent-muted": "var(--spk-accent-muted)",
  "accent-subtle": "var(--spk-accent-subtle)",
  "accent-text": "var(--spk-accent-text)",
  "accent-border": "var(--spk-accent-border)",
  "success": "var(--spk-success)",
  "success-text": "var(--spk-success-text)",
  "success-muted": "var(--spk-success-muted)",
  "warning": "var(--spk-warning)",
  "warning-text": "var(--spk-warning-text)",
  "warning-muted": "var(--spk-warning-muted)",
  "danger": "var(--spk-danger)",
  "danger-text": "var(--spk-danger-text)",
  "danger-muted": "var(--spk-danger-muted)",
  "info": "var(--spk-info)",
  "info-text": "var(--spk-info-text)",
  "info-muted": "var(--spk-info-muted)",
  "positive": "var(--spk-positive)",
  "negative": "var(--spk-negative)",
  "background": "var(--background)",
  "foreground": "var(--foreground)",
  "card": "var(--card)",
  "card-foreground": "var(--card-foreground)",
  "popover": "var(--popover)",
  "popover-foreground": "var(--popover-foreground)",
  "primary": "var(--primary)",
  "primary-foreground": "var(--primary-foreground)",
  "secondary": "var(--secondary)",
  "secondary-foreground": "var(--secondary-foreground)",
  "muted": "var(--muted)",
  "muted-foreground": "var(--muted-foreground)",
  "accent": "var(--accent)",
  "accent-foreground": "var(--accent-foreground)",
  "destructive": "var(--destructive)",
  "destructive-foreground": "var(--destructive-foreground)",
  "border": "var(--border)",
  "input": "var(--input)",
  "input-background": "var(--input-background)",
  "switch-background": "var(--switch-background)",
  "ring": "var(--ring)",
  "chart-1": "var(--chart-1)",
  "chart-2": "var(--chart-2)",
  "chart-3": "var(--chart-3)",
  "chart-4": "var(--chart-4)",
  "chart-5": "var(--chart-5)",
  "sidebar": "var(--sidebar)",
  "sidebar-foreground": "var(--sidebar-foreground)",
  "sidebar-primary": "var(--sidebar-primary)",
  "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
  "sidebar-accent": "var(--sidebar-accent)",
  "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
  "sidebar-border": "var(--sidebar-border)",
  "sidebar-ring": "var(--sidebar-ring)",
};

const BASE_COLORS: Record<string, string> = {
  black: "#000",
  white: "#fff",
  transparent: "transparent",
  current: "currentcolor",
  inherit: "inherit",
};

export const DEFAULT_THEME: Theme = {
  colors: { ...PALETTE, ...BASE_COLORS, ...SPATIKA_COLORS },
  spacing: "0.25rem",
  breakpoints: { sm: "40rem", md: "48rem", lg: "64rem", xl: "80rem", "2xl": "96rem" },
  containers: {
    "3xs": "16rem",
    "2xs": "18rem",
    xs: "20rem",
    sm: "24rem",
    md: "28rem",
    lg: "32rem",
    xl: "36rem",
    "2xl": "42rem",
    "3xl": "48rem",
    "4xl": "56rem",
    "5xl": "64rem",
    "6xl": "72rem",
    "7xl": "80rem",
  },
  fontSize: {
    xs: { size: "0.75rem", lineHeight: "calc(1 / 0.75)" },
    sm: { size: "0.875rem", lineHeight: "calc(1.25 / 0.875)" },
    base: { size: "1rem", lineHeight: "calc(1.5 / 1)" },
    lg: { size: "1.125rem", lineHeight: "calc(1.75 / 1.125)" },
    xl: { size: "1.25rem", lineHeight: "calc(1.75 / 1.25)" },
    "2xl": { size: "1.5rem", lineHeight: "calc(2 / 1.5)" },
    "3xl": { size: "1.875rem", lineHeight: "calc(2.25 / 1.875)" },
    "4xl": { size: "2.25rem", lineHeight: "calc(2.5 / 2.25)" },
    "5xl": { size: "3rem", lineHeight: "1" },
    "6xl": { size: "3.75rem", lineHeight: "1" },
    "7xl": { size: "4.5rem", lineHeight: "1" },
    "8xl": { size: "6rem", lineHeight: "1" },
    "9xl": { size: "8rem", lineHeight: "1" },
    display: { size: "var(--spk-text-display)", lineHeight: "var(--spk-text-display-lh)", letterSpacing: "-0.03em", fontWeight: "600" },
    hero: { size: "var(--spk-text-hero)", lineHeight: "var(--spk-text-hero-lh)", letterSpacing: "-0.035em", fontWeight: "650" },
    "hero-sm": { size: "var(--spk-text-hero-sm)", lineHeight: "var(--spk-text-hero-sm-lh)", letterSpacing: "-0.03em", fontWeight: "650" },
    "title-1": { size: "var(--spk-text-title-1)", lineHeight: "var(--spk-text-title-1-lh)", letterSpacing: "var(--spk-tracking-tight)", fontWeight: "600" },
    "title-2": { size: "var(--spk-text-title-2)", lineHeight: "var(--spk-text-title-2-lh)", letterSpacing: "var(--spk-tracking-snug)", fontWeight: "600" },
    "title-3": { size: "var(--spk-text-title-3)", lineHeight: "var(--spk-text-title-3-lh)", letterSpacing: "var(--spk-tracking-snug)", fontWeight: "600" },
    "body-lg": { size: "var(--spk-text-body-lg)", lineHeight: "var(--spk-text-body-lg-lh)" },
    body: { size: "var(--spk-text-body)", lineHeight: "var(--spk-text-body-lh)" },
    "body-sm": { size: "var(--spk-text-body-sm)", lineHeight: "var(--spk-text-body-sm-lh)" },
    label: { size: "var(--spk-text-label)", lineHeight: "var(--spk-text-label-lh)", fontWeight: "500" },
    caption: { size: "var(--spk-text-caption)", lineHeight: "var(--spk-text-caption-lh)" },
    overline: { size: "var(--spk-text-overline)", lineHeight: "var(--spk-text-overline-lh)", letterSpacing: "var(--spk-tracking-wide)", fontWeight: "500" },
  },
  fontFamily: {
    sans: "var(--spk-font-sans)",
    serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
    mono: "var(--spk-font-mono)",
  },
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "650",
    black: "650",
  },
  tracking: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
  leading: { tight: "1.25", snug: "1.375", normal: "1.5", relaxed: "1.625", loose: "2" },
  radius: {
    "": "0.25rem",
    xs: "var(--spk-radius-xs)",
    sm: "var(--spk-radius-xs)",
    md: "var(--spk-radius-sm)",
    lg: "var(--spk-radius-sm)",
    xl: "var(--spk-radius-md)",
    "2xl": "var(--spk-radius-md)",
    "3xl": "var(--spk-radius-lg)",
    "4xl": "2rem",
    control: "var(--spk-radius-sm)",
    card: "var(--spk-radius-md)",
    sheet: "var(--spk-radius-lg)",
  },
  shadow: {
    "": "var(--spk-shadow-sm)",
    "2xs": "var(--spk-shadow-xs)",
    xs: "var(--spk-shadow-xs)",
    sm: "var(--spk-shadow-sm)",
    md: "var(--spk-shadow-md)",
    lg: "var(--spk-shadow-lg)",
    xl: "var(--spk-shadow-lg)",
    "2xl": "var(--spk-shadow-xl)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  },
  insetShadow: {
    "2xs": "inset 0 1px rgb(0 0 0 / 0.05)",
    xs: "inset 0 1px 1px rgb(0 0 0 / 0.05)",
    sm: "inset 0 2px 4px rgb(0 0 0 / 0.05)",
  },
  dropShadow: {
    "": "0 1px 2px rgb(0 0 0 / 0.1), 0 1px 1px rgb(0 0 0 / 0.06)",
    xs: "0 1px 1px rgb(0 0 0 / 0.05)",
    sm: "0 1px 2px rgb(0 0 0 / 0.15)",
    md: "0 3px 3px rgb(0 0 0 / 0.12)",
    lg: "0 4px 4px rgb(0 0 0 / 0.15)",
    xl: "0 9px 7px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 25px rgb(0 0 0 / 0.15)",
  },
  textShadow: {
    "2xs": "0px 1px 0px rgb(0 0 0 / 0.15)",
    xs: "0px 1px 1px rgb(0 0 0 / 0.2)",
    sm: "0px 1px 0px rgb(0 0 0 / 0.075), 0px 1px 1px rgb(0 0 0 / 0.075), 0px 2px 2px rgb(0 0 0 / 0.075)",
    md: "0px 1px 1px rgb(0 0 0 / 0.1), 0px 1px 2px rgb(0 0 0 / 0.1), 0px 2px 4px rgb(0 0 0 / 0.1)",
    lg: "0px 1px 2px rgb(0 0 0 / 0.1), 0px 3px 2px rgb(0 0 0 / 0.1), 0px 4px 8px rgb(0 0 0 / 0.1)",
  },
  blur: {
    "": "8px",
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "40px",
    "3xl": "64px",
  },
  perspective: {
    dramatic: "100px",
    near: "300px",
    normal: "500px",
    midrange: "800px",
    distant: "1200px",
  },
  aspect: { video: "16 / 9" },
  ease: {
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
    standard: "var(--spk-ease-standard)",
    enter: "var(--spk-ease-enter)",
    exit: "var(--spk-ease-exit)",
    spring: "var(--spk-ease-spring)",
  },
  animate: {
    spin: { value: "spin 1s linear infinite", keyframes: "@keyframes spin{to{transform:rotate(360deg)}}" },
    ping: {
      value: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
      keyframes: "@keyframes ping{75%,100%{transform:scale(2);opacity:0}}",
    },
    pulse: {
      value: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      keyframes: "@keyframes pulse{50%{opacity:0.5}}",
    },
    bounce: {
      value: "bounce 1s infinite",
      keyframes:
        "@keyframes bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:none;animation-timing-function:cubic-bezier(0,0,0.2,1)}}",
    },
  },
  transition: { duration: "150ms", timing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  darkSelector: ".neelam *, .sandhya *, .neelam, .sandhya",
  ringColor: "var(--spk-focus)",
};

/** Deep-enough partial of {@link Theme} for app overrides. */
export type ThemeOverrides = { [K in keyof Theme]?: Theme[K] extends Record<string, unknown> ? Partial<Theme[K]> : Theme[K] };

/**
 * Layer app overrides on the default theme. Record-valued keys merge (an app adds
 * `colors: { brand: "var(--brand)" }` without losing the rest); scalar keys replace.
 */
export function resolveTheme(overrides: ThemeOverrides = {}, base: Theme = DEFAULT_THEME): Theme {
  const theme = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    const current = theme[key];
    theme[key] =
      value && typeof value === "object" && current && typeof current === "object" && !Array.isArray(value)
        ? { ...(current as object), ...(value as object) }
        : value;
  }
  return theme as Theme;
}

/**
 * Theme values as CSS variables with Tailwind CSS v4 names (`--color-amber-600`,
 * `--radius-lg`, `--text-sm`, `--spacing` …), for stylesheets that reference them directly.
 */
export function themeVariables(theme: Theme): Map<string, string> {
  const vars = new Map<string, string>();
  const scale = (prefix: string, record: Record<string, string>) => {
    for (const [key, value] of Object.entries(record)) vars.set(key === "" ? `--${prefix}` : `--${prefix}-${key}`, value);
  };
  scale("color", theme.colors);
  vars.set("--spacing", theme.spacing);
  scale("breakpoint", theme.breakpoints);
  scale("container", theme.containers);
  for (const [key, size] of Object.entries(theme.fontSize)) {
    vars.set(`--text-${key}`, size.size);
    if (size.lineHeight) vars.set(`--text-${key}--line-height`, size.lineHeight);
    if (size.letterSpacing) vars.set(`--text-${key}--letter-spacing`, size.letterSpacing);
    if (size.fontWeight) vars.set(`--text-${key}--font-weight`, size.fontWeight);
  }
  scale("font", theme.fontFamily);
  scale("font-weight", theme.fontWeight);
  scale("tracking", theme.tracking);
  scale("leading", theme.leading);
  scale("radius", theme.radius);
  scale("shadow", theme.shadow);
  scale("inset-shadow", theme.insetShadow);
  scale("drop-shadow", theme.dropShadow);
  scale("text-shadow", theme.textShadow);
  scale("blur", theme.blur);
  scale("perspective", theme.perspective);
  scale("aspect", theme.aspect);
  scale("ease", theme.ease);
  for (const [key, anim] of Object.entries(theme.animate)) vars.set(`--animate-${key}`, anim.value);
  vars.set("--default-transition-duration", theme.transition.duration);
  vars.set("--default-transition-timing-function", theme.transition.timing);
  return vars;
}
