import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { Download, Maximize2, Move, SquareDashedMousePointer, ZoomIn, ZoomOut } from "lucide-react";
import { useChartKeyboard } from "./chart-keyboard";
import { cn } from "../lib/cn";
import { exportChart } from "../lib/chart-export";
import { publishChartSync, subscribeChartSync } from "../lib/chart-sync";
import {
  DEFAULT_CHART_MARGIN,
  DEFAULT_ZOOM,
  applyZoom,
  areaPath,
  axisDataFromDataset,
  axisValueFormatter,
  bandScale,
  chartColor,
  clampZoom,
  errorBarRange,
  extent,
  formatAxisNumber,
  formatAxisValue,
  formatChartNumber,
  inferScaleType,
  linePath,
  linearScale,
  markOpacity,
  niceDomain,
  niceTicks,
  panZoom,
  plotBox,
  pointScale,
  rangeAreaPath,
  roundedRectPath,
  seriesDataFromDataset,
  seriesHasPlottableData,
  splitDefinedSegments,
  stackSeries,
  wheelZoom,
  zoomFromBrush,
  type ChartAxisConfig,
  type ChartCurve,
  type ChartDataset,
  type ChartErrorValue,
  type ChartInteraction,
  type ChartLegendPosition,
  type ChartMargin,
  type ChartZoom,
  type HighlightScope,
  type PlotBox,
  type StackOffset,
} from "../lib/charts";
import { ChartToolbarButton } from "./ChartToolbarButton";
import {
  CartesianGrid,
  CategoryAxis,
  ChartLegend,
  ChartStatusOverlay,
  ChartTooltip,
  ValueAxis,
  categoryLabels,
  formatSeriesValue,
  legendSitsBefore,
  resolveMargin,
  seriesMeta,
  useChartSurfaceSize,
  type ChartHover,
} from "./chart-ui";
import {
  bindChartMark,
  chartMarkData,
  seriesItemColor,
  type ChartItemEvent,
  type ChartMarkRenderContext,
  type ChartReferenceArea,
  type ChartReferenceDot,
  type ChartReferenceLine,
  type ChartTooltipRenderer,
  type ChartTooltipTrigger,
} from "./chart-interaction";

export type ComposedSeriesType = "bar" | "line" | "area" | "scatter";

export type ComposedSeries = {
  id?: string;
  type?: ComposedSeriesType;
  label?: string;
  color?: string;
  /** Per-category colors; each entry falls back to `color`. */
  itemColors?: Array<string | null | undefined>;
  data?: Array<number | null>;
  dataKey?: string;
  stack?: string;
  yAxisId?: string;
  curve?: ChartCurve;
  showMark?: boolean;
  area?: boolean;
  scatter?: Array<{ x: number; y: number; id?: string | number }>;
  /** Stroke dash pattern for line/area series (`"4 4"`). */
  strokeDasharray?: string;
  /** When false, line/area paths break at nulls instead of joining across them. Default true. */
  connectNulls?: boolean;
  /** Symmetric ±delta or `[minus, plus]` per category (Recharts ErrorBar). */
  error?: Array<ChartErrorValue | null | undefined>;
};

type ResolvedSeries = {
  id: string;
  type: ComposedSeriesType;
  label: string;
  color: string;
  itemColors?: Array<string | null | undefined>;
  data: Array<number | null>;
  stack?: string;
  yAxisId?: string;
  curve: ChartCurve;
  showMark: boolean;
  scatter?: Array<{ x: number; y: number; id?: string | number }>;
  strokeDasharray?: string;
  connectNulls: boolean;
  error?: Array<ChartErrorValue | null | undefined>;
};

export type HighlightedItem = { seriesId: string; dataIndex: number } | null;

type ChartContextValue = {
  slot: string;
  width: number;
  height: number;
  margin: Required<ChartMargin>;
  plot: PlotBox;
  categories: Array<string | number | Date>;
  series: ResolvedSeries[];
  hidden: Set<string>;
  toggleSeries: (id: string) => void;
  xAt: (index: number) => number;
  yAt: (value: number, yAxisId?: string) => number;
  bandwidth: number;
  ticksLeft: number[];
  ticksRight: number[];
  rightAxis: ChartAxisConfig | undefined;
  leftAxis: ChartAxisConfig | undefined;
  xAxis?: ChartAxisConfig;
  hideGrid?: boolean;
  stacked: boolean;
  barGapRatio: number;
  borderRadius: number;
  zoom: ChartZoom;
  setZoom: (zoom: ChartZoom) => void;
  resetZoom: () => void;
  zoomEnabled: boolean;
  interaction: ChartInteraction;
  setInteraction: (next: ChartInteraction) => void;
  highlightScope: HighlightScope;
  highlighted: HighlightedItem;
  setHighlighted: (item: HighlightedItem) => void;
  hover: ChartHover;
  setHover: (hover: ChartHover) => void;
  svgRef: RefObject<SVGSVGElement | null>;
  clipPathId: string;
  locale?: string;
  animated: boolean;
  brush: { x0: number; x1: number } | null;
  setBrush: (brush: { x0: number; x1: number } | null) => void;
  exportChart: (format: "svg" | "png") => Promise<void>;
  onItemClick?: (event: ChartItemEvent) => void;
  renderMark?: (ctx: ChartMarkRenderContext) => ReactNode;
  referenceLines?: ChartReferenceLine[];
  referenceAreas?: ChartReferenceArea[];
  referenceDots?: ChartReferenceDot[];
  showLabels?: boolean;
  stackOffset: StackOffset;
  minPointSize: number;
  maxBarSize?: number;
  showCursor: boolean;
  tooltipTrigger: ChartTooltipTrigger;
  showBarBackground: boolean;
};

const ChartContext = createContext<ChartContextValue | null>(null);

export function useChartContext(): ChartContextValue {
  const value = useContext(ChartContext);
  if (!value) throw new Error("Chart composition components must be used inside ChartContainer");
  return value;
}

function useOptionalChartContext() {
  return useContext(ChartContext);
}

