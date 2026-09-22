import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, LayoutGrid } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  THEME_IDS,
  THEME_LABELS,
  UserMenu,
  useAppShell,
  useSpatikaTheme,
  type CommandPaletteGroup,
} from "@spatika/react";

/** Brand row that hides its wordmark when the sidebar collapses to a rail. */
export function Brand({ mark, name }: { mark: ReactNode; name: string }) {
  const shell = useAppShell();
  return (
    <div className="screen-brand">
      <span className="screen-brand-mark" aria-hidden>
        {mark}
      </span>
      {shell?.collapsed ? <span className="sr-only">{name}</span> : name}
    </div>
  );
}

/** User menu with the theme switcher and a way back to the docs. */
export function ScreenUserMenu({ name, email, variant }: { name: string; email: string; variant?: "row" | "avatar" }) {
  const { theme, setTheme } = useSpatikaTheme();
  const navigate = useNavigate();
  return (
    <UserMenu name={name} email={email} variant={variant}>
      <DropdownMenuLabel>Theme</DropdownMenuLabel>
      {THEME_IDS.map((id) => (
        <DropdownMenuItem key={id} onSelect={() => setTheme(id)}>
          <span style={{ flex: 1 }}>{THEME_LABELS[id]}</span>
          {theme === id ? <Check aria-hidden /> : null}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => navigate("/showcase")}>
        <LayoutGrid aria-hidden />
        All showcase screens
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => navigate("/")}>
        <ArrowLeft aria-hidden />
        Back to docs
      </DropdownMenuItem>
    </UserMenu>
  );
}

/** Command palette groups shared by every showcase screen. */
export function useSharedCommands(): CommandPaletteGroup[] {
  const { setTheme } = useSpatikaTheme();
  const navigate = useNavigate();
  return [
    {
      heading: "Showcase",
      items: [
        { id: "go-finance", label: "Open finance dashboard", onSelect: () => navigate("/showcase/finance") },
        { id: "go-admin", label: "Open SaaS admin", onSelect: () => navigate("/showcase/admin") },
        { id: "go-workspace", label: "Open productivity workspace", onSelect: () => navigate("/showcase/workspace") },
        { id: "go-docs", label: "Back to Spatika docs", onSelect: () => navigate("/") },
      ],
    },
    {
      heading: "Theme",
      items: THEME_IDS.map((id) => ({
        id: `theme-${id}`,
        label: `Switch to ${THEME_LABELS[id]}`,
        keywords: ["theme", "appearance", "dark", "light"],
        onSelect: () => setTheme(id),
      })),
    },
  ];
}

export const money = (value: number, precision = 2) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);

export const shortDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
