/**
 * Guards the hand-authored utility layer in `@spatika/tokens`.
 *
 * 2.3.0 replaced the Tailwind build with a first-party `utilities.css`, and every class
 * the generator missed (integer spacing steps, all z-index layers, `min-w-0`, …) silently
 * shipped without a rule. This test fails when library source uses a utility-shaped class
 * that no stylesheet defines, so the utility layer can never drift from the components again.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packagesRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function readCss(): string {
  const tokenDir = join(packagesRoot, "tokens/src");
  return [
    ...readdirSync(tokenDir)
      .filter((file) => file.endsWith(".css"))
      .map((file) => readFileSync(join(tokenDir, file), "utf8")),
    readFileSync(join(packagesRoot, "editor/src/styles/editor.css"), "utf8"),
  ].join("\n");
}

function definedClasses(css: string): Set<string> {
  const defined = new Set<string>();
  for (const match of css.matchAll(/\.((?:\\.|[\w-])+)/g)) {
    defined.add(match[1].replace(/\\(.)/g, "$1"));
  }
  return defined;
}

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== "test" && name !== "__tests__") sourceFiles(path, out);
    } else if (/\.tsx?$/.test(name) && !/\.(test|spec)\.tsx?$/.test(name)) {
      out.push(path);
    }
  }
  return out;
}

/** Utility roots Spatika's class strings are built from. Anything else is prose or an identifier. */
const UTILITY =
  /^!?-?(?:(?:flex|grid|inline|outline|text|bg|border|rounded|shadow|ring|font|leading|tracking|whitespace|break|line-clamp|cursor|pointer-events|select|transition|duration|ease|animate|opacity|z|inset|top|left|right|bottom|start|end|order|col|row|grid-cols|grid-rows|gap|space|divide|p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|w|h|size|min-w|min-h|max-w|max-h|items|justify|self|content|place|shrink|grow|basis|aspect|object|overflow|overscroll|scroll|snap|fill|stroke|from|via|to|translate|scale|rotate|origin|backdrop|blur|decoration|underline-offset|align|list|accent|caret|appearance|resize|touch|will-change|columns|table|caption|field-sizing)-[^\s]+)$/;

/** Utilities that take no value suffix. */
const STANDALONE = new Set([
  "flex", "grid", "inline", "inline-flex", "inline-block", "inline-grid", "block", "hidden",
  "contents", "absolute", "relative", "fixed", "sticky", "static", "isolate", "truncate",
  "underline", "uppercase", "lowercase", "capitalize", "italic", "tabular-nums", "sr-only",
  "outline", "grow", "shrink", "border", "rounded", "shadow", "ring", "transition", "invisible",
  "visible", "line-through", "antialiased", "container",
]);

/** Utility-shaped tokens that are really identifiers (slot names, token names, prop values). */
const NOT_CLASSES = new Set([
  "text-field",
  "text-field-helper",
  "text-style",
  "grid-template-rows",
  "z-index",
  "gap-start",
  "gap-end",
]);

function isUtility(token: string): boolean {
  if (NOT_CLASSES.has(token)) return false;
  // Strip variant prefixes (hover:, md:, data-[state=open]:, [&>svg]: …) before matching the root.
  const base = token.replace(/^(?:(?:[\w-]+(?:-\[[^\]]*\])?(?:\/[\w-]+)?|\[[^\]]*\]):)+/, "");
  return STANDALONE.has(base.replace(/^!/, "")) || UTILITY.test(base);
}

/**
 * A string is a class list when it has two or more tokens and most of them are utilities.
 * A lone token counts only when it is unmistakably a utility — it carries a step, an
 * arbitrary value or a variant (`left-5`, `aspect-[4/3]`, `active:translate-y-px`), or is an
 * `animate-*` class. Bare words ("list-item", "bottom-center") are slot names and prop values.
 */
function classCandidates(source: string): string[] {
  const tokens: string[] = [];
  for (const match of source.matchAll(/(["'`])((?:(?!\1)[^\n\\]|\\.)*)\1/g)) {
    const value = match[2];
    if (/[{}();=<>]|\$\{/.test(value.replace(/\[[^\]]*\]/g, ""))) continue;
    const parts = value.split(/\s+/).filter(Boolean);
    const utilities = parts.filter(isUtility);
    if (parts.length === 1) {
      const [token] = parts;
      if (utilities.length && (/[\d[:/]/.test(token) || token.startsWith("animate-"))) {
        tokens.push(token);
      }
      continue;
    }
    if (utilities.length * 2 < parts.length) continue;
    tokens.push(...utilities);
  }
  return tokens;
}

describe("utility layer coverage", () => {
  it("defines a rule for every utility class used by the published packages", () => {
    const defined = definedClasses(readCss());
    const missing = new Map<string, Set<string>>();
    const roots = ["react/src", "charts/src", "editor/src"].map((dir) => join(packagesRoot, dir));

    for (const file of roots.flatMap((root) => sourceFiles(root))) {
      for (const token of classCandidates(readFileSync(file, "utf8"))) {
        if (defined.has(token)) continue;
        const files = missing.get(token) ?? new Set<string>();
        files.add(relative(packagesRoot, file));
        missing.set(token, files);
      }
    }

    const report = [...missing.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([token, files]) => `${token}  (${[...files].slice(0, 2).join(", ")})`);
    expect(report).toEqual([]);
  });

  it("points every dark: utility at Spatika's dark themes", () => {
    const css = readFileSync(join(packagesRoot, "tokens/src/utilities.css"), "utf8");
    const darkRules = css.split("\n").filter((line) => line.includes(".dark\\:"));
    expect(darkRules.length).toBeGreaterThan(0);
    for (const rule of darkRules) {
      expect(rule).toContain(".neelam");
      expect(rule).toContain(".sandhya");
    }
  });

  it("builds gradient direction utilities from their from/via/to stops", () => {
    const css = readFileSync(join(packagesRoot, "tokens/src/utilities.css"), "utf8");
    const rules = css.split("\n").filter((line) => line.includes(".bg-gradient-to-"));
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) expect(rule).toContain("var(--spk-gradient-stops");
    expect(css).toContain(".bg-gradient-to-t{background-image:linear-gradient(to top,");
  });

  it("ships plain CSS — no Tailwind-only at-rules", () => {
    const tokenDir = join(packagesRoot, "tokens/src");
    for (const file of readdirSync(tokenDir).filter((name) => name.endsWith(".css"))) {
      const css = readFileSync(join(tokenDir, file), "utf8");
      expect(css, file).not.toMatch(/@(?:custom-variant|theme|apply|tailwind|plugin)\b/);
    }
  });
});
