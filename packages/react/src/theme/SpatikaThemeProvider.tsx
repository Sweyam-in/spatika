import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";
import { useIsomorphicLayoutEffect } from "../lib/use-isomorphic-layout-effect";
import {
  findCustomTheme,
  injectCustomThemeStyles,
  type SpatikaTheme,
} from "../lib/create-theme";
import {
  applyTheme,
  DEFAULT_THEME,
  isDarkTheme,
  isThemeId,
  readStoredTheme,
  THEME_IDS,
  writeStoredTheme,
  type BuiltinThemeId,
  type ThemeId,
} from "../lib/themes";

export type SpatikaThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: readonly ThemeId[];
};

const SpatikaThemeContext = createContext<SpatikaThemeContextValue | null>(null);

export type SpatikaThemeProviderProps = {
  children: ReactNode;
  /** Controlled theme */
  theme?: ThemeId;
  /** Uncontrolled initial theme. Ignored when `storageKey` already has a value. */
  defaultTheme?: ThemeId;
  /**
   * Persist the selected theme in `localStorage` under this key.
   * Pass `false` (default) to keep the theme in memory only.
   */
  storageKey?: string | false;
  onThemeChange?: (theme: ThemeId) => void;
  /**
   * When true (default), also sync theme classes onto `document.documentElement`
   * so CSS variables apply globally (typical SPA / Storybook usage).
   */
  syncDocument?: boolean;
  /** Optional element to theme instead of (or in addition to) document */
  target?: HTMLElement | null;
  className?: string;
  /** Custom themes from `createTheme`. Switch them with `setTheme(id)`. */
  customThemes?: readonly SpatikaTheme[];
};

function baseThemeClass(
  theme: ThemeId,
  custom: SpatikaTheme | undefined,
): BuiltinThemeId | undefined {
  const base = custom?.extends ?? (isThemeId(theme) ? theme : DEFAULT_THEME);
  return base === DEFAULT_THEME ? undefined : base;
}

/**
 * Theme provider for Spatika.
 * Wraps the app (or a subtree) and applies theme classes / data attributes.
 */
const EMPTY_CUSTOM_THEMES: readonly SpatikaTheme[] = [];

export function SpatikaThemeProvider({
  children,
  theme: themeProp,
  defaultTheme = DEFAULT_THEME,
  storageKey = false,
  onThemeChange,
  syncDocument = true,
  target,
  className,
  customThemes = EMPTY_CUSTOM_THEMES,
}: SpatikaThemeProviderProps) {
  const customIds = useMemo(() => customThemes.map((item) => item.id), [customThemes]);
  const [uncontrolled, setUncontrolled] = useState<ThemeId>(
    () => readStoredTheme(storageKey, customIds) ?? defaultTheme,
  );
  const theme = themeProp ?? uncontrolled;
  const custom = findCustomTheme(theme, customThemes);

  const setTheme = useCallback(
    (next: ThemeId) => {
      if (themeProp === undefined) setUncontrolled(next);
      onThemeChange?.(next);
    },
    [onThemeChange, themeProp],
  );

  useIsomorphicLayoutEffect(() => {
    injectCustomThemeStyles(customThemes);
    if (syncDocument) applyTheme(theme, undefined, custom);
    if (target) applyTheme(theme, target, custom);
    writeStoredTheme(storageKey, theme);
  }, [theme, syncDocument, target, storageKey, custom, customThemes]);

  const value = useMemo(() => {
    const extras = customThemes.map((item) => item.id).filter((id) => !isThemeId(id));
    return {
      theme,
      setTheme,
      themes: extras.length ? [...THEME_IDS, ...extras] : THEME_IDS,
    } satisfies SpatikaThemeContextValue;
  }, [theme, setTheme, customThemes]);

  const dark = custom ? custom.colorScheme === "dark" : isDarkTheme(theme);
  const themeClass = baseThemeClass(theme, custom);

  return (
    <SpatikaThemeContext.Provider value={value}>
      <div
        className={cn(className, themeClass)}
        data-spk-theme={theme}
        data-slot="spatika-theme-provider"
        style={{ colorScheme: dark ? "dark" : "light" }}
      >
        {children}
      </div>
    </SpatikaThemeContext.Provider>
  );
}

/** Access current theme and setter from `SpatikaThemeProvider`. */
export function useSpatikaTheme(): SpatikaThemeContextValue {
  const ctx = useContext(SpatikaThemeContext);
  if (!ctx) {
    throw new Error("useSpatikaTheme must be used within <SpatikaThemeProvider>");
  }
  return ctx;
}
