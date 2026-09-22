/**
 * Geometry and layout helpers for Spatika SVG charts.
 * Theme colors stay as CSS variables so Mukta / Neelam / Usha / Sandhya restyle automatically.
 */

export const CHART_COLOR_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export type ChartCurve = "linear" | "monotone" | "step";

/** How stacked series share a category. `sign` keeps +/− independent; `expand` is 100% stacked. */
export type StackOffset = "sign" | "expand";

/** Symmetric ±delta, or `[minus, plus]` deltas from the datum (Recharts ErrorBar). */
export type ChartErrorValue = number | [number, number];

export type ChartAxisConfig = {
  id?: string;
  data?: Array<string | number | Date>;
  dataKey?: string;
  min?: number;
  max?: number;
  label?: string;
  hide?: boolean;
  position?: "left" | "right" | "top" | "bottom";
  scaleType?: "band" | "point" | "linear" | "time";
  /** Format numeric ticks and default tooltip values for this axis. */
  valueFormatter?: (value: number) => string;
  /** Alias of `valueFormatter` (Recharts `tickFormatter`). */
  tickFormatter?: (value: number) => string;
  /** Appended after the formatted tick (Recharts `unit`). */
  unit?: string;
  /** Rotate category tick labels in degrees (Recharts `angle`). Negative tilts them left. */
  tickAngle?: number;
  /** Flip the value axis so the domain max sits at the origin (Recharts `reversed`). */
  reversed?: boolean;
};

/** Where the series legend sits relative to the plot. */
export type ChartLegendPosition = "top" | "bottom" | "left" | "right";

/** Pie / gauge radius: pixels, a 0–1 fraction of max radius, or a percent string (`"42%"`). */
export type ChartRadius = number | string;

export type ChartDatasetRow = Record<string, string | number | Date | null | undefined>;
export type ChartDataset = ChartDatasetRow[];

export type ChartZoom = { x: [number, number]; y?: [number, number] };
export type HighlightScope = "none" | "item" | "series";
export type ChartInteraction = "none" | "pan" | "brush";

export const DEFAULT_ZOOM: ChartZoom = { x: [0, 1] };
export const MIN_ZOOM_SPAN = 0.06;

export type PlotBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  iw: number;
  ih: number;
};

export function plotBox(width: number, height: number, m: Required<ChartMargin>): PlotBox {
  return {
    left: m.left,
    right: width - m.right,
    top: m.top,
    bottom: height - m.bottom,
    iw: Math.max(1, width - m.left - m.right),
    ih: Math.max(1, height - m.top - m.bottom),
  };
}

export function clampZoom(zoom: ChartZoom): ChartZoom {
  const clampPair = (pair: [number, number]): [number, number] => {
    const span = clamp(pair[1] - pair[0], MIN_ZOOM_SPAN, 1);
    let start = clamp(pair[0], 0, 1 - span);
    return [start, start + span];
  };
  return { x: clampPair(zoom.x), y: zoom.y ? clampPair(zoom.y) : zoom.y };
}

export function applyZoom(px: number, origin: number, size: number, zoom: [number, number]): number {
  const t = (px - origin) / (size || 1);
  return origin + ((t - zoom[0]) / (zoom[1] - zoom[0] || 1)) * size;
}

export function panZoom(zoom: ChartZoom, dxVisible: number, dyVisible = 0): ChartZoom {
  const xSpan = zoom.x[1] - zoom.x[0];
  const ySpan = zoom.y ? zoom.y[1] - zoom.y[0] : 0;
  return clampZoom({
    x: [zoom.x[0] - dxVisible * xSpan, zoom.x[1] - dxVisible * xSpan],
    y: zoom.y
      ? [zoom.y[0] + dyVisible * ySpan, zoom.y[1] + dyVisible * ySpan]
      : zoom.y,
  });
}

export function wheelZoom(zoom: ChartZoom, anchorVisible: number, factor: number): ChartZoom {
  const span = zoom.x[1] - zoom.x[0];
  const t = zoom.x[0] + anchorVisible * span;
  const next = clamp(span * factor, MIN_ZOOM_SPAN, 1);
  const leftFrac = span === 0 ? 0.5 : (t - zoom.x[0]) / span;
  return clampZoom({ x: [t - next * leftFrac, t - next * leftFrac + next], y: zoom.y });
}

export function zoomFromBrush(
  startPx: number,
  endPx: number,
  origin: number,
  size: number,
  zoom: ChartZoom,
): ChartZoom {
  const a = clamp((Math.min(startPx, endPx) - origin) / (size || 1), 0, 1);
  const b = clamp((Math.max(startPx, endPx) - origin) / (size || 1), 0, 1);
  if (b - a < 0.02) return zoom;
  const span = zoom.x[1] - zoom.x[0];
  return clampZoom({
    x: [zoom.x[0] + a * span, zoom.x[0] + b * span],
    y: zoom.y,
  });
}

