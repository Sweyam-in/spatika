import { isDarkTheme, isThemeId, THEME_IDS, THEME_LABELS, useSpatikaTheme } from "@spatika/react";
import { Moon, Sun } from "lucide-react";

export function ThemeToolbar() {
  const { theme, setTheme } = useSpatikaTheme();
  const builtin = isThemeId(theme) ? theme : THEME_IDS[0];

  function cycleTheme() {
    const index = THEME_IDS.indexOf(builtin);
    setTheme(THEME_IDS[(index + 1) % THEME_IDS.length]!);
  }

  return (
    <>
      <div className="theme-picker" role="group" aria-label="Theme">
        {THEME_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={theme === id ? "active" : undefined}
            onClick={() => setTheme(id)}
            aria-pressed={theme === id}
          >
            {THEME_LABELS[id]}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="icon-link theme-picker-mobile"
        onClick={cycleTheme}
        aria-label={`Theme: ${THEME_LABELS[builtin]}. Tap to cycle.`}
      >
        {isDarkTheme(theme) ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </>
  );
}