export type ChartContainerProps = {
  slot?: string;
  className?: string;
  width?: number;
  height?: number;
  margin?: ChartMargin;
  dataset?: ChartDataset;
  xAxis?: ChartAxisConfig[];
  yAxis?: ChartAxisConfig[];
  series: ComposedSeries[];
  colors?: string[];
  hideLegend?: boolean;
  /** Where the series legend sits. Default `top`. */
  legendPosition?: ChartLegendPosition;
  hideGrid?: boolean;
  stacked?: boolean;
  barGapRatio?: number;
  borderRadius?: number;
  zoom?: boolean | ChartZoom;
  defaultZoom?: ChartZoom;
  onZoomChange?: (zoom: ChartZoom) => void;
  showToolbar?: boolean;
  highlightScope?: HighlightScope;
  selected?: HighlightedItem;
  animated?: boolean;
  locale?: string;
  children?: ReactNode;
  "aria-label"?: string;
  /** When true, plot height follows the parent instead of the numeric `height`. */
  fillHeight?: boolean;
  onItemClick?: (event: ChartItemEvent) => void;
  renderTooltip?: ChartTooltipRenderer;
  renderMark?: (ctx: ChartMarkRenderContext) => ReactNode;
  referenceLines?: ChartReferenceLine[];
  referenceAreas?: ChartReferenceArea[];
  referenceDots?: ChartReferenceDot[];
  /** Draw the numeric value at the end of each bar. */
  showLabels?: boolean;
  /** Link hover with other charts that share this id (Recharts `syncId`). */
  syncId?: string;
  /** Show every series at the hovered category. Default true. */
  sharedTooltip?: boolean;
  /** Open the tooltip on hover or click (Recharts Tooltip `trigger`). */
  tooltipTrigger?: ChartTooltipTrigger;
  /** Vertical guide at the active category. Default true. */
  showCursor?: boolean;
  /** Seed hover at this category index. */
  defaultIndex?: number;
  /** Stacking strategy when `stacked` is set. `expand` is 100% stacked. */
  stackOffset?: StackOffset;
  /** Minimum bar thickness in px so near-zero values stay visible. */
  minPointSize?: number;
  /** Cap bar thickness in px (Recharts `maxBarSize`). */
  maxBarSize?: number;
  /** Category tracks behind bars (Recharts `Bar` `background`). */
  showBarBackground?: boolean;
  /** Cover the plot while data is fetching. */
  loading?: boolean;
  /** Message when every visible series is empty. Default `"No data"`. */
  emptyText?: ReactNode;
  onMouseMove?: (hover: ChartHover) => void;
  onMouseLeave?: () => void;
};

function plotValueFormat(ctx: { leftAxis?: ChartAxisConfig; rightAxis?: ChartAxisConfig }, yAxisId?: string) {
  const axis = yAxisId && ctx.rightAxis && yAxisId === ctx.rightAxis.id ? ctx.rightAxis : ctx.leftAxis;
  return axisValueFormatter(axis);
}

function resolveSeries(series: ComposedSeries[], dataset: ChartDataset | undefined, colors?: string[]): ResolvedSeries[] {
  return series.map((item, index) => {
    const data =
      item.data ??
      (dataset && item.dataKey ? seriesDataFromDataset(dataset, item.dataKey) : []);
    const type: ComposedSeriesType = item.type ?? (item.area ? "area" : "bar");
    return {
      id: item.id ?? item.label ?? item.dataKey ?? `series-${index}`,
      type,
      label: item.label ?? item.dataKey ?? item.id ?? `Series ${index + 1}`,
      color: item.color ?? chartColor(index, colors),
      itemColors: item.itemColors,
      data,
      stack: item.stack,
      yAxisId: item.yAxisId,
      curve: item.curve ?? "monotone",
      showMark: item.showMark ?? type !== "bar",
      scatter: item.scatter,
      strokeDasharray: item.strokeDasharray,
      connectNulls: item.connectNulls ?? true,
      error: item.error,
    };
  });
}

function numericDomain(
  series: ResolvedSeries[],
  stacked: boolean,
  axis?: ChartAxisConfig,
  stackOffset: StackOffset = "sign",
): [number, number] {
  if (axis?.min != null && axis?.max != null) return [axis.min, axis.max];
  if (stacked && stackOffset === "expand") return [axis?.min ?? 0, axis?.max ?? 1];
  const values: number[] = [];
  const subset = series.filter((item) => (item.yAxisId ?? "left") === (axis?.id ?? item.yAxisId ?? "left") || !axis?.id);
  const relevant = axis?.id ? series.filter((item) => (item.yAxisId ?? leftId(axis)) === axis.id) : series;
  const used = relevant.length ? relevant : subset;
  if (stacked) {
    for (const kind of ["bar", "area"] as const) {
      const group = used.filter((item) => item.type === kind);
      if (!group.length) continue;
      const stacks = stackSeries(
        group.map((item) => item.data.map((v) => v ?? 0)),
        stackOffset,
      );
      for (const segs of stacks) for (const seg of segs) values.push(seg.start, seg.end);
    }
    for (const item of used) {
      if (item.type === "bar" || item.type === "area") continue;
      if (item.scatter) for (const p of item.scatter) values.push(p.y);
      else for (const value of item.data) if (value != null) values.push(value);
    }
  } else {
    for (const item of used) {
      if (item.scatter) for (const p of item.scatter) values.push(p.y);
      else for (const value of item.data) if (value != null) values.push(value);
    }
  }
  if (!values.length) values.push(0, 1);
  if (Math.min(...values) > 0) values.push(0);
  const [min, max] = niceDomain(...extent(values, 0.04));
  return [axis?.min ?? min, axis?.max ?? max];
}

function leftId(axis?: ChartAxisConfig) {
  return axis?.id ?? "left";
}

function hoverFromIndex(
  dataIndex: number,
  series: ResolvedSeries[],
  hidden: Set<string>,
  categories: Array<string | number | Date>,
  xAt: (index: number) => number,
  bandwidth: number,
  plot: PlotBox,
  shared: boolean,
  format: (item: ResolvedSeries, value: number) => string,
): ChartHover {
  const visible = series.filter((item) => !hidden.has(item.id) && item.data[dataIndex] != null);
  if (!visible.length) return null;
  const primary = visible[0]!;
  const items = (shared ? visible : [primary]).map((item) => ({
    color: seriesItemColor(item.color, item.itemColors, dataIndex),
    label: item.label,
    value: format(item, item.data[dataIndex] as number),
  }));
  return {
    x: xAt(dataIndex) + bandwidth / 2,
    y: plot.top + 8,
    title: String(categories[dataIndex] ?? dataIndex),
    items,
    dataIndex,
    seriesId: primary.id,
    category: categories[dataIndex],
  };
}

