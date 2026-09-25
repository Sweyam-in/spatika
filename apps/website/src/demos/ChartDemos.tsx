import {
  AreaChart,
  BarChart,
  BarChart3D,
  BarPlot,
  BoxPlotChart,
  BubbleChart,
  CandlestickChart,
  ChartContainer,
  ChartDataGrid,
  ChartSurface,
  ChartsBrush,
  ChartsGrid,
  ChartsReferenceLine,
  ChartsXAxis,
  ChartsYAxis,
  ChordChart,
  FunnelChart,
  Gauge,
  Heatmap,
  LineChart,
  LinePlot,
  LinearGauge,
  MapChart,
  OhlcChart,
  PieChart,
  PieChart3D,
  PolarLineChart,
  PyramidChart,
  RadarChart,
  RadialBarChart,
  RadialLineChart,
  RangeAreaChart,
  RangeBarChart,
  SankeyChart,
  ScatterChart,
  SparkLineChart,
  SunburstChart,
  Treemap,
  WaterfallChart,
  type GeoJsonFeatureCollection,
} from "@spatika/charts";
import type { ReactNode } from "react";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

/** Chart height in the gallery's scaled card stage (compact) and on the component page. */
const COMPACT_HEIGHT = 200;

function h(compact?: boolean, full = 240) {
  return compact ? COMPACT_HEIGHT : full;
}

function scatterCloud(count: number, seed: number, ox = 0, oy = 0) {
  let s = seed;
  const next = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  return Array.from({ length: count }, (_, i) => ({
    x: ox + next() * 80,
    y: oy + next() * 55,
    id: `${seed}-${i}`,
  }));
}

function territory(
  id: string,
  name: string,
  ring: Array<[number, number]>,
): GeoJsonFeatureCollection["features"][number] {
  return {
    type: "Feature",
    id,
    properties: { name },
    geometry: { type: "Polygon", coordinates: [ring] },
  };
}

const territoryGeo: GeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [
    territory("north", "North", [
      [8, 38],
      [28, 42],
      [34, 34],
      [18, 30],
      [6, 33],
      [8, 38],
    ]),
    territory("east", "East", [
      [34, 34],
      [48, 36],
      [52, 24],
      [38, 20],
      [32, 26],
      [34, 34],
    ]),
    territory("south", "South", [
      [16, 22],
      [36, 18],
      [34, 8],
      [18, 6],
      [10, 14],
      [16, 22],
    ]),
    territory("west", "West", [
      [-4, 32],
      [10, 34],
      [14, 22],
      [4, 16],
      [-6, 20],
      [-4, 32],
    ]),
    territory("isle", "Isle", [
      [42, 14],
      [50, 16],
      [52, 10],
      [44, 7],
      [40, 10],
      [42, 14],
    ]),
  ],
};

const gridRows = [
  { id: "web", name: "Web", views: 420, share: 42, trend: [8, 12, 9, 16, 18, 22] },
  { id: "ios", name: "iOS", views: 280, share: 28, trend: [4, 6, 8, 7, 10, 12] },
  { id: "and", name: "Android", views: 180, share: 18, trend: [3, 4, 5, 8, 7, 9] },
  { id: "other", name: "Other", views: 120, share: 12, trend: [2, 2, 3, 2, 4, 5] },
];

