import { describe, expect, it } from "vitest";
import {
  arcPath,
  axisDataFromDataset,
  boxPlotStats,
  categoryLabelGutter,
  chartColor,
  errorBarRange,
  extent,
  fitCategoryLabel,
  formatAxisNumber,
  formatChartNumber,
  funnelLayout,
  linePath,
  niceDomain,
  niceTicks,
  pieSlices,
  pieLabelLine,
  resolveChartRadius,
  seriesDataFromDataset,
  seriesHasPlottableData,
  splitDefinedSegments,
  stackSeries,
  squarify,
  waterfallBars,
  wheelZoom,
} from "./charts";

describe("chart math", () => {
  it("builds nice ticks across a domain", () => {
    const ticks = niceTicks(0, 100, 5);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(100);
    expect(ticks.length).toBeGreaterThan(2);
  });

  it("stacks positive and negative series independently", () => {
    const stacked = stackSeries([
      [2, -1],
      [3, -2],
    ]);
    expect(stacked[0]![0]).toEqual({ start: 0, end: 2 });
    expect(stacked[1]![0]).toEqual({ start: 2, end: 5 });
    expect(stacked[0]![1]).toEqual({ start: 0, end: -1 });
    expect(stacked[1]![1]).toEqual({ start: -1, end: -3 });
  });

  it("lays out pie slices that sum to a full turn", () => {
    const slices = pieSlices([1, 1, 2], {
      cx: 50,
      cy: 50,
      innerRadius: 10,
      outerRadius: 40,
    });
    expect(slices).toHaveLength(3);
    expect(slices[2]!.percent).toBeCloseTo(0.5);
    expect(slices.every((slice) => slice.path.length > 0)).toBe(true);
  });

  it("draws linear and monotone line paths", () => {
    const pts = [
      { x: 0, y: 10 },
      { x: 10, y: 0 },
      { x: 20, y: 8 },
    ];
    expect(linePath(pts, "linear")).toContain("L");
    expect(linePath(pts, "monotone")).toContain("C");
  });

  it("computes box-plot fences and outliers", () => {
    const stats = boxPlotStats([1, 2, 3, 4, 5, 100]);
    expect(stats.median).toBe(3.5);
    expect(stats.outliers).toEqual([100]);
  });

  it("builds waterfall running totals", () => {
    const bars = waterfallBars([100, 20, -30, null]);
    expect(bars[3]).toEqual({ index: 3, start: 0, end: 90, value: 90, total: true });
  });

  it("packs a treemap that fills the viewport", () => {
    const rects = squarify(
      [
        { label: "A", value: 6 },
        { label: "B", value: 4 },
      ],
      0,
      0,
      100,
      50,
    );
    const area = rects.reduce((sum, rect) => sum + rect.w * rect.h, 0);
    expect(area).toBeCloseTo(5000, 0);
  });

  it("lays out funnel rows from wide to narrow", () => {
    const rows = funnelLayout(
      [
        { label: "A", value: 10 },
        { label: "B", value: 5 },
      ],
      100,
      80,
    );
    expect(rows[0]!.topRight - rows[0]!.topLeft).toBeGreaterThan(rows[1]!.topRight - rows[1]!.topLeft);
  });

  it("shares a max so comparison funnels stay on the same scale", () => {
    const inner = funnelLayout([{ label: "A", value: 50 }], 100, 40, 6, 100);
    const outer = funnelLayout([{ label: "A", value: 100 }], 100, 40, 6, 100);
    expect(outer[0]!.topRight - outer[0]!.topLeft).toBe(100);
    expect(inner[0]!.topRight - inner[0]!.topLeft).toBe(50);
  });

  it("zooms a window around an anchor", () => {
    const next = wheelZoom({ x: [0, 1] }, 0.5, 0.5);
    expect(next.x[1] - next.x[0]).toBeCloseTo(0.5);
    expect(next.x[0]).toBeGreaterThan(0);
    expect(next.x[1]).toBeLessThan(1);
  });

  it("reads series from a dataset", () => {
    const dataset = [
      { month: "Jan", views: 10 },
      { month: "Feb", views: 20 },
    ];
    expect(seriesDataFromDataset(dataset, "views")).toEqual([10, 20]);
    expect(axisDataFromDataset(dataset, "month")).toEqual(["Jan", "Feb"]);
  });

  it("formats compact numbers and cycles chart colors", () => {
    expect(formatChartNumber(1500)).toBe("1.5k");
    expect(chartColor(0)).toBe("var(--chart-1)");
    expect(chartColor(5)).toBe("var(--chart-1)");
    expect(extent([3, 3])).not.toEqual([3, 3]);
  });

  it("splits a full-circle arc into two sweeps", () => {
    expect(arcPath(0, 0, 0, 10, 0, 360).split("A").length).toBeGreaterThan(2);
  });

  it("resolves pie radii from pixels, fractions, and percents", () => {
    expect(resolveChartRadius(undefined, 100, 100)).toBe(100);
    expect(resolveChartRadius(80, 100, 100)).toBe(80);
    expect(resolveChartRadius(120, 100, 100)).toBe(100);
    expect(resolveChartRadius(0.4, 100, 100)).toBe(40);
    expect(resolveChartRadius("42%", 100, 100)).toBe(42);
  });

  it("sizes a horizontal-bar category gutter from the longest label", () => {
    expect(categoryLabelGutter(["Jan"])).toBe(72);
    expect(categoryLabelGutter(["Very Long Category Name"])).toBeGreaterThan(72);
    expect(fitCategoryLabel("abcdefghijklmnop", 40)).toMatch(/…$/);
  });

  it("formats axis ticks from valueFormatter", () => {
    expect(formatAxisNumber(12, { valueFormatter: (v) => `${v}%` })).toBe("12%");
    expect(formatAxisNumber(12, { tickFormatter: (v) => `${v}x` })).toBe("12x");
  });

  it("splits line points at nulls unless connectNulls is set", () => {
    const pts = [{ x: 0 }, null, { x: 2 }, { x: 3 }];
    expect(splitDefinedSegments(pts, true)).toHaveLength(1);
    expect(splitDefinedSegments(pts, false)).toEqual([[{ x: 0 }], [{ x: 2 }, { x: 3 }]]);
  });

  it("expands stacked series to a 0–1 share", () => {
    const stacked = stackSeries(
      [
        [2, 1],
        [2, 3],
      ],
      "expand",
    );
    expect(stacked[0]![0]).toEqual({ start: 0, end: 0.5 });
    expect(stacked[1]![0]).toEqual({ start: 0.5, end: 1 });
    expect(stacked[0]![1]!.end + (stacked[1]![1]!.end - stacked[1]![1]!.start)).toBeCloseTo(1);
  });

  it("maps symmetric and asymmetric error bars", () => {
    expect(errorBarRange(10, 2)).toEqual([8, 12]);
    expect(errorBarRange(10, [1, 4])).toEqual([9, 14]);
    expect(errorBarRange(10, null)).toBeNull();
  });

  it("appends axis unit after the formatted tick", () => {
    expect(formatAxisNumber(12, { unit: "k" })).toMatch(/k$/);
    expect(formatAxisNumber(12, { valueFormatter: (v) => `${v}`, unit: "%" })).toBe("12%");
  });

  it("reports whether series contain a plottable value", () => {
    expect(seriesHasPlottableData([{ data: [1, null] }])).toBe(true);
    expect(seriesHasPlottableData([{ data: [null, undefined] }])).toBe(false);
    expect(seriesHasPlottableData([{ scatter: [{ x: 1, y: 2 }] }])).toBe(true);
  });

  it("builds an outside pie label leader from the slice rim", () => {
    const line = pieLabelLine(50, 50, 40, 0, 16);
    expect(line.textAnchor).toBe("start");
    expect(line.x3).toBeGreaterThan(line.x1);
  });
});

