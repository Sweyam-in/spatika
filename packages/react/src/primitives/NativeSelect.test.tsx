import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NativeSelect } from "./NativeSelect";

describe("NativeSelect", () => {
  it("renders a full-width form select by default", () => {
    render(
      <NativeSelect aria-label="Rows">
        <option value="10">10</option>
      </NativeSelect>,
    );
    const select = screen.getByLabelText("Rows");
    expect(select).toHaveAttribute("data-size", "default");
    expect(select).not.toHaveAttribute("size");
  });

  it("renders a compact toolbar select without the native size attribute", () => {
    render(
      <NativeSelect size="sm" aria-label="Month">
        <option value="7">AUG</option>
      </NativeSelect>,
    );
    const select = screen.getByLabelText("Month");
    expect(select).toHaveAttribute("data-size", "sm");
    expect(select.className).toMatch(/h-8|min-h-8/);
    expect(select).not.toHaveAttribute("size");
  });
});
