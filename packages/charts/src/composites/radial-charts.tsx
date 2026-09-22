import {
  arcPath,
  formatChartNumber,
  linePath,
  pieLabelLine,
  pieSlices,
  polarPoint,
  resolveChartRadius,
  type ChartLegendPosition,
  type ChartMargin,
  type ChartRadius,
} from "../lib/charts";
import {
  ChartFrame,
  formatSeriesValue,
  seriesMeta,
  useChartHover,
  useHiddenSeries,
} from "./chart-ui";
import { bindChartMark, type ChartItemEvent, type ChartTooltipRenderer } from "./chart-interaction";

export type PieDatum = {
  id?: string | number;
  value: number;
  label?: string;
  color?: string;
};

export type PieSeries = {
  data: PieDatum[];
  innerRadius?: ChartRadius;
  outerRadius?: ChartRadius;
  paddingAngle?: number;
  startAngle?: number;
  endAngle?: number;
  cx?: number;
  cy?: number;
  faded?: boolean;
};

export type PieChartProps = {
  series: PieSeries[];
  height?: number;
  width?: number;
  colors?: string[];
  hideLegend?: boolean;
  margin?: ChartMargin;
  className?: string;
  slot?: string;
  fillHeight?: boolean;
  onItemClick?: (event: ChartItemEvent) => void;
  renderTooltip?: ChartTooltipRenderer;
  /** Return slice label text, or null to hide. Defaults to percent when the slice is large enough. */
  labelFormatter?: (item: { label: string; value: number; percent: number }) => string | null;
  /** Draw leader lines to labels outside the ring (Recharts Pie `labelLine`). */
  labelLine?: boolean;
  legendPosition?: ChartLegendPosition;
  loading?: boolean;
  emptyText?: import("react").ReactNode;
};

