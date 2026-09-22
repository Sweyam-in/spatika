import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CoverHero } from "./CoverHero";

describe("CoverHero", () => {
  it("renders title, kicker, facts, and avatars", () => {
    render(
      <CoverHero
        title="Friday night"
        kicker={<span>Meetup</span>}
        facts={[{ key: "when", label: "When", value: "Fri 14 Mar" }]}
        avatars={[{ name: "Alex Rivera" }, { name: "Sam Lee" }, { name: "Jo Park" }, { name: "Riley" }]}
        bleed={false}
      />,
    );
    expect(screen.getByRole("heading", { name: "Friday night" })).toBeInTheDocument();
    expect(screen.getByText("Meetup")).toBeInTheDocument();
    expect(screen.getByText("When")).toBeInTheDocument();
    expect(screen.getByText("Fri 14 Mar")).toBeInTheDocument();
    expect(screen.getByLabelText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("calls onBack from the floating control and skips bleed attributes when disabled", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    const { container } = render(
      <CoverHero title="Studio" onBack={onBack} backLabel="Go back" bleed={false} />,
    );
    expect(container.querySelector("[data-slot='cover-hero']")).not.toHaveAttribute(
      "data-cover-bleed",
    );
    expect(screen.queryByRole("button", { name: "Go back" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Go back" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
