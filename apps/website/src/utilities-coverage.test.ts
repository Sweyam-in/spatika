/**
 * The docs site's demos and pages use Spatika utilities too — every one needs a CSS rule,
 * from the tokens package or the site's own stylesheet.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { classCandidates, definedClasses, sourceFiles } from "../../../scripts/lib/class-scan.mjs";

const repoRoot = join(__dirname, "../../..");
const tokenDir = join(repoRoot, "packages/tokens/src");

describe("docs site utility coverage", () => {
  it("defines a rule for every utility class the site uses", () => {
    const css = [
      ...readdirSync(tokenDir)
        .filter((file) => file.endsWith(".css"))
        .map((file) => readFileSync(join(tokenDir, file), "utf8")),
      readFileSync(join(repoRoot, "packages/editor/src/styles/editor.css"), "utf8"),
      readFileSync(join(__dirname, "styles.css"), "utf8"),
    ].join("\n");
    const defined = definedClasses(css);
    const missing = new Map<string, string>();
    for (const file of sourceFiles(__dirname)) {
      for (const token of classCandidates(readFileSync(file, "utf8"))) {
        if (!defined.has(token) && !missing.has(token)) missing.set(token, relative(repoRoot, file));
      }
    }
    expect([...missing].map(([token, file]) => `${token}  (${file})`).sort()).toEqual([]);
  });
});