export function PieChart({
  series,
  height = 280,
  width,
  colors,
  hideLegend,
  margin,
  className,
  slot = "pie-chart",
  fillHeight,
  onItemClick,
  renderTooltip,
  labelFormatter,
  labelLine = false,
  legendPosition,
  loading,
  emptyText,
}: PieChartProps) {
  const first = series[0] ?? { data: [] };
  const meta = seriesMeta(
    first.data.map((item, i) => ({
      id: String(item.id ?? item.label ?? i),
      label: item.label ?? `Slice ${i + 1}`,
      color: item.color,
    })),
    colors,
  );
  const ids = meta.map((item) => item.id);
  const { hidden, toggle } = useHiddenSeries(ids);
  const { hover, setHover, clear } = useChartHover();

  return (
    <ChartFrame
      slot={slot}
      className={className}
      width={width}
      height={height}
      fillHeight={fillHeight}
      margin={margin ?? (labelLine ? { top: 20, right: 56, bottom: 20, left: 56 } : { top: 12, right: 12, bottom: 12, left: 12 })}
      legend={hideLegend ? undefined : meta}
      legendPosition={legendPosition}
      hiddenIds={hidden}
      onToggleSeries={toggle}
      hover={hover}
      renderTooltip={renderTooltip}
      loading={loading}
      empty={first.data.every((item, i) => hidden.has(meta[i]!.id) || item.value <= 0)}
      emptyText={emptyText}
      aria-label="Pie chart"
    >
      {({ width: w, height: h, m }) => {
        const plotW = Math.max(1, w - m.left - m.right);
        const plotH = Math.max(1, h - m.top - m.bottom);
        const cx = first.cx ?? m.left + plotW / 2;
        const cy = first.cy ?? m.top + plotH / 2;
        const maxR = Math.min(plotW, plotH) / 2;
        const outer = resolveChartRadius(first.outerRadius, maxR, maxR);
        const innerRaw = resolveChartRadius(first.innerRadius, maxR, 0);
        const inner = innerRaw >= outer ? 0 : innerRaw;
        const visible = first.data.map((item, i) => (hidden.has(meta[i]!.id) ? 0 : item.value));
        const slices = pieSlices(visible, {
          cx,
          cy,
          innerRadius: inner,
          outerRadius: outer,
          startAngle: first.startAngle,
          endAngle: first.endAngle,
          paddingAngle: first.paddingAngle,
        });
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {slices.map((slice, i) => {
              const info = meta[i]!;
              if (hidden.has(info.id) || !slice.path) return null;
              const item = first.data[i]!;
              const color = info.color;
              const event: ChartItemEvent = {
                seriesId: info.id,
                seriesLabel: info.label,
                dataIndex: i,
                category: info.label,
                value: item.value,
                color,
              };
              const labelText = labelFormatter
                ? labelFormatter({ label: info.label, value: item.value, percent: slice.percent })
                : slice.percent > 0.08
                  ? `${Math.round(slice.percent * 100)}%`
                  : null;
              const leader = labelLine && labelText ? pieLabelLine(cx, cy, outer, slice.midAngle) : null;
              return (
                <g key={info.id}>
                  <path
                    d={slice.path}
                    fill={color}
                    style={{ fill: color }}
                    {...bindChartMark({
                      event,
                      hover: {
                        title: info.label,
                        items: [
                          {
                            color,
                            label: info.label,
                            value: `${formatChartNumber(item.value)} (${Math.round(slice.percent * 100)}%)`,
                          },
                        ],
                      },
                      onItemClick,
                      setHover,
                      clearHover: clear,
                    })}
                  />
                  {leader ? (
                    <polyline
                      className="spk-chart-label-line"
                      points={`${leader.x1},${leader.y1} ${leader.x2},${leader.y2} ${leader.x3},${leader.y3}`}
                    />
                  ) : null}
                  {labelText ? (
                    <text
                      className="spk-chart-label"
                      fill={leader ? "var(--muted-foreground)" : "var(--primary-foreground)"}
                      x={leader ? leader.textX : slice.labelX}
                      y={leader ? leader.textY : slice.labelY}
                      textAnchor={leader ? leader.textAnchor : "middle"}
                      dominantBaseline="middle"
                    >
                      {labelText}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export type GaugeSection = {
  value: number;
  color?: string;
  label?: string;
};

export type GaugeProps = {
  value?: number;
  valueMin?: number;
  valueMax?: number;
  startAngle?: number;
  endAngle?: number;
  innerRadius?: ChartRadius;
  outerRadius?: ChartRadius;
  height?: number;
  width?: number;
  color?: string;
  colors?: string[];
  text?: string | null | ((value: number) => string);
  sections?: GaugeSection[];
  hideLegend?: boolean;
  paddingAngle?: number;
  className?: string;
};

export function Gauge({
  value = 0,
  valueMin = 0,
  valueMax = 100,
  startAngle = -110,
  endAngle = 110,
  innerRadius,
  outerRadius,
  height = 200,
  width,
  color = "var(--chart-1)",
  colors,
  text,
  sections,
  hideLegend,
  paddingAngle = 2,
  className,
}: GaugeProps) {
  const pct = (value - valueMin) / (valueMax - valueMin || 1);
  const segmented = Boolean(sections?.length);
  const resolvedText =
    text === null
      ? null
      : typeof text === "function"
        ? text(value)
        : (text ?? (segmented ? null : `${Math.round(pct * 100)}%`));
  const meta = seriesMeta(
    (sections ?? []).map((item, i) => ({
      id: item.label ?? `section-${i}`,
      label: item.label ?? `Section ${i + 1}`,
      color: item.color,
    })),
    colors,
  );

  return (
    <ChartFrame
      slot="gauge"
      className={className}
      width={width}
      height={height}
      margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
      legend={segmented && !hideLegend ? meta : undefined}
      aria-label={segmented ? "Gauge" : `Gauge ${value}`}
    >
      {({ width: w, height: h }) => {
        const cx = w / 2;
        const cy = segmented ? h * 0.72 : h * 0.62;
        const maxR = Math.min(w, h) * (segmented ? 0.5 : 0.42);
        const outer = resolveChartRadius(outerRadius, maxR, maxR);
        const innerRaw = resolveChartRadius(innerRadius, maxR, outer * 0.72);
        const inner = innerRaw >= outer ? outer * 0.72 : innerRaw;
        const span = endAngle - startAngle;
        const valueAngle = startAngle + span * Math.min(1, Math.max(0, pct));
        const slices = segmented
          ? pieSlices(
              (sections ?? []).map((item) => item.value),
              {
                cx,
                cy,
                innerRadius: inner,
                outerRadius: outer,
                startAngle,
                endAngle,
                paddingAngle,
              },
            )
          : [];
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {segmented ? (
              slices.map((slice, i) => {
                const info = meta[i]!;
                if (!slice.path) return null;
                return (
                  <path
                    key={info.id}
                    d={slice.path}
                    fill={info.color}
                    className="spk-chart-mark"
                  />
                );
              })
            ) : (
              <>
                <path
                  d={arcPath(cx, cy, inner, outer, startAngle, endAngle)}
                  fill="color-mix(in srgb, var(--muted) 80%, transparent)"
                />
                <path d={arcPath(cx, cy, inner, outer, startAngle, valueAngle)} fill={color} />
              </>
            )}
            {resolvedText != null ? (
              <text
                className="spk-chart-label"
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="1.35rem"
              >
                {resolvedText}
              </text>
            ) : null}
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export type LinearGaugeProps = {
  value: number;
  valueMin?: number;
  valueMax?: number;
  height?: number;
  width?: number;
  color?: string;
  className?: string;
};

export function LinearGauge({
  value,
  valueMin = 0,
  valueMax = 100,
  height = 48,
  width,
  color = "var(--chart-1)",
  className,
}: LinearGaugeProps) {
  const pct = Math.min(1, Math.max(0, (value - valueMin) / (valueMax - valueMin || 1)));
  return (
    <ChartFrame
      slot="linear-gauge"
      className={className}
      width={width}
      height={height}
      margin={{ top: 14, right: 12, bottom: 14, left: 12 }}
      aria-label={`Linear gauge ${value}`}
    >
      {({ width: w, height: h, m }) => {
        const y = h / 2 - 7;
        const trackW = w - m.left - m.right;
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <rect
              x={m.left}
              y={y}
              width={trackW}
              height={14}
              rx={7}
              fill="color-mix(in srgb, var(--muted) 80%, transparent)"
            />
            <rect x={m.left} y={y} width={Math.max(14, trackW * pct)} height={14} rx={7} fill={color} />
            <text
              className="spk-chart-label"
              x={m.left + trackW * pct}
              y={y - 4}
              textAnchor={pct > 0.85 ? "end" : "middle"}
            >
              {formatChartNumber(value)}
            </text>
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export type RadarSeries = {
  id?: string;
  label?: string;
  color?: string;
  data: number[];
};

export type RadarChartProps = {
  series: RadarSeries[];
  radar: { metrics: string[]; max?: number };
  height?: number;
  width?: number;
  colors?: string[];
  hideLegend?: boolean;
  className?: string;
  fill?: boolean;
  slot?: string;
};

export function RadarChart({
  series,
  radar,
  height = 300,
  width,
  colors,
  hideLegend,
  className,
  fill = true,
  slot = "radar-chart",
}: RadarChartProps) {
  const meta = seriesMeta(series, colors);
  const ids = meta.map((item) => item.id);
  const { hidden, toggle } = useHiddenSeries(ids);
  const { hover, setHover, clear } = useChartHover();
  const max = radar.max ?? Math.max(...series.flatMap((item) => item.data), 1);

  return (
    <ChartFrame
      slot={slot}
      className={className}
      width={width}
      height={height}
      margin={{ top: 28, right: 28, bottom: 28, left: 28 }}
      legend={hideLegend ? undefined : meta}
      hiddenIds={hidden}
      onToggleSeries={toggle}
      hover={hover}
      aria-label="Radar chart"
    >
      {({ width: w, height: h }) => {
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.36;
        const n = radar.metrics.length || 1;
        const angle = 360 / n;
        const rings = [0.25, 0.5, 0.75, 1];
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {rings.map((ring) => (
              <polygon
                key={ring}
                fill="none"
                className="spk-chart-grid"
                points={radar.metrics
                  .map((_, i) => {
                    const p = polarPoint(cx, cy, radius * ring, i * angle);
                    return `${p.x},${p.y}`;
                  })
                  .join(" ")}
              />
            ))}
            {radar.metrics.map((metric, i) => {
              const p = polarPoint(cx, cy, radius, i * angle);
              const label = polarPoint(cx, cy, radius + 18, i * angle);
              return (
                <g key={metric}>
                  <line className="spk-chart-grid" x1={cx} y1={cy} x2={p.x} y2={p.y} />
                  <text
                    className="spk-chart-tick"
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {metric}
                  </text>
                </g>
              );
            })}
            {series.map((item, s) => {
              const info = meta[s]!;
              if (hidden.has(info.id)) return null;
              const pts = item.data.map((value, i) =>
                polarPoint(cx, cy, radius * (value / max), i * angle),
              );
              const closed = [...pts, pts[0]!];
              return (
                <g key={info.id}>
                  {fill ? (
                    <polygon
                      points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill={info.color}
                      fillOpacity={0.18}
                      stroke={info.color}
                      strokeWidth={2}
                      className="spk-chart-mark"
                    />
                  ) : (
                    <path
                      d={linePath(closed, "linear")}
                      fill="none"
                      stroke={info.color}
                      strokeWidth={2}
                      className="spk-chart-mark"
                    />
                  )}
                  {pts.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={3.2}
                      fill={info.color}
                      onMouseEnter={() =>
                        setHover({
                          x: p.x,
                          y: p.y,
                          title: radar.metrics[i],
                          items: [
                            {
                              color: info.color,
                              label: info.label,
                              value: formatSeriesValue(item.data[i]),
                            },
                          ],
                        })
                      }
                      onMouseLeave={clear}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export function PolarLineChart(props: RadarChartProps) {
  return <RadarChart {...props} fill={false} slot="polar-line-chart" />;
}

export type RadialBarChartProps = {
  series: Array<{ data: PieDatum[] }>;
  height?: number;
  width?: number;
  colors?: string[];
  hideLegend?: boolean;
  className?: string;
  startAngle?: number;
  endAngle?: number;
};

export function RadialBarChart({
  series,
  height = 280,
  width,
  colors,
  hideLegend,
  className,
  startAngle = -90,
  endAngle = 180,
}: RadialBarChartProps) {
  const data = series[0]?.data ?? [];
  const meta = seriesMeta(
    data.map((item, i) => ({ id: String(item.id ?? item.label ?? i), label: item.label ?? `Item ${i + 1}`, color: item.color })),
    colors,
  );
  const ids = meta.map((item) => item.id);
  const { hidden, toggle } = useHiddenSeries(ids);
  const { hover, setHover, clear } = useChartHover();
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <ChartFrame
      slot="radial-bar-chart"
      className={className}
      width={width}
      height={height}
      margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
      legend={hideLegend ? undefined : meta}
      hiddenIds={hidden}
      onToggleSeries={toggle}
      hover={hover}
      aria-label="Radial bar chart"
    >
      {({ width: w, height: h }) => {
        const cx = w / 2;
        const cy = h / 2;
        const outer = Math.min(w, h) * 0.42;
        const track = Math.max(8, (outer * 0.62) / Math.max(data.length, 1));
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {data.map((item, i) => {
              const info = meta[i]!;
              if (hidden.has(info.id)) return null;
              const r1 = outer - i * track;
              const r0 = r1 - track * 0.72;
              const span = endAngle - startAngle;
              const a1 = startAngle + span * (item.value / max);
              return (
                <g key={info.id}>
                  <path
                    d={arcPath(cx, cy, r0, r1, startAngle, endAngle)}
                    fill="color-mix(in srgb, var(--muted) 70%, transparent)"
                  />
                  <path
                    d={arcPath(cx, cy, r0, r1, startAngle, a1)}
                    fill={info.color}
                    className="spk-chart-mark"
                    onMouseEnter={(event) =>
                      setHover({
                        x: event.nativeEvent.offsetX,
                        y: event.nativeEvent.offsetY,
                        title: info.label,
                        items: [{ color: info.color, label: info.label, value: formatChartNumber(item.value) }],
                      })
                    }
                    onMouseLeave={clear}
                  />
                </g>
              );
            })}
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export type RadialLineChartProps = {
  series: RadarSeries[];
  metrics?: string[];
  height?: number;
  width?: number;
  colors?: string[];
  hideLegend?: boolean;
  className?: string;
};

export function RadialLineChart({
  series,
  metrics,
  height = 280,
  width,
  colors,
  hideLegend,
  className,
}: RadialLineChartProps) {
  const labels = metrics ?? series[0]?.data.map((_, i) => String(i + 1)) ?? [];
  return (
    <RadarChart
      series={series}
      radar={{ metrics: labels }}
      height={height}
      width={width}
      colors={colors}
      hideLegend={hideLegend}
      className={className}
      fill={false}
      slot="radial-line-chart"
    />
  );
}