export function seriesDataFromDataset(dataset: ChartDataset, dataKey: string): Array<number | null> {
  return dataset.map((row) => {
    const value = row[dataKey];
    if (value == null || value === "") return null;
    if (typeof value === "number") return value;
    if (value instanceof Date) return value.getTime();
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  });
}

export function axisDataFromDataset(
  dataset: ChartDataset,
  dataKey: string,
): Array<string | number | Date> {
  return dataset.map((row) => {
    const value = row[dataKey];
    if (value instanceof Date || typeof value === "number") return value;
    return String(value ?? "");
  });
}

export function markOpacity(
  scope: HighlightScope,
  highlighted: { seriesId: string; dataIndex: number } | null,
  seriesId: string,
  dataIndex?: number,
): number {
  if (!highlighted || scope === "none") return 1;
  if (scope === "series") return highlighted.seriesId === seriesId ? 1 : 0.28;
  return highlighted.seriesId === seriesId && highlighted.dataIndex === dataIndex ? 1 : 0.28;
}

export type ChartMargin = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export const DEFAULT_CHART_MARGIN: Required<ChartMargin> = {
  top: 16,
  right: 16,
  bottom: 36,
  left: 44,
};

export function chartColor(index: number, colors?: string[]): string {
  const palette = colors?.length ? colors : CHART_COLOR_VARS;
  return palette[index % palette.length]!;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function toNumber(value: string | number | Date | null | undefined): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function formatChartNumber(value: number, locale?: string): string {
  if (!Number.isFinite(value)) return "—";
  if (locale) {
    return new Intl.NumberFormat(locale, {
      notation: Math.abs(value) >= 1000 ? "compact" : "standard",
      maximumFractionDigits: 2,
    }).format(value);
  }
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${trimFloat(value / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${trimFloat(value / 1_000_000)}M`;
  if (abs >= 1_000) return `${trimFloat(value / 1_000)}k`;
  if (Number.isInteger(value)) return String(value);
  return trimFloat(value);
}

function trimFloat(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

export function formatAxisValue(value: string | number | Date): string {
  if (value instanceof Date) {
    return value.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  if (typeof value === "number") return formatChartNumber(value);
  return String(value);
}

export function axisValueFormatter(
  axis?: Pick<ChartAxisConfig, "valueFormatter" | "tickFormatter">,
): ((value: number) => string) | undefined {
  return axis?.valueFormatter ?? axis?.tickFormatter;
}

export function formatAxisNumber(
  value: number,
  axis?: Pick<ChartAxisConfig, "valueFormatter" | "tickFormatter" | "unit">,
  locale?: string,
): string {
  const format = axisValueFormatter(axis);
  const text = format ? format(value) : formatChartNumber(value, locale);
  return axis?.unit ? `${text}${axis.unit}` : text;
}

/** Symmetric ±delta, or `[minus, plus]` deltas from `value`. */
export function errorBarRange(
  value: number,
  error: ChartErrorValue | null | undefined,
): [number, number] | null {
  if (error == null) return null;
  if (typeof error === "number") {
    if (!Number.isFinite(error) || error < 0) return null;
    return [value - error, value + error];
  }
  const [minus, plus] = error;
  if (!Number.isFinite(minus) || !Number.isFinite(plus)) return null;
  return [value - minus, value + plus];
}

/**
 * Resolve a pie/gauge radius. Numbers in (0, 1] are a fraction of `maxR`;
 * larger numbers are pixels (clamped). Strings like `"42%"` are percents of `maxR`.
 */
export function resolveChartRadius(
  value: number | string | undefined,
  maxR: number,
  fallback: number,
): number {
  const cap = Math.max(0, maxR);
  if (value == null) return clamp(fallback, 0, cap);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.endsWith("%")) {
      const pct = Number.parseFloat(trimmed) / 100;
      return Number.isFinite(pct) ? clamp(cap * pct, 0, cap) : clamp(fallback, 0, cap);
    }
    const n = Number.parseFloat(trimmed);
    if (!Number.isFinite(n)) return clamp(fallback, 0, cap);
    return resolveChartRadius(n, cap, fallback);
  }
  if (!Number.isFinite(value)) return clamp(fallback, 0, cap);
  if (value > 0 && value <= 1) return cap * value;
  return clamp(value, 0, cap);
}

function categoryText(label: string | number | Date): string {
  if (label instanceof Date) {
    return label.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return `${label}`;
}

/** Left-gutter width for horizontal-bar category labels. */
export function categoryLabelGutter(
  labels: Array<string | number | Date>,
  options?: { min?: number; max?: number; charWidth?: number; pad?: number },
): number {
  const min = options?.min ?? 72;
  const max = options?.max ?? 160;
  const charWidth = options?.charWidth ?? 6.2;
  const pad = options?.pad ?? 16;
  let longest = 0;
  for (const item of labels) {
    longest = Math.max(longest, categoryText(item).length);
  }
  return Math.min(max, Math.max(min, Math.ceil(longest * charWidth) + pad));
}

/** Ellipsis-fit a category tick into the left gutter. */
export function fitCategoryLabel(label: string | number | Date, leftPx: number): string {
  const text = categoryText(label);
  const maxChars = Math.max(4, Math.floor(Math.max(24, leftPx - 12) / 6.2));
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars - 1)}…`;
}

/** Split mapped points at nulls, or join them when `connectNulls` is true. */
export function splitDefinedSegments<T>(points: Array<T | null | undefined>, connectNulls = true): T[][] {
  const defined = points.filter((p): p is T => p != null);
  if (connectNulls) return defined.length ? [defined] : [];
  const segs: T[][] = [];
  let current: T[] = [];
  for (const p of points) {
    if (p == null) {
      if (current.length) {
        segs.push(current);
        current = [];
      }
    } else {
      current.push(p);
    }
  }
  if (current.length) segs.push(current);
  return segs;
}

export function extent(values: number[], pad = 0): [number, number] {
  const finite = values.filter((v) => Number.isFinite(v));
  if (!finite.length) return [0, 1];
  let min = Math.min(...finite);
  let max = Math.max(...finite);
  if (min === max) {
    const delta = Math.abs(min) || 1;
    min -= delta;
    max += delta;
  }
  if (pad > 0) {
    const span = max - min;
    const paddedMin = min - span * pad;
    const paddedMax = max + span * pad;
    // Padding must not cross zero: a chart of non-negative values should never
    // show a negative axis (and vice versa).
    min = min >= 0 ? Math.max(0, paddedMin) : paddedMin;
    max = max <= 0 ? Math.min(0, paddedMax) : paddedMax;
  }
  return [min, max];
}

export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    const pad = Math.abs(min) || 1;
    min -= pad;
    max += pad;
  }
  const span = max - min;
  const step0 = span / Math.max(1, count - 1);
  const mag = 10 ** Math.floor(Math.log10(Math.abs(step0) || 1));
  const residual = step0 / mag;
  const rounded =
    residual >= 7.5 ? 10 * mag : residual >= 3.5 ? 5 * mag : residual >= 1.5 ? 2 * mag : mag;

  // When the domain is already rounded (see `niceDomain`), prefer a step that lands exactly on
  // both bounds. Without this, re-ticking a nice domain picks a coarser step and rounds outward
  // again, so the axis keeps growing and the outer labels drift out of the plot.
  const divides = (value: number, step: number) =>
    Math.abs(value / step - Math.round(value / step)) < 1e-9;
  const candidates: number[] = [];
  for (const scale of [mag / 10, mag, mag * 10]) {
    for (const factor of [1, 2, 5, 10]) candidates.push(factor * scale);
  }
  const exact = candidates
    .filter((candidate) => {
      const intervals = span / candidate;
      return (
        candidate > 0 &&
        Math.abs(intervals - Math.round(intervals)) < 1e-9 &&
        Math.round(intervals) >= 2 &&
        Math.round(intervals) + 1 <= count + 4 &&
        divides(min, candidate)
      );
    })
    .sort((a, b) => Math.abs(Math.log(a / step0)) - Math.abs(Math.log(b / step0)))[0];

  const step = exact ?? rounded;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(Number(value.toPrecision(12)));
  }
  // `start` / `end` round outward, so the extremes can sit outside the plot. Those
  // labels would paint over the legend or below the axis, so drop them.
  return ticks;
}

