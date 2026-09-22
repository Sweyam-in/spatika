import * as React from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

export type FloatingSide = "top" | "right" | "bottom" | "left";
export type FloatingAlign = "start" | "center" | "end";

export type FloatingPosition = {
  top: number;
  left: number;
  side: FloatingSide;
  /** Measured trigger size for consumers that match width. */
  triggerWidth: number;
  triggerHeight: number;
};

type UseFloatingPositionOptions = {
  open: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLElement | null>;
  side?: FloatingSide;
  align?: FloatingAlign;
  sideOffset?: number;
  collisionPadding?: number;
};

/**
 * Positions floating content relative to a trigger using getBoundingClientRect.
 * Returns fixed-position coordinates suitable for `position: fixed` portals.
 */
export function useFloatingPosition({
  open,
  triggerRef,
  contentRef,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  collisionPadding = 8,
}: UseFloatingPositionOptions): FloatingPosition | null {
  const [position, setPosition] = React.useState<FloatingPosition | null>(null);

  const update = React.useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!trigger || !content) return;

    const triggerRect = trigger.getBoundingClientRect();
    // Prefer laid-out size; fall back to trigger size (min 1) so first paint /
    // happy-dom still yields a position — avoids `visibility: hidden` menus that
    // testing-library cannot query by role.
    const contentWidth =
      content.offsetWidth > 0 ? content.offsetWidth : Math.max(triggerRect.width, 1);
    const contentHeight =
      content.offsetHeight > 0 ? content.offsetHeight : Math.max(triggerRect.height, 1);

    let resolvedSide = side;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Prefer requested side; flip if clearly overflowing.
    if (
      side === "bottom" &&
      triggerRect.bottom + sideOffset + contentHeight > viewportH - collisionPadding
    ) {
      if (triggerRect.top - sideOffset - contentHeight > collisionPadding) {
        resolvedSide = "top";
      }
    } else if (
      side === "top" &&
      triggerRect.top - sideOffset - contentHeight < collisionPadding
    ) {
      if (
        triggerRect.bottom + sideOffset + contentHeight <
        viewportH - collisionPadding
      ) {
        resolvedSide = "bottom";
      }
    } else if (
      side === "right" &&
      triggerRect.right + sideOffset + contentWidth > viewportW - collisionPadding
    ) {
      if (triggerRect.left - sideOffset - contentWidth > collisionPadding) {
        resolvedSide = "left";
      }
    } else if (
      side === "left" &&
      triggerRect.left - sideOffset - contentWidth < collisionPadding
    ) {
      if (
        triggerRect.right + sideOffset + contentWidth <
        viewportW - collisionPadding
      ) {
        resolvedSide = "right";
      }
    }

    let top = 0;
    let left = 0;

    if (resolvedSide === "bottom") {
      top = triggerRect.bottom + sideOffset;
    } else if (resolvedSide === "top") {
      top = triggerRect.top - contentHeight - sideOffset;
    } else if (resolvedSide === "left" || resolvedSide === "right") {
      if (align === "start") top = triggerRect.top;
      else if (align === "end") top = triggerRect.bottom - contentHeight;
      else top = triggerRect.top + (triggerRect.height - contentHeight) / 2;
    }

    if (resolvedSide === "right") {
      left = triggerRect.right + sideOffset;
    } else if (resolvedSide === "left") {
      left = triggerRect.left - contentWidth - sideOffset;
    } else if (align === "start") {
      left = triggerRect.left;
    } else if (align === "end") {
      left = triggerRect.right - contentWidth;
    } else {
      left = triggerRect.left + (triggerRect.width - contentWidth) / 2;
    }

    // Keep the panel fully inside the viewport.
    left = Math.min(
      Math.max(collisionPadding, left),
      Math.max(collisionPadding, viewportW - contentWidth - collisionPadding),
    );
    top = Math.min(
      Math.max(collisionPadding, top),
      Math.max(collisionPadding, viewportH - contentHeight - collisionPadding),
    );

    setPosition({
      top,
      left,
      side: resolvedSide,
      triggerWidth: triggerRect.width,
      triggerHeight: triggerRect.height,
    });
  }, [align, collisionPadding, contentRef, side, sideOffset, triggerRef]);

  useIsomorphicLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    update();

    // Remeasure after paint in case fonts/layout settle one frame later.
    const raf = window.requestAnimationFrame(() => update());

    const handle = () => update();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(handle) : null;
    if (contentRef.current && ro) ro.observe(contentRef.current);
    if (triggerRef.current && ro) ro.observe(triggerRef.current);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
      ro?.disconnect();
    };
  }, [open, update, contentRef, triggerRef]);

  return position;
}
