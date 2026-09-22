import { describe, expect, it } from "vitest";
import { components } from "@/data/navigation";
import { basicSource } from "./source";

describe("basicSource", () => {
  it("returns a Button demo that imports from @spatika/react", () => {
    const button = components.find((entry) => entry.slug === "button")!;
    const code = basicSource(button);
    expect(code).toContain('from "@spatika/react"');
    expect(code).toContain("<Button");
    expect(code).toContain("variant=\"glass\"");
  });

  it("returns a BarChart demo that imports from @spatika/charts", () => {
    const bar = components.find((entry) => entry.slug === "bar-chart")!;
    const code = basicSource(bar);
    expect(code).toContain('from "@spatika/charts"');
    expect(code).toContain("<BarChart");
  });

  it("falls back to a self-closing tag for unknown slugs", () => {
    const code = basicSource({
      slug: "unknown-widget",
      name: "UnknownWidget",
      category: "Primitives",
      description: "Missing",
      importName: "UnknownWidget",
    });
    expect(code).toContain("UnknownWidget");
    expect(code).toContain("<UnknownWidget />");
  });

  it("keeps career and project demos free of personal portfolio copy", () => {
    const career = components.find((entry) => entry.slug === "career-card")!;
    const project = components.find((entry) => entry.slug === "project-card")!;
    const joined = `${basicSource(career)}\n${basicSource(project)}`;
    expect(joined).not.toMatch(/Nissan|OmniChannel|Trivandrum|sreelal\.me/i);
    expect(joined).toContain("Sweyam");
    expect(joined).toContain("Spatika UI");
  });
});
