import {
  extent,
  formatChartNumber,
  niceTicks,
  pieSlices,
  type ChartAxisConfig,
  type ChartMargin,
} from "../lib/charts";
import { ellipseSlicePath, ellipseWallPath, isoBoxFaces, isoPoint } from "../lib/iso";
import {
  CartesianGrid,
  ChartFrame,
  categoryLabels,
  formatSeriesValue,
  seriesMeta,
  useChartHover,
  useHiddenSeries,
} from "./chart-ui";
import { hoverMark } from "./chart-interaction";
import type { NumericSeries } from "./cartesian-charts";

function box(width: number, height: number, m: Required<ChartMargin>) {
  return {
    left: m.left,
    right: width - m.right,
    top: m.top,
    bottom: height - m.bottom,
    iw: Math.max(1, width - m.left - m.right),
    ih: Math.max(1, height - m.top - m.bottom),
  };
}

export type BarChart3DProps = {
  series: NumericSeries[];
  xAxis?: ChartAxisConfig[];
  yAxis?: ChartAxisConfig[];
  height?: number;
  width?: number;
  colors?: string[];
  hideLegend?: boolean;
  hideGrid?: boolean;
  margin?: ChartMargin;
  className?: string;
  depth?: number;
};

export function BarChart3D({
  series,
  xAxis,
  yAxis,
  height = 280,
  width,
  colors,
  hideLegend,
  hideGrid,
  margin,
  className,
  depth = 14,
}: BarChart3DProps) {
  const meta = seriesMeta(series, colors);
  const ids = meta.map((item) => item.id);
  const { hidden, toggle } = useHiddenSeries(ids);
  const { hover, setHover, clear } = useChartHover();
  const categories = categoryLabels(xAxis?.[0], series[0]?.data?.length ?? 0);
  const values = series.flatMap((item) => (item.data ?? []).map((v) => v ?? 0));
  const domain: [number, number] = [
    yAxis?.[0]?.min ?? Math.min(0, extent(values, 0.08)[0]),
    yAxis?.[0]?.max ?? extent(values, 0.08)[1],
  ];
  const ticks = niceTicks(domain[0], domain[1], 4);

  return (
    <ChartFrame
      slot="bar-chart-3d"
      className={className}
      width={width}
      height={height}
      margin={margin ?? { top: 24, right: 28, bottom: 40, left: 48 }}
      legend={hideLegend ? undefined : meta}
      hiddenIds={hidden}
      onToggleSeries={toggle}
      hover={hover}
      aria-label="3D bar chart"
    >
      {({ width: w, height: h, m }) => {
        const plot = box(w, h, m);
        const originX = plot.left + plot.iw * 0.16;
        const originY = plot.bottom - 6;
        const visible = series
          .map((item, s) => ({ item, info: meta[s]!, s }))
          .filter(({ info }) => !hidden.has(info.id));
        const n = Math.max(categories.length, 1);
        const groupW = Math.max(18, (plot.iw * 0.72) / n);
        const barW = Math.max(8, (groupW * 0.78) / Math.max(visible.length, 1));
        const gap = Math.max(2, (groupW - barW * visible.length) / Math.max(visible.length + 1, 1));
        const maxH = plot.ih * 0.78;
        const yScale = (value: number) =>
          ((value - domain[0]) / (domain[1] - domain[0] || 1)) * maxH;
        const yAt = (value: number) => originY - yScale(value);

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
            {ticks.map((tick) => (
              <text key={tick} className="spk-chart-tick" x={plot.left - 8} y={yAt(tick)} textAnchor="end">
                {formatChartNumber(tick)}
              </text>
            ))}
            {categories.map((label, i) => {
              const x0 = i * groupW;
              const foot = isoPoint(x0 + groupW / 2, 0, depth, originX, originY);
              return (
                <text
                  key={String(label)}
                  className="spk-chart-tick"
                  x={foot.x}
                  y={plot.bottom + 16}
                  textAnchor="middle"
                >
                  {String(label)}
                </text>
              );
            })}
            {categories.flatMap((_, i) =>
              visible.map(({ item, info }, s) => {
                const value = item.data?.[i] ?? 0;
                const barH = Math.max(2, yScale(value));
                const x = i * groupW + gap + s * (barW + gap * 0.2);
                const faces = isoBoxFaces(x, 0, 0, barW, barH, depth, originX, originY);
                const color = info.color;
                return (
                  <g
                    key={`${info.id}-${i}`}
                    className="spk-chart-mark"
                    {...hoverMark({
                      series: info.id,
                      index: i,
                      setHover,
                      clear,
                      tip: {
                        title: String(categories[i]),
                        items: [
                          {
                            color,
                            label: info.label,
                            value: formatSeriesValue(value),
                          },
                        ],
                      },
                    })}
                  >
                    <path d={faces.side} fill={`color-mix(in srgb, ${color} 78%, black)`} />
                    <path d={faces.top} fill={`color-mix(in srgb, ${color} 72%, white)`} />
                    <path d={faces.front} fill={color} />
                  </g>
                );
              }),
            )}
          </svg>
        );
      }}
    </ChartFrame>
  );
}

