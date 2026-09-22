# @spatika/charts

Production SVG charts for **Spatika UI**. Install this package when an app needs plots; skip it when you only need chrome and forms from `@spatika/react`.

**Docs:** [spatika.sweyam.com](https://spatika.sweyam.com) · Charts catalog: [BarChart](https://spatika.sweyam.com/components/bar-chart)

Peer of [Recharts](https://github.com/recharts/recharts) in spirit (declarative React + SVG) with Spatika tokens, overlay tooltips, and extra types (candlestick, waterfall, sankey, maps, 3D).

## Install

```bash
npm install @spatika/charts @spatika/tokens
```

Peer dependencies: `react` and `react-dom` (^18 or ^19).

Charts read theme CSS variables (`--spk-viz-1` … `--spk-viz-8`, exposed as `--chart-1` …, plus overlay tooltip surfaces). Import tokens once at the app root:

```tsx
import "@spatika/tokens/styles.css";
import { BarChart } from "@spatika/charts";

<BarChart
  height={240}
  xAxis={[{ data: ["Jan", "Feb", "Mar"] }]}
  series={[{ label: "Views", data: [420, 380, 510] }]}
/>
```

`@spatika/react` re-exports the same components for existing apps. New chart-only projects should import from `@spatika/charts`.

## Compared with Recharts

| Capability | Recharts | `@spatika/charts` |
|---|---|---|
| Cartesian (bar, line, area, scatter, composed) | Yes | Yes — plus box plot, waterfall, candlestick, OHLC, range, sparkline |
| Polar (pie, radar, radial bar) | Yes | Yes — plus polar line, gauge |
| Flow (funnel, treemap, sankey) | Yes | Yes — plus chord, pyramid, sunburst, heatmap |
| Composition (`XAxis` / `Tooltip` children) | Primary API | `ChartContainer` + `BarPlot` / `LinePlot` / `ChartsXAxis` |
| `ResponsiveContainer` | Yes | Yes (`fillHeight` or `ResponsiveContainer`) |
| `syncId` linked hover | Yes | Yes |
| Brush / zoom / pan | Brush | Brush, wheel zoom, pan, toolbar export |
| Reference line / area / dot | Yes | Yes |
| Error bars | Yes | Yes (`series.error`) |
| Stack offset (`expand` 100%) | Yes | Yes (`stackOffset="expand"`) |
| Shared tooltip + cursor | Yes | Yes |
| Theme design tokens | Manual hex | CSS variables, four Spatika themes |
| Maps, WebGL scatter, isometric 3D | No | Yes |

## Quick composition

```tsx
import {
  BarPlot,
  ChartContainer,
  ChartSurface,
  ChartsCursor,
  ChartsGrid,
  ChartsReferenceArea,
  ChartsReferenceLine,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
} from "@spatika/charts";

<ChartContainer
  height={280}
  zoom
  showToolbar
  syncId="traffic"
  sharedTooltip
  dataset={[
    { month: "Jan", views: 420, conv: 12 },
    { month: "Feb", views: 380, conv: 18 },
  ]}
  xAxis={[{ dataKey: "month" }]}
  series={[
    { type: "bar", dataKey: "views", label: "Views" },
    { type: "line", dataKey: "conv", label: "Conversion" },
  ]}
  referenceLines={[{ y: 400, label: "Goal" }]}
>
  <ChartSurface>
    <ChartsGrid />
    <ChartsReferenceArea />
    <BarPlot />
    <LinePlot />
    <ChartsCursor />
    <ChartsXAxis />
    <ChartsYAxis />
    <ChartsReferenceLine />
  </ChartSurface>
</ChartContainer>
```

## License

MIT
