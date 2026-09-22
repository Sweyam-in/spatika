import * as React from "react";

type UseDismissableOptions = {
  enabled?: boolean;
  onDismiss: () => void;
  /** Refs whose nodes count as "inside" (content + trigger). */
  refs: React.RefObject<HTMLElement | null>[];
};

/**
 * Closes on Escape and pointer-down outside the provided refs.
 */
export function useDismissable({
  enabled = true,
  onDismiss,
  refs,
}: UseDismissableOptions) {
  const onDismissRef = React.useRef(onDismiss);
  onDismissRef.current = onDismiss;

  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onDismissRef.current();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const isInside = refs.some((ref) => ref.current?.contains(target));
      if (!isInside) {
        onDismissRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [enabled, refs]);
}
