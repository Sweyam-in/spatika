import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Gauge, LinearGauge, PieChart, RadarChart } from "./radial-charts";

describe("radial-charts", () => {
  it("renders a pie chart from slice values", () => {
    const { container } = render(
      <PieChart
        width={200}
        height={200}
        series={[{ data: [{ value: 10, label: "A" }, { value: 20, label: "B" }] }]}
      />,
    );
    expect(container.querySelector('[data-slot="pie-chart"]')).toBeTruthy();
    expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
  });

  it("fires onItemClick from a pie slice", () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <PieChart
        width={200}
        height={200}
        hideLegend
        series={[{ data: [{ value: 10, label: "A" }, { value: 20, label: "B" }] }]}
        onItemClick={onItemClick}
      />,
    );
    fireEvent.click(container.querySelector(".spk-chart-mark--interactive")!);
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ seriesLabel: "A", value: 10 }));
  });

  it("draws outside labels with leader lines", () => {
    const { container } = render(
      <PieChart
        width={200}
        height={200}
        hideLegend
        labelLine
        series={[{ data: [{ value: 10, label: "A" }, { value: 20, label: "B" }] }]}
      />,
    );
    expect(container.querySelectorAll(".spk-chart-label-line").length).toBeGreaterThan(0);
  });

  it("shows an empty overlay when every slice is zero", () => {
    render(
      <PieChart
        width={200}
        height={200}
        hideLegend
        series={[{ data: [{ value: 0, label: "A" }] }]}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("No data");
  });

  it("renders a single-value gauge with a percent label", () => {
    render(<Gauge value={40} width={160} height={120} />);
    expect(screen.getByRole("group", { name: "Gauge 40" })).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("renders a segmented gauge with a section legend", () => {
    const { container } = render(
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
      />,
    );
    expect(container.querySelector('[data-slot="gauge"]')).toBeTruthy();
    expect(screen.getByRole("button", { name: "v5" })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="gauge"] path').length).toBe(3);
  });

  it("hides the section legend and accepts a text formatter", () => {
    render(
      <Gauge
        value={72}
        width={160}
        height={120}
        hideLegend
        text={(value) => `${value} pts`}
        sections={[{ value: 1, label: "hidden" }]}
      />,
    );
    expect(screen.queryByRole("button", { name: "hidden" })).not.toBeInTheDocument();
    expect(screen.getByText("72 pts")).toBeInTheDocument();
  });

  it("accepts percent radii and centers the pie in the plot", () => {
    const { container } = render(
      <PieChart
        width={200}
        height={200}
        hideLegend
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        series={[
          {
            innerRadius: "40%",
            outerRadius: "80%",
            data: [
              { value: 10, label: "A" },
              { value: 20, label: "B" },
            ],
          },
        ]}
      />,
    );
    const d = container.querySelector("path")?.getAttribute("d") ?? "";
    expect(d).toContain("A80 80");
    expect(d).toContain("A40 40");
  });

  it("does not paint a fallback SVG before fillHeight measures", () => {
    const { container } = render(
      <PieChart
        fillHeight
        hideLegend
        series={[{ data: [{ value: 10, label: "A" }, { value: 20, label: "B" }] }]}
      />,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("omits a redundant pie tooltip title when it matches the slice label", () => {
    const { container } = render(
      <PieChart
        width={200}
        height={200}
        hideLegend
        series={[{ data: [{ value: 10, label: "Muslim" }, { value: 20, label: "Other" }] }]}
      />,
    );
    fireEvent.mouseEnter(container.querySelector(".spk-chart-mark")!);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.querySelector(".spk-chart-tooltip-title")).toBeNull();
    expect(tooltip.textContent).toMatch(/Muslim/);
  });

  it("renders a linear gauge and a radar polygon", () => {
    const { container } = render(
      <div>
        <LinearGauge value={25} width={200} />
        <RadarChart
          width={220}
          height={220}
          radar={{ metrics: ["A", "B", "C"] }}
          series={[{ label: "One", data: [3, 5, 4] }]}
        />
      </div>,
    );
    expect(container.querySelector('[data-slot="linear-gauge"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="radar-chart"]')).toBeTruthy();
    expect(screen.getByRole("button", { name: "One" })).toBeInTheDocument();
  });
});