function expandSharedHover(
  hover: ChartHover,
  series: ResolvedSeries[],
  hidden: Set<string>,
  categories: Array<string | number | Date>,
  shared: boolean,
  format: (item: ResolvedSeries, value: number) => string,
): ChartHover {
  if (!hover || !shared || hover.dataIndex == null) return hover;
  const i = hover.dataIndex;
  const items = series
    .filter((item) => !hidden.has(item.id) && item.data[i] != null)
    .map((item) => ({
      color: seriesItemColor(item.color, item.itemColors, i),
      label: item.label,
      value: format(item, item.data[i] as number),
    }));
  if (!items.length) return hover;
  return { ...hover, title: hover.title ?? String(categories[i] ?? i), items };
}

export function ChartContainer({
  slot = "chart-container",
  className,
  width,
  height = 280,
  margin,
  dataset,
  xAxis,
  yAxis,
  series,
  colors,
  hideLegend,
  legendPosition = "top",
  hideGrid,
  stacked = false,
  barGapRatio = 0.15,
  borderRadius = 3,
  zoom,
  defaultZoom,
  onZoomChange,
  showToolbar,
  highlightScope = "item",
  selected,
  animated = true,
  locale,
  children,
  "aria-label": ariaLabel,
  fillHeight = false,
  onItemClick,
  renderTooltip,
  renderMark,
  referenceLines,
  referenceAreas,
  referenceDots,
  showLabels = false,
  syncId,
  sharedTooltip = true,
  tooltipTrigger = "hover",
  showCursor = true,
  defaultIndex,
  stackOffset = "sign",
  minPointSize = 0,
  maxBarSize,
  showBarBackground = false,
  loading = false,
  emptyText,
  onMouseMove,
  onMouseLeave,
}: ChartContainerProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const clipPathId = `spk-chart-clip-${useId().replace(/:/g, "")}`;
  const measured = useChartSurfaceSize(surfaceRef, width ?? 320, height, fillHeight);
  const plotWidth = width ?? measured.width;
  const plotHeight = fillHeight ? measured.height : height;
  const hasRight = yAxis?.some((axis) => axis.position === "right");
  const xConfig = xAxis?.[0];
  const angledTicks = xConfig?.tickAngle != null && xConfig.tickAngle !== 0;
  const baseMargin = resolveMargin(
    margin ?? (hasRight ? { ...DEFAULT_CHART_MARGIN, right: 48 } : undefined),
  );
  const m =
    angledTicks && margin?.bottom == null ? { ...baseMargin, bottom: Math.max(baseMargin.bottom, 64) } : baseMargin;
  const resolved = useMemo(() => resolveSeries(series, dataset, colors), [series, dataset, colors]);
  const categories = useMemo(() => {
    if (dataset && xConfig?.dataKey) return axisDataFromDataset(dataset, xConfig.dataKey);
    return categoryLabels(xConfig, resolved[0]?.data.length ?? resolved[0]?.scatter?.length ?? 0);
  }, [dataset, xConfig, resolved]);
  const leftAxis = yAxis?.find((axis) => (axis.position ?? "left") === "left") ?? yAxis?.[0];
  const rightAxis = yAxis?.find((axis) => axis.position === "right");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const toggleSeries = (id: string) => {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const zoomEnabled = zoom === true || typeof zoom === "object";
  const controlledZoom = typeof zoom === "object" ? zoom : undefined;
  const [innerZoom, setInnerZoom] = useState<ChartZoom>(defaultZoom ?? DEFAULT_ZOOM);
  const currentZoom = clampZoom(controlledZoom ?? innerZoom);
  const setZoom = (next: ChartZoom) => {
    const clamped = clampZoom(next);
    if (!controlledZoom) setInnerZoom(clamped);
    onZoomChange?.(clamped);
  };
  const resetZoom = () => setZoom(DEFAULT_ZOOM);
  const [interaction, setInteraction] = useState<ChartInteraction>("none");
  const [highlighted, setHighlighted] = useState<HighlightedItem>(null);
  const [hover, setHover] = useState<ChartHover>(null);
  const [brush, setBrush] = useState<{ x0: number; x1: number } | null>(null);
  const activeHighlight = selected ?? highlighted;

  const plot = plotBox(plotWidth, plotHeight, m);
  const visible = resolved.filter((item) => !hidden.has(item.id));
  const leftSeries = visible.filter((item) => !item.yAxisId || item.yAxisId === (leftAxis?.id ?? item.yAxisId));
  const rightSeries = visible.filter((item) => rightAxis && item.yAxisId === rightAxis.id);
  const leftDomain = numericDomain(leftSeries.length ? leftSeries : visible, stacked, leftAxis, stackOffset);
  const rightDomain = rightAxis
    ? numericDomain(rightSeries.length ? rightSeries : visible, false, rightAxis)
    : leftDomain;
  const ticksLeft = niceTicks(leftDomain[0], leftDomain[1], 5);
  const ticksRight = niceTicks(rightDomain[0], rightDomain[1], 5);
  const scaleType = xConfig?.scaleType ?? inferScaleType(xConfig?.data ?? categories);
  const yLeftRange: [number, number] = leftAxis?.reversed ? [plot.top, plot.bottom] : [plot.bottom, plot.top];
  const yRightRange: [number, number] = rightAxis?.reversed ? [plot.top, plot.bottom] : [plot.bottom, plot.top];
  const yLeft = linearScale(leftDomain, yLeftRange);
  const yRight = linearScale(rightDomain, yRightRange);

  const { xAt, bandwidth } = useMemo(() => {
    let xAtInner = (index: number) =>
      plot.left + plot.iw * (categories.length <= 1 ? 0.5 : index / (categories.length - 1));
    let bw = 0;
    if (scaleType === "band" || scaleType === undefined) {
      const scale = bandScale(categories.map(String), [plot.left, plot.right], 0.24);
      xAtInner = (index) => scale(String(categories[index]));
      bw = scale.bandwidth;
    } else if (scaleType === "point") {
      const scale = pointScale(categories.map(String), [plot.left, plot.right]);
      xAtInner = (index) => scale(String(categories[index]));
    } else if (xConfig?.data?.every((v) => typeof v === "number" || v instanceof Date)) {
      const xs = xConfig.data.map((v) => (v instanceof Date ? v.getTime() : Number(v)));
      const [min, max] = extent(xs);
      const scale = linearScale([min, max], [plot.left, plot.right]);
      xAtInner = (index) => scale(xs[index] ?? min);
    }
    const zoomX = (index: number) => applyZoom(xAtInner(index), plot.left, plot.iw, currentZoom.x);
    return { xAt: zoomX, bandwidth: bw / (currentZoom.x[1] - currentZoom.x[0] || 1) };
  }, [categories, currentZoom.x, plot.iw, plot.left, plot.right, scaleType, xConfig?.data]);

  const yAt = useCallback(
    (value: number, yAxisId?: string) => {
      const raw = yAxisId && rightAxis && yAxisId === rightAxis.id ? yRight(value) : yLeft(value);
      if (!currentZoom.y) return raw;
      return applyZoom(raw, plot.top, plot.ih, currentZoom.y);
    },
    [currentZoom.y, plot.ih, plot.top, rightAxis, yLeft, yRight],
  );

  const doExport = useCallback(
    async (format: "svg" | "png") => {
      await exportChart(svgRef.current, format);
    },
    [],
  );

  const sourceId = useId();
  const formatHoverValue = useCallback(
    (item: ResolvedSeries, value: number) =>
      formatSeriesValue(value, plotValueFormat({ leftAxis, rightAxis }, item.yAxisId)),
    [leftAxis, rightAxis],
  );

  const applyHover = useCallback(
    (next: ChartHover) => {
      const expanded = expandSharedHover(
        next,
        resolved,
        hidden,
        categories,
        sharedTooltip,
        formatHoverValue,
      );
      setHover(expanded);
      if (expanded) onMouseMove?.(expanded);
      else onMouseLeave?.();
      if (syncId) {
        publishChartSync({
          syncId,
          dataIndex: expanded?.dataIndex ?? null,
          category: expanded?.category,
          source: sourceId,
        });
      }
    },
    [categories, formatHoverValue, hidden, onMouseLeave, onMouseMove, resolved, sharedTooltip, sourceId, syncId],
  );

  useEffect(() => {
    if (!syncId) return;
    return subscribeChartSync(syncId, (payload) => {
      if (payload.source === sourceId) return;
      if (payload.dataIndex == null) {
        setHover(null);
        setHighlighted(null);
        return;
      }
      setHighlighted({ seriesId: resolved[0]?.id ?? "series", dataIndex: payload.dataIndex });
      setHover(
        hoverFromIndex(
          payload.dataIndex,
          resolved,
          hidden,
          categories,
          xAt,
          bandwidth,
          plot,
          sharedTooltip,
          formatHoverValue,
        ),
      );
    });
  }, [bandwidth, categories, formatHoverValue, hidden, plot, resolved, sharedTooltip, sourceId, syncId, xAt]);

  const seededDefault = useRef(false);
  useEffect(() => {
    if (seededDefault.current) return;
    if (defaultIndex == null || defaultIndex < 0 || defaultIndex >= categories.length) return;
    if (plotWidth <= 0) return;
    seededDefault.current = true;
    setHover(
      hoverFromIndex(
        defaultIndex,
        resolved,
        hidden,
        categories,
        xAt,
        bandwidth,
        plot,
        sharedTooltip,
        formatHoverValue,
      ),
    );
  }, [bandwidth, categories, defaultIndex, formatHoverValue, hidden, plot, plotWidth, resolved, sharedTooltip, xAt]);

  const ctx: ChartContextValue = {
    slot,
    width: plotWidth,
    height: plotHeight,
    margin: m,
    plot,
    categories,
    series: resolved,
    hidden,
    toggleSeries,
    xAt,
    yAt,
    bandwidth,
    ticksLeft,
    ticksRight,
    rightAxis,
    leftAxis,
    xAxis: xConfig,
    hideGrid,
    stacked,
    barGapRatio,
    borderRadius,
    zoom: currentZoom,
    setZoom,
    resetZoom,
    zoomEnabled,
    interaction,
    setInteraction,
    highlightScope,
    highlighted: activeHighlight,
    setHighlighted,
    hover,
    setHover: applyHover,
    svgRef,
    clipPathId,
    locale,
    animated,
    brush,
    setBrush,
    exportChart: doExport,
    onItemClick,
    renderMark,
    referenceLines,
    referenceAreas,
    referenceDots,
    showLabels,
    stackOffset,
    minPointSize,
    maxBarSize,
    showCursor,
    tooltipTrigger,
    showBarBackground,
  };

  const legend = seriesMeta(resolved, colors);
  const label =
    ariaLabel ??
    `Chart of ${resolved.map((item) => item.label).join(", ")}`;
  const isEmpty = !seriesHasPlottableData(visible);
  // Named "Data points" only: it sits inside the chart's own labelled group.
  const keyboard = useChartKeyboard(surfaceRef, { disabled: Boolean(loading || isEmpty) });
  const legendEl = hideLegend ? null : (
    <ChartLegend items={legend} hiddenIds={hidden} onToggle={toggleSeries} position={legendPosition} />
  );
  const legendBefore = legendSitsBefore(legendPosition);

  return (
    <ChartContext.Provider value={ctx}>
      <div
        data-slot={slot}
        className={cn("spk-chart", animated && "spk-chart--animated", fillHeight && "spk-chart--fill", className)}
        role="group"
        aria-label={label}
        aria-busy={loading || undefined}
      >
        {showToolbar ? <ChartsToolbar /> : null}
        <div className={cn("spk-chart-body", `spk-chart--legend-${legendPosition}`)}>
          {legendBefore ? legendEl : null}
          <div
            ref={surfaceRef}
            className="spk-chart-surface"
            style={fillHeight ? undefined : { height: plotHeight }}
            {...keyboard.surfaceProps}
          >
            {plotWidth > 0 && plotHeight > 0 ? children ?? <DefaultChartSurface /> : null}
            <ChartTooltip hover={keyboard.hover ?? hover} boundsWidth={plotWidth} render={renderTooltip} />
            <ChartStatusOverlay loading={loading} empty={isEmpty} emptyText={emptyText} />
          </div>
          {legendBefore ? null : legendEl}
        </div>
        {keyboard.liveRegion}
        <ChartA11yTable />
      </div>
    </ChartContext.Provider>
  );
}

/** Mixed bar/line/area plot — Recharts `ComposedChart` alias of `ChartContainer`. */
export function ComposedChart(props: ChartContainerProps) {
  return <ChartContainer slot={props.slot ?? "composed-chart"} {...props} />;
}

export type ResponsiveContainerProps = {
  children: ReactNode;
  className?: string;
  minHeight?: number;
  /** CSS aspect ratio (width / height), e.g. `1.6`. */
  aspect?: number;
};

/**
 * Fill the parent the way Recharts `ResponsiveContainer` does.
 * Injects `fillHeight` on a single chart child so the plot tracks the box.
 */
export function ResponsiveContainer({
  children,
  className,
  minHeight = 240,
  aspect,
}: ResponsiveContainerProps) {
  const child = Children.count(children) === 1 ? Children.only(children) : null;
  return (
    <div
      data-slot="responsive-container"
      className={cn("spk-chart-responsive", className)}
      style={{
        width: "100%",
        height: aspect ? undefined : "100%",
        minHeight,
        aspectRatio: aspect ? String(aspect) : undefined,
      }}
    >
      {isValidElement(child)
        ? cloneElement(child as ReactElement<{ fillHeight?: boolean }>, { fillHeight: true })
        : children}
    </div>
  );
}

function DefaultChartSurface() {
  const { rightAxis } = useChartContext();
  return (
    <ChartSurface>
      <ChartsGrid />
      <ChartsReferenceArea />
      <BarPlot />
      <AreaPlot />
      <LinePlot />
      <ScatterPlot />
      <ChartsErrorBar />
      <ChartsCursor />
      <ChartsXAxis />
      <ChartsYAxis />
      {rightAxis ? <ChartsYAxis position="right" /> : null}
      <ChartsReferenceLine />
      <ChartsReferenceDot />
      <ChartsBrush />
    </ChartSurface>
  );
}

export function ChartSurface({ children, className }: { children?: ReactNode; className?: string }) {
  const ctx = useChartContext();
  const drag = useRef<{ x: number; y: number; zoom: ChartZoom } | null>(null);
  const { plot, zoomEnabled, interaction, setZoom, zoom, setBrush, setHover, setHighlighted, svgRef } = ctx;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !zoomEnabled) return;
    const onWheelNative = (event: WheelEvent) => {
      event.preventDefault();
      const bounds = svg.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const anchor = (x - plot.left) / plot.iw;
      const factor = event.deltaY > 0 ? 1.12 : 1 / 1.12;
      setZoom(wheelZoom(zoom, clamp01(anchor), factor));
    };
    svg.addEventListener("wheel", onWheelNative, { passive: false });
    return () => svg.removeEventListener("wheel", onWheelNative);
  }, [plot.iw, plot.left, setZoom, svgRef, zoom, zoomEnabled]);

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!zoomEnabled) return;
    const svg = event.currentTarget;
    const bounds = svg.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    if (x < plot.left || x > plot.right || y < plot.top || y > plot.bottom) return;
    svg.setPointerCapture(event.pointerId);
    if (interaction === "brush") {
      setBrush({ x0: x, x1: x });
      return;
    }
    if (interaction === "pan" || event.shiftKey) {
      drag.current = { x, y, zoom };
    }
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    const bounds = svg.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    if (ctx.brush) {
      setBrush({ x0: ctx.brush.x0, x1: x });
      return;
    }
    if (!drag.current) return;
    const dx = (x - drag.current.x) / plot.iw;
    setZoom(panZoom(drag.current.zoom, dx));
  };

  const onPointerUp = () => {
    if (ctx.brush) {
      const next = zoomFromBrush(ctx.brush.x0, ctx.brush.x1, plot.left, plot.iw, zoom);
      setZoom(next);
      setBrush(null);
    }
    drag.current = null;
  };

  return (
    <svg
      ref={ctx.svgRef}
      className={className}
      width={ctx.width}
      height={ctx.height}
      viewBox={`0 0 ${ctx.width} ${ctx.height}`}
      data-slot="chart-surface"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseLeave={() => {
        setHover(null);
        setHighlighted(null);
      }}
    >
      <defs>
        <clipPath id={ctx.clipPathId}>
          <rect x={plot.left} y={plot.top} width={plot.iw} height={plot.ih} />
        </clipPath>
      </defs>
      {children}
    </svg>
  );
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function ChartsGrid() {
  const { hideGrid, ticksLeft, yAt, plot } = useChartContext();
  if (hideGrid) return null;
  return (
    <CartesianGrid
      ticks={ticksLeft}
      scale={(value) => yAt(value)}
      left={plot.left}
      right={plot.right}
      top={plot.top}
      bottom={plot.bottom}
    />
  );
}

