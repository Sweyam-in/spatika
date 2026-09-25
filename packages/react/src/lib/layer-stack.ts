import * as React from "react";

/**
 * Dismissable layer stack.
 *
 * Every open overlay (dialog, sheet, popover, menu, select, tooltip …) registers a layer.
 * One shared document listener routes dismissal so nested overlays behave:
 *
 * - **Escape** reaches only the topmost layer. Escape in a menu inside a dialog closes the
 *   menu, and the dialog stays open until the next Escape.
 * - **Pointer-down outside** dismisses every layer above the one that was pressed. Choosing
 *   an item in a menu portaled out of a popover keeps the popover open; pressing the page
 *   closes the whole stack.
 *
 * Handlers run after React's own handlers, so a component that calls
 * `event.preventDefault()` on Escape in its `onKeyDown` keeps its layer open.
 */

type Layer = {
  refs: React.RefObject<HTMLElement | null>[];
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
};

const layers: Layer[] = [];
let listening = false;

function contains(layer: Layer, target: Node) {
  return layer.refs.some((ref) => ref.current?.contains(target));
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.isComposing || event.defaultPrevented) return;
  const top = layers[layers.length - 1];
  if (!top?.onEscapeKeyDown) return;
  top.onEscapeKeyDown(event);
}

function handlePointerDown(event: PointerEvent) {
  const target = event.target as Node | null;
  if (!target) return;
  let pressed = -1;
  for (let index = layers.length - 1; index >= 0; index -= 1) {
    if (contains(layers[index], target)) {
      pressed = index;
      break;
    }
  }
  // Snapshot first: dismiss handlers unregister layers synchronously in some consumers.
  const above = layers.slice(pressed + 1).reverse();
  for (const layer of above) layer.onPointerDownOutside?.(event);
}

function listen() {
  if (listening || typeof document === "undefined") return;
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("pointerdown", handlePointerDown, true);
  listening = true;
}

function unlisten() {
  if (!listening || layers.length > 0) return;
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("pointerdown", handlePointerDown, true);
  listening = false;
}

export type DismissLayerOptions = {
  enabled?: boolean;
  /** Nodes that belong to this layer (content, and usually the trigger). */
  refs: React.RefObject<HTMLElement | null>[];
  /** Called when Escape reaches this layer (it is the topmost). */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Called when a pointer goes down outside this layer and every layer stacked on it. */
  onPointerDownOutside?: (event: PointerEvent) => void;
};

/** Registers an overlay in the dismissable layer stack while `enabled`. */
export function useDismissLayer({
  enabled = true,
  refs,
  onEscapeKeyDown,
  onPointerDownOutside,
}: DismissLayerOptions) {
  const handlers = React.useRef({ onEscapeKeyDown, onPointerDownOutside });
  handlers.current = { onEscapeKeyDown, onPointerDownOutside };
  const refsRef = React.useRef(refs);
  refsRef.current = refs;

  React.useEffect(() => {
    if (!enabled) return;
    const layer: Layer = {
      get refs() {
        return refsRef.current;
      },
      onEscapeKeyDown: (event) => handlers.current.onEscapeKeyDown?.(event),
      onPointerDownOutside: (event) => handlers.current.onPointerDownOutside?.(event),
    };
    layers.push(layer);
    listen();
    return () => {
      const index = layers.indexOf(layer);
      if (index >= 0) layers.splice(index, 1);
      unlisten();
    };
  }, [enabled]);
}

/** Number of open layers — exposed for tests. */
export function openLayerCount() {
  return layers.length;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Scroll lock — reference counted, compensates for the scrollbar so the page
 * behind a modal does not shift sideways when it stops scrolling.
 * ──────────────────────────────────────────────────────────────────────────── */

let scrollLocks = 0;
let savedBodyStyle: { overflow: string; paddingRight: string } | null = null;

export function lockScroll() {
  if (typeof document === "undefined") return () => {};
  if (scrollLocks === 0) {
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    savedBodyStyle = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    if (scrollbar > 0) {
      const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbar}px`;
    }
    body.style.overflow = "hidden";
  }
  scrollLocks += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLocks -= 1;
    if (scrollLocks === 0 && savedBodyStyle) {
      document.body.style.overflow = savedBodyStyle.overflow;
      document.body.style.paddingRight = savedBodyStyle.paddingRight;
      savedBodyStyle = null;
    }
  };
}
