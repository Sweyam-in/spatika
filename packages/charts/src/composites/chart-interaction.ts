import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type ChartTooltipItem = {
  color: string;
  label: string;
  value: string;
};

export type ChartHover = {
  x: number;
  y: number;
  title?: string;
  items: ChartTooltipItem[];
  dataIndex?: number;
  seriesId?: string;
  category?: string | number | Date;
} | null;

/** Payload fired when a chart mark (bar, slice, point, cell) is activated. */
export type ChartItemEvent = {
  seriesId: string;
  seriesLabel: string;
  dataIndex: number;
  category: string | number | Date;
  value: number | null;
  color: string;
};

/** Geometry plus item identity, used by `renderMark` on line and area series. */
export type ChartMarkRenderContext = ChartItemEvent & {
  x: number;
  y: number;
};

/**
 * Overlay guide on a cartesian plot.
 * Set `y` for a horizontal value line, or `xIndex` for a vertical category line.
 */
export type ChartReferenceLine = {
  y?: number;
  xIndex?: number;
  yAxisId?: string;
  color?: string;
  label?: string;
  strokeDasharray?: string;
};

export type ChartTooltipRenderer = (hover: NonNullable<ChartHover>) => ReactNode;

/** When `click`, marks open the tooltip on activate instead of pointer enter (Recharts Tooltip `trigger`). */
export type ChartTooltipTrigger = "hover" | "click";

/** Band or value rectangle overlay (Recharts `ReferenceArea`). */
export type ChartReferenceArea = {
  xIndex0?: number;
  xIndex1?: number;
  y0?: number;
  y1?: number;
  yAxisId?: string;
  color?: string;
  label?: string;
};

/** Point overlay on a cartesian plot (Recharts `ReferenceDot`). */
export type ChartReferenceDot = {
  xIndex?: number;
  y?: number;
  yAxisId?: string;
  r?: number;
  color?: string;
  label?: string;
};

export type ChartMarkBind = {
  className: string;
  role?: "button";
  tabIndex?: number;
  "aria-label"?: string;
  onClick?: (event: { stopPropagation(): void }) => void;
  onKeyDown?: (event: { key: string; preventDefault(): void }) => void;
  onMouseEnter?: (event: { nativeEvent: { offsetX: number; offsetY: number } }) => void;
  onMouseLeave?: () => void;
};

/** Per-category color, falling back to the series token. Empty entries keep `color`. */
export function seriesItemColor(
  color: string,
  itemColors: Array<string | null | undefined> | undefined,
  index: number,
): string {
  return itemColors?.[index] ?? color;
}

export function chartItemAriaLabel(event: ChartItemEvent): string {
  const category = String(event.category);
  if (event.seriesLabel && event.seriesLabel !== category) {
    return `${event.seriesLabel} ${category}`;
  }
  return category;
}

/**
 * Pointer, keyboard, and hover bindings for an SVG mark.
 * Adds a button role only when `onItemClick` is set so legends stay the sole named buttons.
 */
export function bindChartMark({
  event,
  hover,
  onItemClick,
  setHover,
  clearHover,
  onHighlight,
  tooltipTrigger = "hover",
}: {
  event: ChartItemEvent;
  hover: Pick<NonNullable<ChartHover>, "title" | "items"> & Partial<NonNullable<ChartHover>>;
  onItemClick?: (event: ChartItemEvent) => void;
  setHover: (hover: ChartHover) => void;
  clearHover: () => void;
  onHighlight?: (item: { seriesId: string; dataIndex: number } | null) => void;
  tooltipTrigger?: ChartTooltipTrigger;
}): ChartMarkBind {
  const clickable = Boolean(onItemClick) || tooltipTrigger === "click";
  const applyHover = (x: number, y: number) => {
    onHighlight?.({ seriesId: event.seriesId, dataIndex: event.dataIndex });
    setHover({
      x: hover.x ?? x,
      y: hover.y ?? y,
      title: hover.title,
      items: hover.items,
      dataIndex: event.dataIndex,
      seriesId: event.seriesId,
      category: event.category,
    });
  };
  const activate = (x = hover.x ?? 0, y = hover.y ?? 0) => {
    if (tooltipTrigger === "click") applyHover(x, y);
    onItemClick?.(event);
  };
  return {
    className: cn("spk-chart-mark", clickable && "spk-chart-mark--interactive"),
    role: clickable ? "button" : undefined,
    tabIndex: clickable ? 0 : undefined,
    "aria-label": clickable ? chartItemAriaLabel(event) : undefined,
    onClick: clickable
      ? (native) => {
          native.stopPropagation();
          activate();
        }
      : undefined,
    onKeyDown: clickable
      ? (native) => {
          if (native.key === "Enter" || native.key === " ") {
            native.preventDefault();
            activate();
          }
        }
      : undefined,
    onMouseEnter:
      tooltipTrigger === "hover"
        ? (native) => applyHover(native.nativeEvent.offsetX, native.nativeEvent.offsetY)
        : undefined,
    onMouseLeave:
      tooltipTrigger === "hover"
        ? () => {
            onHighlight?.(null);
            clearHover();
          }
        : undefined,
  };
}
