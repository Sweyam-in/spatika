import { describe, expect, it } from "vitest";
import { components } from "@/data/navigation";
import { getComponentDoc } from "./catalog";

describe("getComponentDoc", () => {
  it("builds intro, examples, API, and related links for Button", () => {
    const button = components.find((entry) => entry.slug === "button")!;
    const doc = getComponentDoc(button);
    expect(doc.intro).toMatch(/usually the right call/i);
    expect(doc.examples.some((example) => example.id === "basic")).toBe(true);
    expect(doc.examples.some((example) => example.id === "sizes")).toBe(true);
    expect(doc.api[0]?.name).toBe("Button");
    expect(doc.slots[0]?.className).toBe('[data-slot="button"]');
    expect(doc.classes.some((row) => row.className === '[data-slot="button"]')).toBe(true);
    expect(doc.related).toContain("icon-button");
    expect(doc.accessibility.length).toBeGreaterThan(0);
  });

  it("covers every catalog entry", () => {
    for (const entry of components) {
      const doc = getComponentDoc(entry);
      expect(doc.intro.length).toBeGreaterThan(24);
      expect(doc.examples[0]?.code.length).toBeGreaterThan(0);
      expect(doc.api.length).toBeGreaterThan(0);
      expect(doc.slots.length).toBeGreaterThan(0);
      expect(doc.classes.length).toBeGreaterThan(0);
      const usageIds = doc.usage.map((section) => section.id);
      expect(usageIds).toEqual([...new Set(usageIds)]);
    }
  });

  it("keeps AppHeader chrome usage distinct from the navigation category section", () => {
    const doc = getComponentDoc(components.find((entry) => entry.slug === "app-header")!);
    const ids = doc.usage.map((section) => section.id);
    expect(ids).toContain("chrome-variant");
    expect(ids).toContain("chrome");
    expect(ids.filter((id) => id === "chrome")).toHaveLength(1);
  });

  it("guides SpatikaEditor with scenario-led usage sections", () => {
    const doc = getComponentDoc(components.find((entry) => entry.slug === "spatika-editor")!);
    const when = doc.usage.find((section) => section.id === "when");
    const ai = doc.usage.find((section) => section.id === "ai");
    expect(when?.paragraphs.join(" ")).toMatch(/release notes|CRM logs/i);
    expect(when?.paragraphs.length).toBeGreaterThan(1);
    expect(ai?.paragraphs.join(" ")).toMatch(/don't call an LLM on your behalf/i);
  });

  it("guides app shell components with warm usage sections", () => {
    const chrome = getComponentDoc(components.find((entry) => entry.slug === "floating-page-chrome")!);
    const header = getComponentDoc(components.find((entry) => entry.slug === "app-header")!);
    expect(chrome.usage.find((section) => section.id === "when")?.paragraphs.join(" ")).toMatch(
      /control panel/i,
    );
    expect(header.usage.find((section) => section.id === "chrome-variant")?.paragraphs.length).toBeGreaterThan(
      1,
    );
  });
});
