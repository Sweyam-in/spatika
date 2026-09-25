#!/usr/bin/env node
/**
 * Rebuilds archive documentation for releases published before per-release docs existed.
 *
 *   node scripts/docs-archive.mjs 2.3.0 2.2.0 …     # or --all
 *
 * For each version it downloads the published @spatika/react, charts and editor tarballs from
 * npm, extracts the API from `dist/index.d.ts` with scripts/extract-api.mjs, takes that
 * version's section of the package CHANGELOG.md, and writes
 * apps/website/public/docs/v<version>/archive.json. Nothing is invented: if a tarball or its
 * type definitions are missing, the version is skipped with a reason.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outRoot = path.join(root, "apps/website/public/docs");
const PACKAGES = ["react", "charts", "editor", "tokens"];

function npm(args, cwd) {
  return execFileSync("npm", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function publishedVersions() {
  return JSON.parse(npm(["view", "@spatika/react", "versions", "--json"], root));
}

function changelogSection(changelog, version) {
  const lines = changelog.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  if (start < 0) return "";
  const end = lines.findIndex((line, index) => index > start && /^## \d/.test(line));
  return lines.slice(start + 1, end < 0 ? undefined : end).join("\n").trim();
}

function archive(version) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), `spatika-${version}-`));
  try {
    const modules = path.join(work, "node_modules", "@spatika");
    fs.mkdirSync(modules, { recursive: true });
    for (const name of PACKAGES) {
      let tarball;
      try {
        tarball = npm(["pack", `@spatika/${name}@${version}`, "--silent"], work).split("\n").pop();
      } catch {
        if (name === "react") throw new Error(`@spatika/react@${version} is not on npm`);
        continue; // charts / editor did not exist in early 1.x
      }
      const dest = path.join(modules, name);
      fs.mkdirSync(dest, { recursive: true });
      execFileSync("tar", ["xzf", path.join(work, tarball), "-C", dest, "--strip-components=1"]);
    }
    // Third-party types (React, class-variance-authority, cmdk, vaul …) resolve from the
    // repository install; only @spatika/* comes from the published tarballs.
    for (const name of fs.readdirSync(path.join(root, "node_modules"))) {
      if (name === "@spatika" || name.startsWith(".")) continue;
      fs.symlinkSync(path.join(root, "node_modules", name), path.join(work, "node_modules", name), "dir");
    }

    const entry = path.join(modules, "react", "dist", "index.d.ts");
    if (!fs.existsSync(entry)) throw new Error(`@spatika/react@${version} has no dist/index.d.ts`);
    const components = JSON.parse(
      execFileSync(process.execPath, [path.join(root, "scripts/extract-api.mjs"), "--entry", entry], {
        cwd: work,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      }),
    );
    // Tarballs do not ship CHANGELOG.md; the repository changelog is the record of every release.
    const changelogPath = [path.join(modules, "react", "CHANGELOG.md"), path.join(root, "packages/react/CHANGELOG.md")].find(
      (file) => fs.existsSync(file) && changelogSection(fs.readFileSync(file, "utf8"), version),
    );
    const releaseNotes = changelogPath ? changelogSection(fs.readFileSync(changelogPath, "utf8"), version) : "";

    const out = path.join(outRoot, `v${version}`);
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(
      path.join(out, "archive.json"),
      JSON.stringify({
        version,
        package: "@spatika/react",
        source: "npm",
        generated: new Date().toISOString().slice(0, 10),
        releaseNotes,
        components,
      }),
    );
    return Object.keys(components).length;
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

const args = process.argv.slice(2);
const versions = args.includes("--all") ? publishedVersions() : args.filter((arg) => !arg.startsWith("--"));
if (!versions.length) {
  console.error("usage: docs-archive.mjs <version…> | --all");
  process.exit(2);
}
let failed = 0;
for (const version of versions) {
  try {
    console.log(`v${version}: ${archive(version)} components`);
  } catch (error) {
    failed += 1;
    console.error(`v${version}: skipped — ${error instanceof Error ? error.message : error}`);
  }
}
process.exit(failed && failed === versions.length ? 1 : 0);
