import { describe, expect, it } from "vitest";
import {
  componentCategories,
  componentImportCode,
  componentImportPackage,
  components,
  customizeNav,
  guideNav,
} from "./navigation";

describe("navigation catalog", () => {
  it("has unique slugs and known categories", () => {
    const slugs = components.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const entry of components) {
      expect(componentCategories).toContain(entry.category);
      expect(entry.importName.length).toBeGreaterThan(0);
    }
  });

  it("links customize and AI agent guides", () => {
    expect(customizeNav.some((item) => item.to === "/customize#creating-a-theme")).toBe(true);
    expect(guideNav.some((item) => item.to === "/guides#ai-agents")).toBe(true);
  });

  it("includes an Editor category alongside Charts", () => {
    expect(componentCategories).toContain("Editor");
    expect(components.some((entry) => entry.category === "Editor" && entry.slug === "spatika-editor")).toBe(
      true,
    );
  });
});

describe("component import helpers", () => {
  it("maps categories to packages", () => {
    expect(componentImportPackage("Charts")).toBe("@spatika/charts");
    expect(componentImportPackage("Editor")).toBe("@spatika/editor");
    expect(componentImportPackage("Forms")).toBe("@spatika/react");
  });

  it("includes editor styles in editor import code", () => {
    expect(
      componentImportCode({
        slug: "spatika-editor",
        name: "SpatikaEditor",
        category: "Editor",
        description: "",
        importName: "SpatikaEditor",
      }),
    ).toContain("@spatika/editor/styles.css");
  });
});
