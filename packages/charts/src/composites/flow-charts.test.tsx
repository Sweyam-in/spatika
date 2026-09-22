import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FunnelChart, Heatmap } from "./flow-charts";

describe("FunnelChart", () => {
  it("renders a comparison overlay with inside and outside value labels", () => {
    render(
      <FunnelChart
        width={280}
        height={200}
        valueFormatter={(value) => `${value}%`}
        series={[
          {
            label: "2000",
            data: [
              { label: "Primary", value: 85 },
              { label: "Secondary", value: 50 },
            ],
          },
          {
            label: "2020",
            data: [
              { label: "Primary", value: 90 },
              { label: "Secondary", value: 67 },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByRole("group", { name: /funnel chart/i })).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="funnel-chart"] path').length).toBe(4);
  });

  it("keeps stage names on a single funnel when the legend is hidden", () => {
    render(
      <FunnelChart
        width={240}
        height={160}
        hideLegend
        series={[{ data: [{ label: "Visit", value: 10 }, { label: "Paid", value: 3 }] }]}
      />,
    );
    expect(screen.getByText("Visit")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });
});

describe("Heatmap", () => {
  it("draws a color scale for the value domain", () => {
    const { container } = render(
      <Heatmap
        width={240}
        height={160}
        xAxis={[{ data: ["A", "B"] }]}
        yAxis={[{ data: ["1"] }]}
        series={[{ data: [{ x: 0, y: 0, value: 2 }, { x: 1, y: 0, value: 8 }] }]}
      />,
    );
    expect(container.querySelector('[data-slot="heatmap-color-scale"]')).toBeTruthy();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("hides the color scale when hideLegend is set", () => {
    const { container } = render(
      <Heatmap
        width={240}
        height={160}
        hideLegend
        xAxis={[{ data: ["A"] }]}
        yAxis={[{ data: ["1"] }]}
        series={[{ data: [{ x: 0, y: 0, value: 4 }] }]}
      />,
    );
    expect(container.querySelector('[data-slot="heatmap-color-scale"]')).toBeNull();
  });

  it("fires onItemClick and can label cells", () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <Heatmap
        width={240}
        height={160}
        hideLegend
        showCellLabels
        xAxis={[{ data: ["A"] }]}
        yAxis={[{ data: ["1"] }]}
        series={[{ data: [{ x: 0, y: 0, value: 4 }] }]}
        onItemClick={onItemClick}
      />,
    );
    expect(screen.getByText("4")).toBeInTheDocument();
    fireEvent.click(container.querySelector(".spk-chart-mark--interactive")!);
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ value: 4, category: "A · 1" }));
  });

  it("keeps unique axis keys when category labels repeat", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Heatmap
        width={320}
        height={180}
        hideLegend
        xAxis={[{ data: ["M", "T", "W", "T", "F", "S", "S"] }]}
        yAxis={[{ data: ["am", "pm"] }]}
        series={[
          {
            data: Array.from({ length: 14 }, (_, i) => ({
              x: i % 7,
              y: Math.floor(i / 7),
              value: i + 1,
            })),
          },
        ]}
      />,
    );
    expect(screen.getAllByText("T")).toHaveLength(2);
    expect(screen.getAllByText("S")).toHaveLength(2);
    expect(error.mock.calls.some((call) => String(call[0]).includes("same key"))).toBe(false);
    error.mockRestore();
  });
});
