import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "../lib/cn";
import {
  DEFAULT_CHART_MARGIN,
  chartColor,
  formatAxisValue,
  formatChartNumber,
  type ChartAxisConfig,
  type ChartLegendPosition,
  type ChartMargin,
} from "../lib/charts";
import {
  type ChartHover,
  type ChartTooltipRenderer,
} from "./chart-interaction";

export type { ChartHover, ChartTooltipItem } from "./chart-interaction";

export type ChartLegendItem = {
  id: string;
  label: string;
  color: string;
};

export type { ChartLegendPosition };

export function legendSitsBefore(position: ChartLegendPosition = "top") {
  return position === "top" || position === "left";
}

export type ChartFrameProps = {
  slot: string;
  className?: string;
  width?: number;
  height?: number;
  /** When true, plot height follows the parent instead of the numeric `height`. */
  fillHeight?: boolean;
  margin?: ChartMargin;
  legend?: ChartLegendItem[];
  legendPosition?: ChartLegendPosition;
  hiddenIds?: Set<string>;
  onToggleSeries?: (id: string) => void;
  hover?: ChartHover;
  renderTooltip?: ChartTooltipRenderer;
  loading?: boolean;
  empty?: boolean;
  emptyText?: ReactNode;
  "aria-label"?: string;
  children: (plot: { width: number; height: number; m: Required<ChartMargin> }) => ReactNode;
};

export function resolveMargin(margin?: ChartMargin): Required<ChartMargin> {
  return {
    top: margin?.top ?? DEFAULT_CHART_MARGIN.top,
    right: margin?.right ?? DEFAULT_CHART_MARGIN.right,
    bottom: margin?.bottom ?? DEFAULT_CHART_MARGIN.bottom,
    left: margin?.left ?? DEFAULT_CHART_MARGIN.left,
  };
}

/**
 * Measure the plot surface. With `fillHeight`, skip the numeric fallback so a
 * 280px SVG is not painted before the first layout (that overflow-clips donuts).
 */
export function useChartSurfaceSize(
  ref: RefObject<HTMLElement | null>,
  fallbackWidth: number,
  fallbackHeight: number,
  fillHeight = false,
) {
  const [size, setSize] = useState({
    width: fallbackWidth,
    height: fillHeight ? 0 : fallbackHeight,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      setSize({
        width: el.clientWidth || fallbackWidth,
        height: fillHeight ? el.clientHeight : el.clientHeight || fallbackHeight,
      });
    };
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fallbackWidth, fallbackHeight, fillHeight, ref]);

  return size;
}

export function ChartStatusOverlay({
  loading,
  empty,
  emptyText = "No data",
}: {
  loading?: boolean;
  empty?: boolean;
  emptyText?: ReactNode;
}) {
  if (loading) {
    return (
      <div className="spk-chart-overlay" data-slot="chart-loading" role="status">
        Loading…
      </div>
    );
  }
  if (empty) {
    return (
      <div className="spk-chart-overlay" data-slot="chart-empty" role="status">
        {emptyText}
      </div>
    );
  }
  return null;
}

export function ChartFrame({
  slot,
  className,
  width,
  height = 280,
  fillHeight = false,
  margin,
  legend,
  legendPosition = "top",
  hiddenIds,
  onToggleSeries,
  hover,
  renderTooltip,
  loading,
  empty,
  emptyText,
  "aria-label": ariaLabel,
  children,
}: ChartFrameProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const measured = useChartSurfaceSize(surfaceRef, width ?? 320, height, fillHeight);
  const plotWidth = width ?? measured.width;
  const plotHeight = fillHeight ? measured.height : height;
  const m = resolveMargin(margin);
  const legendEl = legend?.length ? (
    <ChartLegend items={legend} hiddenIds={hiddenIds} onToggle={onToggleSeries} position={legendPosition} />
  ) : null;
  const before = legendSitsBefore(legendPosition);

  return (
    <div
      data-slot={slot}
      className={cn("spk-chart", fillHeight && "spk-chart--fill", className)}
      role="group"
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
    >
      <div className={cn("spk-chart-body", `spk-chart--legend-${legendPosition}`)}>
        {before ? legendEl : null}
        <div
          ref={surfaceRef}
          className="spk-chart-surface"
          style={fillHeight ? undefined : { height: plotHeight }}
        >
          {plotWidth > 0 && plotHeight > 0 ? children({ width: plotWidth, height: plotHeight, m }) : null}
          <ChartTooltip hover={hover ?? null} boundsWidth={plotWidth} render={renderTooltip} />
          <ChartStatusOverlay loading={loading} empty={empty} emptyText={emptyText} />
        </div>
        {before ? null : legendEl}
      </div>
    </div>
  );
}

