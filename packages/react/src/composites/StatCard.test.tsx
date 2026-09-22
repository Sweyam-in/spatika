import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders label, value, and hint", () => {
    render(<StatCard label="Users" value="144k" hint="+12 this week" />);
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("144k")).toBeInTheDocument();
    expect(screen.getByText("+12 this week")).toBeInTheDocument();
  });

  it("renders an optional chart under the value", () => {
    render(<StatCard label="Users" value="144k" chart={<span>trend</span>} />);
    expect(screen.getByText("144k")).toBeInTheDocument();
    expect(screen.getByText("trend")).toBeInTheDocument();
  });

  it("renders value-first metric layout", () => {
    render(<StatCard variant="metric" label="Uptime" value="99.9%" />);
    expect(screen.getByText("99.9%")).toBeInTheDocument();
    expect(screen.getByText("Uptime")).toBeInTheDocument();
  });

  it("omits the chart slot when none is provided", () => {
    render(<StatCard label="Users" value="144k" />);
    expect(screen.queryByText("trend")).not.toBeInTheDocument();
    expect(screen.getByText("144k")).toBeInTheDocument();
  });
});
