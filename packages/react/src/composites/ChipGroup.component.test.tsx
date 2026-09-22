import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChipGroup } from "./ChipGroup";

describe("ChipGroup", () => {
  it("renders options and reports toggles", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <ChipGroup
        title="Size"
        options={[
          { value: "S", label: "Small" },
          { value: "L", label: "Large" },
        ]}
        selected={["S"]}
        onToggle={onToggle}
      />,
    );

    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Small" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Large" }));
    expect(onToggle).toHaveBeenCalledWith("L");
  });
});
