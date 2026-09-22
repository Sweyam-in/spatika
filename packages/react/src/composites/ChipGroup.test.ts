import { describe, expect, it } from "vitest";
import { isOptionSelected, toggleOptionValue } from "./ChipGroup";

describe("ChipGroup helpers", () => {
  it("detects selection case-insensitively", () => {
    expect(isOptionSelected(["small"], "SMALL")).toBe(true);
    expect(isOptionSelected(["small"], "large")).toBe(false);
    expect(isOptionSelected(undefined, "x")).toBe(false);
  });

  it("toggles values in a list", () => {
    expect(toggleOptionValue(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleOptionValue(["a", "b"], "A")).toEqual(["b"]);
    expect(toggleOptionValue(undefined, "x")).toEqual(["x"]);
  });
});
