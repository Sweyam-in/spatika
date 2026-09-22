import { cn } from "./cn";
import type { CoverHeaderInk } from "./cover-pattern";

/** Floating glass pill sitting on a generated / photo cover. */
export function coverFloatingShellClass(_ink: CoverHeaderInk, className?: string): string {
  return cn("cover-floating-shell", className);
}

export function coverFloatingIconClass(ink: CoverHeaderInk): string {
  return ink === "light"
    ? "text-white/90 hover:bg-white/20 hover:text-white"
    : "text-zinc-800 hover:bg-zinc-950/[0.08] hover:text-zinc-950";
}

export function coverPlateClass(ink: CoverHeaderInk): string {
  return ink === "light"
    ? "border border-white/18 bg-black/40 backdrop-blur-[24px] backdrop-saturate-150 shadow-md"
    : "border border-white/60 bg-white/55 backdrop-blur-[20px] backdrop-saturate-150 shadow-md";
}

export function coverTitleClass(ink: CoverHeaderInk): string {
  return ink === "light"
    ? "text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.4)]"
    : "text-zinc-950";
}

export function coverMutedClass(ink: CoverHeaderInk): string {
  return ink === "light" ? "text-white/70" : "text-zinc-600";
}

export type { CoverHeaderInk };
