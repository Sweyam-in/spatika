import { describe, expect, it } from "vitest";
import { components } from "@/data/navigation";
import { PLAYGROUNDS, controlsFor, literalOptions, playgroundCode } from "./playground";

describe("playground model", () => {
  it("reads union options from the generated types", () => {
    expect(literalOptions('"sm" | "md" | null')).toEqual(["sm", "md"]);
    expect(literalOptions("number | InputSize")).toBeNull();
  });

  it("derives controls from the real API, starting value first", () => {
    const controls = controlsFor(PLAYGROUNDS.button);
    const variant = controls.find((control) => control.name === "variant");
    expect(variant).toMatchObject({ kind: "select" });
    expect(variant && "options" in variant && variant.options[0]).toBe("primary");
    expect(variant && "options" in variant && variant.options).toContain("destructive-soft");
    expect(controls.find((control) => control.name === "loading")).toMatchObject({ kind: "boolean" });
    expect(controls.some((control) => control.name === "className" || control.name === "asChild")).toBe(false);
  });

  it("generates code with only meaningful props", () => {
    const code = playgroundCode(PLAYGROUNDS.button, { children: "Save", variant: "destructive", loading: true, disabled: false, asChild: false });
    expect(code).toContain('import { Button } from "@spatika/react";');
    expect(code).toContain('<Button variant="destructive" loading>Save</Button>');
    expect(code).not.toContain("disabled");
  });

  it("only offers playgrounds for catalogued components with controls", () => {
    for (const [slug, config] of Object.entries(PLAYGROUNDS)) {
      expect(components.some((entry) => entry.slug === slug), slug).toBe(true);
      expect(controlsFor(config).length, slug).toBeGreaterThan(0);
    }
  });
});
