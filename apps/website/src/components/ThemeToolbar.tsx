import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  isThemeId,
  THEME_IDS,
  THEME_LABELS,
  useSpatikaTheme,
  type BuiltinThemeId,
} from "@spatika/react";
import { ChevronDown } from "lucide-react";

const THEME_NOTES: Record<BuiltinThemeId, string> = {
  mukta: "Neutral light · default",
  neelam: "Designed dark",
  usha: "Warm light",
  sandhya: "Warm dark · flat",
};

/**
 * A preview of a theme drawn with that theme's own tokens: the swatch carries the theme class,
 * so canvas, surface and accent resolve to its values whatever theme the page is in.
 */
function ThemeSwatch({ id }: { id: BuiltinThemeId }) {
  return (
    <span className={`theme-dot ${id}`} aria-hidden>
      <span className="theme-dot-surface" />
      <span className="theme-dot-accent" />
    </span>
  );
}

/** Header theme selector: one button that opens the four themes with a preview of each. */
export function ThemeToolbar() {
  const { theme, setTheme } = useSpatikaTheme();
  // A custom theme (createTheme) keeps its own name; none of the built-ins is checked.
  const builtin = isThemeId(theme) ? theme : null;
  const label = builtin ? THEME_LABELS[builtin] : theme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="theme-select-trigger"
          aria-label={`Theme: ${label}`}
          trailingIcon={<ChevronDown className="size-3.5" aria-hidden />}
        >
          {builtin ? <ThemeSwatch id={builtin} /> : null}
          <span className="theme-select-name">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="theme-select-menu">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={builtin ?? ""} onValueChange={(value) => setTheme(value)}>
          {THEME_IDS.map((id) => (
            <DropdownMenuRadioItem key={id} value={id} className="theme-select-item">
              <ThemeSwatch id={id} />
              <span className="theme-select-text">
                <span>{THEME_LABELS[id]}</span>
                <small>{THEME_NOTES[id]}</small>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