export function ChartLegend({
  items,
  hiddenIds,
  onToggle,
  position = "top",
}: {
  items: ChartLegendItem[];
  hiddenIds?: Set<string>;
  onToggle?: (id: string) => void;
  position?: ChartLegendPosition;
}) {
  return (
    <div className="spk-chart-legend" data-position={position}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="spk-chart-legend-item"
          data-hidden={hiddenIds?.has(item.id) ? "true" : undefined}
          onClick={() => onToggle?.(item.id)}
        >
          <span className="spk-chart-swatch" style={{ background: item.color }} />
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function ChartTooltip({
  hover,
  boundsWidth,
  render,
}: {
  hover: ChartHover;
  boundsWidth: number;
  render?: ChartTooltipRenderer;
}) {
  if (!hover || !hover.items.length) return null;
  const custom = render?.(hover);
  if (render && custom == null) return null;
  const left = clampTooltip(hover.x, boundsWidth);
  const hideTitle =
    Boolean(hover.title) && hover.items.length === 1 && hover.items[0]!.label === hover.title;
  return (
    <div className="spk-chart-tooltip" style={{ left, top: hover.y }} role="tooltip">
      {render ? (
        custom
      ) : (
        <>
          {hover.title && !hideTitle ? <p className="spk-chart-tooltip-title">{hover.title}</p> : null}
          <ul>
            {hover.items.map((item) => (
              <li key={item.label}>
                <span className="spk-chart-swatch" style={{ background: item.color }} />
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function clampTooltip(x: number, width: number) {
  return clampNum(x, 72, Math.max(72, width - 72));
}

function clampNum(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CartesianGrid({
  ticks,
  scale,
  left,
  right,
  top,
  bottom,
}: {
  ticks: number[];
  scale: (value: number) => number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}) {
  return (
    <g data-slot="chart-grid">
      {ticks.map((tick) => (
        <line
          key={tick}
          className="spk-chart-grid"
          x1={left}
          x2={right}
          y1={scale(tick)}
          y2={scale(tick)}
        />
      ))}
      <line className="spk-chart-axis" x1={left} x2={right} y1={bottom} y2={bottom} />
      <line className="spk-chart-axis" x1={left} x2={left} y1={top} y2={bottom} />
    </g>
  );
}

export function ValueAxis({
  ticks,
  scale,
  left,
  width,
  format,
}: {
  ticks: number[];
  scale: (value: number) => number;
  left: number;
  width?: number;
  format?: (value: number) => string;
}) {
  const label = format ?? formatChartNumber;
  return (
    <g data-slot="chart-y-axis">
      {ticks.map((tick) => (
        <text
          key={tick}
          className="spk-chart-tick"
          x={left - 8}
          y={scale(tick)}
          textAnchor="end"
          dominantBaseline="middle"
        >
          {label(tick)}
        </text>
      ))}
      {width ? (
        <text
          className="spk-chart-axis-label"
          x={12}
          y={width / 2}
          transform={`rotate(-90 12 ${width / 2})`}
          textAnchor="middle"
        />
      ) : null}
    </g>
  );
}

export function CategoryAxis({
  labels,
  position,
  y,
  tickAngle = 0,
}: {
  labels: Array<string | number | Date>;
  position: (index: number) => number;
  y: number;
  tickAngle?: number;
}) {
  const maxLabels = labels.length > 12 ? Math.ceil(labels.length / 8) : 1;
  const anchor = tickAngle < 0 ? "end" : tickAngle > 0 ? "start" : "middle";
  return (
    <g data-slot="chart-x-axis">
      {labels.map((label, index) => {
        if (index % maxLabels !== 0) return null;
        const x = position(index);
        const ty = y + 16;
        return (
          <text
            key={`${index}-${String(label)}`}
            className="spk-chart-tick"
            x={x}
            y={ty}
            textAnchor={anchor}
            transform={tickAngle ? `rotate(${tickAngle} ${x} ${ty})` : undefined}
          >
            {formatAxisValue(label)}
          </text>
        );
      })}
    </g>
  );
}

export function useHiddenSeries(ids: string[]) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const visible = ids.filter((id) => !hidden.has(id));
  return { hidden, toggle, visible };
}

export function seriesMeta(
  series: Array<{ id?: string; label?: string; color?: string }>,
  colors?: string[],
): ChartLegendItem[] {
  return series.map((item, index) => ({
    id: item.id ?? item.label ?? `series-${index}`,
    label: item.label ?? item.id ?? `Series ${index + 1}`,
    color: item.color ?? chartColor(index, colors),
  }));
}

export function useChartHover() {
  const [hover, setHover] = useState<ChartHover>(null);
  return { hover, setHover, clear: () => setHover(null) };
}

export function categoryLabels(axis?: ChartAxisConfig, length = 0): Array<string | number | Date> {
  if (axis?.data?.length) return axis.data;
  return Array.from({ length }, (_, i) => i + 1);
}

export function formatSeriesValue(
  value: number | [number, number] | undefined,
  format?: (value: number) => string,
) {
  if (value == null) return "—";
  const fmt = format ?? formatChartNumber;
  if (Array.isArray(value)) return `${fmt(value[0])} – ${fmt(value[1])}`;
  return fmt(value);
}