/**
 * Round a domain out to the tick bounds so every tick lands inside the plot.
 *
 * Without this the outermost labels are painted above the plot (over the legend) or below the
 * axis, because `niceTicks` rounds outward while the scale keeps the tight data domain.
 */
export function niceDomain(min: number, max: number, count = 5): [number, number] {
  const ticks = niceTicks(min, max, count);
  if (!ticks.length) return [min, max];
  return [Math.min(ticks[0]!, min), Math.max(ticks[ticks.length - 1]!, max)];
}

export function linearScale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  const fn = (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
  fn.invert = (pixel: number) => d0 + ((pixel - r0) / (r1 - r0 || 1)) * span;
  return fn;
}

export function bandScale(domain: string[], range: [number, number], paddingInner = 0.24) {
  const labels = domain.length ? domain : [""];
  const [r0, r1] = range;
  const step = (r1 - r0) / labels.length;
  const bandwidth = step * (1 - paddingInner);
  const offset = (step - bandwidth) / 2;
  const index = new Map(labels.map((label, i) => [label, i]));
  const fn = (value: string) => r0 + (index.get(value) ?? 0) * step + offset;
  return Object.assign(fn, { bandwidth, step });
}

export function pointScale(domain: string[], range: [number, number]) {
  const labels = domain.length ? domain : [""];
  const [r0, r1] = range;
  if (labels.length <= 1) {
    const fn = () => (r0 + r1) / 2;
    return Object.assign(fn, { step: 0 });
  }
  const step = (r1 - r0) / (labels.length - 1);
  const index = new Map(labels.map((label, i) => [label, i]));
  const fn = (value: string) => r0 + (index.get(value) ?? 0) * step;
  return Object.assign(fn, { step });
}

