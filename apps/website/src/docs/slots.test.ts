import { describe, expect, it } from "vitest";
import { components } from "@/data/navigation";
import { getSlots } from "./slots";

describe("getSlots", () => {
  it("documents Card layout slots and Button asChild", () => {
    const card = components.find((entry) => entry.slug === "card")!;
    const names = getSlots(card).map((slot) => slot.name);
    expect(names).toEqual(
      expect.arrayContaining(["card", "card-header", "card-title", "card-content", "card-footer"]),
    );
    expect(getSlots(card).find((slot) => slot.name === "card-header")?.exportName).toBe("CardHeader");

    const button = components.find((entry) => entry.slug === "button")!;
    expect(getSlots(button)[0]?.className).toBe('[data-slot="button"]');
    expect(getSlots(button)[0]?.description).toContain("asChild");
  });

  it("returns at least a root slot for every catalog entry", () => {
    for (const entry of components) {
      const slots = getSlots(entry);
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0]?.name.length).toBeGreaterThan(0);
    }
  });
});
