import { describe, expect, it } from "vitest";
import {
  BarChart,
  BarChart3D,
  Button,
  ChartContainer,
  ChartDataGrid,
  EventCalendar,
  MapChart,
  SchedulerDateJump,
  SchedulerToolbar,
  BREAKPOINTS,
  calendarVisibleRange,
  createTheme,
  mercator,
} from "./index";

describe("@spatika/react public exports", () => {
  it("exports primitives, chart composites, and helpers", () => {
    expect(Button.displayName).toBe("Button");
    expect(BarChart).toBeTypeOf("function");
    expect(ChartContainer).toBeTypeOf("function");
    expect(ChartDataGrid).toBeTypeOf("function");
    expect(MapChart).toBeTypeOf("function");
    expect(BarChart3D).toBeTypeOf("function");
    expect(EventCalendar).toBeTypeOf("function");
    expect(SchedulerToolbar).toBeTypeOf("function");
    expect(SchedulerDateJump).toBeTypeOf("function");
    expect(calendarVisibleRange).toBeTypeOf("function");
    expect(mercator([0, 0])[0]).toBeCloseTo(0.5);
    expect(BREAKPOINTS.md).toBe(768);
    expect(createTheme({ id: "brand", palette: { primary: "#7c3aed" } }).vars["--primary"]).toBe(
      "#7c3aed",
    );
  });
});
