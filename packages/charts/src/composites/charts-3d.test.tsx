import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart3D, PieChart3D } from "./charts-3d";

describe("charts-3d", () => {
  it("renders isometric bars and an extruded pie", () => {
    const { container } = render(
      <div>
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
      </div>,
    );
    expect(container.querySelector('[data-slot="bar-chart-3d"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="pie-chart-3d"]')).toBeTruthy();
  });
});
