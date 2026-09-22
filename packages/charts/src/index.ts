"use client";

/**
 * @spatika/charts — Spatika SVG charts
 *
 * Import tokens once at the app root:
 *   import "@spatika/tokens/styles.css";
 *
 * Theme colors use CSS variables (`--chart-1` … `--chart-5`).
 */

export {
  CHART_COLOR_VARS,
  chartColor,
  formatChartNumber,
  formatAxisNumber,
  resolveChartRadius,
  categoryLabelGutter,
  fitCategoryLabel,
  seriesDataFromDataset,
  axisDataFromDataset,
  clampZoom,
  DEFAULT_ZOOM,
  stackSeries,
  errorBarRange,
  pieLabelLine,
  seriesHasPlottableData,
} from "./lib/charts";
export type {
  ChartAxisConfig,
  ChartCurve,
  ChartDataset,
  ChartErrorValue,
  ChartInteraction,
  ChartLegendPosition,
  ChartMargin,
  ChartRadius,
  ChartZoom,
  HighlightScope,
  SankeyLink,
  SankeyNode,
  StackOffset,
  TreeNode,
} from "./lib/charts";
export { serializeChartSvg, exportChart, downloadChartSvg, downloadChartPng } from "./lib/chart-export";
export {
  ChartContainer,
  ComposedChart,
  ResponsiveContainer,
  ChartSurface,
  ChartsGrid,
  ChartsXAxis,
  ChartsYAxis,
  ChartsLegend,
  ChartsToolbar,
  ChartsBrush,
  ChartsCursor,
  ChartsReferenceLine,
  ChartsReferenceArea,
  ChartsReferenceDot,
  ChartsErrorBar,
  BarPlot,
  LinePlot,
  AreaPlot,
  ScatterPlot,
  useChartContext,
} from "./composites/chart-composition";
export type {
  ChartContainerProps,
  ComposedSeries,
  ComposedSeriesType,
  HighlightedItem,
  ResponsiveContainerProps,
} from "./composites/chart-composition";
export type {
  ChartHover,
  ChartItemEvent,
  ChartMarkRenderContext,
  ChartReferenceArea,
  ChartReferenceDot,
  ChartReferenceLine,
  ChartTooltipItem,
  ChartTooltipRenderer,
  ChartTooltipTrigger,
} from "./composites/chart-interaction";
export {
  AreaChart,
  BarChart,
  BoxPlotChart,
  BubbleChart,
  CandlestickChart,
  LineChart,
  OhlcChart,
  RangeAreaChart,
  RangeBarChart,
  ScatterChart,
  SparkLineChart,
  WaterfallChart,
} from "./composites/cartesian-charts";
export type {
  BarChartProps,
  BoxPlotChartProps,
  CandleDatum,
  CandlestickChartProps,
  CartesianChartProps,
  LineChartProps,
  NumericSeries,
  RangeAreaChartProps,
  RangeBarChartProps,
  RangeSeries,
  ScatterChartProps,
  ScatterPoint,
  ScatterRenderer,
  ScatterSeries,
  SparkLineChartProps,
  WaterfallChartProps,
} from "./composites/cartesian-charts";
export {
  Gauge,
  LinearGauge,
  PieChart,
  PolarLineChart,
  RadarChart,
  RadialBarChart,
  RadialLineChart,
} from "./composites/radial-charts";
export type {
  GaugeProps,
  GaugeSection,
  LinearGaugeProps,
  PieChartProps,
  PieDatum,
  PieSeries,
  RadarChartProps,
  RadarSeries,
  RadialBarChartProps,
  RadialLineChartProps,
} from "./composites/radial-charts";
export {
  ChordChart,
  FunnelChart,
  Heatmap,
  PyramidChart,
  SankeyChart,
  SunburstChart,
  Treemap,
} from "./composites/flow-charts";
export type {
  ChordChartProps,
  FunnelChartProps,
  FunnelDatum,
  FunnelLabelPosition,
  FunnelSeries,
  HeatDatum,
  HeatmapProps,
  SankeyChartProps,
  SunburstChartProps,
  TreemapProps,
} from "./composites/flow-charts";
export { MapChart } from "./composites/MapChart";
export type { MapChartProps, MapShapeDatum } from "./composites/MapChart";
export { BarChart3D, PieChart3D } from "./composites/charts-3d";
export type { BarChart3DProps, PieChart3DProps } from "./composites/charts-3d";
export { ChartDataGrid, renderChartCell } from "./composites/ChartDataGrid";
export type {
  ChartDataGridProps,
  ChartDataGridRow,
  ChartGridColumn,
  ChartGridColumnType,
} from "./composites/ChartDataGrid";
export {
  mercator,
  equirectangular,
  geoPath,
  fitFeatures,
  featureId,
} from "./lib/geo";
export type {
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  GeoJsonGeometry,
  GeoProjectionKind,
} from "./lib/geo";
