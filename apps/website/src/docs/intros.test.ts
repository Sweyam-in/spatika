import { describe, expect, it } from "vitest";
import { components } from "@/data/navigation";
import { getIntro } from "./intros";

describe("getIntro", () => {
  it("explains what Button does, not only that it exists", () => {
    const button = components.find((entry) => entry.slug === "button")!;
    const intro = getIntro(button);
    expect(intro).toMatch(/primary|right call/i);
    expect(intro).toContain("touch");
    expect(intro.length).toBeGreaterThan(button.description.length);
  });

  it("covers every catalog entry with a full sentence", () => {
    for (const entry of components) {
      const intro = getIntro(entry);
      expect(intro.length).toBeGreaterThan(24);
      expect(intro).toMatch(/[.!]/);
    }
  });

  it("falls back for unknown slugs", () => {
    const intro = getIntro({
      slug: "unknown-widget",
      name: "UnknownWidget",
      category: "Primitives",
      description: "A missing composite",
      importName: "UnknownWidget",
    });
    expect(intro).toContain("A missing composite");
    expect(intro).toContain("@spatika/react");
  });

  it("explains SpatikaEditor with scenario-led prose", () => {
    const entry = components.find((item) => item.slug === "spatika-editor")!;
    const intro = getIntro(entry);
    expect(intro).toMatch(/textarea just won't cut it/i);
    expect(intro).toMatch(/your own backend/i);
    expect(intro.length).toBeGreaterThan(entry.description.length * 2);
  });

  it("explains AppHeader as product chrome with warm prose", () => {
    const entry = components.find((item) => item.slug === "app-header")!;
    const intro = getIntro(entry);
    expect(intro).toMatch(/top of every screen/i);
    expect(intro).toMatch(/FloatingPageChromeBar/i);
    expect(intro.length).toBeGreaterThan(entry.description.length * 2);
  });
});
