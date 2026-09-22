import { describe, expect, it } from "vitest";
import { components } from "@/data/navigation";
import { getClasses } from "./classes";

describe("getClasses", () => {
  it("lists data-slot selectors and named token classes", () => {
    const button = components.find((entry) => entry.slug === "button")!;
    expect(getClasses(button).some((row) => row.className === '[data-slot="button"]')).toBe(true);

    const card = components.find((entry) => entry.slug === "card")!;
    const names = getClasses(card).map((row) => row.className);
    expect(names).toContain('[data-slot="card"]');
    expect(names).toContain(".glass-panel");

    const bar = components.find((entry) => entry.slug === "bar-chart")!;
    expect(getClasses(bar).some((row) => row.className === ".spk-chart")).toBe(true);
  });

  it("covers every catalog entry", () => {
    for (const entry of components) {
      expect(getClasses(entry).length).toBeGreaterThan(0);
    }
  });

  it("skips placeholder class names", () => {
    const sheet = components.find((entry) => entry.slug === "filter-sheet")!;
    expect(getClasses(sheet).some((row) => row.className === "—")).toBe(false);
  });
});