export function ChartsXAxis() {
  const { xAxis, categories, xAt, plot } = useChartContext();
  if (xAxis?.hide) return null;
  return (
    <CategoryAxis labels={categories} position={xAt} y={plot.bottom} tickAngle={xAxis?.tickAngle} />
  );
}

export function ChartsYAxis({ position = "left" }: { position?: "left" | "right" }) {
  const { ticksLeft, ticksRight, yAt, plot, leftAxis, rightAxis, locale } = useChartContext();
  if (position === "right") {
    if (!rightAxis || rightAxis.hide) return null;
    return (
      <g data-slot="chart-y-axis-right">
        {ticksRight.map((tick) => (
          <text
            key={tick}
            className="spk-chart-tick"
            x={plot.right + 8}
            y={yAt(tick, rightAxis.id)}
            dominantBaseline="middle"
          >
            {formatAxisNumber(tick, rightAxis, locale)}
          </text>
        ))}
      </g>
    );
  }
  if (leftAxis?.hide) return null;
  return <ValueAxis ticks={ticksLeft} scale={(value) => yAt(value, leftAxis?.id)} left={plot.left} format={axisValueFormatter(leftAxis)} />;
}

function PlotClip({ children, slot }: { children: ReactNode; slot: string }) {
  const { clipPathId } = useChartContext();
  return (
    <g data-slot={slot} clipPath={`url(#${clipPathId})`}>
      {children}
    </g>
  );
}

