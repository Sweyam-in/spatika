import { describe, expect, it } from "vitest";
import { createCompiler, escapeClass } from "./compile";
import { Engine } from "./engine";
import { extractCandidates } from "./scan";

const compiler = createCompiler();
const css = (...classes: string[]) => compiler.build(classes);

describe("utilities", () => {
  it("resolves semantic colours to Spatika tokens, with opacity via color-mix", () => {
    expect(css("bg-surface")).toContain("background-color: var(--spk-surface);");
    expect(css("text-fg-secondary")).toContain("color: var(--spk-text-secondary);");
    expect(css("bg-muted/20")).toContain("background-color: color-mix(in oklab, var(--muted) 20%, transparent);");
    expect(css("border-line/[0.35]")).toContain("color-mix(in oklab, var(--spk-border) 35%, transparent)");
  });

  it("keeps the Tailwind palette so existing markup renders unchanged", () => {
    expect(css("text-amber-600")).toContain("color: oklch(66.6% 0.179 58.318);");
  });

  it("builds spacing, fractions, negatives and arbitrary values", () => {
    expect(css("p-4")).toContain("padding: calc(0.25rem * 4);");
    expect(css("-mt-2")).toContain("margin-top: calc(0.25rem * -2);");
    expect(css("w-1/2")).toContain("width: calc(1 / 2 * 100%);");
    expect(css("h-[calc(100vh-4rem)]")).toContain("height: calc(100vh - 4rem);");
    expect(css("grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]")).toContain(
      "grid-template-columns: repeat(auto-fill,minmax(12rem,1fr));",
    );
  });

  it("maps type, radius and shadow scales onto Spatika tokens", () => {
    expect(css("text-title-2")).toContain("font-size: var(--spk-text-title-2);");
    expect(css("rounded-lg")).toContain("border-radius: var(--spk-radius-sm);");
    expect(css("shadow-md")).toContain("--spk-u-shadow: var(--spk-shadow-md);");
  });

  it("ignores anything that is not a utility", () => {
    expect(css("hello", "useState", "px-", "bg-notacolor")).toBe("");
  });
});

describe("variants", () => {
  it("wraps hover in a hover-capable media query", () => {
    expect(css("hover:bg-surface")).toMatch(/@media \(hover: hover\) \{\s*\.hover\\:bg-surface:hover \{/);
  });

  it("points dark: at Spatika's dark themes", () => {
    expect(css("dark:text-fg")).toContain(".dark\\:text-fg:is(.neelam *, .sandhya *, .neelam, .sandhya)");
  });

  it("supports group/peer names, data and aria attributes, and arbitrary selectors", () => {
    expect(css("group-hover/card:opacity-100")).toContain(":is(:where(.group\\/card):hover *)");
    expect(css("peer-disabled:opacity-50")).toContain(":is(:where(.peer):disabled ~ *)");
    expect(css("data-[state=open]:flex")).toContain('[data-state="open"]');
    expect(css("aria-invalid:border-danger")).toContain('[aria-invalid="true"]');
    expect(css("[&>svg]:size-4")).toContain("> svg");
  });

  it("orders breakpoints after base utilities so responsive overrides win", () => {
    const out = css("md:flex", "hidden", "sm:block");
    expect(out.indexOf(".hidden")).toBeLessThan(out.indexOf(".sm\\:block"));
    expect(out.indexOf(".sm\\:block")).toBeLessThan(out.indexOf(".md\\:flex"));
  });

  it("adds content to before/after only when the utility does not set it", () => {
    expect(css("after:absolute")).toContain("content: var(--spk-u-content);");
    const out = css("before:content-['']");
    expect(out.match(/content: var\(--spk-u-content\)/g)).toHaveLength(1);
  });
});

describe("theme overrides", () => {
  it("adds app colours without losing the defaults", () => {
    const app = createCompiler({ theme: { colors: { brand: "var(--brand)" } } });
    const out = app.build(["bg-brand", "bg-surface"]);
    expect(out).toContain("background-color: var(--brand);");
    expect(out).toContain("background-color: var(--spk-surface);");
  });
});

describe("scanning", () => {
  it("finds classes in JSX, arrays, template literals and arbitrary values", () => {
    const found = extractCandidates(
      `<div className={cn(["flex", "gap-2"], open && 'bg-surface/80', \`p-4 \${x}\`)} data-x="content-['']">` +
        `<span class="shadow-[0_2px_8px_rgba(0,0,0,.1)] [&>svg]:size-4 hover:text-fg"/>`,
    );
    for (const cls of ["flex", "gap-2", "bg-surface/80", "p-4", "content-['']", "shadow-[0_2px_8px_rgba(0,0,0,.1)]", "[&>svg]:size-4", "hover:text-fg"]) {
      expect(found, cls).toContain(cls);
    }
  });

  it("escapes class names for selectors", () => {
    expect(escapeClass("md:w-1/2")).toBe("md\\:w-1\\/2");
    expect(escapeClass("2xl:p-4")).toBe("\\32 xl\\:p-4");
  });
});

describe("engine directive", () => {
  it("replaces @spatika utilities; and leaves other stylesheets alone", () => {
    const engine = new Engine({ content: [], spatika: false, safelist: ["flex"] });
    expect(engine.transform(".a{color:red}")).toBeNull();
    expect(engine.transform("@spatika utilities;\n.a{color:red}")).toContain(".flex {");
  });
});
