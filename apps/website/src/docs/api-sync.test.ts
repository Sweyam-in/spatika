/**
 * Keeps the documentation honest about the code.
 *
 * `generated/api.json` is extracted from the package source (`npm run docs:api`). These tests
 * fail when the generated file is stale, or when a hand-written prop table documents a prop
 * the component does not have — the kind of drift that leaves copy-paste examples broken.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { components } from "@/data/navigation";
import api from "@/generated/api.json";
import { apiBySlug, getApi } from "./api";

type Generated = Record<string, { props: { name: string }[]; extends?: string[] }>;
const generated = api as Generated;
const repoRoot = path.resolve(__dirname, "../../../..");

/** Attributes components receive through their HTML element spread. */
const HTML_ATTRIBUTES = new Set([
  "className", "children", "style", "id", "title", "role", "tabIndex", "hidden",
  "onClick", "onChange", "onKeyDown", "onFocus", "onBlur", "disabled", "type", "name", "value",
  "defaultValue", "placeholder", "href", "target", "rel", "src", "alt", "width", "height",
  "readOnly", "required", "autoFocus", "autoComplete", "min", "max", "step", "rows",
]);

describe("API reference sync", () => {
  it("generated/api.json matches the package source", () => {
    expect(() =>
      execFileSync(
        process.execPath,
        [
          "scripts/extract-api.mjs",
          "--entry", "packages/react/src/index.ts",
          "--tsconfig", "packages/react/tsconfig.json",
          "--out", "apps/website/src/generated/api.json",
          "--check",
        ],
        { cwd: repoRoot, stdio: "pipe" },
      ),
    ).not.toThrow();
  }, 60_000);

  it("generated/demo-sources.json matches the demo files", () => {
    expect(() =>
      execFileSync(process.execPath, ["apps/website/scripts/sync-demo-sources.mjs", "--check"], {
        cwd: repoRoot,
        stdio: "pipe",
      }),
    ).not.toThrow();
  });

  it("documents only props that exist", () => {
    const stale: string[] = [];
    for (const [slug, sections] of Object.entries(apiBySlug)) {
      for (const section of sections) {
        const names = section.name.split(/\s*\/\s*/);
        const known = names.map((name) => generated[name.replace(/\(\)$/, "")]).filter(Boolean);
        if (!known.length) continue; // hooks and compound-part groups are documented by hand
        const own = new Set(known.flatMap((entry) => entry.props.map((prop) => prop.name)));
        const inheritsHtml = known.some((entry) => entry.extends?.includes("HTML attributes"));
        for (const prop of section.props) {
          for (const name of prop.name.split(/\s*\/\s*/)) {
            if (own.has(name) || (inheritsHtml && HTML_ATTRIBUTES.has(name))) continue;
            if (name.startsWith("aria-") || name.startsWith("data-") || name === "…" || name === "...props") continue;
            stale.push(`${slug}: ${section.name}.${name}`);
          }
        }
      }
    }
    expect(stale).toEqual([]);
  });

  it("gives every catalog entry a real prop table", () => {
    for (const entry of components) {
      const [section] = getApi(entry);
      expect(section.props.length, entry.slug).toBeGreaterThan(0);
    }
  });
});
