#!/usr/bin/env node
/**
 * Versioned documentation builds. Nothing here publishes packages or deploys the site —
 * it produces a directory you deploy yourself.
 *
 *   node scripts/release-docs.mjs manifest [--site-dir <dir>]
 *       Rebuild versions.json from npm (published versions + dates) and the snapshots that
 *       exist in <dir>. Writes apps/website/public/versions.json (and <dir>/versions.json).
 *
 *   node scripts/release-docs.mjs release --site-dir <dir> [--version X.Y.Z] [--skip-tests]
 *       For a release commit: validate, then build the site for the root (latest) and an
 *       immutable snapshot at <dir>/docs/vX.Y.Z/. Pre-release versions only get a snapshot.
 *
 *   node scripts/release-docs.mjs next --site-dir <dir>
 *       Build development docs for the current checkout at <dir>/next/.
 *
 *   node scripts/release-docs.mjs verify --site-dir <dir>
 *       Check every version in versions.json still resolves in <dir>.
 *
 *   node scripts/release-docs.mjs site --site-dir <dir> [--skip-tests] [--published]
 *       Bring a persistent site directory up to date with the checkout, whatever it is — what the
 *       Docker image runs on every deploy. A released checkout (its version is on npm and no
 *       changesets are pending) gets its snapshot if missing and becomes the root when it is the
 *       latest stable. Anything else is development: it goes to /next/, and to the root only
 *       while no release has been installed there yet. `--published` treats the version as
 *       published, to rehearse a release before `npm publish`.
 *
 * <dir> is the persistent copy of the deployed site. Existing /docs/v*\/ snapshots in it are
 * never modified or deleted — a release refuses to overwrite its own snapshot.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildManifest, parseVersion } from "./lib/versions.mjs";

const root = path.resolve(import.meta.dirname, "..");
const website = path.join(root, "apps/website");
const PACKAGES = ["tokens", "charts", "editor", "react"];

function args() {
  const [command, ...rest] = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < rest.length; i += 1) {
    if (!rest[i].startsWith("--")) continue;
    const next = rest[i + 1];
    options[rest[i].slice(2)] = next === undefined || next.startsWith("--") ? true : rest[++i];
  }
  return { command, options };
}

function run(cmd, cmdArgs, env = {}) {
  console.log(`$ ${cmd} ${cmdArgs.join(" ")}`);
  execFileSync(cmd, cmdArgs, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });
}

/** Changesets not yet applied by `npm run version-packages`: the checkout is ahead of its version. */
function pendingChangesets() {
  const dir = path.join(root, ".changeset");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => file.endsWith(".md") && file !== "README.md");
}

/** Records what the root was built from, so later builds know whether a release owns it. */
const ROOT_MARKER = "docs-root.json";

