import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ChartDataGrid, renderChartCell } from "./ChartDataGrid";

describe("ChartDataGrid", () => {
  it("renders a linked table and highlights a selected row", async () => {
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
    expect(screen.getByText("Channel")).toBeInTheDocument();
    const row = container.querySelector(
      '[data-slot="chart-data-grid"] tbody [data-slot="table-row"]:nth-child(2)',
    );
    await user.click(row!);
    expect(row).toHaveAttribute("data-state", "selected");
  });

  it("hides the chart when requested", () => {
    const { container } = render(
      <ChartDataGrid
        hideChart
        categoryField="name"
        valueField="views"
        rows={[{ id: "web", name: "Web", views: 10 }]}
        columns={[{ field: "name", headerName: "Channel" }]}
      />,
    );
    expect(container.querySelector('[data-slot="chart-container"]')).toBeNull();
  });
});

describe("renderChartCell", () => {
  it("returns a dash for non-numeric values", () => {
    expect(renderChartCell("n/a")).toBe("—");
  });

  it("renders a sparkline for numeric arrays", () => {
    const { container } = render(<>{renderChartCell([1, 4, 2], { variant: "sparkline" })}</>);
    expect(container.querySelector('[data-slot="sparkline"]')).toBeTruthy();
  });
});