export function inferScaleType(data?: Array<string | number | Date>): ChartAxisConfig["scaleType"] {
  if (!data?.length) return "linear";
  if (data[0] instanceof Date) return "time";
  if (typeof data[0] === "number") return "linear";
  return "band";
}

export type StackSegment = { start: number; end: number };

/** Stack series by index, keeping positive and negative totals independent. `expand` is 100% stacked. */
export function stackSeries(seriesData: number[][], offset: StackOffset = "sign"): StackSegment[][] {
  const count = seriesData[0]?.length ?? 0;
  const result = seriesData.map(() =>
    Array.from({ length: count }, () => ({ start: 0, end: 0 })),
  );
  for (let i = 0; i < count; i++) {
    let positive = 0;
    let negative = 0;
    for (let s = 0; s < seriesData.length; s++) {
      const value = seriesData[s]?.[i] ?? 0;
      if (value >= 0) {
        result[s]![i] = { start: positive, end: positive + value };
        positive += value;
      } else {
        result[s]![i] = { start: negative, end: negative + value };
        negative += value;
      }
    }
    if (offset !== "expand") continue;
    const total = Math.abs(positive) + Math.abs(negative) || 1;
    for (let s = 0; s < seriesData.length; s++) {
      const seg = result[s]![i]!;
      result[s]![i] = { start: seg.start / total, end: seg.end / total };
    }
  }
  return result;
}

export function polarPoint(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export function arcPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  if (sweep <= 0 || outerRadius <= 0) return "";
  if (sweep >= 359.999) {
    const mid = startAngle + 180;
    return `${arcPath(cx, cy, innerRadius, outerRadius, startAngle, mid)} ${arcPath(cx, cy, innerRadius, outerRadius, mid, startAngle + 360)}`;
  }
  const large = sweep > 180 ? 1 : 0;
  const outer0 = polarPoint(cx, cy, outerRadius, startAngle);
  const outer1 = polarPoint(cx, cy, outerRadius, endAngle);
  if (innerRadius <= 0) {
    return `M${cx} ${cy} L${outer0.x} ${outer0.y} A${outerRadius} ${outerRadius} 0 ${large} 1 ${outer1.x} ${outer1.y} Z`;
  }
  const inner0 = polarPoint(cx, cy, innerRadius, startAngle);
  const inner1 = polarPoint(cx, cy, innerRadius, endAngle);
  return `M${outer0.x} ${outer0.y} A${outerRadius} ${outerRadius} 0 ${large} 1 ${outer1.x} ${outer1.y} L${inner1.x} ${inner1.y} A${innerRadius} ${innerRadius} 0 ${large} 0 ${inner0.x} ${inner0.y} Z`;
}

export type PieSlice = {
  index: number;
  value: number;
  percent: number;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  path: string;
  labelX: number;
  labelY: number;
};

export function pieSlices(
  values: number[],
  options: {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle?: number;
    endAngle?: number;
    paddingAngle?: number;
  },
): PieSlice[] {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle = 0,
    endAngle = 360,
    paddingAngle = 0,
  } = options;
  const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);
  const span = endAngle - startAngle;
  const pad = values.length > 1 ? paddingAngle : 0;
  const usable = span - pad * values.length;
  let cursor = startAngle;
  return values.map((value, index) => {
    const portion = total > 0 ? Math.max(0, value) / total : 1 / Math.max(values.length, 1);
    const sliceSpan = usable * portion;
    const a0 = cursor + pad / 2;
    const a1 = a0 + sliceSpan;
    cursor = a1 + pad / 2;
    const mid = (a0 + a1) / 2;
    const labelR = innerRadius + (outerRadius - innerRadius) * 0.62;
    const label = polarPoint(cx, cy, labelR, mid);
    return {
      index,
      value,
      percent: portion,
      startAngle: a0,
      endAngle: a1,
      midAngle: mid,
      path: arcPath(cx, cy, innerRadius, outerRadius, a0, a1),
      labelX: label.x,
      labelY: label.y,
    };
  });
}

export type PieLabelLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  textX: number;
  textY: number;
  textAnchor: "start" | "end";
};

/** Outside label leader from the slice rim (Recharts Pie `labelLine`). */
export function pieLabelLine(
  cx: number,
  cy: number,
  outerRadius: number,
  midAngle: number,
  offset = 16,
): PieLabelLine {
  const start = polarPoint(cx, cy, outerRadius, midAngle);
  const elbow = polarPoint(cx, cy, outerRadius + offset * 0.55, midAngle);
  const side = elbow.x >= cx ? 1 : -1;
  const textX = elbow.x + side * offset;
  return {
    x1: start.x,
    y1: start.y,
    x2: elbow.x,
    y2: elbow.y,
    x3: textX,
    y3: elbow.y,
    textX: textX + side * 4,
    textY: elbow.y,
    textAnchor: side > 0 ? "start" : "end",
  };
}

