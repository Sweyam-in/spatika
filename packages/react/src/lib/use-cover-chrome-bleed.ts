import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

/** Foreground ink the app chrome should use while it floats over a cover surface. */
export type CoverChromeInk = "light" | "dark";

/**
 * Tells the fixed app header to go transparent so a page cover (profile hero,
 * story hero, …) can paint through it. Cleared on unmount and whenever the
 * cover has scrolled away.
 */
export function useCoverChromeBleed(active: boolean, ink: CoverChromeInk): void {
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    if (!active) {
      root.removeAttribute("data-cover-chrome-bleed");
      root.removeAttribute("data-cover-chrome-ink");
      root.removeAttribute("data-profile-cover-bleed");
      root.removeAttribute("data-profile-cover-ink");
      return;
    }

    root.setAttribute("data-cover-chrome-bleed", "true");
    root.setAttribute("data-cover-chrome-ink", ink);
    root.setAttribute("data-profile-cover-bleed", "true");
    root.setAttribute("data-profile-cover-ink", ink);
    return () => {
      root.removeAttribute("data-cover-chrome-bleed");
      root.removeAttribute("data-cover-chrome-ink");
      root.removeAttribute("data-profile-cover-bleed");
      root.removeAttribute("data-profile-cover-ink");
    };
  }, [active, ink]);
}
