import { render } from "@testing-library/react";
import { SpatikaThemeProvider } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { chartDemos } from "./ChartDemos";

describe("chartDemos", () => {
  it("includes compact previews for core chart types", () => {
    const demos = chartDemos(true);
    expect(demos["bar-chart"]).toBeTruthy();
    expect(demos["line-chart"]).toBeTruthy();
    expect(demos["map-chart"]).toBeTruthy();
    expect(demos["chart-data-grid"]).toBeTruthy();

    const { container } = render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        {demos["bar-chart"]}
      </SpatikaThemeProvider>,
    );
    expect(container.querySelector('[data-slot="bar-chart"], [data-slot="bar-plot"]')).toBeTruthy();
  });
});
