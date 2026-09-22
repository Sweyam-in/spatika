import { describe, expect, it } from "vitest";
import { SNIPPETS } from "./agent-snippets";
import { components } from "./navigation";

describe("agent snippets", () => {
  it("covers every catalog slug", () => {
    const missing = components.filter((entry) => !SNIPPETS[entry.slug]);
    expect(missing.map((entry) => entry.slug)).toEqual([]);
  });

  it("imports BarChart from @spatika/charts", () => {
    expect(SNIPPETS["bar-chart"]).toContain('from "@spatika/charts"');
    expect(SNIPPETS["bar-chart"]).toContain("<BarChart");
  });

  it("keeps marketing snippets free of personal portfolio copy", () => {
    const joined = Object.values(SNIPPETS).join("\n");
    expect(joined).not.toMatch(/Nissan|OmniChannel|Trivandrum|mail@sreelal/i);
    expect(SNIPPETS["career-card"]).toContain("Sweyam");
    expect(SNIPPETS["project-card"]).toContain("Spatika UI");
  });
});
