import * as React from "react";

/**
 * Stacking layers for portaled UI.
 *
 * App shells (e.g. journalD fullscreen story editor) often use z-index ~9999.
 * Floating menus sit just above that; modal dialogs sit above menus.
 */
export const OVERLAY_Z_INDEX = {
  /** Popovers that are not competing with fullscreen editors. */
  popover: 90,
  /** `Select` listboxes. */
  select: 200,
  /** Dropdown menus (including menus opened inside fullscreen editors). */
  menu: 10000,
  /** Modal overlays + dialog/sheet/alert content. */
  modal: 11000,
} as const;

/**
 * How many modal-tier overlays (Dialog/Sheet/AlertDialog/Modal) the current
 * subtree is nested inside. `Dialog`/`Sheet`/etc. content wraps its children
 * in a provider that increments this; floating popovers/menus/selects read it
 * via `useOverlayZIndex` so they stack above the modal they were opened from
 * instead of behind it (both tiers otherwise use fixed, unrelated z-indexes).
 */
const ModalDepthContext = React.createContext(0);

export function useModalDepth(): number {
  return React.useContext(ModalDepthContext);
}

export function ModalDepthProvider({ children }: { children?: React.ReactNode }) {
  const depth = useModalDepth();
  return React.createElement(ModalDepthContext.Provider, { value: depth + 1 }, children);
}

/**
 * z-index for a floating popover/menu/select. Nested inside an open modal it
 * escalates above that modal (and any menu opened from within it); otherwise
 * it uses its normal `base` layer.
 */
export function useOverlayZIndex(base: number): number {
  const depth = useModalDepth();
  return depth > 0 ? OVERLAY_Z_INDEX.modal + depth : base;
}

/** Inline styles that beat consumer `.glass { position: relative }` rules. */
export function fixedLayerStyle(
  zIndex: number,
  extra?: React.CSSProperties,
): React.CSSProperties {
  return {
    position: "fixed",
    zIndex,
    ...extra,
  };
}

/**
 * Radix-compatible synthetic event for menu `onSelect`.
 * Callers use `event.preventDefault()` to keep the menu open.
 */
export function createSelectEvent(): Event {
  let prevented = false;
  return {
    preventDefault() {
      prevented = true;
    },
    get defaultPrevented() {
      return prevented;
    },
  } as Event;
}
