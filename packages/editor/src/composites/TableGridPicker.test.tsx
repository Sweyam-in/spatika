import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TableGridPicker } from "./TableGridPicker";

describe("TableGridPicker", () => {
  it("updates the preview label while hovering the grid", () => {
    const onInsert = vi.fn();
    render(<TableGridPicker onInsert={onInsert} />);

    expect(screen.getByText("3 × 3")).toBeInTheDocument();

    const cell = screen.getByRole("gridcell", { name: "5 by 4 table" });
    fireEvent.mouseMove(cell);

    expect(screen.getByText("5 × 4")).toBeInTheDocument();
  });

  it("inserts on grid click", async () => {
    const onInsert = vi.fn();
    render(<TableGridPicker onInsert={onInsert} />);

    await userEvent.click(screen.getByRole("gridcell", { name: "5 by 4 table" }));
    expect(onInsert).toHaveBeenCalledWith(4, 5, true);
  });
});
