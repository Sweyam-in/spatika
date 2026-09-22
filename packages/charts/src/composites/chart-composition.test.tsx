import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  ChartContainer,
  ComposedChart,
  ResponsiveContainer,
} from "./chart-composition";
import { BarChart } from "./cartesian-charts";
import { resetChartSync } from "../lib/chart-sync";

describe("chart-composition", () => {
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
        ]}
        xAxis={[{ dataKey: "month" }]}
        series={[
          { type: "bar", dataKey: "views", label: "Views" },
          { type: "line", dataKey: "conv", label: "Conv" },
        ]}
      />,
    );
    expect(container.querySelector('[data-slot="bar-plot"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="line-plot"]')).toBeTruthy();
    expect(screen.getByRole("toolbar", { name: "Chart tools" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("labels the chart as a group so toolbar controls are not nested in role=img", () => {
    render(
      <ChartContainer
        width={360}
        height={220}
        showToolbar
        xAxis={[{ data: ["Jan", "Feb"] }]}
        series={[{ type: "bar", label: "Views", data: [4, 6] }]}
      />,
    );
    expect(screen.getByRole("group", { name: /chart of views/i })).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "Chart tools" })).toBeInTheDocument();
  });

  it("stacks area series from a dataset", () => {
    const { container } = render(
      <ChartContainer
        width={360}
        height={220}
        stacked
        dataset={[
          { month: "Jan", a: 2, b: 1 },
          { month: "Feb", a: 3, b: 2 },
        ]}
        xAxis={[{ dataKey: "month" }]}
        series={[
          { type: "area", dataKey: "a", label: "A" },
          { type: "area", dataKey: "b", label: "B" },
        ]}
      />,
    );
    expect(container.querySelector('[data-slot="area-plot"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-slot="area-plot"] path').length).toBeGreaterThanOrEqual(2);
  });

  it("draws reference lines from ChartContainer", () => {
    const { container } = render(
      <ChartContainer
        width={360}
        height={220}
        hideLegend
        xAxis={[{ data: ["Jan", "Feb"] }]}
        series={[{ type: "line", label: "Gap", data: [3, 5] }]}
        referenceLines={[{ y: 4, label: "Capacity" }]}
      />,
    );
    expect(container.querySelector('[data-slot="chart-reference-lines"]')).toBeTruthy();
    expect(screen.getByText("Capacity")).toBeInTheDocument();
  });

  it("draws reference areas, dots, error bars, and a cursor", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ChartContainer
        width={360}
        height={220}
        hideLegend
        defaultIndex={0}
        xAxis={[{ data: ["Jan", "Feb"] }]}
        series={[{ type: "bar", label: "Views", data: [4, 6], error: [1, 2] }]}
        referenceAreas={[{ xIndex0: 0, xIndex1: 1, label: "Launch" }]}
        referenceDots={[{ xIndex: 1, y: 6, label: "Peak" }]}
      />,
    );
    expect(container.querySelector('[data-slot="chart-reference-areas"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="chart-reference-dots"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="chart-error-bars"]')).toBeTruthy();
    expect(screen.getByText("Launch")).toBeInTheDocument();
    expect(screen.getByText("Peak")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="chart-cursor"]')).toBeTruthy();
    const marks = container.querySelectorAll('[data-slot="bar-plot"] .spk-chart-mark');
    await user.hover(marks[1]!);
    expect(screen.getByRole("tooltip").textContent).toMatch(/Views/);
  });

  it("shares hover across charts with the same syncId", async () => {
    resetChartSync();
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <BarChart
          width={240}
          height={160}
          hideLegend
          syncId="traffic"
          xAxis={[{ data: ["Jan", "Feb"] }]}
          series={[{ label: "A", data: [2, 4] }]}
        />
        <BarChart
          width={240}
          height={160}
          hideLegend
          syncId="traffic"
          xAxis={[{ data: ["Jan", "Feb"] }]}
          series={[{ label: "B", data: [1, 3] }]}
        />
      </div>,
    );
    const firstMarks = container.querySelectorAll('[data-slot="bar-chart"]')[0]!.querySelectorAll(
      '[data-slot="bar-plot"] .spk-chart-mark',
    );
    await user.hover(firstMarks[1]!);
    expect(container.querySelectorAll('[data-slot="chart-cursor"]').length).toBe(2);
  });

  it("stacks to 100% when stackOffset is expand", () => {
    const { container } = render(
      <ChartContainer
        width={360}
        height={220}
        stacked
        stackOffset="expand"
        hideLegend
        xAxis={[{ data: ["Jan", "Feb"] }]}
        series={[
          { type: "bar", label: "A", data: [1, 1] },
          { type: "bar", label: "B", data: [1, 3] },
        ]}
      />,
    );
    expect(container.querySelector('[data-slot="bar-plot"]')).toBeTruthy();
    expect(screen.getByText("0.2")).toBeInTheDocument();
  });

  it("injects fillHeight on a ResponsiveContainer child", () => {
    const { container } = render(
      <div style={{ height: 200 }}>
        <ResponsiveContainer minHeight={120}>
          <ComposedChart
            width={320}
            height={180}
            hideLegend
            xAxis={[{ data: ["Jan"] }]}
            series={[{ type: "bar", label: "A", data: [2] }]}
          />
        </ResponsiveContainer>
      </div>,
    );
    expect(container.querySelector('[data-slot="responsive-container"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="composed-chart"]')).toBeTruthy();
    expect(container.querySelector(".spk-chart--fill")).toBeTruthy();
  });

  it("shows every series in a shared tooltip", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ChartContainer
        width={360}
        height={220}
        hideLegend
        sharedTooltip
        xAxis={[{ data: ["Jan", "Feb"] }]}
        series={[
          { type: "bar", label: "Views", data: [4, 6] },
          { type: "bar", label: "Signups", data: [1, 2] },
        ]}
      />,
    );
    await user.hover(container.querySelector('[data-slot="bar-plot"] .spk-chart-mark')!);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.textContent).toMatch(/Views/);
    expect(tooltip.textContent).toMatch(/Signups/);
  });

  it("shows an empty overlay when series have no values", () => {
    render(
      <ChartContainer
        width={360}
        height={220}
        hideLegend
        emptyText="Nothing to plot"
        xAxis={[{ data: ["Jan"] }]}
        series={[{ type: "bar", label: "Views", data: [null] }]}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Nothing to plot");
  });

  it("shows a loading overlay over the plot", () => {
    render(
      <ChartContainer
        width={360}
        height={220}
        hideLegend
        loading
        xAxis={[{ data: ["Jan"] }]}
        series={[{ type: "bar", label: "Views", data: [4] }]}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });

  it("flips the value axis when reversed", () => {
    const { container } = render(
      <ChartContainer
        width={360}
        height={220}
        hideLegend
        hideGrid
        xAxis={[{ data: ["A", "B"] }]}
        yAxis={[{ min: 0, max: 10, reversed: true, valueFormatter: (value) => `v${value}` }]}
        series={[{ type: "bar", label: "A", data: [10, 2] }]}
      />,
    );
    const ticks = [...container.querySelectorAll('[data-slot="chart-y-axis"] .spk-chart-tick')];
    const y0 = Number(ticks.find((tick) => tick.textContent === "v0")?.getAttribute("y"));
    const y10 = Number(ticks.find((tick) => tick.textContent === "v10")?.getAttribute("y"));
    expect(y0).toBeLessThan(y10);
  });

  it("rotates category ticks from xAxis.tickAngle", () => {
    const { container } = render(
      <ChartContainer
        width={360}
        height={220}
        hideLegend
        xAxis={[{ data: ["January"], tickAngle: -40 }]}
        series={[{ type: "bar", label: "A", data: [4] }]}
      />,
    );
    const tick = [...container.querySelectorAll('[data-slot="chart-x-axis"] text')].find(
      (node) => node.textContent === "January",
    );
    expect(tick?.getAttribute("transform")).toMatch(/rotate\(-40 /);
  });
});