/** True when any series has a finite value or a scatter cloud. */
export function seriesHasPlottableData(
  series: Array<{
    data?: Array<number | null | undefined>;
    scatter?: unknown[];
  }>,
): boolean {
  return series.some((item) => {
    if (item.scatter && item.scatter.length > 0) return true;
    return (item.data ?? []).some((value) => value != null && Number.isFinite(value));
  });
}

export function linePath(
  points: Array<{ x: number; y: number }>,
  curve: ChartCurve = "linear",
): string {
  const pts = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (!pts.length) return "";
  if (pts.length === 1) return `M${pts[0]!.x} ${pts[0]!.y}`;
  if (curve === "step") {
    const parts = [`M${pts[0]!.x} ${pts[0]!.y}`];
    for (let i = 1; i < pts.length; i++) {
      const mid = (pts[i - 1]!.x + pts[i]!.x) / 2;
      parts.push(`L${mid} ${pts[i - 1]!.y} L${mid} ${pts[i]!.y} L${pts[i]!.x} ${pts[i]!.y}`);
    }
    return parts.join(" ");
  }
  if (curve === "monotone") return monotonePath(pts);
  return `M${pts.map((p) => `${p.x} ${p.y}`).join(" L")}`;
}

function monotonePath(points: Array<{ x: number; y: number }>): string {
  const n = points.length;
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const deltaX = points[i + 1]!.x - points[i]!.x;
    dx[i] = deltaX;
    m[i] = deltaX === 0 ? 0 : (points[i + 1]!.y - points[i]!.y) / deltaX;
  }
  const t: number[] = [m[0] ?? 0];
  for (let i = 0; i < n - 2; i++) {
    const m0 = m[i] ?? 0;
    const m1 = m[i + 1] ?? 0;
    if (m0 * m1 <= 0) {
      t[i + 1] = 0;
    } else {
      const dx0 = dx[i] ?? 0;
      const dx1 = dx[i + 1] ?? 0;
      const next = (3 * (dx0 + dx1)) / ((2 * dx1 + dx0) / m0 + (dx1 + 2 * dx0) / m1);
      t[i + 1] = Number.isFinite(next) ? next : 0;
    }
  }
  t.push(m[m.length - 1] ?? 0);
  const parts = [`M${points[0]!.x} ${points[0]!.y}`];
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i]!;
    const p1 = points[i + 1]!;
    const delta = dx[i] ?? 0;
    const cpx1 = p0.x + delta / 3;
    const cpy1 = p0.y + ((t[i] ?? 0) * delta) / 3;
    const cpx2 = p1.x - delta / 3;
    const cpy2 = p1.y - ((t[i + 1] ?? 0) * delta) / 3;
    parts.push(`C${cpx1} ${cpy1} ${cpx2} ${cpy2} ${p1.x} ${p1.y}`);
  }
  return parts.join(" ");
}

export function areaPath(
  points: Array<{ x: number; y: number }>,
  baselineY: number,
  curve: ChartCurve = "linear",
): string {
  const pts = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (!pts.length) return "";
  const line = linePath(pts, curve);
  const first = pts[0]!;
  const last = pts[pts.length - 1]!;
  return `${line} L${last.x} ${baselineY} L${first.x} ${baselineY} Z`;
}

export function rangeAreaPath(
  high: Array<{ x: number; y: number }>,
  low: Array<{ x: number; y: number }>,
  curve: ChartCurve = "linear",
): string {
  if (!high.length || high.length !== low.length) return "";
  const top = linePath(high, curve);
  const reversed = [...low].reverse();
  const bottom = linePath(reversed, curve).replace(/^M/, "L");
  return `${top} ${bottom} Z`;
}

export function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string {
  const w = Math.abs(width);
  const h = Math.abs(height);
  const left = width < 0 ? x + width : x;
  const top = height < 0 ? y + height : y;
  const r = clamp(radius, 0, Math.min(w, h) / 2);
  if (r <= 0) return `M${left} ${top} h${w} v${h} h${-w} Z`;
  return `M${left + r} ${top} h${w - 2 * r} a${r} ${r} 0 0 1 ${r} ${r} v${h - 2 * r} a${r} ${r} 0 0 1 ${-r} ${r} h${-(w - 2 * r)} a${r} ${r} 0 0 1 ${-r} ${-r} v${-(h - 2 * r)} a${r} ${r} 0 0 1 ${r} ${-r} Z`;
}

export function heatColor(t: number): string {
  const pct = Math.round(clamp(t, 0, 1) * 100);
  return `color-mix(in srgb, var(--chart-1) ${pct}%, var(--muted) ${100 - pct}%)`;
}

export type BoxPlotStats = {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
};