function readRootMarker(siteDir) {
  const file = path.join(siteDir, ROOT_MARKER);
  try {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
  } catch {
    return null;
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

function packageVersion() {
  return readJson(path.join(root, "packages/react/package.json")).version;
}

/** The four packages ship as one version and pin each other to it. */
function validateVersions(version) {
  const pending = pendingChangesets();
  if (pending.length) {
    fail(`Pending changesets (${pending.join(", ")}) — this checkout is not the ${version} release. Run: npm run version-packages`);
  }
  for (const name of PACKAGES) {
    const pkg = readJson(path.join(root, `packages/${name}/package.json`));
    if (pkg.version !== version) fail(`@spatika/${name} is ${pkg.version}, expected ${version}`);
    for (const [dep, range] of Object.entries(pkg.dependencies ?? {})) {
      // Exact, ^ or ~ ranges anchored at the release version all resolve to it.
      if (dep.startsWith("@spatika/") && range.replace(/^[\^~]/, "") !== version) {
        fail(`@spatika/${name} depends on ${dep}@${range}, expected ${version}`);
      }
    }
  }
  const changelog = fs.readFileSync(path.join(root, "packages/react/CHANGELOG.md"), "utf8");
  if (!changelog.split("\n").some((line) => line.trim() === `## ${version}`)) {
    fail(`packages/react/CHANGELOG.md has no "## ${version}" section — run: npm run version-packages`);
  }
}

function npmPublished() {
  try {
    const versions = JSON.parse(execFileSync("npm", ["view", "@spatika/react", "versions", "--json"], { encoding: "utf8" }));
    const time = JSON.parse(execFileSync("npm", ["view", "@spatika/react", "time", "--json"], { encoding: "utf8" }));
    return { versions: Array.isArray(versions) ? versions : [versions], dates: time };
  } catch (error) {
    fail(`Could not read published versions from npm: ${error instanceof Error ? error.message : error}`);
  }
}

function snapshotVersions(siteDir) {
  const docs = siteDir && path.join(siteDir, "docs");
  if (!docs || !fs.existsSync(docs)) return [];
  return fs
    .readdirSync(docs)
    .filter((dir) => dir.startsWith("v") && fs.existsSync(path.join(docs, dir, "index.html")))
    .map((dir) => dir.slice(1));
}

function writeManifest(siteDir, extraFull = [], extraPublished = []) {
  const { versions, dates } = npmPublished();
  // A snapshot in the site is a release that was built for deployment; keep listing it even if
  // the registry is behind (or it was built before `npm publish`).
  const published = [...new Set([...versions, ...extraPublished, ...snapshotVersions(siteDir)])];
  const today = new Date().toISOString();
  for (const version of extraPublished) dates[version] ??= today;
  const current = packageVersion();
  const manifest = buildManifest({
    published,
    dates,
    fullDocs: [...snapshotVersions(siteDir), ...extraFull],
    development: current,
  });
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  fs.writeFileSync(path.join(website, "public/versions.json"), json);
  if (siteDir) {
    fs.mkdirSync(siteDir, { recursive: true });
    fs.writeFileSync(path.join(siteDir, "versions.json"), json);
  }
  console.log(`versions.json: latest ${manifest.latest}, ${manifest.versions.length} entries`);
  return manifest;
}

function buildPackages() {
  for (const name of PACKAGES) run("npm", ["run", "build", "-w", `@spatika/${name}`]);
}

/** Builds the docs site into `outDir` for `base`. Archives are served from the root only. */
function buildSite({ outDir, base, version, channel }) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "spatika-docs-"));
  run("npm", ["run", "build", "-w", "@spatika/website"], {
    DOCS_OUT_DIR: temp,
    VITE_BASE_PATH: base,
    VITE_DOCS_VERSION: version,
    VITE_DOCS_CHANNEL: channel,
  });
  if (base !== "/") {
    // Snapshots read /versions.json and /docs/v*/archive.json from the root.
    fs.rmSync(path.join(temp, "docs"), { recursive: true, force: true });
    fs.rmSync(path.join(temp, "versions.json"), { force: true });
  }
  return temp;
}

/** Replaces the root build without touching /docs/ snapshots or /next/. */
function installRoot(siteDir, built, marker) {
  fs.mkdirSync(siteDir, { recursive: true });
  for (const entry of fs.readdirSync(siteDir)) {
    if (entry === "docs" || entry === "next" || entry === "versions.json") continue;
    fs.rmSync(path.join(siteDir, entry), { recursive: true, force: true });
  }
  for (const entry of fs.readdirSync(built)) {
    const from = path.join(built, entry);
    const to = path.join(siteDir, entry);
    if (entry === "docs") {
      // /docs/ holds version folders (snapshots, archives) and the agent Markdown (/docs/*.md).
      // Version folders are only ever added; everything else is refreshed with the new release.
      fs.mkdirSync(to, { recursive: true });
      for (const name of fs.readdirSync(from)) {
        const target = path.join(to, name);
        const isVersion = /^v\d/.test(name);
        if (isVersion && fs.existsSync(target)) continue;
        fs.cpSync(path.join(from, name), target, { recursive: true });
      }
      continue;
    }
    fs.cpSync(from, to, { recursive: true });
  }
  fs.writeFileSync(path.join(siteDir, ROOT_MARKER), `${JSON.stringify(marker)}\n`);
}

function verify(siteDir) {
  const manifestPath = path.join(siteDir, "versions.json");
  if (!fs.existsSync(manifestPath)) fail(`${manifestPath} is missing`);
  const manifest = readJson(manifestPath);
  const missing = [];
  for (const entry of manifest.versions) {
    const dir = path.join(siteDir, entry.path);
    const ok =
      entry.docs === "full"
        ? fs.existsSync(path.join(dir, "index.html"))
        : fs.existsSync(path.join(siteDir, "docs", `v${entry.version}`, "archive.json"));
    if (!ok && entry.status !== "development") missing.push(`${entry.version} (${entry.docs} at ${entry.path})`);
    // Every release keeps its stable /docs/vX.Y.Z/ URL, even when it is also served at the root.
    if (entry.docs === "full" && entry.path === "/" && !fs.existsSync(path.join(siteDir, "docs", `v${entry.version}`, "index.html"))) {
      missing.push(`${entry.version} (snapshot at /docs/v${entry.version}/)`);
    }
  }
  if (missing.length) fail(`Version URLs that no longer resolve:\n  ${missing.join("\n  ")}`);
  console.log(`✓ ${manifest.versions.length} documented versions resolve in ${siteDir}`);
}

