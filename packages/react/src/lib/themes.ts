/** Supported built-in theme identifiers applied as classes on a root element. */
export const THEME_IDS = ["mukta", "neelam", "usha", "sandhya"] as const;

export type BuiltinThemeId = (typeof THEME_IDS)[number];

/**
 * Built-in ids plus custom ids from `createTheme`.
 * Custom strings keep autocomplete for Mukta / Neelam / Usha / Sandhya.
 */
export type ThemeId = BuiltinThemeId | (string & {});

export const DEFAULT_THEME: BuiltinThemeId = "mukta";

/** Default `localStorage` key used by the docs site and `SpatikaThemeProvider`. */
export const SPATIKA_THEME_STORAGE_KEY = "spk-theme";

export const THEME_LABELS: Record<BuiltinThemeId, string> = {
  mukta: "Mukta",
  neelam: "Neelam",
  usha: "Usha",
  sandhya: "Sandhya",
};

const THEME_CLASS_LIST = ["neelam", "usha", "sandhya"] as const;

export function isThemeId(value: unknown): value is BuiltinThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

export function isDarkTheme(theme: ThemeId): boolean {
  return theme === "neelam" || theme === "sandhya";
}

export type ApplyThemeCustom = {
  id: string;
  extends: BuiltinThemeId;
  colorScheme: "light" | "dark";
};

/** Read a persisted theme. Returns `null` when missing or invalid. */
export function readStoredTheme(
  storageKey?: string | false,
  allowed?: readonly string[],
): ThemeId | null {
  if (!storageKey || typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(storageKey);
    if (!value) return null;
    if (isThemeId(value)) return value;
    if (allowed?.includes(value)) return value;
    return null;
  } catch {
    return null;
  }
}

/** Persist a theme. No-op when `storageKey` is unset. */
export function writeStoredTheme(storageKey: string | false | undefined, theme: ThemeId): void {
  if (!storageKey || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // Private mode / quota — keep the in-memory theme.
  }
}

function resolveBase(theme: ThemeId, custom?: ApplyThemeCustom | null): BuiltinThemeId {
  if (custom) return custom.extends;
  return isThemeId(theme) ? theme : DEFAULT_THEME;
}

/** Apply a theme class to an element (defaults to `<html>`). */
export function applyTheme(
  theme: ThemeId,
  target?: HTMLElement | null,
  custom?: ApplyThemeCustom | null,
) {
  if (typeof document === "undefined") return;
  const root = target ?? document.documentElement;
  const base = resolveBase(theme, custom);
  const id = custom?.id ?? theme;

  root.classList.remove(...THEME_CLASS_LIST);
  if (base !== DEFAULT_THEME) {
    root.classList.add(base);
  }
  root.setAttribute("data-spk-theme", id);
  const dark = custom ? custom.colorScheme === "dark" : isDarkTheme(base);
  root.style.colorScheme = dark ? "dark" : "light";
}
