import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const tokensRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../tokens/src",
);

describe("@spatika/tokens", () => {
  it("defines four theme roots", () => {
    const css = readFileSync(join(tokensRoot, "tokens.css"), "utf8");
    expect(css).toContain(":root");
    expect(css).toContain(".neelam");
    expect(css).toContain(".usha");
    expect(css).toContain(".sandhya");
    expect(css).toContain("--glass-bg");
    expect(css).toContain("--primary");
  });

  it("ships glass utilities and a11y helpers", () => {
    const css = readFileSync(join(tokensRoot, "glass.css"), "utf8");
    expect(css).toContain(".glass");
    expect(css).toContain(".glass-panel");
    expect(css).toContain(".spk-focus-ring");
    expect(css).toContain(".spk-touch-target");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toContain(".glass-tabbar");
    expect(css).toContain(".glass-page-toolbar");
  });

  it("ships app chrome, cover bleed, and page-header type", () => {
    const chrome = readFileSync(join(tokensRoot, "chrome.css"), "utf8");
    expect(chrome).toContain(".app-chrome-header");
    expect(chrome).toContain("data-cover-chrome-bleed");
    expect(chrome).toContain("[data-cover-bleed=\"true\"]");
    expect(chrome).toContain("inset: 0");
    expect(chrome).toContain(".glass-page-toolbar");
    expect(chrome).toContain(".app-page-chrome");
    const tokens = readFileSync(join(tokensRoot, "tokens.css"), "utf8");
    expect(tokens).toContain("--app-tabbar-height");
    expect(tokens).toContain("--app-chrome-offset");
    const surfaces = readFileSync(join(tokensRoot, "surfaces.css"), "utf8");
    expect(surfaces).toContain(".page-header-title");
  });

  it("respects reduced motion in base styles", () => {
    const css = readFileSync(join(tokensRoot, "base.css"), "utf8");
    expect(css).toContain("prefers-reduced-motion");
  });
});
