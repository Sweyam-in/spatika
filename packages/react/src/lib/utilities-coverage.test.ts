/**
 * Guards the hand-authored utility layer in `@spatika/tokens`.
 *
 * 2.3.0 replaced the Tailwind build with a first-party `utilities.css`, and every class
 * the generator missed (integer spacing steps, all z-index layers, `min-w-0`, …) silently
 * shipped without a rule. This test fails when library source uses a utility-shaped class
 * that no stylesheet defines, so the utility layer can never drift from the components again.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { classCandidates, definedClasses, sourceFiles } from "../../../../scripts/lib/class-scan.mjs";

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
    expect(css).toMatch(/\.bg-gradient-to-t \{\s*--spk-u-gradient-position: to top in oklab;\s*background-image: linear-gradient\(var\(--spk-u-gradient-stops\)\);/);
    expect(css).toContain("--spk-u-gradient-stops: var(--spk-u-gradient-via-stops,");
  });

  it("is the current output of the utility compiler (run `npm run utilities`)", async () => {
    const { buildUtilities } = await import("../../../../scripts/build-utilities.mjs");
    const committed = readFileSync(join(packagesRoot, "tokens/src/utilities.css"), "utf8");
    expect(committed === buildUtilities()).toBe(true);
  });

  it("ships plain CSS — no Tailwind-only at-rules", () => {
    const tokenDir = join(packagesRoot, "tokens/src");
    for (const file of readdirSync(tokenDir).filter((name) => name.endsWith(".css"))) {
      const css = readFileSync(join(tokenDir, file), "utf8");
      expect(css, file).not.toMatch(/@(?:custom-variant|theme|apply|tailwind|plugin)\b/);
    }
  });
});
