import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EntityMediaCard } from "./EntityMediaCard";

describe("EntityMediaCard", () => {
  it("renders title, subtitle, and status on a stacked tile", () => {
    const { container } = render(
      <EntityMediaCard title="Alex Chen" subtitle="Product designer" statusLine="Active" />,
    );
    expect(screen.getByText("Alex Chen")).toBeInTheDocument();
    expect(screen.getByText("Product designer")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("AC")).toBeInTheDocument();
    const card = container.querySelector("[data-slot='entity-media-card']");
    expect(card).toHaveAttribute("data-size", "large");
    expect(card).toHaveAttribute("data-orientation", "stack");
    expect(container.querySelector("[data-cover-pattern]")).toBeTruthy();
  });

  it("uses a photo when imageUrl is set", () => {
    const { container } = render(
      <EntityMediaCard title="Jordan Lee" imageUrl="/jordan.jpg" />,
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "/jordan.jpg");
    expect(screen.queryByText("JL")).not.toBeInTheDocument();
  });

  it("renders as a link and calls onClick on a button card", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <EntityMediaCard title="Alex Chen" href="/people/alex" />,
    );
    expect(screen.getByRole("link", { name: /Alex Chen/ })).toHaveAttribute(
      "href",
      "/people/alex",
    );

    rerender(<EntityMediaCard title="Alex Chen" onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: /Alex Chen/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps row cards stretched so the photo matches the copy height", () => {
    const { container } = render(
      <EntityMediaCard
        title="Jordan Lee"
        subtitle="Account lead"
        orientation="row"
        size="small"
      />,
    );
    const card = container.querySelector("[data-slot='entity-media-card']");
    expect(card).toHaveAttribute("data-orientation", "row");
    expect(card).toHaveClass("items-stretch");
  });
});
