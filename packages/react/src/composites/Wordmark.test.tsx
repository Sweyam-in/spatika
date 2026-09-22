import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Wordmark } from "./Wordmark";

describe("Wordmark", () => {
  it("renders a gradient accent after the name", () => {
    render(<Wordmark name="Sweyam" accent=".io" />);
    expect(screen.getByText("Sweyam")).toBeInTheDocument();
    expect(screen.getByText(".io")).toBeInTheDocument();
  });

  it("renders as a heading with a mark and rest, and omits unused slots", () => {
    const { rerender } = render(
      <Wordmark name="Sweyam" mark="." rest="io" as="h1" />,
    );
    expect(screen.getByRole("heading", { name: /Sweyam/ })).toBeInTheDocument();
    expect(screen.getByText(".")).toBeInTheDocument();
    expect(screen.getByText("io")).toBeInTheDocument();

    rerender(<Wordmark name="Sweyam" />);
    expect(screen.queryByText(".io")).not.toBeInTheDocument();
  });
});