export function BarPlot() {
  const ctx = useChartContext();
  const bars = ctx.series.filter((item) => item.type === "bar" && !ctx.hidden.has(item.id));
  if (!bars.length) return null;
  const stacks = ctx.stacked
    ? stackSeries(
        bars.map((item) => item.data.map((v) => v ?? 0)),
        ctx.stackOffset,
      )
    : null;
  const n = ctx.stacked ? 1 : Math.max(bars.length, 1);
  const gap = n > 1 ? ctx.bandwidth * ctx.barGapRatio : 0;
  const slotW = (ctx.bandwidth - gap * (n - 1)) / n;
  const barW = Math.min(ctx.maxBarSize ?? slotW, slotW);
  const barPad = (slotW - barW) / 2;
  const zero = ctx.yAt(0);
  return (
    <>
      <PlotClip slot="bar-plot">
        {ctx.showBarBackground && ctx.bandwidth > 0 ? (
          <g data-slot="bar-background">
            {ctx.categories.map((_, i) => (
              <rect
                key={`bg-${i}`}
                className="spk-chart-bar-bg"
                x={ctx.xAt(i)}
                y={ctx.plot.top}
                width={ctx.bandwidth}
                height={ctx.plot.ih}
                rx={Math.min(ctx.borderRadius, 4)}
              />
            ))}
          </g>
        ) : null}
        {bars.map((item, s) =>
          item.data.map((value, i) => {
            if (value == null) return null;
            let x = ctx.xAt(i);
            let y1: number;
            let y2: number;
            if (stacks) {
              const seg = stacks[s]![i]!;
              y1 = ctx.yAt(seg.end, item.yAxisId);
              y2 = ctx.yAt(seg.start, item.yAxisId);
            } else {
              x = ctx.xAt(i) + s * (slotW + gap) + barPad;
              y1 = ctx.yAt(value, item.yAxisId);
              y2 = zero;
            }
            const rawH = Math.abs(y2 - y1);
            const h = Math.max(ctx.minPointSize, rawH || (value === 0 ? 0 : ctx.minPointSize), 1);
            const y = y2 >= y1 ? y2 - h : y1;
            const opacity = markOpacity(ctx.highlightScope, ctx.highlighted, item.id, i);
            const color = seriesItemColor(item.color, item.itemColors, i);
            const event: ChartItemEvent = {
              seriesId: item.id,
              seriesLabel: item.label,
              dataIndex: i,
              category: ctx.categories[i] ?? i,
              value,
              color,
            };
            return (
              <path
                key={`${item.id}-${i}`}
                d={roundedRectPath(x, y, ctx.stacked ? ctx.bandwidth : barW, h, ctx.borderRadius)}
                fill={color}
                style={{ fill: color }}
                opacity={opacity}
                {...bindChartMark({
                  event,
                  hover: {
                    title: String(ctx.categories[i]),
                    items: [{ color, label: item.label, value: formatSeriesValue(value, plotValueFormat(ctx, item.yAxisId)) }],
                  },
                  onItemClick: ctx.onItemClick,
                  setHover: ctx.setHover,
                  clearHover: () => ctx.setHover(null),
                  onHighlight: ctx.setHighlighted,
                  tooltipTrigger: ctx.tooltipTrigger,
                })}
              />
            );
          }),
        )}
      </PlotClip>
      {ctx.showLabels ? (
        <g data-slot="bar-labels" pointerEvents="none">
          {bars.map((item, s) =>
            item.data.map((value, i) => {
              if (value == null) return null;
              const x = ctx.stacked ? ctx.xAt(i) : ctx.xAt(i) + s * (barW + gap);
              const y = ctx.yAt(value, item.yAxisId);
              const width = ctx.stacked ? ctx.bandwidth : barW;
              return (
                <text
                  key={`${item.id}-${i}-label`}
                  className="spk-chart-label"
                  x={x + width / 2}
                  y={y - 4}
                  textAnchor="middle"
                >
                  {formatSeriesValue(value, plotValueFormat(ctx, item.yAxisId))}
                </text>
              );
            }),
          )}
        </g>
      ) : null}
    </>
  );
}

