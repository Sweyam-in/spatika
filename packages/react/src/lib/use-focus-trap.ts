import * as React from "react";
import { lockScroll } from "./layer-stack";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "summary",
  "iframe",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  "[tabindex]",
].join(",");

/** Focusable, tabbable descendants in DOM order (skips `hidden`, `inert` and tabindex=-1). */
export function getTabbable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      el.tabIndex >= 0 &&
      !el.hasAttribute("disabled") &&
      !el.closest("[hidden],[inert]") &&
      el.getAttribute("aria-hidden") !== "true",
  );
}

/** Only the most recently opened trap handles Tab, so nested dialogs keep their focus. */
const traps: symbol[] = [];

/**
 * Traps Tab within the container while enabled, locks page scroll, moves focus inside
 * (to `[data-autofocus]` / `[autofocus]` first, else the first tabbable element, else the
 * container) and restores focus to the previously focused element on close.
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  React.useEffect(() => {
    if (!enabled) return;

    const trap = Symbol("focus-trap");
    traps.push(trap);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const unlock = lockScroll();

    const focusFirst = () => {
      const container = containerRef.current;
      if (!container || container.contains(document.activeElement)) return;
      const preferred = container.querySelector<HTMLElement>("[data-autofocus],[autofocus]");
      const target = preferred ?? getTabbable(container)[0] ?? container;
      target.focus({ preventScroll: true });
    };

    // Defer so portal content is mounted.
    const id = window.setTimeout(focusFirst, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || traps[traps.length - 1] !== trap) return;
      const container = containerRef.current;
      if (!container) return;

      const focusable = getTabbable(container);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !container.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", handleKeyDown);
      const index = traps.indexOf(trap);
      if (index >= 0) traps.splice(index, 1);
      unlock();
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [containerRef, enabled]);
}
