#!/usr/bin/env node
/**
 * TypeScript emits the module specifiers it was given, so `import { x } from "./lib/portal"`
 * stays extensionless in dist. Bundlers cope; Node's ESM resolver does not, which breaks SSR,
 * React Server Components and any `node --import` consumer.
 *
 * This rewrites relative specifiers in the emitted `.js` and `.d.ts` files to explicit
 * `./x.js` / `./x/index.js` form. Run it after `tsc` in each package build.
 *
 *   node ../../scripts/fix-esm-extensions.mjs dist
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "dist");

/** `from "…"`, `import("…")` and bare `import "…"` side-effect specifiers. */
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']*)\2/g;

function resolveSpecifier(fileDir, spec) {
  if (/\.(js|mjs|cjs|json|css|svg)$/.test(spec)) return spec;
  const target = join(fileDir, spec);
  if (existsSync(`${target}.js`)) return `${spec}.js`;
  if (existsSync(join(target, "index.js"))) return `${spec}/index.js`;
  return spec;
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(js|d\.ts)$/.test(entry.name)) yield path;
  }
}

let files = 0;
let rewrites = 0;
for await (const file of walk(root)) {
  const source = await readFile(file, "utf8");
  let changed = 0;
  const next = source.replace(SPECIFIER, (match, prefix, quote, spec) => {
    const fixed = resolveSpecifier(dirname(file), spec);
    if (fixed === spec) return match;
    changed += 1;
    return `${prefix}${quote}${fixed}${quote}`;
  });
  if (changed) {
    await writeFile(file, next);
    files += 1;
    rewrites += changed;
  }
}
console.log(`esm extensions: ${rewrites} specifiers in ${files} files under ${root}`);
