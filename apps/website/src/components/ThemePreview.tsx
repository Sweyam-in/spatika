import { Check } from "lucide-react";
import { THEME_IDS, THEME_LABELS, useSpatikaTheme, type BuiltinThemeId } from "@spatika/react";

/** Mini UI palette shown inside each theme card. */
const themePalettes: Record<
  BuiltinThemeId,
  { bg: string; surface: string; primary: string; primaryForeground: string; text: string; muted: string }
> = {
  mukta: {
    bg: "#f8fafc",
    surface: "#ffffff",
    primary: "#2563eb",
    primaryForeground: "#ffffff",
    text: "#111111",
    muted: "#64748b",
  },
  neelam: {
    bg: "#0f1115",
    surface: "#1a1d24",
    primary: "#5b8cff",
    primaryForeground: "#ffffff",
    text: "#e6e6e6",
    muted: "#94a3b8",
  },
  usha: {
    bg: "#faf8f6",
    surface: "#ffffff",
    primary: "#e95420",
    primaryForeground: "#ffffff",
    text: "#1a1a1a",
    muted: "#666260",
  },
  sandhya: {
    bg: "#13161c",
    surface: "#22262f",
    primary: "#e95420",
    primaryForeground: "#ffffff",
    text: "#e6e6e6",
    muted: "#a0a4ab",
  },
};

export function ThemePreview() {
  const { theme, setTheme } = useSpatikaTheme();

  return (
    <div className="theme-preview-grid">
      {THEME_IDS.map((id) => {
        const palette = themePalettes[id];
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            className={`theme-preview-card${active ? " active" : ""}`}
            onClick={() => setTheme(id)}
            aria-pressed={active}
          >
            <div className="theme-preview-frame" style={{ background: palette.bg, color: palette.text }}>
              <div
                className="theme-preview-bar"
                style={{
                  background: `color-mix(in srgb, ${palette.surface} 85%, transparent)`,
                  borderColor: `color-mix(in srgb, ${palette.text} 12%, transparent)`,
                }}
              >
                <span className="theme-preview-dot" style={{ background: palette.primary }} />
                <span className="theme-preview-line" style={{ background: palette.muted, opacity: 0.35 }} />
              </div>
              <div className="theme-preview-body">
                <span
                  className="theme-preview-pill"
                  style={{ background: palette.primary, color: palette.primaryForeground }}
                />
                <span
                  className="theme-preview-chip"
                  style={{
                    background: palette.surface,
                    borderColor: `color-mix(in srgb, ${palette.text} 15%, transparent)`,
                  }}
                />
              </div>
              <div className="theme-preview-swatches">
                <span style={{ background: palette.primary }} />
                <span style={{ background: palette.surface }} />
                <span style={{ background: palette.muted }} />
              </div>
            </div>
            <div className="theme-preview-label">
              <span>{THEME_LABELS[id]}</span>
              <code>{id}</code>
            </div>
            {active ? (
              <span className="theme-preview-check" aria-hidden>
                <Check size={14} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
