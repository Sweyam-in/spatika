import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChartToolbarButton } from "./ChartToolbarButton";

describe("ChartToolbarButton", () => {
  it("fires onClick for a named toolbar action", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ChartToolbarButton aria-label="Zoom in" onClick={onClick}>+</ChartToolbarButton>);
    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
