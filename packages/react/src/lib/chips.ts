/**
 * Chip / toggle class recipes shared by filters and preference groups.
 */
import { cn } from "./cn";

const chipFocus = "outline-none focus-visible:shadow-[var(--spk-focus-ring)]";
const chipMotion =
  "transition-[color,background-color,border-color] duration-[var(--spk-duration-fast)] ease-[var(--spk-ease-standard)]";

const selected = "border-accent-border bg-accent-muted text-accent-text";
const unselected = "border-line bg-surface text-fg-secondary hover:border-line-strong hover:text-fg";

/** Filter pill (directory / history filters). */
export function filterChipClass(active: boolean, className?: string) {
  return cn(
    "inline-flex h-7 max-w-full items-center justify-center gap-1.5 rounded-full border px-2.5 text-body-sm font-medium",
    chipMotion,
    chipFocus,
    active ? selected : unselected,
    className,
  );
}

/** Preference toggle (settings). */
export function preferenceChipClass(active: boolean, className?: string) {
  return cn(
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-[var(--spk-radius-sm)] border px-3 text-body-sm font-medium touch-manipulation",
    chipMotion,
    chipFocus,
    active ? selected : unselected,
    className,
  );
}

/** Layout mode toggle (grid / list / kanban). */
export function layoutToggleClass(active: boolean, className?: string) {
  return cn(
    "flex h-[var(--spk-control-h)] items-center justify-center gap-2 rounded-[var(--spk-radius-sm)] border px-3 text-body font-medium",
    chipMotion,
    chipFocus,
    active ? selected : unselected,
    className,
  );
}

/** Full-width selectable list row. */
export function listRowToggleClass(active: boolean, className?: string) {
  return cn(
    "flex min-h-[var(--spk-row-h)] w-full items-center justify-between gap-3 rounded-[var(--spk-radius-sm)] border px-3 py-2 text-left text-body",
    chipMotion,
    chipFocus,
    active ? "border-accent-border bg-accent-subtle text-fg" : "border-line bg-surface text-fg hover:border-line-strong",
    className,
  );
}

export const nativeSelectClass = "spk-field";

export type NativeSelectSize = "sm" | "default" | "touch";

/** Size recipes for NativeSelect. `sm` is for toolbars (not full width). */
export function nativeSelectSizeClass(size: NativeSelectSize = "default") {
  if (size === "sm") return cn(nativeSelectClass, "spk-field--sm h-8 min-h-8 w-auto");
  if (size === "touch") return cn(nativeSelectClass, "spk-field--touch min-h-11");
  return nativeSelectClass;
}
