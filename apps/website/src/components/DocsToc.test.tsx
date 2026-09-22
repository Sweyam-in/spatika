import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DocsToc } from "./DocsToc";

describe("DocsToc", () => {
  it("renders on-page links", () => {
    render(
      <DocsToc
        items={[
          { id: "usage", label: "Usage" },
          { id: "api", label: "API" },
        ]}
      />,
    );
    expect(screen.getByRole("navigation", { name: "On this page" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Usage" })).toHaveAttribute("href", "#usage");
  });

  it("renders nothing when empty", () => {
    const { container } = render(<DocsToc items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
