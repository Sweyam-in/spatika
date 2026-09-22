/**
 * Motion language.
 *
 *   hover / press   120ms / 80ms   standard easing — colour & shadow only
 *   select          180ms          spring settle — prism rail, thumbs, indicators
 *   enter           260ms          decelerate — popovers, dialogs, toasts
 *   exit            180ms          accelerate
 *   expand/layout   260ms          standard
 *
 * CSS custom properties (`--spk-duration-*`, `--spk-ease-*`, `--spk-motion-*`) are the source
 * of truth; these JS values mirror them for animation libraries.
 * Every motion collapses to a fade (or nothing) under `prefers-reduced-motion`.
 */

export const duration = {
  instant: 0.08,
  fast: 0.12,
  base: 0.18,
  normal: 0.18,
  slow: 0.26,
  slower: 0.36,
} as const;

export const easing = {
  standard: [0.2, 0, 0, 1] as [number, number, number, number],
  enter: [0.16, 1, 0.3, 1] as [number, number, number, number],
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
  spring: [0.34, 1.3, 0.64, 1] as [number, number, number, number],
} as const;

export const transition = {
  fast: { duration: duration.fast, ease: easing.standard },
  normal: { duration: duration.base, ease: easing.standard },
  slow: { duration: duration.slow, ease: easing.enter },
  enter: { duration: duration.slow, ease: easing.enter },
  exit: { duration: duration.base, ease: easing.exit },
  select: { duration: duration.base, ease: easing.spring },
} as const;

/** Interactive card hover — border only; cards do not levitate. */
export const motionCardHover =
  "transition-[border-color,background-color,box-shadow] duration-[var(--spk-duration-fast)] ease-[var(--spk-ease-standard)] hover:border-line-strong";

/** Emphasised hover for focal cards — border + slight elevation. */
export const motionCardHoverEmphasis =
  "transition-[border-color,box-shadow] duration-[var(--spk-duration-fast)] ease-[var(--spk-ease-standard)] hover:border-line-strong hover:shadow-md";

/** Pressed feedback — a half-pixel settle, not a squash. */
export const motionPress = "active:translate-y-px";

export const pageEnter = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: transition.normal,
};

export const cardEnter = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  transition: transition.enter,
};
