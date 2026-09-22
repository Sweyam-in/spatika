import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders text content", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("supports semantic variants", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge.className).toContain("spk-badge--info");
    expect(badge).toHaveAttribute("data-variant", "info");
  });

  it("maps 1.x aliases onto 2.0 tones", () => {
    render(<Badge variant="warm">Warm</Badge>);
    expect(screen.getByText("Warm").className).toContain("spk-badge--warning");
  });

  it("renders a status dot so status is not colour-only", () => {
    const { container } = render(
      <Badge variant="success" dot>
        Active
      </Badge>,
    );
    expect(container.querySelector(".spk-badge-dot")).toBeInTheDocument();
  });
});
