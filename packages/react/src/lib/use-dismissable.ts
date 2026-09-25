import * as React from "react";
import { useDismissLayer } from "./layer-stack";

type UseDismissableOptions = {
  enabled?: boolean;
  onDismiss: () => void;
  /** Refs whose nodes count as "inside" (content + trigger). */
  refs: React.RefObject<HTMLElement | null>[];
};

/**
 * Closes on Escape and pointer-down outside the provided refs.
 * Routed through the shared layer stack, so only the topmost open overlay reacts.
 */
export function useDismissable({ enabled = true, onDismiss, refs }: UseDismissableOptions) {
  useDismissLayer({
    enabled,
    refs,
    onEscapeKeyDown: (event) => {
      event.stopPropagation();
      onDismiss();
    },
    onPointerDownOutside: () => onDismiss(),
  });
}
