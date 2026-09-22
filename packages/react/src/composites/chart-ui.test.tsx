import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SparkLineChart } from "@spatika/charts";

/**
 * `chart-ui` moved to `@spatika/charts`. This file keeps colocated coverage
 * next to the old path so the extract stays test-paired.
 */
describe("chart-ui (re-exported via @spatika/charts)", () => {
  it("still renders a sparkline frame that uses ChartFrame", () => {
    const { container } = render(
      <SparkLineChart data={[1, 4, 2]} width={120} height={36} />,
    );
    expect(container.querySelector('[data-slot="sparkline"]')).toBeTruthy();
  });

  it("does not paint a tooltip when nothing is hovered", () => {
    render(<SparkLineChart data={[1, 4, 2]} width={120} height={36} />);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });
});
