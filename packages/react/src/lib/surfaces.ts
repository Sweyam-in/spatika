/**
 * Surface model.
 *
 *   default      solid surface + hairline border — the everyday container
 *   raised       lifted: subtle shadow + facet edge (menus of content, focal cards)
 *   subtle       quiet fill, no shadow — grouping inside a page
 *   sunken       recessed wells (code, inputs groups, empty areas)
 *   outline      border only — typography-led sections
 *   glass        translucent material — floating chrome, media overlays (opt-in)
 *   transparent  no chrome at all — layout only
 */
import { cn } from "./cn";

export type SurfaceVariant =
  | "default"
  | "raised"
  | "subtle"
  | "sunken"
  | "outline"
  | "glass"
  | "transparent";

export const SURFACE_VARIANTS: readonly SurfaceVariant[] = [
  "default",
  "raised",
  "subtle",
  "sunken",
  "outline",
  "glass",
  "transparent",
];

/** Class recipe for a surface. Pair with padding utilities or `--spk-card-p`. */
export function surfaceClass(surface: SurfaceVariant = "default", className?: string) {
  return cn("spk-surface", `spk-surface--${surface}`, className);
}

export const surfaceRadiusCard = "rounded-[var(--spk-radius-md)]";
export const surfaceRadiusControl = "rounded-[var(--spk-radius-sm)]";
export const surfaceRadiusPill = "rounded-full";

/** @deprecated 2.0 — use `surfaceRadiusCard`. */
export const surfaceRadiusProfile = surfaceRadiusCard;

/** Focal card (raised). */
export const surfacePrimaryClass = cn(surfaceClass("raised"), "h-full overflow-hidden p-[var(--spk-card-p)]");

/** Quieter grouping. */
export const surfaceSecondaryClass = cn(surfaceClass("subtle"), "h-full overflow-hidden p-[var(--spk-card-p)]");

/** Everyday detail card. */
export const surfaceDetailClass = cn(surfaceClass("default"), "h-full overflow-hidden p-[var(--spk-card-p)]");

/** Dashed supporting strip (drop zones, placeholders). */
export const surfaceTertiaryClass = cn(
  "relative overflow-hidden rounded-[var(--spk-radius-md)] border border-dashed border-line-strong p-3",
);
