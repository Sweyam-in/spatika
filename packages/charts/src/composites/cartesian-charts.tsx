import { useCallback, useState, type MouseEvent, type ReactNode } from "react";
import {
  areaPath,
  bandScale,
  boxPlotStats,
  categoryLabelGutter,
  chartColor,
  extent,
  fitCategoryLabel,
  formatAxisNumber,
  formatChartNumber,
  inferScaleType,
  linePath,
  linearScale,
  niceDomain,
  niceTicks,
  pointScale,
  rangeAreaPath,
  roundedRectPath,
  stackSeries,
  waterfallBars,
  seriesHasPlottableData,
  type BoxPlotStats,
  type ChartAxisConfig,
  type ChartCurve,
  type ChartErrorValue,
  type ChartLegendPosition,
  type ChartMargin,
  type StackOffset,
} from "../lib/charts";
import {
  CartesianGrid,
  CategoryAxis,
  ChartFrame,
  ValueAxis,
  categoryLabels,
  formatSeriesValue,
  seriesMeta,
  useChartHover,
  useHiddenSeries,
  type ChartHover,
} from "./chart-ui";
import { ChartContainer } from "./chart-composition";
import {
  bindChartMark,
  seriesItemColor,
  type ChartItemEvent,
  type ChartMarkRenderContext,
  type ChartReferenceArea,
  type ChartReferenceDot,
  type ChartReferenceLine,
  type ChartTooltipRenderer,
  type ChartTooltipTrigger,
} from "./chart-interaction";
import { ScatterWebGLLayer } from "./ScatterWebGL";
import {
  nearestScatterHit,
  shouldUseWebGL,
  svgPointerPosition,
  type ScatterRenderer,
} from "../lib/webgl-scatter";

export type { ScatterRenderer };

export type NumericSeries = {
  id?: string;
  label?: string;
  data?: Array<number | null>;
  dataKey?: string;
  color?: string;
  /** Per-category colors; each entry falls back to `color`. */
  itemColors?: Array<string | null | undefined>;
  stack?: string;
  area?: boolean;
  curve?: ChartCurve;
  showMark?: boolean;
  yAxisId?: string;
  type?: "bar" | "line" | "area";
  /** Stroke dash pattern for line/area series (`"4 4"`). */
  strokeDasharray?: string;
  /** When false, line/area paths break at nulls instead of joining across them. Default true. */
  connectNulls?: boolean;
  /** Symmetric ±delta or `[minus, plus]` per category (Recharts ErrorBar). */
  error?: Array<ChartErrorValue | null | undefined>;
};

export type CartesianChartProps = {
  xAxis?: ChartAxisConfig[];
  yAxis?: ChartAxisConfig[];
  series: NumericSeries[];
  dataset?: import("../lib/charts").ChartDataset;
  height?: number;
  width?: number;
  colors?: string[];
  hideLegend?: boolean;
  hideGrid?: boolean;
  margin?: ChartMargin;
  className?: string;
  zoom?: boolean | import("../lib/charts").ChartZoom;
  onZoomChange?: (zoom: import("../lib/charts").ChartZoom) => void;
  showToolbar?: boolean;
  highlightScope?: import("../lib/charts").HighlightScope;
  animated?: boolean;
  locale?: string;
  fillHeight?: boolean;
  onItemClick?: (event: ChartItemEvent) => void;
  renderTooltip?: ChartTooltipRenderer;
  renderMark?: (ctx: ChartMarkRenderContext) => ReactNode;
  referenceLines?: ChartReferenceLine[];
  referenceAreas?: ChartReferenceArea[];
  referenceDots?: ChartReferenceDot[];
  showLabels?: boolean;
  syncId?: string;
  sharedTooltip?: boolean;
  tooltipTrigger?: ChartTooltipTrigger;
  showCursor?: boolean;
  defaultIndex?: number;
  stackOffset?: StackOffset;
  minPointSize?: number;
  maxBarSize?: number;
  legendPosition?: ChartLegendPosition;
  loading?: boolean;
  emptyText?: import("react").ReactNode;
  showBarBackground?: boolean;
};

export type BarChartProps = CartesianChartProps & {
  layout?: "vertical" | "horizontal";
  stacked?: boolean;
  borderRadius?: number;
  categoryGapRatio?: number;
  barGapRatio?: number;
};

function interactionProps(
  props: Pick<
    CartesianChartProps,
    | "syncId"
    | "sharedTooltip"
    | "tooltipTrigger"
    | "showCursor"
    | "defaultIndex"
    | "stackOffset"
    | "minPointSize"
    | "maxBarSize"
    | "referenceAreas"
    | "referenceDots"
    | "legendPosition"
    | "loading"
    | "emptyText"
    | "showBarBackground"
  >,
) {
  return {
    syncId: props.syncId,
    sharedTooltip: props.sharedTooltip,
    tooltipTrigger: props.tooltipTrigger,
    showCursor: props.showCursor,
    defaultIndex: props.defaultIndex,
    stackOffset: props.stackOffset,
    minPointSize: props.minPointSize,
    maxBarSize: props.maxBarSize,
    referenceAreas: props.referenceAreas,
    referenceDots: props.referenceDots,
    legendPosition: props.legendPosition,
    loading: props.loading,
    emptyText: props.emptyText,
    showBarBackground: props.showBarBackground,
  };
}

export type LineChartProps = CartesianChartProps & {
  curve?: ChartCurve;
  area?: boolean;
  showMark?: boolean;
  stacked?: boolean;
  /** Default `connectNulls` for series that do not set their own. */
  connectNulls?: boolean;
};

export type ScatterPoint = {
  id?: string | number;
  x: number;
  y: number;
  z?: number;
  label?: string;
};

export type ScatterSeries = {
  id?: string;
  label?: string;
  color?: string;
  data: ScatterPoint[];
};