export function boxPlotStats(values: number[]): BoxPlotStats {
  const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!xs.length) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] };
  const quantile = (p: number) => {
    const i = (xs.length - 1) * p;
    const lo = Math.floor(i);
    const hi = Math.ceil(i);
    return xs[lo]! + (xs[hi]! - xs[lo]!) * (i - lo);
  };
  const q1 = quantile(0.25);
  const median = quantile(0.5);
  const q3 = quantile(0.75);
  const iqr = q3 - q1;
  const loFence = q1 - 1.5 * iqr;
  const hiFence = q3 + 1.5 * iqr;
  const inliers = xs.filter((v) => v >= loFence && v <= hiFence);
  return {
    min: inliers[0] ?? xs[0]!,
    q1,
    median,
    q3,
    max: inliers[inliers.length - 1] ?? xs[xs.length - 1]!,
    outliers: xs.filter((v) => v < loFence || v > hiFence),
  };
}

export type FunnelLayout = {
  label: string;
  value: number;
  percent: number;
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
  y: number;
  height: number;
  color?: string;
};

export function funnelLayout(
  items: Array<{ label: string; value: number; color?: string }>,
  width: number,
  height: number,
  gap = 6,
  maxValue?: number,
): FunnelLayout[] {
  if (!items.length) return [];
  const max = Math.max(maxValue ?? 0, ...items.map((item) => item.value), 1);
  const row = (height - gap * (items.length - 1)) / items.length;
  return items.map((item, index) => {
    const next = items[index + 1]?.value ?? item.value * 0.45;
    const topW = (item.value / max) * width;
    const botW = (next / max) * width;
    const y = index * (row + gap);
    return {
      label: item.label,
      value: item.value,
      percent: item.value / max,
      topLeft: (width - topW) / 2,
      topRight: (width + topW) / 2,
      bottomLeft: (width - botW) / 2,
      bottomRight: (width + botW) / 2,
      y,
      height: row,
      color: item.color,
    };
  });
}

export function pyramidLayout(
  items: Array<{ label: string; value: number; color?: string }>,
  width: number,
  height: number,
): FunnelLayout[] {
  if (!items.length) return [];
  const max = Math.max(...items.map((item) => item.value), 1);
  const row = height / items.length;
  return items.map((item, index) => {
    const t = index / items.length;
    const t2 = (index + 1) / items.length;
    const topW = width * (1 - t) * (item.value / max) * 0.35 + width * (1 - t) * 0.65;
    const botW = width * (1 - t2) * 0.85 + width * 0.08;
    const y = index * row;
    return {
      label: item.label,
      value: item.value,
      percent: item.value / max,
      topLeft: (width - topW) / 2,
      topRight: (width + topW) / 2,
      bottomLeft: (width - botW) / 2,
      bottomRight: (width + botW) / 2,
      y,
      height: row,
      color: item.color,
    };
  });
}

export type TreeNode = {
  id?: string;
  label: string;
  value?: number;
  color?: string;
  children?: TreeNode[];
};

export type TreemapRect = {
  id: string;
  label: string;
  value: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  depth: number;
};

function nodeValue(node: TreeNode): number {
  if (node.children?.length) return node.children.reduce((sum, child) => sum + nodeValue(child), 0);
  return Math.max(0, node.value ?? 0);
}