function LineLikePlot({ types, slot }: { types: ComposedSeriesType[]; slot: string }) {
  const ctx = useChartContext();
  const items = ctx.series.filter((item) => types.includes(item.type) && !ctx.hidden.has(item.id));
  if (!items.length) return null;
  const stackAreas = ctx.stacked && types.includes("area") && items.every((item) => item.type === "area");
  const stacks = stackAreas
    ? stackSeries(
        items.map((item) => item.data.map((v) => v ?? 0)),
        ctx.stackOffset,
      )
    : null;
  return (
    <PlotClip slot={slot}>
      {items.map((item, s) => {
        const fill = item.type === "area";
        const stackedSegs = stacks?.[s];
        const mapped = item.data.map((value, i) => {
          if (value == null) return null;
          const yValue = stackedSegs ? stackedSegs[i]!.end : value;
          return { x: ctx.xAt(i), y: ctx.yAt(yValue, item.yAxisId), value, i };
        });
        const segments = splitDefinedSegments(mapped, item.connectNulls);
        const pts = mapped.filter((p): p is { x: number; y: number; value: number; i: number } => p != null);
        const opacity = markOpacity(ctx.highlightScope, ctx.highlighted, item.id);
        const valueFormat = plotValueFormat(ctx, item.yAxisId);
        return (
          <g key={item.id} opacity={opacity}>
            {segments.map((seg, segIndex) => {
              const baseline = stackedSegs
                ? seg.map((pt) => ({
                    x: pt.x,
                    y: ctx.yAt(stackedSegs[pt.i]!.start, item.yAxisId),
                  }))
                : null;
              return (
                <g key={`${item.id}-seg-${segIndex}`}>
                  {fill ? (
                    <path
                      d={
                        baseline
                          ? rangeAreaPath(seg, baseline, item.curve)
                          : areaPath(seg, ctx.plot.bottom, item.curve)
                      }
                      fill={item.color}
                      opacity={baseline ? 0.88 : 0.12}
                      className="spk-chart-mark"
                    />
                  ) : null}
                  <path
                    d={linePath(seg, item.curve)}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={1.75}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeDasharray={item.strokeDasharray}
                    className="spk-chart-mark"
                  />
                </g>
              );
            })}
            {item.showMark
              ? pts.map((pt) => {
                  const color = seriesItemColor(item.color, item.itemColors, pt.i);
                  const event: ChartItemEvent = {
                    seriesId: item.id,
                    seriesLabel: item.label,
                    dataIndex: pt.i,
                    category: ctx.categories[pt.i] ?? pt.i,
                    value: pt.value,
                    color,
                  };
                  const mark = ctx.renderMark?.({ ...event, x: pt.x, y: pt.y }) ?? (
                    <circle cx={pt.x} cy={pt.y} r={2.75} fill={color} style={{ fill: color }} />
                  );
                  return (
                    <g
                      key={pt.i}
                      {...bindChartMark({
                        event,
                        hover: {
                          x: pt.x,
                          y: pt.y,
                          title: String(ctx.categories[pt.i]),
                          items: [{ color, label: item.label, value: formatSeriesValue(pt.value, valueFormat) }],
                        },
                        onItemClick: ctx.onItemClick,
                        setHover: ctx.setHover,
                        clearHover: () => ctx.setHover(null),
                        onHighlight: ctx.setHighlighted,
                        tooltipTrigger: ctx.tooltipTrigger,
                      })}
                    >
                      {mark}
                    </g>
                  );
                })
              : // No visible points: invisible anchors keep every value reachable from the keyboard
                // (they appear only while the keyboard is on them).
                pts.map((pt) => {
                  const color = seriesItemColor(item.color, item.itemColors, pt.i);
                  return (
                    <circle
                      key={pt.i}
                      cx={pt.x}
                      cy={pt.y}
                      r={3.5}
                      fill={color}
                      className="spk-chart-mark spk-chart-anchor"
                      aria-hidden
                      {...chartMarkData(item.id, pt.i, {
                        title: String(ctx.categories[pt.i]),
                        items: [{ color, label: item.label, value: formatSeriesValue(pt.value, valueFormat) }],
                      })}
                    />
                  );
                })}
          </g>
        );
      })}
    </PlotClip>
  );
}