type PlotBox = { left: number; right: number; top: number; bottom: number; iw: number; ih: number };

function box(width: number, height: number, m: Required<ChartMargin>): PlotBox {
  return {
    left: m.left,
    right: width - m.right,
    top: m.top,
    bottom: height - m.bottom,
    iw: Math.max(1, width - m.left - m.right),
    ih: Math.max(1, height - m.top - m.bottom),
  };
}

function numericDomain(series: NumericSeries[], stacked: boolean, axis?: ChartAxisConfig): [number, number] {
  if (axis?.min != null && axis?.max != null) return [axis.min, axis.max];
  const values: number[] = [];
  if (stacked) {
    const stacks = stackSeries(series.map((item) => (item.data ?? []).map((v) => v ?? 0)));
    for (const segs of stacks) for (const seg of segs) values.push(seg.start, seg.end);
  } else {
    for (const item of series) for (const value of item.data ?? []) if (value != null) values.push(value);
  }
  if (!values.length) values.push(0, 1);
  if (Math.min(...values) > 0) values.push(0);
  const [min, max] = niceDomain(...extent(values, 0.04));
  return [axis?.min ?? min, axis?.max ?? max];
}

function CartesianShell({
  slot,
  ariaLabel,
  series,
  colors,
  hideLegend,
  hideGrid,
  xAxis,
  yAxis,
  width,
  height,
  margin,
  className,
  domain,
  categories,
  categoryMode = "band",
  children,
}: {
  slot: string;
  ariaLabel: string;
  series: Array<{ id?: string; label?: string; color?: string }>;
  colors?: string[];
  hideLegend?: boolean;
  hideGrid?: boolean;
  xAxis?: ChartAxisConfig[];
  yAxis?: ChartAxisConfig[];
  width?: number;
  height?: number;
  margin?: ChartMargin;
  className?: string;
  domain: [number, number];
  categories: Array<string | number | Date>;
  categoryMode?: "band" | "point" | "linear";
  children: (ctx: {
    plot: PlotBox;
    xAt: (index: number) => number;
    yAt: (value: number) => number;
    bandwidth: number;
    ticks: number[];
    hidden: Set<string>;
    meta: ReturnType<typeof seriesMeta>;
    setHover: (hover: ChartHover) => void;
    clear: () => void;
  }) => ReactNode;
}) {
  const meta = seriesMeta(series, colors);
  const ids = meta.map((item) => item.id);
  const { hidden, toggle } = useHiddenSeries(ids);
  const { hover, setHover, clear } = useChartHover();
  const ticks = niceTicks(domain[0], domain[1], 5);
  const xConfig = xAxis?.[0];

  return (
    <ChartFrame
      slot={slot}
      className={className}
      width={width}
      height={height}
      margin={margin}
      legend={hideLegend ? undefined : meta}
      hiddenIds={hidden}
      onToggleSeries={toggle}
      hover={hover}
      aria-label={ariaLabel}
    >
      {({ width: w, height: h, m }) => {
        const plot = box(w, h, m);
        const yAt = linearScale(domain, [plot.bottom, plot.top]);
        let xAt = (index: number) => plot.left + plot.iw * (categories.length <= 1 ? 0.5 : index / (categories.length - 1));
        let bandwidth = 0;
        if (categoryMode === "band") {
          const scale = bandScale(
            categories.map(String),
            [plot.left, plot.right],
            0.24,
          );
          xAt = (index) => scale(String(categories[index]));
          bandwidth = scale.bandwidth;
        } else if (categoryMode === "point") {
          const scale = pointScale(categories.map(String), [plot.left, plot.right]);
          xAt = (index) => scale(String(categories[index]));
        } else if (xConfig?.data?.every((v) => typeof v === "number" || v instanceof Date)) {
          const xs = xConfig.data.map((v) => (v instanceof Date ? v.getTime() : Number(v)));
          const [min, max] = extent(xs);
          const scale = linearScale([min, max], [plot.left, plot.right]);
          xAt = (index) => scale(xs[index] ?? min);
        }
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {hideGrid ? null : (
              <CartesianGrid
                ticks={ticks}
                scale={yAt}
                left={plot.left}
                right={plot.right}
                top={plot.top}
                bottom={plot.bottom}
              />
            )}
            {yAxis?.[0]?.hide ? null : (
              <ValueAxis ticks={ticks} scale={yAt} left={plot.left} format={yAxis?.[0]?.valueFormatter ?? yAxis?.[0]?.tickFormatter} />
            )}
            {xAxis?.[0]?.hide ? null : (
              <CategoryAxis labels={categories} position={xAt} y={plot.bottom} />
            )}
            {children({ plot, xAt, yAt, bandwidth, ticks, hidden, meta, setHover, clear })}
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export function BarChart({
  xAxis,
  yAxis,
  series,
  dataset,
  height,
  width,
  layout = "vertical",
  stacked = false,
  borderRadius = 3,
  colors,
  hideLegend,
  hideGrid,
  margin,
  className,
  barGapRatio = 0.15,
  zoom,
  onZoomChange,
  showToolbar,
  highlightScope,
  animated,
  locale,
  fillHeight,
  onItemClick,
  renderTooltip,
  renderMark,
  referenceLines,
  showLabels,
  syncId,
  sharedTooltip,
  tooltipTrigger,
  showCursor,
  defaultIndex,
  stackOffset,
  minPointSize,
  maxBarSize,
  referenceAreas,
  referenceDots,
  legendPosition,
  loading,
  emptyText,
  showBarBackground,
}: BarChartProps) {
  const meta = seriesMeta(series, colors);

  if (layout === "horizontal") {
    return (
      <HorizontalBarChart
        xAxis={xAxis}
        yAxis={yAxis}
        series={series}
        height={height}
        width={width}
        stacked={stacked}
        borderRadius={borderRadius}
        colors={colors}
        hideLegend={hideLegend}
        hideGrid={hideGrid}
        margin={margin}
        className={className}
        barGapRatio={barGapRatio}
        fillHeight={fillHeight}
        onItemClick={onItemClick}
        renderTooltip={renderTooltip}
        showLabels={showLabels}
        legendPosition={legendPosition}
        loading={loading}
        emptyText={emptyText}
      />
    );
  }

  return (
    <ChartContainer
      slot="bar-chart"
      aria-label={`Bar chart of ${meta.map((s) => s.label).join(", ")}`}
      className={className}
      width={width}
      height={height}
      margin={margin}
      dataset={dataset}
      xAxis={xAxis}
      yAxis={yAxis}
      series={series.map((item) => ({ ...item, type: "bar" as const }))}
      colors={colors}
      hideLegend={hideLegend}
      hideGrid={hideGrid}
      stacked={stacked}
      barGapRatio={barGapRatio}
      borderRadius={borderRadius}
      zoom={zoom}
      onZoomChange={onZoomChange}
      showToolbar={showToolbar}
      highlightScope={highlightScope}
      animated={animated}
      locale={locale}
      fillHeight={fillHeight}
      onItemClick={onItemClick}
      renderTooltip={renderTooltip}
      renderMark={renderMark}
      referenceLines={referenceLines}
      showLabels={showLabels}
      {...interactionProps({
        syncId,
        sharedTooltip,
        tooltipTrigger,
        showCursor,
        defaultIndex,
        stackOffset,
        minPointSize,
        maxBarSize,
        referenceAreas,
        referenceDots,
        legendPosition,
        loading,
        emptyText,
        showBarBackground,
      })}
    />
  );
}

function HorizontalBarChart({
  xAxis,
  yAxis,
  series,
  height,
  width,
  stacked,
  borderRadius = 3,
  colors,
  hideLegend,
  hideGrid,
  margin,
  className,
  barGapRatio = 0.15,
  fillHeight,
  onItemClick,
  renderTooltip,
  showLabels,
  legendPosition,
  loading,
  emptyText,
}: BarChartProps) {
  const categories = categoryLabels(xAxis?.[0], series[0]?.data?.length ?? 0);
  const domain = numericDomain(series, Boolean(stacked), yAxis?.[0]);
  const meta = seriesMeta(series, colors);
  const ids = meta.map((item) => item.id);
  const { hidden, toggle } = useHiddenSeries(ids);
  const { hover, setHover, clear } = useChartHover();
  const ticks = niceTicks(domain[0], domain[1], 5);
  const stacks = stacked ? stackSeries(series.map((item) => (item.data ?? []).map((v) => v ?? 0))) : null;
  const valueFormat = yAxis?.[0]?.valueFormatter ?? yAxis?.[0]?.tickFormatter;
  const resolvedMargin = {
    top: margin?.top ?? 16,
    right: margin?.right ?? (showLabels ? 48 : 16),
    bottom: margin?.bottom ?? 28,
    left: margin?.left ?? categoryLabelGutter(categories),
  };

  return (
    <ChartFrame
      slot="bar-chart"
      className={className}
      width={width}
      height={height}
      fillHeight={fillHeight}
      margin={resolvedMargin}
      legend={hideLegend ? undefined : meta}
      legendPosition={legendPosition}
      hiddenIds={hidden}
      onToggleSeries={toggle}
      hover={hover}
      renderTooltip={renderTooltip}
      loading={loading}
      empty={!seriesHasPlottableData(series)}
      emptyText={emptyText}
      aria-label={`Bar chart of ${meta.map((s) => s.label).join(", ")}`}
    >
      {({ width: w, height: h, m }) => {
        const plot = box(w, h, m);
        const xAt = linearScale(domain, [plot.left, plot.right]);
        const yScale = bandScale(categories.map(String), [plot.top, plot.bottom], 0.24);
        const visible = meta.filter((item) => !hidden.has(item.id));
        const n = stacked ? 1 : Math.max(visible.length, 1);
        const gap = n > 1 ? yScale.bandwidth * barGapRatio : 0;
        const barH = (yScale.bandwidth - gap * (n - 1)) / n;
        const zero = xAt(0);
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {hideGrid
              ? null
              : ticks.map((tick) => (
                  <line
                    key={tick}
                    className="spk-chart-grid"
                    x1={xAt(tick)}
                    x2={xAt(tick)}
                    y1={plot.top}
                    y2={plot.bottom}
                  />
                ))}
            {ticks.map((tick) => (
              <text
                key={`t-${tick}`}
                className="spk-chart-tick"
                x={xAt(tick)}
                y={plot.bottom + 16}
                textAnchor="middle"
              >
                {formatAxisNumber(tick, yAxis?.[0])}
              </text>
            ))}
            {categories.map((label, i) => (
              <text
                key={String(label)}
                className="spk-chart-tick"
                x={plot.left - 8}
                y={yScale(String(label)) + yScale.bandwidth / 2}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {fitCategoryLabel(label, m.left)}
              </text>
            ))}
            {series.map((item, s) => {
              const info = meta[s]!;
              if (hidden.has(info.id)) return null;
              const visIndex = visible.findIndex((v) => v.id === info.id);
              return (item.data ?? []).map((value, i) => {
                if (value == null) return null;
                const catY = yScale(String(categories[i]));
                let y = catY;
                let x1: number;
                let x2: number;
                if (stacks) {
                  const seg = stacks[s]![i]!;
                  x1 = xAt(seg.start);
                  x2 = xAt(seg.end);
                } else {
                  y = catY + visIndex * (barH + gap);
                  x1 = zero;
                  x2 = xAt(value);
                }
                const x = Math.min(x1, x2);
                const barW = Math.max(1, Math.abs(x2 - x1));
                const color = seriesItemColor(info.color, item.itemColors, i);
                const event: ChartItemEvent = {
                  seriesId: info.id,
                  seriesLabel: info.label,
                  dataIndex: i,
                  category: categories[i] ?? i,
                  value,
                  color,
                };
                return (
                  <g key={`${info.id}-${i}`}>
                    <path
                      d={roundedRectPath(x, y, barW, stacked ? yScale.bandwidth : barH, borderRadius)}
                      fill={color}
                      style={{ fill: color }}
                      {...bindChartMark({
                        event,
                        hover: {
                          title: String(categories[i]),
                          items: [{ color, label: info.label, value: formatSeriesValue(value, valueFormat) }],
                        },
                        onItemClick,
                        setHover,
                        clearHover: clear,
                      })}
                    />
                    {showLabels ? (
                      <text
                        className="spk-chart-label"
                        x={Math.max(x1, x2) + 6}
                        y={y + (stacked ? yScale.bandwidth : barH) / 2}
                        dominantBaseline="middle"
                      >
                        {formatSeriesValue(value, valueFormat)}
                      </text>
                    ) : null}
                  </g>
                );
              });
            })}
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export function LineChart({
  xAxis,
  yAxis,
  series,
  dataset,
  height,
  width,
  colors,
  hideLegend,
  hideGrid,
  margin,
  className,
  curve = "monotone",
  area = false,
  showMark = true,
  stacked = false,
  zoom,
  onZoomChange,
  showToolbar,
  highlightScope,
  animated,
  locale,
  fillHeight,
  onItemClick,
  renderTooltip,
  renderMark,
  referenceLines,
  connectNulls,
  syncId,
  sharedTooltip,
  tooltipTrigger,
  showCursor,
  defaultIndex,
  stackOffset,
  minPointSize,
  maxBarSize,
  referenceAreas,
  referenceDots,
  legendPosition,
  loading,
  emptyText,
}: LineChartProps) {
  const meta = seriesMeta(series, colors);
  const stackedAreas = stacked && (area || series.some((item) => item.area || item.type === "area"));
  return (
    <ChartContainer
      slot={area ? "area-chart" : "line-chart"}
      aria-label={`${area ? "Area" : "Line"} chart of ${meta.map((s) => s.label).join(", ")}`}
      className={className}
      width={width}
      height={height}
      margin={margin}
      dataset={dataset}
      xAxis={xAxis}
      yAxis={yAxis}
      series={series.map((item) => ({
        ...item,
        type: area || item.area ? "area" : "line",
        curve: item.curve ?? curve,
        showMark: item.showMark ?? (stackedAreas ? false : showMark),
        connectNulls: item.connectNulls ?? connectNulls,
      }))}
      colors={colors}
      hideLegend={hideLegend}
      hideGrid={hideGrid}
      stacked={stacked}
      zoom={zoom}
      onZoomChange={onZoomChange}
      showToolbar={showToolbar}
      highlightScope={highlightScope}
      animated={animated}
      locale={locale}
      fillHeight={fillHeight}
      onItemClick={onItemClick}
      renderTooltip={renderTooltip}
      renderMark={renderMark}
      referenceLines={referenceLines}
      {...interactionProps({
        syncId,
        sharedTooltip,
        tooltipTrigger,
        showCursor,
        defaultIndex,
        stackOffset,
        minPointSize,
        maxBarSize,
        referenceAreas,
        referenceDots,
        legendPosition,
        loading,
        emptyText,
      })}
    />
  );
}

export function AreaChart(props: LineChartProps) {
  return <LineChart {...props} area />;
}

export type SparkLineChartProps = {
  data: number[];
  /** Category labels for hover tooltips (mood pulse, KPI cards). */
  labels?: Array<string | number | Date>;
  height?: number;
  width?: number;
  color?: string;
  area?: boolean;
  curve?: ChartCurve;
  className?: string;
  showHighlight?: boolean;
  plotType?: "line" | "bar";
  renderTooltip?: ChartTooltipRenderer;
};

export function SparkLineChart({
  data,
  labels,
  height = 48,
  width,
  color = "var(--chart-1)",
  area = true,
  curve = "monotone",
  className,
  showHighlight = true,
  plotType = "line",
  renderTooltip,
}: SparkLineChartProps) {
  const [min, max] = extent(data, 0.08);
  const { hover, setHover, clear } = useChartHover();
  return (
    <ChartFrame
      slot="sparkline"
      className={className}
      width={width}
      height={height}
      margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
      hover={hover}
      renderTooltip={renderTooltip}
      aria-label="Sparkline"
    >
      {({ width: w, height: h, m }) => {
        const plot = box(w, h, m);
        const yAt = linearScale([min, max], [plot.bottom, plot.top]);
        const pointHover = (i: number, value: number) => {
          const category = labels?.[i] ?? i + 1;
          const label = labels?.[i] != null ? String(labels[i]) : "Value";
          return {
            event: {
              seriesId: "spark",
              seriesLabel: "Value",
              dataIndex: i,
              category,
              value,
              color,
            } satisfies ChartItemEvent,
            hover: {
              title: labels?.[i] != null ? String(labels[i]) : undefined,
              items: [{ color, label, value: formatChartNumber(value) }],
            },
          };
        };
        if (plotType === "bar") {
          const n = Math.max(data.length, 1);
          const gap = 1;
          const barW = Math.max(1, plot.iw / n - gap);
          return (
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
              {data.map((value, i) => {
                const x = plot.left + (i / n) * plot.iw + gap / 2;
                const y = yAt(value);
                const bind = pointHover(i, value);
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(1, plot.bottom - y)}
                    fill={color}
                    rx={1}
                    {...bindChartMark({
                      event: bind.event,
                      hover: bind.hover,
                      setHover,
                      clearHover: clear,
                    })}
                  />
                );
              })}
            </svg>
          );
        }
        const xAt = (i: number) =>
          plot.left + (data.length <= 1 ? plot.iw / 2 : (i / (data.length - 1)) * plot.iw);
        const pts = data.map((value, i) => ({ x: xAt(i), y: yAt(value) }));
        const last = pts[pts.length - 1];
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {area ? <path d={areaPath(pts, plot.bottom, curve)} fill={color} opacity={0.12} /> : null}
            <path
              d={linePath(pts, curve)}
              fill="none"
              stroke={color}
              strokeWidth={1.75}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {showHighlight && last ? <circle cx={last.x} cy={last.y} r={3} fill={color} /> : null}
            {pts.map((pt, i) => {
              const bind = pointHover(i, data[i]!);
              return (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={7}
                  fill="transparent"
                  {...bindChartMark({
                    event: bind.event,
                    hover: { ...bind.hover, x: pt.x, y: pt.y },
                    setHover,
                    clearHover: clear,
                  })}
                />
              );
            })}
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export type ScatterChartProps = {
  series: ScatterSeries[];
  xAxis?: ChartAxisConfig[];
  yAxis?: ChartAxisConfig[];
  height?: number;
  width?: number;
  colors?: string[];
  hideLegend?: boolean;
  hideGrid?: boolean;
  margin?: ChartMargin;
  className?: string;
  bubble?: boolean;
  renderer?: ScatterRenderer;
  legendPosition?: ChartLegendPosition;
  loading?: boolean;
  emptyText?: import("react").ReactNode;
};

export function ScatterChart({
  series,
  xAxis,
  yAxis,
  height,
  width,
  colors,
  hideLegend,
  hideGrid,
  margin,
  className,
  bubble = false,
  renderer = "svg",
  legendPosition,
  loading,
  emptyText,
}: ScatterChartProps) {
  const meta = seriesMeta(series, colors);
  const ids = meta.map((item) => item.id);
  const { hidden, toggle } = useHiddenSeries(ids);
  const { hover, setHover, clear } = useChartHover();
  const [glFailed, setGlFailed] = useState(false);
  const onGlUnavailable = useCallback(() => setGlFailed(true), []);
  const pointCount = series.reduce((n, item) => n + item.data.length, 0);
  const useGL = shouldUseWebGL(renderer, pointCount) && !glFailed;
  const xs = series.flatMap((item) => item.data.map((p) => p.x));
  const ys = series.flatMap((item) => item.data.map((p) => p.y));
  const zs = series.flatMap((item) => item.data.map((p) => p.z ?? 1));
  const xDomain: [number, number] = [xAxis?.[0]?.min ?? extent(xs, 0.08)[0], xAxis?.[0]?.max ?? extent(xs, 0.08)[1]];
  const yDomain: [number, number] = [yAxis?.[0]?.min ?? extent(ys, 0.08)[0], yAxis?.[0]?.max ?? extent(ys, 0.08)[1]];
  const zDomain = extent(zs);
  const ticks = niceTicks(yDomain[0], yDomain[1], 5);
  const xTicks = niceTicks(xDomain[0], xDomain[1], 5);

  return (
    <ChartFrame
      slot={bubble ? "bubble-chart" : "scatter-chart"}
      className={className}
      width={width}
      height={height}
      margin={margin}
      legend={hideLegend ? undefined : meta}
      legendPosition={legendPosition}
      hiddenIds={hidden}
      onToggleSeries={toggle}
      hover={hover}
      loading={loading}
      empty={!series.some((item) => item.data.length > 0)}
      emptyText={emptyText}
      aria-label={bubble ? "Bubble chart" : "Scatter chart"}
    >
      {({ width: w, height: h, m }) => {
        const plot = box(w, h, m);
        const xAt = linearScale(xDomain, [plot.left, plot.right]);
        const yAt = linearScale(yDomain, [plot.bottom, plot.top]);
        const zAt = (z: number) => 5 + ((z - zDomain[0]) / (zDomain[1] - zDomain[0] || 1)) * 18;
        const hoverPoint = (event: MouseEvent<SVGElement>, svg: SVGSVGElement | null) => {
          if (!svg) return;
          const pos = svgPointerPosition(svg, event.clientX, event.clientY, w, h);
          const candidates = series.flatMap((item, s) => {
            const info = meta[s]!;
            if (hidden.has(info.id)) return [];
            return item.data.map((point, i) => ({
              x: xAt(point.x),
              y: yAt(point.y),
              r: bubble ? zAt(point.z ?? 1) : 4.5,
              seriesIndex: s,
              pointIndex: i,
            }));
          });
          const hit = nearestScatterHit(candidates, pos.x, pos.y);
          if (!hit) {
            clear();
            return;
          }
          const item = series[hit.seriesIndex]!;
          const info = meta[hit.seriesIndex]!;
          const point = item.data[hit.pointIndex]!;
          setHover({
            x: pos.x,
            y: pos.y,
            title: point.label ?? info.label,
            items: [
              { color: info.color, label: "x", value: formatChartNumber(point.x) },
              { color: info.color, label: "y", value: formatChartNumber(point.y) },
              ...(point.z != null
                ? [{ color: info.color, label: "size", value: formatChartNumber(point.z) }]
                : []),
            ],
          });
        };
        return (
          <>
            {useGL ? (
              <ScatterWebGLLayer
                width={w}
                height={h}
                series={series}
                meta={meta}
                hidden={hidden}
                xAt={xAt}
                yAt={yAt}
                sizeAt={zAt}
                bubble={bubble}
                onUnavailable={onGlUnavailable}
              />
            ) : null}
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
              {hideGrid ? null : (
                <CartesianGrid
                  ticks={ticks}
                  scale={yAt}
                  left={plot.left}
                  right={plot.right}
                  top={plot.top}
                  bottom={plot.bottom}
                />
              )}
              <ValueAxis ticks={ticks} scale={yAt} left={plot.left} />
              {xTicks.map((tick) => (
                <text
                  key={tick}
                  className="spk-chart-tick"
                  x={xAt(tick)}
                  y={plot.bottom + 16}
                  textAnchor="middle"
                >
                  {formatChartNumber(tick)}
                </text>
              ))}
              {useGL ? (
                <rect
                  x={plot.left}
                  y={plot.top}
                  width={plot.iw}
                  height={plot.ih}
                  fill="transparent"
                  onMouseMove={(event) => hoverPoint(event, event.currentTarget.ownerSVGElement)}
                  onMouseLeave={clear}
                />
              ) : (
                series.map((item, s) => {
                  const info = meta[s]!;
                  if (hidden.has(info.id)) return null;
                  return item.data.map((point, i) => (
                    <circle
                      key={`${info.id}-${point.id ?? i}`}
                      cx={xAt(point.x)}
                      cy={yAt(point.y)}
                      r={bubble ? zAt(point.z ?? 1) : 4.5}
                      fill={info.color}
                      fillOpacity={bubble ? 0.45 : 0.85}
                      stroke={info.color}
                      strokeWidth={bubble ? 1.25 : 0}
                      className="spk-chart-mark"
                      onMouseEnter={(event) =>
                        setHover({
                          x: event.nativeEvent.offsetX,
                          y: event.nativeEvent.offsetY,
                          title: point.label ?? info.label,
                          items: [
                            { color: info.color, label: "x", value: formatChartNumber(point.x) },
                            { color: info.color, label: "y", value: formatChartNumber(point.y) },
                            ...(point.z != null
                              ? [{ color: info.color, label: "size", value: formatChartNumber(point.z) }]
                              : []),
                          ],
                        })
                      }
                      onMouseLeave={clear}
                    />
                  ));
                })
              )}
            </svg>
          </>
        );
      }}
    </ChartFrame>
  );
}

export function BubbleChart(props: ScatterChartProps) {
  return <ScatterChart {...props} bubble />;
}

export type RangeSeries = {
  id?: string;
  label?: string;
  color?: string;
  data: Array<[number, number] | null>;
};

export type RangeBarChartProps = Omit<CartesianChartProps, "series"> & {
  series: RangeSeries[];
  layout?: "vertical" | "horizontal";
};

export function RangeBarChart({
  xAxis,
  yAxis,
  series,
  height,
  width,
  colors,
  hideLegend,
  hideGrid,
  margin,
  className,
}: RangeBarChartProps) {
  const categories = categoryLabels(xAxis?.[0], series[0]?.data?.length ?? 0);
  const values = series.flatMap((item) => item.data.flatMap((pair) => (pair ? pair : [])));
  const niced = niceDomain(...extent(values, 0.04));
  const domain: [number, number] = [yAxis?.[0]?.min ?? niced[0], yAxis?.[0]?.max ?? niced[1]];
  const meta = seriesMeta(series, colors);

  return (
    <CartesianShell
      slot="range-bar-chart"
      ariaLabel="Range bar chart"
      series={series}
      colors={colors}
      hideLegend={hideLegend}
      hideGrid={hideGrid}
      xAxis={xAxis}
      yAxis={yAxis}
      width={width}
      height={height}
      margin={margin}
      className={className}
      domain={domain}
      categories={categories}
      categoryMode="band"
    >
      {({ xAt, yAt, bandwidth, hidden, meta: items, setHover, clear }) => (
        <g>
          {series.map((item, s) => {
            const info = items[s]!;
            if (hidden.has(info.id)) return null;
            const barW = bandwidth / Math.max(series.length, 1);
            return item.data.map((pair, i) => {
              if (!pair) return null;
              const [lo, hi] = pair;
              const y1 = yAt(hi);
              const y2 = yAt(lo);
              const y = Math.min(y1, y2);
              const h = Math.max(1, Math.abs(y2 - y1));
              const x = xAt(i) + s * barW;
              return (
                <rect
                  key={`${info.id}-${i}`}
                  x={x}
                  y={y}
                  width={barW * 0.86}
                  height={h}
                  rx={5}
                  fill={info.color}
                  className="spk-chart-mark"
                  onMouseEnter={(event) =>
                    setHover({
                      x: event.nativeEvent.offsetX,
                      y: event.nativeEvent.offsetY,
                      title: String(categories[i]),
                      items: [{ color: info.color, label: info.label, value: formatSeriesValue(pair) }],
                    })
                  }
                  onMouseLeave={clear}
                />
              );
            });
          })}
        </g>
      )}
    </CartesianShell>
  );
}

export type RangeAreaChartProps = Omit<CartesianChartProps, "series"> & {
  series: RangeSeries[];
  curve?: ChartCurve;
};

export function RangeAreaChart({
  xAxis,
  yAxis,
  series,
  height,
  width,
  colors,
  hideLegend,
  hideGrid,
  margin,
  className,
  curve = "monotone",
}: RangeAreaChartProps) {
  const categories = categoryLabels(xAxis?.[0], series[0]?.data?.length ?? 0);
  const values = series.flatMap((item) => item.data.flatMap((pair) => (pair ? pair : [])));
  const niced = niceDomain(...extent(values, 0.06));
  const domain: [number, number] = [yAxis?.[0]?.min ?? niced[0], yAxis?.[0]?.max ?? niced[1]];

  return (
    <CartesianShell
      slot="range-area-chart"
      ariaLabel="Range area chart"
      series={series}
      colors={colors}
      hideLegend={hideLegend}
      hideGrid={hideGrid}
      xAxis={xAxis}
      yAxis={yAxis}
      width={width}
      height={height}
      margin={margin}
      className={className}
      domain={domain}
      categories={categories}
      categoryMode="point"
    >
      {({ xAt, yAt, hidden, meta, setHover, clear }) => (
        <g>
          {series.map((item, s) => {
            const info = meta[s]!;
            if (hidden.has(info.id)) return null;
            const high = item.data.map((pair, i) => ({ x: xAt(i), y: yAt(pair ? pair[1] : 0) }));
            const low = item.data.map((pair, i) => ({ x: xAt(i), y: yAt(pair ? pair[0] : 0) }));
            return (
              <g key={info.id}>
                <path d={rangeAreaPath(high, low, curve)} fill={info.color} opacity={0.14} className="spk-chart-mark" />
                <path d={linePath(high, curve)} fill="none" stroke={info.color} strokeWidth={1.5} />
                <path d={linePath(low, curve)} fill="none" stroke={info.color} strokeWidth={1.5} />
                {high.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={3}
                    fill={info.color}
                    onMouseEnter={() =>
                      setHover({
                        x: pt.x,
                        y: pt.y,
                        title: String(categories[i]),
                        items: [{ color: info.color, label: info.label, value: formatSeriesValue(item.data[i] ?? undefined) }],
                      })
                    }
                    onMouseLeave={clear}
                  />
                ))}
              </g>
            );
          })}
        </g>
      )}
    </CartesianShell>
  );
}

export type WaterfallChartProps = CartesianChartProps;

export function WaterfallChart({
  xAxis,
  yAxis,
  series,
  height,
  width,
  colors,
  hideLegend = true,
  hideGrid,
  margin,
  className,
}: WaterfallChartProps) {
  const item = series[0];
  const categories = categoryLabels(xAxis?.[0], item?.data?.length ?? 0);
  const bars = waterfallBars(item?.data ?? []);
  const values = bars.flatMap((bar) => [bar.start, bar.end]);
  const niced = niceDomain(Math.min(0, ...values), extent(values, 0.06)[1]);
  const domain: [number, number] = [yAxis?.[0]?.min ?? niced[0], yAxis?.[0]?.max ?? niced[1]];
  const color = item?.color ?? chartColor(0, colors);

  return (
    <CartesianShell
      slot="waterfall-chart"
      ariaLabel="Waterfall chart"
      series={series}
      colors={colors}
      hideLegend={hideLegend}
      hideGrid={hideGrid}
      xAxis={xAxis}
      yAxis={yAxis}
      width={width}
      height={height}
      margin={margin}
      className={className}
      domain={domain}
      categories={categories}
      categoryMode="band"
    >
      {({ xAt, yAt, bandwidth, setHover, clear }) => (
        <g>
          {bars.map((bar, i) => {
            const y1 = yAt(bar.end);
            const y2 = yAt(bar.start);
            const y = Math.min(y1, y2);
            const h = Math.max(1, Math.abs(y2 - y1));
            const fill = bar.total
              ? "var(--chart-2)"
              : bar.value >= 0
                ? color
                : "var(--chart-4)";
            const next = bars[i + 1];
            return (
              <g key={bar.index}>
                {next && !next.total ? (
                  <line
                    x1={xAt(i) + bandwidth}
                    x2={xAt(i + 1)}
                    y1={yAt(bar.end)}
                    y2={yAt(bar.end)}
                    className="spk-chart-grid"
                  />
                ) : null}
                <rect
                  x={xAt(i)}
                  y={y}
                  width={bandwidth}
                  height={h}
                  rx={5}
                  fill={fill}
                  className="spk-chart-mark"
                  onMouseEnter={(event) =>
                    setHover({
                      x: event.nativeEvent.offsetX,
                      y: event.nativeEvent.offsetY,
                      title: String(categories[i]),
                      items: [
                        {
                          color: fill,
                          label: bar.total ? "Total" : bar.value >= 0 ? "Increase" : "Decrease",
                          value: formatChartNumber(bar.value),
                        },
                      ],
                    })
                  }
                  onMouseLeave={clear}
                />
              </g>
            );
          })}
        </g>
      )}
    </CartesianShell>
  );
}

export type BoxPlotSeries = {
  id?: string;
  label?: string;
  color?: string;
  data: Array<BoxPlotStats | number[] | null>;
};

export type BoxPlotChartProps = Omit<CartesianChartProps, "series"> & {
  series: BoxPlotSeries[];
};

export function BoxPlotChart({
  xAxis,
  yAxis,
  series,
  height,
  width,
  colors,
  hideLegend,
  hideGrid,
  margin,
  className,
}: BoxPlotChartProps) {
  const stats = series.map((item) =>
    item.data.map((entry) => (Array.isArray(entry) ? boxPlotStats(entry) : entry)),
  );
  const categories = categoryLabels(xAxis?.[0], stats[0]?.length ?? 0);
  const values = stats.flatMap((row) =>
    row.flatMap((box) => (box ? [box.min, box.max, ...(box.outliers ?? [])] : [])),
  );
  const niced = niceDomain(...extent(values, 0.06));
  const domain: [number, number] = [yAxis?.[0]?.min ?? niced[0], yAxis?.[0]?.max ?? niced[1]];

  return (
    <CartesianShell
      slot="boxplot-chart"
      ariaLabel="Box plot"
      series={series}
      colors={colors}
      hideLegend={hideLegend}
      hideGrid={hideGrid}
      xAxis={xAxis}
      yAxis={yAxis}
      width={width}
      height={height}
      margin={margin}
      className={className}
      domain={domain}
      categories={categories}
      categoryMode="band"
    >
      {({ xAt, yAt, bandwidth, hidden, meta, setHover, clear }) => (
        <g>
          {series.map((item, s) => {
            const info = meta[s]!;
            if (hidden.has(info.id)) return null;
            const boxW = Math.min(36, bandwidth * 0.55);
            return stats[s]!.map((boxStat, i) => {
              if (!boxStat) return null;
              const cx = xAt(i) + bandwidth / 2;
              const x = cx - boxW / 2;
              return (
                <g
                  key={`${info.id}-${i}`}
                  onMouseEnter={(event) =>
                    setHover({
                      x: event.nativeEvent.offsetX,
                      y: event.nativeEvent.offsetY,
                      title: String(categories[i]),
                      items: [
                        { color: info.color, label: "min", value: formatChartNumber(boxStat.min) },
                        { color: info.color, label: "q1", value: formatChartNumber(boxStat.q1) },
                        { color: info.color, label: "median", value: formatChartNumber(boxStat.median) },
                        { color: info.color, label: "q3", value: formatChartNumber(boxStat.q3) },
                        { color: info.color, label: "max", value: formatChartNumber(boxStat.max) },
                      ],
                    })
                  }
                  onMouseLeave={clear}
                >
                  <line
                    x1={cx}
                    x2={cx}
                    y1={yAt(boxStat.min)}
                    y2={yAt(boxStat.max)}
                    stroke={info.color}
                    strokeWidth={1.5}
                  />
                  <line x1={x} x2={x + boxW} y1={yAt(boxStat.min)} y2={yAt(boxStat.min)} stroke={info.color} />
                  <line x1={x} x2={x + boxW} y1={yAt(boxStat.max)} y2={yAt(boxStat.max)} stroke={info.color} />
                  <rect
                    x={x}
                    y={yAt(boxStat.q3)}
                    width={boxW}
                    height={Math.max(1, yAt(boxStat.q1) - yAt(boxStat.q3))}
                    fill={info.color}
                    fillOpacity={0.22}
                    stroke={info.color}
                    rx={3}
                  />
                  <line
                    x1={x}
                    x2={x + boxW}
                    y1={yAt(boxStat.median)}
                    y2={yAt(boxStat.median)}
                    stroke={info.color}
                    strokeWidth={2}
                  />
                  {boxStat.outliers.map((value, oi) => (
                    <circle key={oi} cx={cx} cy={yAt(value)} r={2.4} fill={info.color} />
                  ))}
                </g>
              );
            });
          })}
        </g>
      )}
    </CartesianShell>
  );
}

export type CandleDatum = {
  open: number;
  high: number;
  low: number;
  close: number;
};

export type CandlestickChartProps = Omit<CartesianChartProps, "series"> & {
  series: Array<{ id?: string; label?: string; color?: string; data: Array<CandleDatum | null> }>;
  variant?: "candle" | "ohlc";
};

export function CandlestickChart({
  xAxis,
  yAxis,
  series,
  height,
  width,
  colors,
  hideLegend = true,
  hideGrid,
  margin,
  className,
  variant = "candle",
}: CandlestickChartProps) {
  const item = series[0];
  const categories = categoryLabels(xAxis?.[0], item?.data?.length ?? 0);
  const values = (item?.data ?? []).flatMap((candle) => (candle ? [candle.high, candle.low] : []));
  const niced = niceDomain(...extent(values, 0.06));
  const domain: [number, number] = [yAxis?.[0]?.min ?? niced[0], yAxis?.[0]?.max ?? niced[1]];

  return (
    <CartesianShell
      slot={variant === "ohlc" ? "ohlc-chart" : "candlestick-chart"}
      ariaLabel={variant === "ohlc" ? "OHLC chart" : "Candlestick chart"}
      series={series}
      colors={colors}
      hideLegend={hideLegend}
      hideGrid={hideGrid}
      xAxis={xAxis}
      yAxis={yAxis}
      width={width}
      height={height}
      margin={margin}
      className={className}
      domain={domain}
      categories={categories}
      categoryMode="band"
    >
      {({ xAt, yAt, bandwidth, setHover, clear }) => (
        <g>
          {(item?.data ?? []).map((candle, i) => {
            if (!candle) return null;
            const up = candle.close >= candle.open;
            const color = up ? "var(--chart-3)" : "var(--chart-4)";
            const cx = xAt(i) + bandwidth / 2;
            const bodyTop = yAt(Math.max(candle.open, candle.close));
            const bodyBot = yAt(Math.min(candle.open, candle.close));
            const bodyH = Math.max(1, bodyBot - bodyTop);
            const wickW = Math.max(1.2, bandwidth * 0.08);
            const bodyW = Math.min(18, bandwidth * 0.55);
            return (
              <g
                key={i}
                onMouseEnter={(event) =>
                  setHover({
                    x: event.nativeEvent.offsetX,
                    y: event.nativeEvent.offsetY,
                    title: String(categories[i]),
                    items: [
                      { color, label: "open", value: formatChartNumber(candle.open) },
                      { color, label: "high", value: formatChartNumber(candle.high) },
                      { color, label: "low", value: formatChartNumber(candle.low) },
                      { color, label: "close", value: formatChartNumber(candle.close) },
                    ],
                  })
                }
                onMouseLeave={clear}
              >
                <line x1={cx} x2={cx} y1={yAt(candle.high)} y2={yAt(candle.low)} stroke={color} strokeWidth={wickW} />
                {variant === "ohlc" ? (
                  <>
                    <line x1={cx - bodyW / 2} x2={cx} y1={yAt(candle.open)} y2={yAt(candle.open)} stroke={color} strokeWidth={2} />
                    <line x1={cx} x2={cx + bodyW / 2} y1={yAt(candle.close)} y2={yAt(candle.close)} stroke={color} strokeWidth={2} />
                  </>
                ) : (
                  <rect x={cx - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} fill={color} rx={2} />
                )}
              </g>
            );
          })}
        </g>
      )}
    </CartesianShell>
  );
}

export function OhlcChart(props: CandlestickChartProps) {
  return <CandlestickChart {...props} variant="ohlc" />;
}