export type PieChart3DProps = {
  series: Array<{
    data: Array<{ id?: string | number; value: number; label?: string; color?: string }>;
    innerRadius?: number;
    paddingAngle?: number;
  }>;
  height?: number;
  width?: number;
  colors?: string[];
  hideLegend?: boolean;
  margin?: ChartMargin;
  className?: string;
  thickness?: number;
};

export function PieChart3D({
  series,
  height = 280,
  width,
  colors,
  hideLegend,
  margin,
  className,
  thickness = 18,
}: PieChart3DProps) {
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
      slot="pie-chart-3d"
      className={className}
      width={width}
      height={height}
      margin={margin ?? { top: 12, right: 12, bottom: 20, left: 12 }}
      legend={hideLegend ? undefined : meta}
      hiddenIds={hidden}
      onToggleSeries={toggle}
      hover={hover}
      aria-label="3D pie chart"
    >
      {({ width: w, height: h, m }) => {
        const cx = w / 2;
        const cy = (h - thickness) / 2;
        const rx = Math.min(w - m.left - m.right, (h - m.top - m.bottom - thickness) * 1.7) / 2;
        const ry = rx * 0.42;
        const visible = first.data.map((item, i) => (hidden.has(meta[i]!.id) ? 0 : item.value));
        const slices = pieSlices(visible, {
          cx,
          cy,
          innerRadius: 0,
          outerRadius: rx,
          paddingAngle: first.paddingAngle,
        });
        const ordered = slices
          .map((slice, i) => ({ slice, info: meta[i]!, item: first.data[i]! }))
          .filter(({ info, slice }) => !hidden.has(info.id) && slice.path)
          .sort((a, b) => ellipsePointY(cx, cy, rx, ry, a.slice.midAngle) - ellipsePointY(cx, cy, rx, ry, b.slice.midAngle));

        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {ordered.map(({ slice, info, item }) => (
              <g
                key={`${info.id}-wall`}
                className="spk-chart-mark"
                onMouseEnter={(event) =>
                  setHover({
                    x: event.nativeEvent.offsetX,
                    y: event.nativeEvent.offsetY,
                    title: info.label,
                    items: [
                      {
                        color: info.color,
                        label: info.label,
                        value: `${formatChartNumber(item.value)} (${Math.round(slice.percent * 100)}%)`,
                      },
                    ],
                  })
                }
                onMouseLeave={clear}
              >
                <path
                  d={ellipseWallPath(cx, cy, rx, ry, slice.startAngle, slice.endAngle, thickness)}
                  fill={`color-mix(in srgb, ${info.color} 70%, black)`}
                />
              </g>
            ))}
            {ordered.map(({ slice, info, item }) => (
              <g
                key={info.id}
                className="spk-chart-mark"
                {...hoverMark({
                  series: "slices",
                  index: meta.indexOf(info),
                  setHover,
                  clear,
                  tip: {
                    title: info.label,
                    items: [
                      {
                        color: info.color,
                        label: info.label,
                        value: `${formatChartNumber(item.value)} (${Math.round(slice.percent * 100)}%)`,
                      },
                    ],
                  },
                })}
              >
                <path
                  d={ellipseSlicePath(cx, cy, rx, ry, slice.startAngle, slice.endAngle)}
                  fill={info.color}
                />
                {slice.percent > 0.08 ? (
                  <text
                    className="spk-chart-label"
                    x={cx + Math.cos(((slice.midAngle - 90) * Math.PI) / 180) * rx * 0.55}
                    y={cy + Math.sin(((slice.midAngle - 90) * Math.PI) / 180) * ry * 0.55}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--primary-foreground)"
                  >
                    {Math.round(slice.percent * 100)}%
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

function ellipsePointY(cx: number, cy: number, rx: number, ry: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return cy + ry * Math.sin(rad);
}
