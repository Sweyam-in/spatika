import { useEffect, useState } from "react";
import {
  BREAKPOINT_KEYS,
  BREAKPOINTS,
  breakpointDown,
  breakpointUp,
  type Breakpoint,
} from "./breakpoints";

/** Subscribe to a CSS media query. Defaults to `false` until mounted. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** True when the viewport is below the `md` breakpoint (768px). */
export function useIsMobile(): boolean {
  return useMediaQuery(breakpointDown("md"));
}

/** True from this breakpoint up (`xs` is always true). */
export function useBreakpointUp(key: Breakpoint): boolean {
  const matches = useMediaQuery(breakpointUp(key));
  return key === "xs" || matches;
}

/** True strictly below this breakpoint. */
export function useBreakpointDown(key: Exclude<Breakpoint, "xs">): boolean {
  return useMediaQuery(breakpointDown(key));
}

/** Largest matching breakpoint, starting at `xs`. */
export function useBreakpoint(): Breakpoint {
  const sm = useMediaQuery(breakpointUp("sm"));
  const md = useMediaQuery(breakpointUp("md"));
  const lg = useMediaQuery(breakpointUp("lg"));
  const xl = useMediaQuery(breakpointUp("xl"));
  if (xl) return "xl";
  if (lg) return "lg";
  if (md) return "md";
  if (sm) return "sm";
  return "xs";
}

export { BREAKPOINTS, BREAKPOINT_KEYS, breakpointDown, breakpointUp };
export type { Breakpoint };
