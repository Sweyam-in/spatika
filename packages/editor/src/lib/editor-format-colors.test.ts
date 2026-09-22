import { describe, expect, it } from "vitest";
import { EDITOR_HIGHLIGHT_COLORS, EDITOR_TEXT_COLORS } from "./editor-format-colors";

describe("editor-format-colors", () => {
  it("includes a default/unset swatch for text and highlight", () => {
    expect(EDITOR_TEXT_COLORS[0]?.value).toBeNull();
    expect(EDITOR_HIGHLIGHT_COLORS[0]?.value).toBeNull();
  });

  it("defines readable preset palettes", () => {
    expect(EDITOR_TEXT_COLORS.length).toBeGreaterThan(5);
    expect(EDITOR_HIGHLIGHT_COLORS.length).toBeGreaterThan(4);
    expect(EDITOR_TEXT_COLORS.every((color) => color.label.length > 0)).toBe(true);
  });
});