export function chartDemos(compact?: boolean): Record<string, ReactNode> {
  const height = h(compact);
  const hideLegend = Boolean(compact);

  return {
    "bar-chart": (
      <BarChart
        height={height}
        hideLegend={hideLegend}
        zoom={!compact}
        showToolbar={!compact}
        highlightScope="series"
        xAxis={[{ data: months }]}
        series={[
          { label: "Views", data: [420, 380, 510, 460, 590, 640] },
          { label: "Signups", data: [120, 150, 140, 180, 210, 240] },
        ]}
      />
    ),
    "chart-container": compact ? (
      <ChartContainer
        height={COMPACT_HEIGHT}
        hideLegend
        dataset={[
          { month: "Jan", views: 42, conv: 12 },
          { month: "Feb", views: 38, conv: 16 },
          { month: "Mar", views: 51, conv: 14 },
        ]}
        xAxis={[{ dataKey: "month" }]}
        series={[
          { type: "bar", dataKey: "views", label: "Views" },
          { type: "line", dataKey: "conv", label: "Conv." },
        ]}
      />
    ) : (
      <ChartContainer
        height={280}
        zoom
        showToolbar
        highlightScope="series"
        dataset={[
          { month: "Jan", views: 420, conv: 12 },
          { month: "Feb", views: 380, conv: 18 },
          { month: "Mar", views: 510, conv: 16 },
          { month: "Apr", views: 460, conv: 24 },
          { month: "May", views: 590, conv: 28 },
          { month: "Jun", views: 640, conv: 34 },
        ]}
        xAxis={[{ dataKey: "month" }]}
        yAxis={[{ id: "left" }, { id: "right", position: "right" }]}
        series={[
          { type: "bar", dataKey: "views", label: "Views" },
          { type: "line", dataKey: "conv", label: "Conversion", yAxisId: "right" },
        ]}
        referenceLines={[{ y: 500, label: "Target" }]}
      >
        <ChartSurface>
          <ChartsGrid />
          <BarPlot />
          <LinePlot />
          <ChartsXAxis />
          <ChartsYAxis />
          <ChartsYAxis position="right" />
          <ChartsReferenceLine />
          <ChartsBrush />
        </ChartSurface>
      </ChartContainer>
    ),
    "line-chart": (
      <LineChart
        height={height}
        hideLegend={hideLegend}
        xAxis={[{ data: months }]}
        series={[
          { label: "Revenue", data: [12, 18, 16, 24, 28, 34] },
          { label: "Cost", data: [8, 9, 11, 12, 13, 15] },
        ]}
      />
    ),
    "area-chart": (
      <AreaChart
        height={height}
        hideLegend={hideLegend}
        stacked={!compact}
        showMark={false}
        referenceLines={compact ? undefined : [{ y: 80, label: "Capacity" }]}
        xAxis={[{ data: months }]}
        series={[
          { label: "v1", data: [20, 28, 32, 30, 36, 40] },
          { label: "v2", data: [48, 62, 70, 88, 96, 110] },
          { label: "v3", data: [8, 12, 18, 24, 38, 52] },
        ]}
      />
    ),
    "pie-chart": (
      <PieChart
        height={height}
        hideLegend={hideLegend}
        series={[
          {
            innerRadius: compact ? 40 : 48,
            paddingAngle: 2,
            data: [
              { id: "web", value: 42, label: "Web" },
              { id: "ios", value: 28, label: "iOS" },
              { id: "and", value: 18, label: "Android" },
              { id: "other", value: 12, label: "Other" },
            ],
          },
        ]}
      />
    ),
    "scatter-chart": (
      <ScatterChart
        height={height}
        hideLegend={hideLegend}
        series={[
          {
            label: "Cohort A",
            data: [
              { x: 12, y: 28, id: 1 },
              { x: 22, y: 36, id: 2 },
              { x: 31, y: 24, id: 3 },
              { x: 44, y: 48, id: 4 },
              { x: 58, y: 40, id: 5 },
            ],
          },
          {
            label: "Cohort B",
            data: [
              { x: 18, y: 18, id: 6 },
              { x: 28, y: 22, id: 7 },
              { x: 40, y: 30, id: 8 },
              { x: 52, y: 26, id: 9 },
            ],
          },
        ]}
      />
    ),
    sparkline: (
      <SparkLineChart data={[8, 12, 9, 16, 14, 22, 18, 26, 24, 30]} height={compact ? 120 : 64} />
    ),
    gauge: compact ? (
      <Gauge value={72} height={height} />
    ) : (
      <Gauge
        height={height}
        startAngle={-90}
        endAngle={90}
        sections={[
          { value: 40, label: "v5" },
          { value: 35, label: "v6" },
          { value: 25, label: "v7" },
        ]}
      />
    ),
    "radar-chart": (
      <RadarChart
        height={compact ? COMPACT_HEIGHT : 280}
        hideLegend={hideLegend}
        radar={{ metrics: ["Speed", "Reliability", "UX", "A11y", "Docs", "Theming"] }}
        series={[
          { label: "Spatika", data: [90, 86, 92, 88, 84, 95] },
          { label: "Baseline", data: [60, 70, 55, 62, 50, 48] },
        ]}
      />
    ),
    heatmap: (
      <Heatmap
        height={height}
        hideLegend={hideLegend}
        showCellLabels={!compact}
        xAxis={[{ data: compact ? ["Mon", "Tue", "Wed", "Thu", "Fri"] : ["M", "T", "W", "T", "F", "S", "S"] }]}
        yAxis={[{ data: compact ? ["AM", "Mid", "PM"] : ["6am", "10am", "2pm", "6pm"] }]}
        series={[
          {
            data: (compact
              ? [
                  [4, 8, 6, 10, 7],
                  [12, 16, 14, 18, 11],
                  [3, 5, 9, 6, 4],
                ]
              : [
                  [12, 18, 22, 40, 28, 8, 4],
                  [30, 44, 36, 62, 80, 16, 6],
                  [48, 70, 55, 90, 100, 22, 10],
                  [8, 14, 20, 28, 18, 6, 2],
                ]
            ).flatMap((row, y) => row.map((value, x) => ({ x, y, value }))),
          },
        ]}
      />
    ),
    "funnel-chart": compact ? (
      <FunnelChart
        height={height}
        hideLegend
        series={[
          {
            data: [
              { label: "Visit", value: 1200 },
              { label: "Signup", value: 640 },
              { label: "Trial", value: 280 },
              { label: "Paid", value: 96 },
            ],
          },
        ]}
      />
    ) : (
      <FunnelChart
        height={height}
        valueFormatter={(value) => `${value}%`}
        series={[
          {
            label: "2000",
            data: [
              { label: "Primary", value: 85 },
              { label: "Lower secondary", value: 74 },
              { label: "Secondary", value: 50 },
              { label: "Tertiary", value: 19 },
            ],
          },
          {
            label: "2020",
            data: [
              { label: "Primary", value: 90 },
              { label: "Lower secondary", value: 85 },
              { label: "Secondary", value: 67 },
              { label: "Tertiary", value: 40 },
            ],
          },
        ]}
      />
    ),
    "pyramid-chart": (
      <PyramidChart
        height={height}
        hideLegend={hideLegend}
        series={[
          {
            data: [
              { label: "Exec", value: 8 },
              { label: "Lead", value: 22 },
              { label: "IC", value: 64 },
              { label: "Intern", value: 18 },
            ],
          },
        ]}
      />
    ),
    "sankey-chart": (
      <SankeyChart
        height={height}
        series={{
          data: [
            { id: "docs" },
            { id: "npm" },
            { id: "github" },
            { id: "trial" },
            { id: "paid" },
          ],
          links: [
            { source: "docs", target: "trial", value: 40 },
            { source: "npm", target: "trial", value: 28 },
            { source: "github", target: "trial", value: 16 },
            { source: "trial", target: "paid", value: 32 },
          ],
        }}
      />
    ),
    "range-bar-chart": (
      <RangeBarChart
        height={height}
        hideLegend={hideLegend}
        xAxis={[{ data: ["Alpha", "Beta", "GA"] }]}
        series={[{ label: "Window", data: [[2, 8], [4, 12], [6, 14]] }]}
      />
    ),
    "candlestick-chart": (
      <CandlestickChart
        height={height}
        xAxis={[{ data: ["Mon", "Tue", "Wed", "Thu", "Fri"] }]}
        series={[
          {
            data: [
              { open: 20, high: 28, low: 18, close: 26 },
              { open: 26, high: 30, low: 22, close: 23 },
              { open: 23, high: 27, low: 21, close: 25 },
              { open: 25, high: 32, low: 24, close: 31 },
              { open: 31, high: 33, low: 26, close: 27 },
            ],
          },
        ]}
      />
    ),
    "radial-bar-chart": (
      <RadialBarChart
        height={height}
        hideLegend={hideLegend}
        series={[
          {
            data: [
              { label: "Mukta", value: 92 },
              { label: "Neelam", value: 74 },
              { label: "Usha", value: 61 },
              { label: "Sandhya", value: 48 },
            ],
          },
        ]}
      />
    ),
    "radial-line-chart": (
      <RadialLineChart
        height={compact ? COMPACT_HEIGHT : 260}
        hideLegend={hideLegend}
        metrics={["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]}
        series={[{ label: "Latency", data: [40, 62, 55, 80, 48, 70] }]}
      />
    ),
    "linear-gauge": <LinearGauge value={64} height={48} />,
    "bubble-chart": (
      <BubbleChart
        height={height}
        hideLegend={hideLegend}
        series={[
          {
            label: "Markets",
            data: [
              { x: 10, y: 20, z: 12, id: 1 },
              { x: 25, y: 35, z: 28, id: 2 },
              { x: 40, y: 22, z: 18, id: 3 },
              { x: 55, y: 44, z: 36, id: 4 },
              { x: 70, y: 30, z: 22, id: 5 },
            ],
          },
        ]}
      />
    ),
    "range-area-chart": (
      <RangeAreaChart
        height={height}
        hideLegend={hideLegend}
        xAxis={[{ data: months }]}
        series={[{ label: "Band", data: [[8, 14], [10, 18], [9, 16], [12, 22], [14, 24], [16, 28]] }]}
      />
    ),
    treemap: (
      <Treemap
        height={height}
        series={[
          {
            data: [
              { label: "Chrome", value: 48 },
              { label: "Safari", value: 22 },
              { label: "Firefox", value: 16 },
              { label: "Edge", value: 10 },
              { label: "Other", value: 4 },
            ],
          },
        ]}
      />
    ),
    "polar-line-chart": (
      <PolarLineChart
        height={compact ? COMPACT_HEIGHT : 260}
        hideLegend={hideLegend}
        radar={{ metrics: ["CPU", "RAM", "Disk", "Net", "GPU"] }}
        series={[{ label: "Load", data: [70, 55, 40, 80, 30] }]}
      />
    ),
    "chord-chart": (
      <ChordChart
        height={height}
        series={{
          data: ["Docs", "App", "API", "CLI"],
          matrix: [
            [0, 8, 4, 2],
            [6, 0, 7, 3],
            [3, 5, 0, 6],
            [2, 2, 4, 0],
          ],
        }}
      />
    ),
    "waterfall-chart": (
      <WaterfallChart
        height={height}
        hideLegend
        xAxis={[{ data: ["Start", "New", "Churn", "Expand", "End"] }]}
        series={[{ data: [120, 40, -18, 22, null] }]}
      />
    ),
    "boxplot-chart": (
      <BoxPlotChart
        height={height}
        hideLegend={hideLegend}
        xAxis={[{ data: ["Mukta", "Neelam", "Usha"] }]}
        series={[
          {
            label: "CLS",
            data: [
              [0.02, 0.04, 0.05, 0.06, 0.08, 0.12],
              [0.03, 0.05, 0.06, 0.07, 0.09, 0.15],
              [0.01, 0.03, 0.04, 0.05, 0.07, 0.1],
            ],
          },
        ]}
      />
    ),
    "ohlc-chart": (
      <OhlcChart
        height={height}
        xAxis={[{ data: ["Mon", "Tue", "Wed", "Thu", "Fri"] }]}
        series={[
          {
            data: [
              { open: 20, high: 28, low: 18, close: 26 },
              { open: 26, high: 30, low: 22, close: 23 },
              { open: 23, high: 27, low: 21, close: 25 },
              { open: 25, high: 32, low: 24, close: 31 },
              { open: 31, high: 33, low: 26, close: 27 },
            ],
          },
        ]}
      />
    ),
    "sunburst-chart": (
      <SunburstChart
        height={height}
        series={[
          {
            data: [
              {
                label: "Product",
                children: [
                  { label: "App", value: 40 },
                  { label: "Docs", value: 22 },
                ],
              },
              {
                label: "Platform",
                children: [
                  { label: "Tokens", value: 18 },
                  { label: "Charts", value: 20 },
                ],
              },
            ],
          },
        ]}
      />
    ),
    "scatter-webgl": (
      <ScatterChart
        height={height}
        hideLegend={hideLegend}
        renderer="webgl"
        series={[
          { label: "Cohort A", data: scatterCloud(compact ? 80 : 2500, 17) },
          { label: "Cohort B", data: scatterCloud(compact ? 60 : 1800, 29, 12, 8) },
        ]}
      />
    ),
    "map-chart": (
      <MapChart
        height={height}
        hideLegend={hideLegend}
        geoData={territoryGeo}
        series={[
          {
            data: [
              { id: "north", value: 64, label: "North" },
              { id: "east", value: 48, label: "East" },
              { id: "south", value: 31, label: "South" },
              { id: "west", value: 22, label: "West" },
              { id: "isle", value: 12, label: "Isle" },
            ],
          },
        ]}
      />
    ),
    "bar-chart-3d": (
      <BarChart3D
        height={height}
        hideLegend={hideLegend}
        xAxis={[{ data: months.slice(0, compact ? 4 : 6) }]}
        series={[
          { label: "Views", data: [42, 38, 51, 46, 59, 64].slice(0, compact ? 4 : 6) },
          { label: "Signups", data: [12, 15, 14, 18, 21, 24].slice(0, compact ? 4 : 6) },
        ]}
      />
    ),
    "pie-chart-3d": (
      <PieChart3D
        height={height}
        hideLegend={hideLegend}
        series={[
          {
            data: [
              { id: "web", value: 42, label: "Web" },
              { id: "ios", value: 28, label: "iOS" },
              { id: "and", value: 18, label: "Android" },
              { id: "other", value: 12, label: "Other" },
            ],
          },
        ]}
      />
    ),
    "chart-data-grid": (
      <ChartDataGrid
        height={compact ? COMPACT_HEIGHT : 180}
        categoryField="name"
        valueField="views"
        rows={gridRows}
        columns={[
          { field: "name", headerName: "Channel" },
          { field: "views", headerName: "Views", type: "number" },
          { field: "share", headerName: "Share", type: "bar" },
          { field: "trend", headerName: "Trend", type: "sparkline" },
        ]}
      />
    ),
  };
}