describe("axis domains stay inside the plot", () => {
  it("does not pad across zero for single-signed data", () => {
    // Padding a non-negative series used to produce a negative axis (a stray "-50" tick).
    expect(extent([20, 110, 200], 0.04)[0]).toBeGreaterThanOrEqual(0);
    expect(extent([1, 10], 0.5)[0]).toBe(0);
    expect(extent([-20, -110, -200], 0.04)[1]).toBeLessThanOrEqual(0);
    expect(extent([-1, -10], 0.5)[1]).toBe(0);
    // Data that genuinely crosses zero keeps its padding on both sides.
    expect(extent([-20, 110], 0.04)[0]).toBeLessThan(-20);
  });

  it("rounds the domain out to the tick bounds", () => {
    const [min, max] = niceDomain(0, 208);
    const ticks = niceTicks(min, max, 5);
    expect(ticks[0]).toBe(min);
    expect(ticks[ticks.length - 1]).toBe(max);
  });

  it("keeps ticks stable when a nice domain is re-ticked", () => {
    // Regression: re-ticking a nice domain used to pick a coarser step and grow the axis,
    // which pushed the outer labels over the legend and below the axis line.
    for (const raw of [
      [0, 208],
      [-4.06, 20.5],
      [0, 640],
      [-120, 45],
    ] as const) {
      const first = niceDomain(raw[0], raw[1]);
      const second = niceDomain(first[0], first[1]);
      expect(second).toEqual(first);
      const ticks = niceTicks(first[0], first[1], 5);
      expect(ticks[0]).toBe(first[0]);
      expect(ticks[ticks.length - 1]).toBe(first[1]);
    }
  });

  it("labels the negative region when data crosses zero", () => {
    const [min, max] = niceDomain(-4.06, 20.5);
    expect(min).toBeLessThan(0);
    expect(niceTicks(min, max, 5).some((tick) => tick < 0)).toBe(true);
  });
});