export function LinePlot() {
  return <LineLikePlot types={["line"]} slot="line-plot" />;
}

export function AreaPlot() {
  return <LineLikePlot types={["area"]} slot="area-plot" />;
}

export function ScatterPlot() {
  const ctx = useChartContext();
  const items = ctx.series.filter((item) => item.type === "scatter" && !ctx.hidden.has(item.id));
  if (!items.length) return null;
  return (
    <PlotClip slot="scatter-plot">
      {items.map((item) => {
        const points =
          item.scatter ??
          item.data
            .map((value, i) => (value == null ? null : { x: i, y: value, id: i }))
            .filter((p): p is { x: number; y: number; id: number } => p != null);
        const xs = points.map((p) => p.x);
        const xDomain = extent(xs, 0.04);
        const xScale = linearScale(xDomain, [ctx.plot.left, ctx.plot.right]);
        return points.map((point, i) => {
          const cx = applyZoom(xScale(point.x), ctx.plot.left, ctx.plot.iw, ctx.zoom.x);
          const cy = ctx.yAt(point.y, item.yAxisId);
          const opacity = markOpacity(ctx.highlightScope, ctx.highlighted, item.id, i);
          const color = seriesItemColor(item.color, item.itemColors, i);
          const event: ChartItemEvent = {
            seriesId: item.id,
            seriesLabel: item.label,
            dataIndex: i,
            category: point.id ?? i,
            value: point.y,
            color,
          };
          return (
            <circle
              key={`${item.id}-${point.id ?? i}`}
              cx={cx}
              cy={cy}
              r={4}
              fill={color}
              opacity={opacity}
              {...bindChartMark({
                event,
                hover: {
                  title: item.label,
                  items: [
                    { color, label: "x", value: formatChartNumber(point.x, ctx.locale) },
                    { color, label: "y", value: formatChartNumber(point.y, ctx.locale) },
                  ],
                },
                onItemClick: ctx.onItemClick,
                setHover: ctx.setHover,
                clearHover: () => ctx.setHover(null),
                onHighlight: ctx.setHighlighted,
                tooltipTrigger: ctx.tooltipTrigger,
              })}
            />
          );
        });
      })}
    </PlotClip>
  );
}

export function ChartsBrush() {
  const { brush, plot } = useChartContext();
  if (!brush) return null;
  const x = Math.min(brush.x0, brush.x1);
  const width = Math.abs(brush.x1 - brush.x0);
  return (
    <rect
      data-slot="chart-brush"
      className="spk-chart-brush"
      x={x}
      y={plot.top}
      width={width}
      height={plot.ih}
    />
  );
}

/** Horizontal (value) or vertical (category index) guide overlay. */
export function ChartsReferenceLine() {
  const { referenceLines, yAt, xAt, plot, bandwidth } = useChartContext();
  if (!referenceLines?.length) return null;
  return (
    <g data-slot="chart-reference-lines">
      {referenceLines.map((line, index) => {
        const color = line.color ?? "var(--primary)";
        const dash = line.strokeDasharray ?? "4 4";
        if (line.y != null) {
          const y = yAt(line.y, line.yAxisId);
          return (
            <g key={`y-${index}`}>
              <line
                className="spk-chart-ref-line"
                x1={plot.left}
                x2={plot.right}
                y1={y}
                y2={y}
                stroke={color}
                strokeDasharray={dash}
              />
              {line.label ? (
                <text className="spk-chart-ref-label" x={plot.right - 4} y={y - 4} textAnchor="end">
                  {line.label}
                </text>
              ) : null}
            </g>
          );
        }
        if (line.xIndex != null) {
          const x = xAt(line.xIndex) + bandwidth / 2;
          return (
            <g key={`x-${index}`}>
              <line
                className="spk-chart-ref-line"
                x1={x}
                x2={x}
                y1={plot.top}
                y2={plot.bottom}
                stroke={color}
                strokeDasharray={dash}
              />
              {line.label ? (
                <text className="spk-chart-ref-label" x={x + 4} y={plot.top + 12}>
                  {line.label}
                </text>
              ) : null}
            </g>
          );
        }
        return null;
      })}
    </g>
  );
}

/** Vertical hover guide at the active category (Recharts Tooltip cursor). */
export function ChartsCursor() {
  const { hover, xAt, bandwidth, plot, showCursor } = useChartContext();
  if (!showCursor || hover?.dataIndex == null) return null;
  const x = xAt(hover.dataIndex) + bandwidth / 2;
  return (
    <line
      data-slot="chart-cursor"
      className="spk-chart-cursor"
      x1={x}
      x2={x}
      y1={plot.top}
      y2={plot.bottom}
    />
  );
}

