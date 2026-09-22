import { useId } from "react";
import {
  chartColor,
  chordLayout,
  formatChartNumber,
  funnelLayout,
  heatColor,
  pyramidLayout,
  sankeyLayout,
  squarify,
  sunburstLayout,
  type ChartAxisConfig,
  type ChartMargin,
  type SankeyLink,
  type SankeyNode,
  type TreeNode,
} from "../lib/charts";
import {
  ChartFrame,
  categoryLabels,
  seriesMeta,
  useChartHover,
  useHiddenSeries,
} from "./chart-ui";
import { bindChartMark, type ChartItemEvent, type ChartTooltipRenderer } from "./chart-interaction";

export type HeatDatum = { x: number; y: number; value: number };

export type HeatmapProps = {
  xAxis?: ChartAxisConfig[];
  yAxis?: ChartAxisConfig[];
  series: Array<{ data: HeatDatum[] }>;
  height?: number;
  width?: number;
  hideLegend?: boolean;
  showColorScale?: boolean;
  margin?: ChartMargin;
  className?: string;
  fillHeight?: boolean;
  onItemClick?: (event: ChartItemEvent) => void;
  renderTooltip?: ChartTooltipRenderer;
  showCellLabels?: boolean | ((cell: HeatDatum) => string);
};

export function Heatmap({
  xAxis,
  yAxis,
  series,
  height = 280,
  width,
  hideLegend,
  showColorScale,
  margin,
  className,
  fillHeight,
  onItemClick,
  renderTooltip,
  showCellLabels = false,
}: HeatmapProps) {
  const cells = series[0]?.data ?? [];
  const xs = categoryLabels(xAxis?.[0], Math.max(...cells.map((c) => c.x), 0) + 1);
  const ys = categoryLabels(yAxis?.[0], Math.max(...cells.map((c) => c.y), 0) + 1);
  const values = cells.map((c) => c.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const { hover, setHover, clear } = useChartHover();
  const reactId = useId().replace(/:/g, "");
  const scaleId = `spk-heat-scale-${reactId}`;
  const colorScale = showColorScale ?? !hideLegend;

  return (
    <ChartFrame
      slot="heatmap"
      className={className}
      width={width}
      height={height}
      fillHeight={fillHeight}
      margin={margin ?? { top: colorScale ? 32 : 12, right: 12, bottom: 36, left: 72 }}
      hover={hover}
      renderTooltip={renderTooltip}
      aria-label="Heatmap"
    >
      {({ width: w, height: h, m }) => {
        const iw = Math.max(1, w - m.left - m.right);
        const ih = Math.max(1, h - m.top - m.bottom);
        const cw = iw / Math.max(xs.length, 1);
        const ch = ih / Math.max(ys.length, 1);
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {colorScale ? (
              <g className="spk-chart-color-scale" data-slot="heatmap-color-scale">
                <defs>
                  <linearGradient id={scaleId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={heatColor(0)} />
                    <stop offset="50%" stopColor={heatColor(0.5)} />
                    <stop offset="100%" stopColor={heatColor(1)} />
                  </linearGradient>
                </defs>
                <text className="spk-chart-muted" x={m.left} y={m.top - 16}>
                  {formatChartNumber(min)}
                </text>
                <text
                  className="spk-chart-muted"
                  x={m.left + iw}
                  y={m.top - 16}
                  textAnchor="end"
                >
                  {formatChartNumber(max)}
                </text>
                <rect
                  x={m.left}
                  y={m.top - 12}
                  width={iw}
                  height={6}
                  rx={3}
                  fill={`url(#${scaleId})`}
                />
              </g>
            ) : null}
            {ys.map((label, y) => (
              <text
                key={`y-${y}-${String(label)}`}
                className="spk-chart-tick"
                x={m.left - 8}
                y={m.top + y * ch + ch / 2}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {String(label)}
              </text>
            ))}
            {xs.map((label, x) => (
              <text
                key={`x-${x}-${String(label)}`}
                className="spk-chart-tick"
                x={m.left + x * cw + cw / 2}
                y={h - m.bottom + 16}
                textAnchor="middle"
              >
                {String(label)}
              </text>
            ))}
            {cells.map((cell, i) => {
              const t = (cell.value - min) / (max - min || 1);
              const color = heatColor(t);
              const category = `${xs[cell.x]} · ${ys[cell.y]}`;
              const event: ChartItemEvent = {
                seriesId: "heat",
                seriesLabel: "value",
                dataIndex: i,
                category,
                value: cell.value,
                color,
              };
              const cellLabel =
                typeof showCellLabels === "function"
                  ? showCellLabels(cell)
                  : showCellLabels
                    ? formatChartNumber(cell.value)
                    : null;
              return (
                <g key={i}>
                  <rect
                    x={m.left + cell.x * cw + 1.5}
                    y={m.top + cell.y * ch + 1.5}
                    width={Math.max(1, cw - 3)}
                    height={Math.max(1, ch - 3)}
                    rx={4}
                    fill={color}
                    {...bindChartMark({
                      event,
                      hover: {
                        title: category,
                        items: [{ color, label: "value", value: formatChartNumber(cell.value) }],
                      },
                      onItemClick,
                      setHover,
                      clearHover: clear,
                    })}
                  />
                  {cellLabel ? (
                    <text
                      className="spk-chart-label"
                      x={m.left + cell.x * cw + cw / 2}
                      y={m.top + cell.y * ch + ch / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      pointerEvents="none"
                    >
                      {cellLabel}
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

export type FunnelDatum = { id?: string; label: string; value: number; color?: string };

export type FunnelSeries = {
  id?: string;
  label?: string;
  data: FunnelDatum[];
};

export type FunnelLabelPosition = "inside" | "outside" | "both";

export type FunnelChartProps = {
  series: FunnelSeries[];
  height?: number;
  width?: number;
  colors?: string[];
  hideLegend?: boolean;
  className?: string;
  variant?: "funnel" | "pyramid";
  gap?: number;
  labelPosition?: FunnelLabelPosition;
  valueFormatter?: (value: number, percent: number) => string;
};

export function FunnelChart({
  series,
  height = 300,
  width,
  colors,
  hideLegend,
  className,
  variant = "funnel",
  gap = 6,
  labelPosition,
  valueFormatter,
}: FunnelChartProps) {
  const stages = series[0]?.data ?? [];
  const comparison = series.length > 1;
  const position = labelPosition ?? (comparison ? "both" : "inside");
  const formatValue =
    valueFormatter ?? ((value: number) => formatChartNumber(value));
  const meta = seriesMeta(
    stages.map((item) => ({ id: item.id ?? item.label, label: item.label, color: item.color })),
    colors,
  );
  const { hover, setHover, clear } = useChartHover();
  const ids = meta.map((item) => item.id);
  const { hidden, toggle } = useHiddenSeries(ids);
  const showInside = position === "inside" || position === "both";
  const showOutside = position === "outside" || position === "both";

  return (
    <ChartFrame
      slot={variant === "pyramid" ? "pyramid-chart" : "funnel-chart"}
      className={className}
      width={width}
      height={height}
      margin={{
        top: 8,
        right: showOutside ? 56 : 8,
        bottom: 8,
        left: 8,
      }}
      legend={hideLegend ? undefined : meta}
      hiddenIds={hidden}
      onToggleSeries={toggle}
      hover={hover}
      aria-label={variant === "pyramid" ? "Pyramid chart" : "Funnel chart"}
    >
      {({ width: w, height: h, m }) => {
        const visibleIndexes = stages
          .map((_, i) => i)
          .filter((i) => !hidden.has(meta[i]!.id));
        const visibleSeries = series.map((item) => ({
          ...item,
          data: visibleIndexes.map((i) => item.data[i]).filter((row): row is FunnelDatum => row != null),
        }));
        const maxValue = Math.max(
          ...visibleSeries.flatMap((item) => item.data.map((row) => row.value)),
          1,
        );
        const innerW = w - m.left - m.right;
        const innerH = h - m.top - m.bottom;
        const layouts = visibleSeries.map((item) => {
          const rows = item.data.map((row, i) => ({
            ...row,
            color: meta[visibleIndexes[i] ?? i]?.color,
          }));
          return variant === "pyramid"
            ? pyramidLayout(rows, innerW, innerH)
            : funnelLayout(rows, innerW, innerH, gap, maxValue);
        });
        const drawOrder = layouts.map((_, i) => i).sort((a, b) => (a === 0 ? 1 : b === 0 ? -1 : a - b));
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {drawOrder.flatMap((seriesIndex) => {
              const layout = layouts[seriesIndex] ?? [];
              const primary = seriesIndex === 0;
              return layout.map((row, i) => {
                const info = meta.find((item) => item.label === row.label) ?? meta[visibleIndexes[i] ?? i]!;
                const d = `M${m.left + row.topLeft} ${m.top + row.y} L${m.left + row.topRight} ${m.top + row.y} L${m.left + row.bottomRight} ${m.top + row.y + row.height} L${m.left + row.bottomLeft} ${m.top + row.y + row.height} Z`;
                const valueText = formatValue(row.value, row.percent);
                const inside =
                  showInside &&
                  primary &&
                  (hideLegend && !comparison ? row.label : valueText);
                const outside = showOutside && !primary ? valueText : showOutside && !comparison ? valueText : null;
                return (
                  <g key={`${seriesIndex}-${row.label}`}>
                    <path
                      d={d}
                      fill={info.color}
                      fillOpacity={primary ? 1 : 0.14}
                      stroke={primary ? "none" : info.color}
                      strokeWidth={primary ? 0 : 1.75}
                      className="spk-chart-mark"
                      onMouseEnter={(event) =>
                        setHover({
                          x: event.nativeEvent.offsetX,
                          y: event.nativeEvent.offsetY,
                          title: row.label,
                          items: [
                            {
                              color: info.color,
                              label: visibleSeries[seriesIndex]?.label ?? row.label,
                              value: formatChartNumber(row.value),
                            },
                          ],
                        })
                      }
                      onMouseLeave={clear}
                    />
                    {inside ? (
                      <text
                        className="spk-chart-label"
                        fill="var(--primary-foreground)"
                        x={w / 2}
                        y={m.top + row.y + row.height / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {inside}
                      </text>
                    ) : null}
                    {outside ? (
                      <text
                        className="spk-chart-tick"
                        x={m.left + Math.max(row.topRight, row.bottomRight) + 8}
                        y={m.top + row.y + row.height / 2}
                        dominantBaseline="middle"
                      >
                        {outside}
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

export function PyramidChart(props: FunnelChartProps) {
  return <FunnelChart {...props} variant="pyramid" />;
}

export type SankeyChartProps = {
  series: { data: SankeyNode[]; links: SankeyLink[] };
  height?: number;
  width?: number;
  colors?: string[];
  className?: string;
};

export function SankeyChart({ series, height = 300, width, colors, className }: SankeyChartProps) {
  const { hover, setHover, clear } = useChartHover();
  return (
    <ChartFrame
      slot="sankey-chart"
      className={className}
      width={width}
      height={height}
      margin={{ top: 12, right: 88, bottom: 12, left: 12 }}
      hover={hover}
      aria-label="Sankey chart"
    >
      {({ width: w, height: h, m }) => {
        const layout = sankeyLayout(series.data, series.links, w - m.left - m.right, h - m.top - m.bottom);
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {layout.links.map((link, i) => (
              <path
                key={`${link.source}-${link.target}-${i}`}
                d={link.path}
                transform={`translate(${m.left} ${m.top})`}
                fill={chartColor(i, colors)}
                fillOpacity={0.28}
                className="spk-chart-mark"
                onMouseEnter={(event) =>
                  setHover({
                    x: event.nativeEvent.offsetX,
                    y: event.nativeEvent.offsetY,
                    title: `${link.source} → ${link.target}`,
                    items: [
                      {
                        color: chartColor(i, colors),
                        label: "flow",
                        value: formatChartNumber(link.value),
                      },
                    ],
                  })
                }
                onMouseLeave={clear}
              />
            ))}
            {layout.nodes.map((node, i) => (
              <g key={node.id} transform={`translate(${m.left} ${m.top})`}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={4}
                  fill={node.color ?? chartColor(i, colors)}
                />
                <text
                  className="spk-chart-tick"
                  x={node.x + node.width + 6}
                  y={node.y + node.height / 2}
                  dominantBaseline="middle"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export type TreemapProps = {
  series: Array<{ data: TreeNode[] }>;
  height?: number;
  width?: number;
  colors?: string[];
  className?: string;
};

export function Treemap({ series, height = 280, width, colors, className }: TreemapProps) {
  const { hover, setHover, clear } = useChartHover();
  const data = series[0]?.data ?? [];
  return (
    <ChartFrame
      slot="treemap"
      className={className}
      width={width}
      height={height}
      margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
      hover={hover}
      aria-label="Treemap"
    >
      {({ width: w, height: h, m }) => {
        const rects = squarify(data, 0, 0, w - m.left - m.right, h - m.top - m.bottom);
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {rects.map((rect, i) => (
              <g key={rect.id} transform={`translate(${m.left} ${m.top})`}>
                <rect
                  x={rect.x + 1.5}
                  y={rect.y + 1.5}
                  width={Math.max(0, rect.w - 3)}
                  height={Math.max(0, rect.h - 3)}
                  rx={8}
                  fill={rect.color ?? chartColor(i, colors)}
                  className="spk-chart-mark"
                  onMouseEnter={(event) =>
                    setHover({
                      x: event.nativeEvent.offsetX,
                      y: event.nativeEvent.offsetY,
                      title: rect.label,
                      items: [
                        {
                          color: rect.color ?? chartColor(i, colors),
                          label: rect.label,
                          value: formatChartNumber(rect.value),
                        },
                      ],
                    })
                  }
                  onMouseLeave={clear}
                />
                {rect.w > 56 && rect.h > 28 ? (
                  <text
                    className="spk-chart-label"
                    x={rect.x + 10}
                    y={rect.y + 20}
                  >
                    {rect.label}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export type SunburstChartProps = {
  series: Array<{ data: TreeNode[] }>;
  height?: number;
  width?: number;
  colors?: string[];
  className?: string;
};

export function SunburstChart({ series, height = 300, width, colors, className }: SunburstChartProps) {
  const { hover, setHover, clear } = useChartHover();
  const data = series[0]?.data ?? [];
  return (
    <ChartFrame
      slot="sunburst-chart"
      className={className}
      width={width}
      height={height}
      margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
      hover={hover}
      aria-label="Sunburst chart"
    >
      {({ width: w, height: h }) => {
        const cx = w / 2;
        const cy = h / 2;
        const outer = Math.min(w, h) * 0.42;
        const slices = sunburstLayout(data, cx, cy, outer * 0.22, outer);
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {slices.map((slice, i) => (
              <path
                key={`${slice.id}-${i}`}
                d={slice.path}
                fill={slice.color ?? chartColor(slice.depth + i, colors)}
                stroke="var(--background)"
                strokeWidth={1.5}
                className="spk-chart-mark"
                onMouseEnter={(event) =>
                  setHover({
                    x: event.nativeEvent.offsetX,
                    y: event.nativeEvent.offsetY,
                    title: slice.label,
                    items: [
                      {
                        color: slice.color ?? chartColor(i, colors),
                        label: slice.label,
                        value: formatChartNumber(slice.value),
                      },
                    ],
                  })
                }
                onMouseLeave={clear}
              />
            ))}
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export type ChordChartProps = {
  series: { data: string[]; matrix: number[][] };
  height?: number;
  width?: number;
  colors?: string[];
  className?: string;
};

export function ChordChart({ series, height = 300, width, colors, className }: ChordChartProps) {
  const { hover, setHover, clear } = useChartHover();
  const meta = seriesMeta(
    series.data.map((label) => ({ id: label, label })),
    colors,
  );
  return (
    <ChartFrame
      slot="chord-chart"
      className={className}
      width={width}
      height={height}
      margin={{ top: 24, right: 24, bottom: 24, left: 24 }}
      legend={meta}
      hover={hover}
      aria-label="Chord chart"
    >
      {({ width: w, height: h }) => {
        const cx = w / 2;
        const cy = h / 2;
        const outer = Math.min(w, h) * 0.38;
        const inner = outer * 0.9;
        const layout = chordLayout(series.data, series.matrix, cx, cy, inner, outer);
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {layout.ribbons.map((ribbon, i) => (
              <path
                key={`${ribbon.source}-${ribbon.target}-${i}`}
                d={ribbon.path}
                fill={chartColor(ribbon.source, colors)}
                fillOpacity={0.28}
                className="spk-chart-mark"
                onMouseEnter={(event) =>
                  setHover({
                    x: event.nativeEvent.offsetX,
                    y: event.nativeEvent.offsetY,
                    title: `${series.data[ribbon.source]} → ${series.data[ribbon.target]}`,
                    items: [
                      {
                        color: chartColor(ribbon.source, colors),
                        label: "flow",
                        value: formatChartNumber(ribbon.value),
                      },
                    ],
                  })
                }
                onMouseLeave={clear}
              />
            ))}
            {layout.groups.map((group) => (
              <path key={group.label} d={group.path} fill={chartColor(group.index, colors)} />
            ))}
          </svg>
        );
      }}
    </ChartFrame>
  );
}
