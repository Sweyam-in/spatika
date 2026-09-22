import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToolbarButton } from "./ToolbarButton";

describe("ToolbarButton", () => {
  it("fires onClick and marks active state", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ToolbarButton aria-label="Bold" active onClick={onClick}>
        B
      </ToolbarButton>,
    );
    const button = screen.getByRole("button", { name: "Bold" });
    expect(button).toHaveAttribute("data-active", "true");
    expect(button).toHaveClass("spk-editor-toolbar-btn--active");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