/** Value or category rectangle overlay (Recharts `ReferenceArea`). */
export function ChartsReferenceArea() {
  const { referenceAreas, yAt, xAt, plot, bandwidth } = useChartContext();
  if (!referenceAreas?.length) return null;
  return (
    <g data-slot="chart-reference-areas">
      {referenceAreas.map((area, index) => {
        const color = area.color ?? "var(--primary)";
        const x0 =
          area.xIndex0 != null ? xAt(area.xIndex0) : plot.left;
        const x1 =
          area.xIndex1 != null ? xAt(area.xIndex1) + bandwidth : plot.right;
        const y0 = area.y0 != null ? yAt(area.y0, area.yAxisId) : plot.top;
        const y1 = area.y1 != null ? yAt(area.y1, area.yAxisId) : plot.bottom;
        const x = Math.min(x0, x1);
        const y = Math.min(y0, y1);
        return (
          <g key={index}>
            <rect
              className="spk-chart-ref-area"
              x={x}
              y={y}
              width={Math.max(1, Math.abs(x1 - x0))}
              height={Math.max(1, Math.abs(y1 - y0))}
              fill={color}
            />
            {area.label ? (
              <text className="spk-chart-ref-label" x={x + 6} y={y + 12}>
                {area.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

/** Point overlay (Recharts `ReferenceDot`). */
export function ChartsReferenceDot() {
  const { referenceDots, yAt, xAt, bandwidth } = useChartContext();
  if (!referenceDots?.length) return null;
  return (
    <g data-slot="chart-reference-dots">
      {referenceDots.map((dot, index) => {
        if (dot.xIndex == null || dot.y == null) return null;
        const x = xAt(dot.xIndex) + bandwidth / 2;
        const y = yAt(dot.y, dot.yAxisId);
        const color = dot.color ?? "var(--primary)";
        return (
          <g key={index}>
            <circle
              className="spk-chart-ref-dot"
              cx={x}
              cy={y}
              r={dot.r ?? 4}
              fill={color}
            />
            {dot.label ? (
              <text className="spk-chart-ref-label" x={x + 8} y={y - 6}>
                {dot.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

/** Whiskers on bar/line/scatter series that set `error` (Recharts `ErrorBar`). */
export function ChartsErrorBar() {
  const ctx = useChartContext();
  const items = ctx.series.filter((item) => item.error && !ctx.hidden.has(item.id));
  if (!items.length) return null;
  const bars = ctx.series.filter((item) => item.type === "bar" && !ctx.hidden.has(item.id));
  const n = ctx.stacked ? 1 : Math.max(bars.length, 1);
  const gap = n > 1 ? ctx.bandwidth * ctx.barGapRatio : 0;
  const slotW = (ctx.bandwidth - gap * (n - 1)) / n;
  const barW = Math.min(ctx.maxBarSize ?? slotW, slotW);
  const barPad = (slotW - barW) / 2;
  return (
    <g data-slot="chart-error-bars" pointerEvents="none">
      {items.map((item, s) =>
        item.data.map((value, i) => {
          if (value == null) return null;
          const range = errorBarRange(value, item.error?.[i]);
          if (!range) return null;
          const isBar = item.type === "bar";
          const barIndex = isBar ? bars.findIndex((bar) => bar.id === item.id) : -1;
          const x = isBar && !ctx.stacked && barIndex >= 0
            ? ctx.xAt(i) + barIndex * (slotW + gap) + barPad + barW / 2
            : ctx.xAt(i) + ctx.bandwidth / 2;
          const y0 = ctx.yAt(range[0], item.yAxisId);
          const y1 = ctx.yAt(range[1], item.yAxisId);
          const cap = 4;
          const color = item.color;
          return (
            <g key={`${item.id}-${i}`}>
              <line x1={x} x2={x} y1={y0} y2={y1} stroke={color} className="spk-chart-error-bar" />
              <line x1={x - cap} x2={x + cap} y1={y0} y2={y0} stroke={color} className="spk-chart-error-bar" />
              <line x1={x - cap} x2={x + cap} y1={y1} y2={y1} stroke={color} className="spk-chart-error-bar" />
            </g>
          );
        }),
      )}
    </g>
  );
}

export function ChartsLegend() {
  const { series, hidden, toggleSeries } = useChartContext();
  return (
    <ChartLegend
      items={series.map((item) => ({ id: item.id, label: item.label, color: item.color }))}
      hiddenIds={hidden}
      onToggle={toggleSeries}
    />
  );
}

export function ChartsToolbar({ className }: { className?: string }) {
  const ctx = useOptionalChartContext();
  if (!ctx) return null;
  const zoomIn = () => ctx.setZoom(wheelZoom(ctx.zoom, 0.5, 1 / 1.25));
  const zoomOut = () => ctx.setZoom(wheelZoom(ctx.zoom, 0.5, 1.25));
  return (
    <div className={cn("spk-chart-toolbar", className)} role="toolbar" aria-label="Chart tools">
      <ChartToolbarButton aria-label="Zoom in" onClick={zoomIn}>
        <ZoomIn size={16} />
      </ChartToolbarButton>
      <ChartToolbarButton aria-label="Zoom out" onClick={zoomOut}>
        <ZoomOut size={16} />
      </ChartToolbarButton>
      <ChartToolbarButton aria-label="Reset zoom" onClick={ctx.resetZoom}>
        <Maximize2 size={16} />
      </ChartToolbarButton>
      <ChartToolbarButton
        aria-label="Pan"
        aria-pressed={ctx.interaction === "pan"}
        data-active={ctx.interaction === "pan" ? "true" : undefined}
        onClick={() => ctx.setInteraction(ctx.interaction === "pan" ? "none" : "pan")}
      >
        <Move size={16} />
      </ChartToolbarButton>
      <ChartToolbarButton
        aria-label="Brush zoom"
        aria-pressed={ctx.interaction === "brush"}
        data-active={ctx.interaction === "brush" ? "true" : undefined}
        onClick={() => ctx.setInteraction(ctx.interaction === "brush" ? "none" : "brush")}
      >
        <SquareDashedMousePointer size={16} />
      </ChartToolbarButton>
      <ChartToolbarButton aria-label="Export SVG" onClick={() => void ctx.exportChart("svg")}>
        <Download size={16} />
      </ChartToolbarButton>
      <ChartToolbarButton aria-label="Export PNG" onClick={() => void ctx.exportChart("png")}>
        <span className="spk-chart-toolbar-png">PNG</span>
      </ChartToolbarButton>
    </div>
  );
}

function ChartA11yTable() {
  const { series, categories, slot } = useChartContext();
  return (
    <table className="spk-chart-a11y">
      <caption>{slot} data</caption>
      <thead>
        <tr>
          <th>Category</th>
          {series.map((item) => (
            <th key={item.id}>{item.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {categories.map((category, i) => (
          <tr key={`${i}-${String(category)}`}>
            <th scope="row">{formatAxisValue(category)}</th>
            {series.map((item) => (
              <td key={item.id}>{item.data[i] == null ? "—" : formatChartNumber(item.data[i] as number)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export { ChartContext };
