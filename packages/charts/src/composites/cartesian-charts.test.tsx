import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AreaChart, BarChart, LineChart, SparkLineChart } from "./cartesian-charts";

const months = ["Jan", "Feb", "Mar"];

describe("cartesian-charts", () => {
  it("renders grouped bars for categorical series", () => {
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
    expect(document.querySelectorAll('[data-slot="bar-plot"] .spk-chart-mark').length).toBeGreaterThan(0);
  });

  it("renders line series from numeric data", () => {
    const { container } = render(
      <LineChart
        width={360}
        height={220}
        xAxis={[{ data: months }]}
        series={[{ label: "Revenue", data: [2, 4, 3] }]}
      />,
    );
    expect(container.querySelector('[data-slot="line-plot"] path')).toBeTruthy();
  });

  it("stacks area series so later layers sit on earlier totals", () => {
    const { container } = render(
      <AreaChart
        width={360}
        height={220}
        stacked
        xAxis={[{ data: months }]}
        series={[
          { label: "v1", data: [2, 3, 4] },
          { label: "v2", data: [1, 1, 2] },
        ]}
      />,
    );
    expect(container.querySelector('[data-slot="area-plot"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-slot="area-plot"] path').length).toBeGreaterThanOrEqual(2);
  });

  it("fires onItemClick with the bar category and value", () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <BarChart
        width={360}
        height={220}
        hideLegend
        xAxis={[{ data: months }]}
        series={[{ label: "Views", data: [4, 3, 5] }]}
        onItemClick={onItemClick}
      />,
    );
    const mark = container.querySelector(".spk-chart-mark--interactive");
    expect(mark).toBeTruthy();
    fireEvent.click(mark!);
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ seriesLabel: "Views", dataIndex: 0, category: "Jan", value: 4 }),
    );
  });

  it("draws category tracks when showBarBackground is set", () => {
    const { container } = render(
      <BarChart
        width={360}
        height={220}
        hideLegend
        showBarBackground
        xAxis={[{ data: months }]}
        series={[{ label: "Views", data: [4, 3, 5] }]}
      />,
    );
    expect(container.querySelector('[data-slot="bar-background"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-slot="bar-background"] rect').length).toBe(3);
  });

  it("colors individual bars from itemColors", () => {
    const { container } = render(
      <BarChart
        width={360}
        height={220}
        hideLegend
        xAxis={[{ data: months }]}
        series={[
          {
            label: "Growth",
            color: "var(--chart-1)",
            data: [2, -1, 3],
            itemColors: ["var(--chart-3)", "var(--chart-4)"],
          },
        ]}
      />,
    );
    const marks = container.querySelectorAll('[data-slot="bar-plot"] .spk-chart-mark');
    expect(marks[0]?.getAttribute("fill")).toBe("var(--chart-3)");
    expect(marks[1]?.getAttribute("fill")).toBe("var(--chart-4)");
    expect(marks[0]?.getAttribute("style")).toContain("var(--chart-3)");
    expect(marks[2]?.getAttribute("fill")).toBe("var(--chart-1)");
  });

  it("renders a reference line and end labels on bars", () => {
    const { container } = render(
      <BarChart
        width={360}
        height={220}
        hideLegend
        showLabels
        xAxis={[{ data: months }]}
        series={[{ label: "Views", data: [4, 3, 5] }]}
        referenceLines={[{ y: 4, label: "Target" }]}
      />,
    );
    expect(container.querySelector('[data-slot="chart-reference-lines"]')).toBeTruthy();
    expect(screen.getByText("Target")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="bar-labels"]')).toBeTruthy();
  });

  it("fires onItemClick from horizontal bars", () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <BarChart
        width={360}
        height={220}
        hideLegend
        layout="horizontal"
        xAxis={[{ data: months }]}
        series={[{ label: "Views", data: [4, 3, 5] }]}
        onItemClick={onItemClick}
      />,
    );
    fireEvent.click(container.querySelector(".spk-chart-mark--interactive")!);
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ category: "Jan", value: 4 }));
  });

  it("renders a custom tooltip from hover", () => {
    const { container } = render(
      <BarChart
        width={360}
        height={220}
        hideLegend
        xAxis={[{ data: months }]}
        series={[{ label: "Views", data: [4, 3, 5] }]}
        renderTooltip={(hover) => <p>{hover.category} custom</p>}
      />,
    );
    fireEvent.mouseEnter(container.querySelector(".spk-chart-mark")!);
    expect(screen.getByText("Jan custom")).toBeInTheDocument();
  });

  it("grows the horizontal-bar left gutter for long category labels", () => {
    const tickX = (root: HTMLElement) =>
      Number(
        [...root.querySelectorAll("text.spk-chart-tick")]
          .find((el) => el.getAttribute("text-anchor") === "end")
          ?.getAttribute("x"),
      );
    const short = render(
      <BarChart
        width={360}
        height={220}
        hideLegend
        layout="horizontal"
        xAxis={[{ data: ["Jan"] }]}
        series={[{ label: "Views", data: [4] }]}
      />,
    );
    const long = render(
      <BarChart
        width={360}
        height={220}
        hideLegend
        layout="horizontal"
        xAxis={[{ data: ["Category Label Here"] }]}
        series={[{ label: "Views", data: [4] }]}
      />,
    );
    expect(tickX(long.container)).toBeGreaterThan(tickX(short.container));
    short.unmount();
    long.unmount();
  });

  it("dashes a line series and breaks the path at nulls", () => {
    const dashed = render(
      <LineChart
        width={360}
        height={220}
        hideLegend
        showMark={false}
        xAxis={[{ data: months }]}
        series={[{ label: "Trend", data: [2, 4, 3], strokeDasharray: "4 4" }]}
      />,
    );
    expect(dashed.container.querySelector('[data-slot="line-plot"] path')?.getAttribute("stroke-dasharray")).toBe("4 4");
    dashed.unmount();

    const gapped = render(
      <LineChart
        width={360}
        height={220}
        hideLegend
        showMark={false}
        connectNulls={false}
        xAxis={[{ data: months }]}
        series={[{ label: "Trend", data: [2, null, 3] }]}
      />,
    );
    expect(gapped.container.querySelectorAll('[data-slot="line-plot"] path').length).toBe(2);
    gapped.unmount();
  });

  it("formats value-axis ticks from yAxis.valueFormatter", () => {
    render(
      <LineChart
        width={360}
        height={220}
        hideLegend
        showMark={false}
        xAxis={[{ data: months }]}
        yAxis={[{ min: 0, max: 100, valueFormatter: (value) => `${value}%` }]}
        series={[{ label: "Share", data: [20, 40, 60] }]}
      />,
    );
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("shows a sparkline tooltip for the nearest point", () => {
    const { container } = render(
      <SparkLineChart data={[1, 4, 2]} labels={["Mon", "Tue", "Wed"]} width={160} height={48} />,
    );
    fireEvent.mouseEnter(container.querySelector(".spk-chart-mark")!);
    expect(screen.getByRole("tooltip").textContent).toMatch(/Mon/);
  });
});
