import * as React from "react";
import { cn } from "../lib/cn";
import { useIsomorphicLayoutEffect } from "../lib/use-isomorphic-layout-effect";

export type ResizablePanelsProps = Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
  /** `horizontal` puts panels side by side (default); `vertical` stacks them. */
  orientation?: "horizontal" | "vertical";
  /** Initial sizes in percent, one per panel. Default: equal. */
  defaultSizes?: number[];
  /** Controlled sizes in percent. */
  sizes?: number[];
  onSizesChange?: (sizes: number[]) => void;
  /** Minimum size per panel in percent. Default 10. */
  minSizes?: number[];
  /** Percent moved per arrow key press. Default 5. */
  keyboardStep?: number;
  /** Persist sizes in localStorage under this key. */
  storageKey?: string;
  /**
   * Below this container width (px) horizontal panels stack vertically without handles —
   * split views rarely make sense on a phone. Default 640.
   */
  stackBelow?: number;
  /** Accessible names for the handles, one per gap. Default "Resize". */
  handleLabels?: string[];
  children: React.ReactNode;
};

function equalSizes(count: number) {
  return Array.from({ length: count }, () => 100 / count);
}

function readStored(key: string | undefined, count: number) {
  if (!key || typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null");
    return Array.isArray(parsed) && parsed.length === count && parsed.every((n) => typeof n === "number")
      ? (parsed as number[])
      : null;
  } catch {
    return null;
  }
}

/**
 * Split view with draggable, keyboard-operable dividers (WAI-ARIA window splitter). Each
 * divider is a focusable `separator`: arrows resize, Home / End jump to the limits. Sizes are
 * percentages, can persist across visits, and panels stack on narrow containers.
 */
export function ResizablePanels({
  orientation = "horizontal",
  defaultSizes,
  sizes: sizesProp,
  onSizesChange,
  minSizes,
  keyboardStep = 5,
  storageKey,
  stackBelow = 640,
  handleLabels,
  className,
  children,
  ...props
}: ResizablePanelsProps) {
  const panels = React.Children.toArray(children).filter(React.isValidElement);
  const count = panels.length;
  const [internal, setInternal] = React.useState<number[]>(
    () => readStored(storageKey, count) ?? defaultSizes ?? equalSizes(count),
  );
  const sizes = sizesProp ?? internal;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [stacked, setStacked] = React.useState(false);
  const [dragging, setDragging] = React.useState<number | null>(null);
  const baseId = React.useId();
  const min = (index: number) => minSizes?.[index] ?? 10;

  useIsomorphicLayoutEffect(() => {
    const element = containerRef.current;
    if (!element || orientation !== "horizontal" || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setStacked(entry.contentRect.width > 0 && entry.contentRect.width < stackBelow));
    observer.observe(element);
    return () => observer.disconnect();
  }, [orientation, stackBelow]);

  const commit = (next: number[]) => {
    if (!sizesProp) setInternal(next);
    onSizesChange?.(next);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* Storage can be unavailable (private mode); sizes still apply for this session. */
      }
    }
  };

  /** Move the divider after panel `index` so that panel becomes `target` percent. */
  const resize = (index: number, target: number) => {
    const pair = sizes[index] + sizes[index + 1];
    const clamped = Math.min(pair - min(index + 1), Math.max(min(index), target));
    const next = [...sizes];
    next[index] = Number(clamped.toFixed(2));
    next[index + 1] = Number((pair - clamped).toFixed(2));
    commit(next);
  };

  const onPointerDown = (index: number) => (event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    setDragging(index);
    const rect = container.getBoundingClientRect();
    const length = orientation === "horizontal" ? rect.width : rect.height;
    const before = sizes.slice(0, index).reduce((sum, size) => sum + size, 0);
    const move = (moveEvent: PointerEvent) => {
      const offset =
        orientation === "horizontal" ? moveEvent.clientX - rect.left : moveEvent.clientY - rect.top;
      resize(index, (offset / length) * 100 - before);
    };
    const handle = event.currentTarget;
    const up = () => {
      setDragging(null);
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  };

  const effective = stacked ? "vertical" : orientation;

  return (
    <div
      ref={containerRef}
      data-slot="resizable-panels"
      data-orientation={effective}
      data-stacked={stacked || undefined}
      className={cn("spk-resizable", className)}
      {...props}
    >
      {panels.map((panel, index) => {
        const panelId = `${baseId}-panel-${index}`;
        return (
          <React.Fragment key={panel.key ?? index}>
            <div
              id={panelId}
              data-slot="resizable-panel"
              className="spk-resizable-panel"
              style={stacked ? { flex: "1 1 auto" } : { flex: `${sizes[index]} 1 0%` }}
            >
              {panel}
            </div>
            {index < count - 1 && !stacked ? (
              <div
                role="separator"
                tabIndex={0}
                aria-label={handleLabels?.[index] ?? "Resize"}
                aria-controls={panelId}
                aria-orientation={orientation === "horizontal" ? "vertical" : "horizontal"}
                aria-valuenow={Math.round(sizes[index])}
                aria-valuemin={min(index)}
                aria-valuemax={Math.round(sizes[index] + sizes[index + 1] - min(index + 1))}
                data-dragging={dragging === index || undefined}
                className="spk-resize-handle"
                onPointerDown={onPointerDown(index)}
                onKeyDown={(event) => {
                  const grow = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
                  const shrink = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
                  const actions: Record<string, () => void> = {
                    [grow]: () => resize(index, sizes[index] + keyboardStep),
                    [shrink]: () => resize(index, sizes[index] - keyboardStep),
                    Home: () => resize(index, min(index)),
                    End: () => resize(index, sizes[index] + sizes[index + 1]),
                  };
                  if (actions[event.key]) {
                    event.preventDefault();
                    actions[event.key]();
                  }
                }}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}