export function squarify(
  nodes: TreeNode[],
  x: number,
  y: number,
  width: number,
  height: number,
  depth = 0,
): TreemapRect[] {
  const items = nodes
    .map((node, index) => ({ node, value: nodeValue(node), index }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
  const rects: TreemapRect[] = [];
  layoutRow(items, x, y, width, height, depth, rects);
  return rects;
}

function layoutRow(
  items: Array<{ node: TreeNode; value: number; index: number }>,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  out: TreemapRect[],
) {
  if (!items.length || width <= 0 || height <= 0) return;
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const horizontal = width >= height;
  const side = horizontal ? height : width;
  let row: typeof items = [];
  let rowValue = 0;
  let bestWorst = Infinity;

  const worst = (candidate: typeof items, value: number) => {
    const rowArea = (value / total) * width * height;
    const rowSide = side;
    let maxRatio = 0;
    for (const item of candidate) {
      const itemSide = rowArea / rowSide;
      const other = (item.value / value) * rowSide;
      const ratio = Math.max(itemSide / other, other / itemSide);
      maxRatio = Math.max(maxRatio, ratio);
    }
    return maxRatio;
  };

  for (const item of items) {
    const next = [...row, item];
    const nextValue = rowValue + item.value;
    const nextWorst = worst(next, nextValue);
    if (row.length && nextWorst > bestWorst) break;
    row = next;
    rowValue = nextValue;
    bestWorst = nextWorst;
  }

  const rowArea = (rowValue / total) * width * height;
  const thickness = horizontal ? rowArea / height : rowArea / width;
  let cursor = horizontal ? y : x;
  for (const item of row) {
    const frac = item.value / rowValue;
    const span = (horizontal ? height : width) * frac;
    const rx = horizontal ? x : cursor;
    const ry = horizontal ? cursor : y;
    const rw = horizontal ? thickness : span;
    const rh = horizontal ? span : thickness;
    if (item.node.children?.length) {
      out.push(...squarify(item.node.children, rx, ry, rw, rh, depth + 1));
    } else {
      out.push({
        id: item.node.id ?? item.node.label,
        label: item.node.label,
        value: item.value,
        x: rx,
        y: ry,
        w: rw,
        h: rh,
        color: item.node.color,
        depth,
      });
    }
    cursor += span;
  }

  const rest = items.slice(row.length);
  if (!rest.length) return;
  if (horizontal) {
    layoutRow(rest, x + thickness, y, width - thickness, height, depth, out);
  } else {
    layoutRow(rest, x, y + thickness, width, height - thickness, depth, out);
  }
}

export type SunburstSlice = TreemapRect & {
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  path: string;
  parentId?: string;
};

export function sunburstLayout(
  nodes: TreeNode[],
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
): SunburstSlice[] {
  const maxDepth = (list: TreeNode[], depth = 1): number =>
    list.reduce(
      (max, node) => Math.max(max, node.children?.length ? maxDepth(node.children, depth + 1) : depth),
      1,
    );
  const depthCount = Math.max(1, maxDepth(nodes));
  const ring = (outerRadius - innerRadius) / depthCount;
  const slices: SunburstSlice[] = [];

  const walk = (
    list: TreeNode[],
    start: number,
    end: number,
    depth: number,
    parentId?: string,
  ) => {
    const total = list.reduce((sum, node) => sum + nodeValue(node), 0) || 1;
    let cursor = start;
    for (const node of list) {
      const span = ((end - start) * nodeValue(node)) / total;
      const a0 = cursor;
      const a1 = cursor + span;
      const r0 = innerRadius + (depth - 1) * ring;
      const r1 = innerRadius + depth * ring;
      const id = node.id ?? node.label;
      slices.push({
        id,
        label: node.label,
        value: nodeValue(node),
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        color: node.color,
        depth,
        startAngle: a0,
        endAngle: a1,
        innerRadius: r0,
        outerRadius: r1,
        path: arcPath(cx, cy, r0, r1, a0, a1),
        parentId,
      });
      if (node.children?.length) walk(node.children, a0, a1, depth + 1, id);
      cursor = a1;
    }
  };

  walk(nodes, 0, 360, 1);
  return slices;
}

export type SankeyNode = { id: string; label?: string; color?: string };
export type SankeyLink = { source: string; target: string; value: number };

export type SankeyLayout = {
  nodes: Array<{
    id: string;
    label: string;
    color?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    value: number;
    path: string;
    width: number;
  }>;
};

export function sankeyLayout(
  nodes: SankeyNode[],
  links: SankeyLink[],
  width: number,
  height: number,
  nodeWidth = 16,
): SankeyLayout {
  const ids = nodes.map((node) => node.id);
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();
  for (const id of ids) {
    incoming.set(id, 0);
    outgoing.set(id, 0);
  }
  for (const link of links) {
    outgoing.set(link.source, (outgoing.get(link.source) ?? 0) + link.value);
    incoming.set(link.target, (incoming.get(link.target) ?? 0) + link.value);
  }

  const column = new Map<string, number>();
  const queue = ids.filter((id) => (incoming.get(id) ?? 0) === 0);
  for (const id of queue) column.set(id, 0);
  const remaining = new Set(ids);
  for (const id of queue) remaining.delete(id);
  while (queue.length) {
    const id = queue.shift()!;
    const col = column.get(id) ?? 0;
    for (const link of links) {
      if (link.source !== id) continue;
      const next = Math.max(column.get(link.target) ?? 0, col + 1);
      column.set(link.target, next);
      if (remaining.has(link.target)) {
        remaining.delete(link.target);
        queue.push(link.target);
      }
    }
  }
  for (const id of remaining) column.set(id, Math.max(...column.values(), 0) + 1);

  const columns = new Map<number, string[]>();
  for (const id of ids) {
    const col = column.get(id) ?? 0;
    const list = columns.get(col) ?? [];
    list.push(id);
    columns.set(col, list);
  }
  const colCount = Math.max(...columns.keys(), 0) + 1;
  const xStep = colCount > 1 ? (width - nodeWidth) / (colCount - 1) : 0;

  const nodeValueMap = new Map<string, number>();
  for (const id of ids) {
    nodeValueMap.set(id, Math.max(incoming.get(id) ?? 0, outgoing.get(id) ?? 0, 1));
  }

  const placed = new Map<string, { x: number; y: number; height: number; value: number }>();
  for (const [col, list] of columns) {
    const total = list.reduce((sum, id) => sum + (nodeValueMap.get(id) ?? 1), 0);
    const gap = 10;
    const usable = Math.max(height - gap * (list.length - 1), 1);
    let y = 0;
    for (const id of list) {
      const value = nodeValueMap.get(id) ?? 1;
      const h = Math.max(8, (value / total) * usable);
      placed.set(id, { x: col * xStep, y, height: h, value });
      y += h + gap;
    }
  }

  const sourceOffset = new Map<string, number>();
  const targetOffset = new Map<string, number>();
  const laidLinks = links.map((link) => {
    const source = placed.get(link.source);
    const target = placed.get(link.target);
    if (!source || !target) {
      return { source: link.source, target: link.target, value: link.value, path: "", width: 0 };
    }
    const srcH = Math.max(2, (link.value / source.value) * source.height);
    const tgtH = Math.max(2, (link.value / target.value) * target.height);
    const sy = source.y + (sourceOffset.get(link.source) ?? 0) + srcH / 2;
    const ty = target.y + (targetOffset.get(link.target) ?? 0) + tgtH / 2;
    sourceOffset.set(link.source, (sourceOffset.get(link.source) ?? 0) + srcH);
    targetOffset.set(link.target, (targetOffset.get(link.target) ?? 0) + tgtH);
    const x0 = source.x + nodeWidth;
    const x1 = target.x;
    const mid = (x0 + x1) / 2;
    const half = Math.max(srcH, tgtH) / 2;
    const path = `M${x0} ${sy - half} C${mid} ${sy - half} ${mid} ${ty - half} ${x1} ${ty - half} L${x1} ${ty + half} C${mid} ${ty + half} ${mid} ${sy + half} ${x0} ${sy + half} Z`;
    return { source: link.source, target: link.target, value: link.value, path, width: half * 2 };
  });

  return {
    nodes: nodes.map((node) => {
      const place = placed.get(node.id);
      return {
        id: node.id,
        label: node.label ?? node.id,
        color: node.color,
        x: place?.x ?? 0,
        y: place?.y ?? 0,
        width: nodeWidth,
        height: place?.height ?? 0,
        value: place?.value ?? 0,
      };
    }),
    links: laidLinks,
  };
}

export type ChordLayout = {
  groups: Array<{
    index: number;
    label: string;
    startAngle: number;
    endAngle: number;
    path: string;
  }>;
  ribbons: Array<{
    source: number;
    target: number;
    value: number;
    path: string;
  }>;
};

export function chordLayout(
  labels: string[],
  matrix: number[][],
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  padAngle = 4,
): ChordLayout {
  const n = labels.length;
  const totals = labels.map((_, i) => matrix[i]?.reduce((sum, value) => sum + value, 0) ?? 0);
  const grand = totals.reduce((sum, value) => sum + value, 0) || 1;
  const groups: ChordLayout["groups"] = [];
  const starts: number[] = [];
  let cursor = 0;
  const usable = 360 - padAngle * n;
  for (let i = 0; i < n; i++) {
    const span = (totals[i]! / grand) * usable;
    const a0 = cursor + padAngle / 2;
    const a1 = a0 + span;
    starts[i] = a0;
    groups.push({
      index: i,
      label: labels[i]!,
      startAngle: a0,
      endAngle: a1,
      path: arcPath(cx, cy, innerRadius, outerRadius, a0, a1),
    });
    cursor = a1 + padAngle / 2;
  }

  const sourceCursor = [...starts];
  const targetCursor = [...starts];
  const ribbons: ChordLayout["ribbons"] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const value = matrix[i]?.[j] ?? 0;
      if (value <= 0) continue;
      const srcSpan = (value / grand) * usable;
      const tgtSpan = (value / grand) * usable;
      const a0 = sourceCursor[i]!;
      const a1 = a0 + srcSpan;
      const b0 = targetCursor[j]!;
      const b1 = b0 + tgtSpan;
      sourceCursor[i] = a1;
      if (i !== j) targetCursor[j] = b1;
      const p0 = polarPoint(cx, cy, innerRadius, a0);
      const p1 = polarPoint(cx, cy, innerRadius, a1);
      const q0 = polarPoint(cx, cy, innerRadius, b0);
      const q1 = polarPoint(cx, cy, innerRadius, b1);
      ribbons.push({
        source: i,
        target: j,
        value,
        path: `M${p0.x} ${p0.y} Q${cx} ${cy} ${q1.x} ${q1.y} L${q0.x} ${q0.y} Q${cx} ${cy} ${p1.x} ${p1.y} Z`,
      });
    }
  }

  return { groups, ribbons };
}

export type WaterfallBar = {
  index: number;
  start: number;
  end: number;
  value: number;
  total: boolean;
};

export function waterfallBars(data: Array<number | null>): WaterfallBar[] {
  let running = 0;
  return data.map((value, index) => {
    if (value == null) {
      return { index, start: 0, end: running, value: running, total: true };
    }
    const start = running;
    const end = running + value;
    running = end;
    return { index, start, end, value, total: false };
  });
}
