import type { ReactElement } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  BarChart,
  SparkLineChart,
  BoxPlotChart,
  CandlestickChart,
  LineChart,
  RangeBarChart,
  ScatterChart,
  WaterfallChart,
} from "./cartesian-charts";
import { BarChart3D, PieChart3D } from "./charts-3d";
import { FunnelChart, Heatmap, SankeyChart, Treemap } from "./flow-charts";
import { MapChart } from "./MapChart";
import { PieChart, RadarChart, RadialBarChart } from "./radial-charts";

const months = ["Jan", "Feb", "Mar"];

function liveText() {
  return document.querySelector('[aria-live="polite"]')?.textContent ?? "";
}

describe("chart keyboard navigation", () => {
  it("makes the plot one tab stop and walks a series with the arrow keys", async () => {
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
    const plot = screen.getByRole("group", { name: "Data points" });
    expect(plot).toHaveAttribute("tabindex", "0");
    plot.focus();
    expect(plot).toHaveAccessibleDescription("Use the arrow keys to move between data points.");

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tooltip")).toHaveTextContent("Jan");
    expect(liveText()).toBe("Jan: Views 4. 1 of 3");
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(liveText()).toBe("Mar: Views 5. 3 of 3");
    await user.keyboard("{ArrowRight}");
    expect(liveText()).toBe("Mar: Views 5. 3 of 3"); // stays on the last point

    await user.keyboard("{ArrowDown}");
    expect(liveText()).toBe("Mar: Signups 2. 3 of 3");
    await user.keyboard("{Home}");
    expect(liveText()).toBe("Jan: Signups 1. 1 of 3");
    expect(document.querySelectorAll("[data-chart-active]")).toHaveLength(1);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(document.querySelectorAll("[data-chart-active]")).toHaveLength(0);
  });

  it("activates the focused point with Enter and does not add a tab stop per mark", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    render(
      <LineChart
        width={360}
        height={220}
        xAxis={[{ data: months }]}
        series={[{ label: "Revenue", data: [10, 12, 9] }]}
        onItemClick={onItemClick}
      />,
    );
    const marks = document.querySelectorAll(".spk-chart-mark--interactive");
    expect(marks.length).toBe(3);
    for (const mark of Array.from(marks)) expect(mark).toHaveAttribute("tabindex", "-1");

    // Tab order: legend button, then the plot — and nothing after it (no stop per mark).
    await user.tab();
    await user.tab();
    expect(screen.getByRole("group", { name: "Data points" })).toHaveFocus();
    await user.keyboard("{End}{Enter}");
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ dataIndex: 2, value: 9, seriesLabel: "Revenue" }));
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("walks the slices of a pie", async () => {
    const user = userEvent.setup();
    render(
      <PieChart
        width={260}
        height={260}
        series={[
          {
            data: [
              { id: "a", label: "Direct", value: 50 },
              { id: "b", label: "Search", value: 30 },
              { id: "c", label: "Social", value: 20 },
            ],
          },
        ]}
      />,
    );
    screen.getByRole("group", { name: "Data points" }).focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(liveText()).toMatch(/^Search/);
    expect(liveText()).toMatch(/2 of 3$/);
  });

  it("reaches the points of a line drawn without marks", async () => {
    const user = userEvent.setup();
    render(
      <LineChart
        width={360}
        height={220}
        showMark={false}
        xAxis={[{ data: months }]}
        series={[{ label: "Revenue", data: [10, 12, 9] }]}
      />,
    );
    screen.getByRole("group", { name: "Data points" }).focus();
    await user.keyboard("{End}");
    expect(liveText()).toBe("Mar: Revenue 9. 3 of 3");
  });

  it("adds no tab stop to sparklines or to charts the page hides from assistive tech", () => {
    render(
      <div>
        <SparkLineChart data={[1, 4, 2, 6]} width={160} height={48} />
        <div aria-hidden="true">
          <BarChart width={200} height={120} xAxis={[{ data: months }]} series={[{ label: "Views", data: [4, 3, 5] }]} />
        </div>
      </div>,
    );
    expect(document.querySelectorAll('.spk-chart-surface[tabindex]')).toHaveLength(0);
    expect(screen.queryByRole("group", { name: "Data points" })).not.toBeInTheDocument();
  });

  const square = {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        id: "a",
        properties: { name: "A" },
        geometry: { type: "Polygon" as const, coordinates: [[[0, 0], [4, 0], [4, 3], [0, 3], [0, 0]]] },
      },
    ],
  };

  const everyChart: Array<[string, ReactElement]> = [
    ["ScatterChart", <ScatterChart width={220} height={180} series={[{ label: "Pts", data: [{ x: 1, y: 2, id: 1 }, { x: 2, y: 3, id: 2 }] }]} />],
    ["RangeBarChart", <RangeBarChart width={260} height={180} xAxis={[{ data: ["A", "B"] }]} series={[{ label: "Temp", data: [[1, 4], [2, 6]] }]} />],
    ["WaterfallChart", <WaterfallChart width={280} height={180} xAxis={[{ data: ["Start", "Up", "End"] }]} series={[{ data: [10, 4, null] }]} />],
    ["BoxPlotChart", <BoxPlotChart width={260} height={180} xAxis={[{ data: ["A"] }]} series={[{ label: "Lat", data: [[1, 2, 3, 4, 5, 9]] }]} />],
    ["CandlestickChart", <CandlestickChart width={260} height={180} xAxis={[{ data: ["Mon", "Tue"] }]} series={[{ data: [{ open: 1, high: 4, low: 0.5, close: 3 }, { open: 3, high: 5, low: 2, close: 2.5 }] }]} />],
    ["RadarChart", <RadarChart width={220} height={220} radar={{ metrics: ["A", "B", "C"] }} series={[{ label: "One", data: [3, 5, 4] }]} />],
    ["RadialBarChart", <RadialBarChart width={220} height={220} series={[{ data: [{ label: "Goal", value: 60 }, { label: "Stretch", value: 30 }] }]} />],
    ["Heatmap", <Heatmap width={240} height={160} xAxis={[{ data: ["A", "B"] }]} yAxis={[{ data: ["1"] }]} series={[{ data: [{ x: 0, y: 0, value: 2 }, { x: 1, y: 0, value: 5 }] }]} />],
    ["FunnelChart", <FunnelChart width={240} height={180} series={[{ data: [{ label: "Visit", value: 10 }, { label: "Paid", value: 3 }] }]} />],
    ["SankeyChart", <SankeyChart width={280} height={180} series={{ data: [{ id: "a" }, { id: "b" }], links: [{ source: "a", target: "b", value: 4 }] }} />],
    ["Treemap", <Treemap width={240} height={160} series={[{ data: [{ label: "A", value: 8 }, { label: "B", value: 4 }] }]} />],
    ["MapChart", <MapChart width={240} height={160} geoData={square} series={[{ data: [{ id: "a", value: 12, label: "A" }] }]} />],
    ["BarChart3D", <BarChart3D width={240} height={160} xAxis={[{ data: ["A", "B"] }]} series={[{ label: "Views", data: [3, 5] }]} />],
    ["PieChart3D", <PieChart3D width={200} height={160} series={[{ data: [{ value: 2, label: "A" }, { value: 3, label: "B" }] }]} />],
  ];

  it.each(everyChart)("%s announces its first data point from the keyboard", async (_name, chart) => {
    const user = userEvent.setup();
    render(chart);
    const plot = screen.getByRole("group", { name: "Data points" });
    plot.focus();
    await user.keyboard("{ArrowRight}");
    expect(liveText()).toMatch(/\S/);
    expect(within(plot).getByRole("tooltip")).toBeInTheDocument();
    cleanup();
  });
});
