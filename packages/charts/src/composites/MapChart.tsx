import { chartColor, formatChartNumber, type ChartMargin } from "../lib/charts";
import {
  featureId,
  fitFeatures,
  geoPath,
  type GeoJsonFeatureCollection,
  type GeoProjectionKind,
} from "../lib/geo";
import { ChartFrame, useChartHover } from "./chart-ui";

export type MapShapeDatum = {
  id: string | number;
  value: number;
  label?: string;
  color?: string;
};

export type MapChartProps = {
  geoData: GeoJsonFeatureCollection;
  series?: Array<{ data: MapShapeDatum[] }>;
  idProperty?: string;
  projection?: GeoProjectionKind;
  height?: number;
  width?: number;
  colors?: string[];
  hideLegend?: boolean;
  margin?: ChartMargin;
  className?: string;
};

export function MapChart({
  geoData,
  series,
  idProperty = "id",
  projection = "mercator",
  height = 280,
  width,
  colors,
  hideLegend,
  margin,
  className,
}: MapChartProps) {
  const features = geoData.features ?? [];
  const data = series?.[0]?.data ?? [];
  const byId = new Map(data.map((item) => [String(item.id), item]));
  const values = data.map((item) => item.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const { hover, setHover, clear } = useChartHover();
  const legend = hideLegend
    ? undefined
    : data.slice(0, 8).map((item, i) => ({
        id: String(item.id),
        label: item.label ?? String(item.id),
        color: item.color ?? choroplethFill(item.value, min, max, i, colors),
      }));

  return (
    <ChartFrame
      slot="map-chart"
      className={className}
      width={width}
      height={height}
      margin={margin ?? { top: 8, right: 8, bottom: 8, left: 8 }}
      legend={legend}
      hover={hover}
      aria-label="Map chart"
    >
      {({ width: w, height: h, m }) => {
        const pad = Math.min(m.left, m.right, m.top, m.bottom);
        const project = fitFeatures(features, w, h, pad, projection);
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {features.map((feature, i) => {
              if (!feature.geometry) return null;
              const id = featureId(feature, idProperty) || String(i);
              const datum = byId.get(id);
              const label =
                datum?.label ??
                (feature.properties?.name != null ? String(feature.properties.name) : id);
              const fill = datum
                ? (datum.color ?? choroplethFill(datum.value, min, max, i, colors))
                : "color-mix(in srgb, var(--muted) 55%, transparent)";
              const d = geoPath(feature.geometry, project);
              if (!d) return null;
              return (
                <path
                  key={id}
                  d={d}
                  fill={fill}
                  className="spk-chart-map-region spk-chart-mark"
                  onMouseEnter={(event) =>
                    setHover({
                      x: event.nativeEvent.offsetX,
                      y: event.nativeEvent.offsetY,
                      title: label,
                      items: datum
                        ? [
                            {
                              color: fill,
                              label: label,
                              value: formatChartNumber(datum.value),
                            },
                          ]
                        : [{ color: fill, label: label, value: "—" }],
                    })
                  }
                  onMouseLeave={clear}
                />
              );
            })}
          </svg>
        );
      }}
    </ChartFrame>
  );
}

function choroplethFill(
  value: number,
  min: number,
  max: number,
  index: number,
  colors?: string[],
): string {
  const t = max === min ? 0.6 : (value - min) / (max - min);
  const base = chartColor(index, colors);
  const mix = Math.round(28 + t * 72);
  return `color-mix(in srgb, ${base} ${mix}%, var(--muted))`;
}
