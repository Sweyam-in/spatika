import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfileHero } from "./ProfileHero";

describe("ProfileHero", () => {
  it("renders name, alias, and a notched identity plate", () => {
    const { container } = render(
      <ProfileHero name="Alex Chen" alias="Product designer" coverSeed="alex" bleed={false} />,
    );
    expect(screen.getByRole("heading", { name: "Alex Chen" })).toBeInTheDocument();
    expect(screen.getByText("Product designer")).toBeInTheDocument();
    expect(container.querySelector(".profile-identity")).toBeTruthy();
    expect(container.querySelector(".profile-identity__plate")).toBeTruthy();
    expect(container.querySelector("[data-slot='profile-hero']")).not.toHaveAttribute(
      "data-cover-bleed",
    );
    expect(container.querySelector("[data-slot='profile-hero']")).toHaveClass("w-full");
  });

  it("keeps the avatar inert until onAvatarClick is provided", async () => {
    const user = userEvent.setup();
    const onAvatarClick = vi.fn();
    const { rerender } = render(<ProfileHero name="Alex Chen" bleed={false} />);
    expect(screen.getByRole("button", { name: "Alex Chen" })).toBeDisabled();

    rerender(<ProfileHero name="Alex Chen" onAvatarClick={onAvatarClick} bleed={false} />);
    const avatar = screen.getByRole("button", { name: "Alex Chen" });
    expect(avatar).toBeEnabled();
    await user.click(avatar);
    expect(onAvatarClick).toHaveBeenCalledTimes(1);
  });
});