/** Snapshot for `version`, plus the root when it is the latest stable. Never overwrites a snapshot. */
function releaseDocs(siteDir, version, { skipTests }) {
  const prerelease = parseVersion(version).pre !== null;
  const snapshotDir = path.join(siteDir, "docs", `v${version}`);
  validateVersions(version);
  run(process.execPath, ["scripts/extract-api.mjs", "--entry", "packages/react/src/index.ts", "--tsconfig", "packages/react/tsconfig.json", "--out", "apps/website/src/generated/api.json", "--check"]);
  run(process.execPath, ["apps/website/scripts/sync-demo-sources.mjs", "--check"]);
  buildPackages();
  if (!skipTests) run("npm", ["run", "test", "-w", "@spatika/website"]);

  // Manifest first, so both builds ship the version list that includes this release.
  const manifest = writeManifest(siteDir, [version], [version]);
  const channel = prerelease ? "prerelease" : "stable";
  const snapshot = buildSite({ outDir: snapshotDir, base: `/docs/v${version}/`, version, channel });
  fs.mkdirSync(path.dirname(snapshotDir), { recursive: true });
  fs.cpSync(snapshot, snapshotDir, { recursive: true });
  if (!prerelease && manifest.latest === version) {
    installRoot(siteDir, buildSite({ outDir: siteDir, base: "/", version, channel }), { version, channel });
  }
  writeManifest(siteDir, [version], [version]);
  verify(siteDir);
}

const { command, options } = args();
const siteDir = typeof options["site-dir"] === "string" ? path.resolve(options["site-dir"]) : undefined;

switch (command) {
  case "manifest":
    writeManifest(siteDir);
    break;

  case "release": {
    if (!siteDir) fail("--site-dir is required");
    const version = typeof options.version === "string" ? options.version : packageVersion();
    if (fs.existsSync(path.join(siteDir, "docs", `v${version}`, "index.html"))) {
      fail(`docs/v${version}/ already exists — published documentation is never overwritten`);
    }
    releaseDocs(siteDir, version, { skipTests: Boolean(options["skip-tests"]) });
    console.log(`\nDocs for v${version} are ready in ${siteDir}. Deploy that directory when the packages are published.`);
    break;
  }

  case "site": {
    if (!siteDir) fail("--site-dir is required");
    fs.mkdirSync(siteDir, { recursive: true });
    const version = packageVersion();
    const pending = pendingChangesets();
    const published = Boolean(options.published) || npmPublished().versions.includes(version);
    if (published && !pending.length) {
      const hasSnapshot = fs.existsSync(path.join(siteDir, "docs", `v${version}`, "index.html"));
      if (hasSnapshot) {
        console.log(`v${version} already has its snapshot (never rebuilt).`);
        buildPackages();
        const manifest = writeManifest(siteDir, [version], [version]);
        const marker = readRootMarker(siteDir);
        const prerelease = parseVersion(version).pre !== null;
        if (!prerelease && manifest.latest === version && (marker?.version !== version || marker?.channel !== "stable")) {
          installRoot(siteDir, buildSite({ outDir: siteDir, base: "/", version, channel: "stable" }), { version, channel: "stable" });
        }
      } else {
        releaseDocs(siteDir, version, { skipTests: Boolean(options["skip-tests"]) });
      }
    } else {
      console.log(
        pending.length
          ? `${pending.length} pending changeset(s): building development docs for the checkout.`
          : `${version} is not published: building development docs for the checkout.`,
      );
      buildPackages();
      writeManifest(siteDir);
      const built = buildSite({ outDir: path.join(siteDir, "next"), base: "/next/", version, channel: "development" });
      fs.rmSync(path.join(siteDir, "next"), { recursive: true, force: true });
      fs.cpSync(built, path.join(siteDir, "next"), { recursive: true });
      // Until a release owns the root, it shows the checkout too (labelled as development).
      const marker = readRootMarker(siteDir);
      if (!marker || marker.channel === "development") {
        installRoot(siteDir, buildSite({ outDir: siteDir, base: "/", version, channel: "development" }), {
          version,
          channel: "development",
        });
      }
    }
    verify(siteDir);
    break;
  }

  case "next": {
    if (!siteDir) fail("--site-dir is required");
    const built = buildSite({ outDir: path.join(siteDir, "next"), base: "/next/", version: packageVersion(), channel: "development" });
    fs.rmSync(path.join(siteDir, "next"), { recursive: true, force: true });
    fs.cpSync(built, path.join(siteDir, "next"), { recursive: true });
    console.log(`Development docs written to ${path.join(siteDir, "next")}`);
    break;
  }

  case "verify":
    if (!siteDir) fail("--site-dir is required");
    verify(siteDir);
    break;

  default:
    console.error("usage: release-docs.mjs <manifest|release|next|verify|site> [--site-dir <dir>] [--version X.Y.Z] [--skip-tests] [--published]");
    process.exit(2);
}
