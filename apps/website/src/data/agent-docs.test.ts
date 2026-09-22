import { describe, expect, it } from "vitest";
import { agentDocFiles, llmsTxt, usageSnippet } from "./agent-docs";
import { components } from "./navigation";

describe("agent docs", () => {
  it("emits llms.txt with install rules and catalog links", () => {
    const text = llmsTxt();
    expect(text).toContain("Must do");
    expect(text).toContain("@spatika/tokens/styles.css");
    expect(text).toContain("SpatikaThemeProvider");
    expect(text).toContain("/docs/button.md");
    expect(text).toContain("/docs/customize.md");
    expect(text).toContain("/docs/editor.md");
  });

  it("generates a markdown file for every component", () => {
    const files = agentDocFiles();
    const slugs = new Set(
      files.filter((file) => file.path.startsWith("docs/") && file.path.endsWith(".md")).map((file) => file.path),
    );
    for (const entry of components) {
      expect(slugs.has(`docs/${entry.slug}.md`)).toBe(true);
    }
    expect(usageSnippet("button")).toContain("<Button");
    const customize = files.find((file) => file.path === "docs/customize.md");
    expect(customize?.body).toContain("createTheme");
    expect(customize?.body).toContain("BREAKPOINTS");
    expect(files.some((file) => file.path === "docs/customize.md")).toBe(true);
  });

  it("sets markdown content types", () => {
    const button = agentDocFiles().find((file) => file.path === "docs/button.md");
    expect(button?.contentType).toContain("text/markdown");
    expect(button?.body).toContain("import { Button }");
    expect(button?.body).toContain("## Props");
    expect(button?.body).toContain("## Slots");
    expect(button?.body).toContain("## CSS classes");
    expect(button?.body).toContain('[data-slot="button"]');
  });
});
