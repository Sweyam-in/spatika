import * as React from "react";
import { cn } from "../lib/cn";
import { useIsomorphicLayoutEffect } from "../lib/use-isomorphic-layout-effect";

export type VirtualListHandle = {
  /** Scroll so the item at `index` is visible. */
  scrollToIndex: (index: number, align?: "start" | "center" | "end" | "auto") => void;
};

export type VirtualListProps<T> = {
  items: readonly T[];
  /** Fixed row height in pixels. */
  itemHeight: number;
  /** Viewport height — a number is pixels. */
  height: number | string;
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey?: (item: T, index: number) => React.Key;
  /** Extra rows rendered above and below the viewport. Default 6. */
  overscan?: number;
  /** Called when the last rows come into view — load the next page here. */
  onEndReached?: () => void;
  /** Rows from the end that trigger `onEndReached`. Default 5. */
  endThreshold?: number;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

function VirtualListInner<T>(
  {
    items,
    itemHeight,
    height,
    renderItem,
    getKey,
    overscan = 6,
    onEndReached,
    endThreshold = 5,
    className,
    ...aria
  }: VirtualListProps<T>,
  ref: React.ForwardedRef<VirtualListHandle>,
) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewport, setViewport] = React.useState(typeof height === "number" ? height : 400);
  const endNotified = React.useRef(-1);

  useIsomorphicLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const measure = () => {
      if (element.clientHeight > 0) setViewport(element.clientHeight);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const total = items.length * itemHeight;
  const first = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const last = Math.min(items.length - 1, Math.ceil((scrollTop + viewport) / itemHeight) + overscan);

  React.useEffect(() => {
    if (!onEndReached || items.length === 0) return;
    const lastVisible = Math.floor((scrollTop + viewport) / itemHeight);
    if (lastVisible >= items.length - endThreshold && endNotified.current !== items.length) {
      endNotified.current = items.length;
      onEndReached();
    }
  }, [scrollTop, viewport, itemHeight, items.length, endThreshold, onEndReached]);

  React.useImperativeHandle(ref, () => ({
    scrollToIndex(index, align = "auto") {
      const element = scrollRef.current;
      if (!element) return;
      const top = index * itemHeight;
      const bottom = top + itemHeight;
      const view = element.clientHeight || viewport;
      let next = element.scrollTop;
      if (align === "start") next = top;
      else if (align === "end") next = bottom - view;
      else if (align === "center") next = top - (view - itemHeight) / 2;
      else if (top < element.scrollTop) next = top;
      else if (bottom > element.scrollTop + view) next = bottom - view;
      element.scrollTop = Math.max(0, next);
      setScrollTop(element.scrollTop);
    },
  }));

  const rows: React.ReactNode[] = [];
  for (let index = first; index <= last; index += 1) {
    rows.push(
      <div
        key={getKey ? getKey(items[index], index) : index}
        role="listitem"
        aria-setsize={items.length}
        aria-posinset={index + 1}
        className="spk-virtual-list-row"
        style={{ top: index * itemHeight, height: itemHeight }}
      >
        {renderItem(items[index], index)}
      </div>,
    );
  }

  return (
    <div
      ref={scrollRef}
      data-slot="virtual-list"
      tabIndex={0}
      className={cn("spk-virtual-list", className)}
      style={{ height }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div role="list" {...aria} className="spk-virtual-list-spacer" style={{ height: total }}>
        {rows}
      </div>
    </div>
  );
}

/**
 * Windowed list for thousands of rows: only the rows in view (plus `overscan`) are in the DOM.
 * Rows keep `aria-setsize` / `aria-posinset` so assistive tech reports the full length. The
 * container is focusable and scrolls with the arrow, Page and Home / End keys.
 */
export const VirtualList = React.forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<VirtualListHandle> },
) => React.ReactElement;
