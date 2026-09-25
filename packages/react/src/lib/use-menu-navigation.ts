import * as React from "react";

/**
 * Keyboard model for `role="menu"` surfaces (WAI-ARIA menu pattern).
 *
 * Items are focusable with `tabIndex={-1}` and focus moves between them:
 * ArrowUp / ArrowDown (wrapping), Home / End, type-ahead on the item text, Enter / Space to
 * activate, Tab to close and continue the page's tab order. Submenus render inside their
 * parent's DOM and carry `data-submenu`, so every query skips items owned by a nested submenu.
 */

const ITEM_SELECTOR = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';

/** The submenu that owns `node`, or null for the root menu. */
function ownerSubmenu(node: Element, menu: HTMLElement) {
  const owner = node.closest("[data-submenu]");
  return owner && menu.contains(owner) ? owner : null;
}

function belongsTo(node: Element, menu: HTMLElement) {
  const owner = ownerSubmenu(node, menu);
  return menu.hasAttribute("data-submenu") ? owner === menu : owner === null;
}

export function getMenuItems(menu: HTMLElement): HTMLElement[] {
  return Array.from(menu.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    (item) =>
      belongsTo(item, menu) &&
      !item.hasAttribute("disabled") &&
      !item.hasAttribute("data-disabled") &&
      item.getAttribute("aria-disabled") !== "true",
  );
}

export type MenuInitialFocus = "first" | "last" | "content";

type UseMenuNavigationOptions = {
  open: boolean;
  contentRef: React.RefObject<HTMLElement | null>;
  /** Where focus lands when the menu opens. */
  initialFocus?: MenuInitialFocus;
  /** Close the menu (Tab, or activation that closes). */
  onClose: () => void;
  /** Element to refocus when the menu closes while focus is inside it. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  /** ArrowLeft handler for submenus. */
  onCloseSubmenu?: () => void;
};

export function useMenuNavigation({
  open,
  contentRef,
  initialFocus = "content",
  onClose,
  returnFocusRef,
  onCloseSubmenu,
}: UseMenuNavigationOptions) {
  const typeahead = React.useRef({ query: "", timer: 0 });

  React.useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      const menu = contentRef.current;
      if (!menu) return;
      const items = getMenuItems(menu);
      const target =
        initialFocus === "first" ? items[0] : initialFocus === "last" ? items[items.length - 1] : undefined;
      (target ?? menu).focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(id);
    // Only on open — later changes to initialFocus must not steal focus.
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const menu = contentRef.current;
    const returnTo = returnFocusRef?.current;
    return () => {
      const active = document.activeElement;
      // Return focus only when it was inside the menu (or lost to <body> as the menu unmounted).
      if (returnTo && (!active || active === document.body || menu?.contains(active))) {
        returnTo.focus({ preventScroll: true });
      }
    };
  }, [open, contentRef, returnFocusRef]);

  return React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const menu = contentRef.current;
      if (!menu || event.defaultPrevented) return;
      // Keys inside a nested submenu belong to that submenu.
      const target = event.target as HTMLElement;
      if (target !== menu && !belongsTo(target, menu)) return;

      const items = getMenuItems(menu);
      const index = items.indexOf(document.activeElement as HTMLElement);
      const focusAt = (next: number) => {
        if (items.length === 0) return;
        items[(next + items.length) % items.length]?.focus({ preventScroll: false });
      };

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          focusAt(index < 0 ? 0 : index + 1);
          return;
        case "ArrowUp":
          event.preventDefault();
          focusAt(index < 0 ? items.length - 1 : index - 1);
          return;
        case "Home":
        case "PageUp":
          event.preventDefault();
          focusAt(0);
          return;
        case "End":
        case "PageDown":
          event.preventDefault();
          focusAt(items.length - 1);
          return;
        case "ArrowLeft":
          if (onCloseSubmenu) {
            event.preventDefault();
            onCloseSubmenu();
          }
          return;
        case "Enter":
        case " ":
          if (index >= 0) {
            event.preventDefault();
            items[index].click();
          }
          return;
        case "Tab":
          onClose();
          return;
        default:
          break;
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const state = typeahead.current;
        window.clearTimeout(state.timer);
        state.query += event.key.toLowerCase();
        state.timer = window.setTimeout(() => {
          state.query = "";
        }, 500);
        const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
        // A repeated single letter cycles through matches; longer queries match a prefix.
        const query = /^(.)\1+$/.test(state.query) ? state.query[0] : state.query;
        const match = ordered.find((item) =>
          (item.textContent ?? "").trim().toLowerCase().startsWith(query),
        );
        match?.focus();
      }
    },
    [contentRef, onClose, onCloseSubmenu],
  );
}

/** Trigger keys that open a menu, and where focus should land. */
export function menuTriggerKey(key: string): MenuInitialFocus | null {
  if (key === "ArrowDown" || key === "Enter" || key === " ") return "first";
  if (key === "ArrowUp") return "last";
  return null;
}
