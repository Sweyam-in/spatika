import { describe, expect, it } from "vitest";
import { applyImageWrapState } from "./resizable-image-view";

describe("applyImageWrapState", () => {
  it("applies width, alignment, and selection classes", () => {
    const wrap = document.createElement("div");
    const img = document.createElement("img");
    applyImageWrapState(
      wrap,
      img,
      {
        attrs: {
          src: "https://example.com/a.png",
          width: "240px",
          align: "left",
        },
      } as never,
      true,
    );

    expect(wrap.className).toContain("spk-editor-image-wrap--selected");
    expect(wrap.className).toContain("spk-editor-image-wrap--left");
    expect(img.style.width).toBe("240px");
    expect(img.src).toContain("https://example.com/a.png");
  });
});
