import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ChartContainer } from "./chart-composition";
import { BarChart, LineChart, ScatterChart, SparkLineChart, WaterfallChart } from "./cartesian-charts";
import { Gauge, LinearGauge, PieChart, RadarChart } from "./radial-charts";
import { FunnelChart, Heatmap, SankeyChart, Treemap } from "./flow-charts";
import { MapChart } from "./MapChart";
import { BarChart3D, PieChart3D } from "./charts-3d";
import { ChartDataGrid } from "./ChartDataGrid";

const months = ["Jan", "Feb", "Mar"];

describe("charts", () => {
  it("renders a grouped bar chart and shows a tooltip on hover", async () => {
    const user = userEvent.setup();
    render(
      <BarChart
        width={360}
        height={220}
        xAxis={[{ data: months }]}
        series={[
          { label: "Views", data: [4, 3, 5] },
          { label: "Signups", data: [1, 2, 2] },
        ]}
      />,
    );
    expect(screen.getByRole("group", { name: /bar chart/i })).toBeInTheDocument();
    const marks = document.querySelectorAll('[data-slot="bar-plot"] .spk-chart-mark');
    expect(marks.length).toBeGreaterThan(0);
    await user.hover(marks[0]!);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("hides a line series from the legend", async () => {
    const user = userEvent.setup();
    render(
      <LineChart
        width={360}
        height={220}
        xAxis={[{ data: months }]}
        series={[
          { label: "Revenue", data: [2, 4, 3] },
          { label: "Cost", data: [1, 1, 2] },
        ]}
      />,
    );
    const paths = () => document.querySelectorAll('[data-slot="line-plot"] path');
    const before = paths().length;
    await user.click(screen.getByRole("button", { name: "Cost" }));
    expect(paths().length).toBeLessThan(before);
  });

  it("renders pie, gauge, radar, scatter, sparkline, and linear gauge", () => {
    const { container } = render(
      <div>
        <PieChart
          width={200}
          height={200}
          series={[{ data: [{ value: 10, label: "A" }, { value: 20, label: "B" }] }]}
        />
        <Gauge value={40} width={160} height={120} />
        <Gauge
          width={160}
          height={120}
          startAngle={-90}
          endAngle={90}
          sections={[
            { value: 40, label: "v5" },
            { value: 35, label: "v6" },
            { value: 25, label: "v7" },
          ]}
        />
        <LinearGauge value={25} width={200} />
        <RadarChart
          width={220}
          height={220}
          radar={{ metrics: ["A", "B", "C"] }}
          series={[{ label: "One", data: [3, 5, 4] }]}
        />
        <ScatterChart
          width={220}
          height={180}
          series={[{ label: "Pts", data: [{ x: 1, y: 2, id: 1 }] }]}
        />
        <SparkLineChart data={[1, 4, 2, 6]} width={160} height={48} />
      </div>,
    );
    expect(container.querySelector('[data-slot="pie-chart"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="gauge"]')).toBeTruthy();
    expect(screen.getByRole("button", { name: "v5" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="linear-gauge"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="radar-chart"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="scatter-chart"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="sparkline"]')).toBeTruthy();
  });

  it("renders heatmap, funnel, sankey, treemap, and waterfall", () => {
    const { container } = render(
      <div>
        <Heatmap
          width={240}
          height={160}
          xAxis={[{ data: ["A", "B"] }]}
          yAxis={[{ data: ["1"] }]}
          series={[{ data: [{ x: 0, y: 0, value: 2 }, { x: 1, y: 0, value: 5 }] }]}
        />
        <FunnelChart
          width={240}
          height={180}
          series={[{ data: [{ label: "Visit", value: 10 }, { label: "Paid", value: 3 }] }]}
        />
        <SankeyChart
          width={280}
          height={180}
          series={{
            data: [{ id: "a" }, { id: "b" }],
            links: [{ source: "a", target: "b", value: 4 }],
          }}
        />
        <Treemap
          width={240}
          height={160}
          series={[{ data: [{ label: "A", value: 8 }, { label: "B", value: 4 }] }]}
        />
        <WaterfallChart
          width={280}
          height={180}
          xAxis={[{ data: ["Start", "Up", "End"] }]}
          series={[{ data: [10, 4, null] }]}
        />
      </div>,
    );
    expect(container.querySelector('[data-slot="heatmap"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="funnel-chart"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="sankey-chart"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="treemap"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="waterfall-chart"]')).toBeTruthy();
  });

  it("composes bar and line plots from a dataset with a toolbar", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ChartContainer
        width={360}
        height={220}
        zoom
        showToolbar
        dataset={[
          { month: "Jan", views: 4, conv: 1 },
          { month: "Feb", views: 6, conv: 2 },
          { month: "Mar", views: 5, conv: 2 },
        ]}
        xAxis={[{ dataKey: "month" }]}
        yAxis={[{ id: "left" }, { id: "right", position: "right" }]}
        series={[
          { type: "bar", dataKey: "views", label: "Views" },
          { type: "line", dataKey: "conv", label: "Conv", yAxisId: "right" },
        ]}
      />,
    );
    expect(container.querySelector('[data-slot="bar-plot"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="line-plot"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="chart-y-axis-right"]')).toBeTruthy();
    expect(screen.getByRole("toolbar", { name: "Chart tools" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders a map, isometric 3d charts, and a sparkline bar", () => {
    const { container } = render(
      <div>
        <MapChart
          width={240}
          height={160}
          geoData={{
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                id: "a",
                properties: { name: "A" },
                geometry: {
                  type: "Polygon",
                  coordinates: [
                    [
                      [0, 0],
                      [4, 0],
                      [4, 3],
                      [0, 3],
                      [0, 0],
                    ],
                  ],
                },
              },
            ],
          }}
          series={[{ data: [{ id: "a", value: 12, label: "A" }] }]}
        />
        <BarChart3D
          width={240}
          height={160}
          xAxis={[{ data: ["A", "B"] }]}
          series={[{ label: "Views", data: [3, 5] }]}
        />
        <PieChart3D
          width={200}
          height={160}
          series={[{ data: [{ value: 2, label: "A" }, { value: 3, label: "B" }] }]}
        />
        <SparkLineChart data={[1, 3, 2, 5]} plotType="bar" width={120} height={36} />
        <ScatterChart
          width={200}
          height={140}
          renderer="webgl"
          series={[{ label: "Pts", data: [{ x: 1, y: 2, id: 1 }] }]}
        />
      </div>,
    );
    expect(container.querySelector('[data-slot="map-chart"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="map-chart"] path')).toBeTruthy();
    expect(container.querySelector('[data-slot="bar-chart-3d"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="pie-chart-3d"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="sparkline"] rect')).toBeTruthy();
    expect(container.querySelector('[data-slot="scatter-chart"]')).toBeTruthy();
  });

  it("highlights a chart bar from a selected grid row", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ChartDataGrid
        height={140}
        categoryField="name"
        valueField="views"
        rows={[
          { id: "web", name: "Web", views: 10, trend: [1, 2, 3] },
          { id: "ios", name: "iOS", views: 6, trend: [2, 2, 1] },
        ]}
        columns={[
          { field: "name", headerName: "Channel" },
          { field: "views", headerName: "Views", type: "number" },
          { field: "trend", headerName: "Trend", type: "sparkline" },
        ]}
      />,
    );
    expect(container.querySelector('[data-slot="chart-data-grid"]')).toBeTruthy();
    const row = container.querySelector(
      '[data-slot="chart-data-grid"] tbody [data-slot="table-row"]:nth-child(2)',
    );
    expect(row).toBeTruthy();
    await user.click(row!);
    expect(row).toHaveAttribute("data-state", "selected");
  });
});
