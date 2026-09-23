/** Viewport widths (px) that match Spatika `Grid` / `Container`. */
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const BREAKPOINT_KEYS = ["xs", "sm", "md", "lg", "xl"] as const satisfies readonly Breakpoint[];

/** `(min-width: Npx)` — inclusive start of a breakpoint. `xs` is always true. */
export function breakpointUp(key: Breakpoint): string {
  return `(min-width: ${BREAKPOINTS[key]}px)`;
}

/** `(max-width: N-1px)` — viewports strictly below a breakpoint. */
export function breakpointDown(key: Exclude<Breakpoint, "xs">): string {
  return `(max-width: ${BREAKPOINTS[key] - 1}px)`;
}

/** Inclusive range between two breakpoints. `end` omitted means no upper bound. */
export function breakpointBetween(start: Breakpoint, end?: Exclude<Breakpoint, "xs">): string {
  if (!end) return breakpointUp(start);
  return `${breakpointUp(start)} and ${breakpointDown(end)}`;
}
