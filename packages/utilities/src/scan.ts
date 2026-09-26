/**
 * Source scanning: find class-name candidates in files. Extraction over-collects on purpose —
 * the compiler ignores anything that is not a utility — but must never miss a real class.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const BOUNDARY = /[\s]/;

/** Candidate class names in a source string. */
export function extractCandidates(source: string, out: Set<string> = new Set()): Set<string> {
  for (const token of source.split(/\s+/)) {
    if (!token) continue;
    for (const piece of bracketAwareSplit(token)) addCandidate(piece, out);
    // A naive split catches classes glued to code punctuation (`["flex",`, `cn('a')`).
    for (const piece of token.split(/["'`,;{}()=<>]|\$\{/)) addCandidate(piece, out);
  }
  return out;
}

/** Split on quotes and code punctuation, except inside `[...]` arbitrary values. */
function bracketAwareSplit(token: string): string[] {
  const out: string[] = [];
  let current = "";
  let depth = 0;
  for (let i = 0; i < token.length; i++) {
    const ch = token[i];
    if (ch === "[") depth++;
    else if (ch === "]") depth = Math.max(0, depth - 1);
    if (depth === 0 && (ch === '"' || ch === "'" || ch === "`" || ch === "{" || ch === "}" || ch === ";" || ch === "=" || ch === "<" || ch === ">" || ch === ",")) {
      if (current) out.push(current);
      current = "";
      continue;
    }
    if (depth === 0 && ch === "$" && token[i + 1] === "{") {
      if (current) out.push(current);
      current = "";
      i++;
      continue;
    }
    current += ch;
  }
  if (current) out.push(current);
  return out;
}

function addCandidate(raw: string, out: Set<string>): void {
  let token = raw;
  // Trim wrapping punctuation that cannot end a class (`hidden)`, `(flex`, `block.`).
  while (token && /^[(.:]/.test(token) && !token.startsWith("(--")) token = token.slice(1);
  while (token && /[.,;:)]$/.test(token) && !balanced(token)) token = token.slice(0, -1);
  while (token && /[.,;:]$/.test(token)) token = token.slice(0, -1);
  if (token.length < 2 && !/^[a-z]$/.test(token)) return;
  if (token.length > 1000) return;
  if (!/^[!\-@*[a-z0-9]/i.test(token)) return;
  if (BOUNDARY.test(token)) return;
  out.add(token);
}

function balanced(token: string): boolean {
  let depth = 0;
  for (const ch of token) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

/** A glob compiled to a base directory and a matcher for paths relative to it. */
type CompiledGlob = { base: string; test: (relative: string) => boolean; pattern: string; negated: boolean };

function globToRegExp(glob: string): RegExp {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === "*") {
      if (glob[i + 1] === "*") {
        const slash = glob[i + 2] === "/";
        re += slash ? "(?:.*/)?" : ".*";
        i += slash ? 2 : 1;
      } else re += "[^/]*";
    } else if (ch === "?") re += "[^/]";
    else if (ch === "{") {
      const end = glob.indexOf("}", i);
      const options = glob.slice(i + 1, end).split(",").map((part) => part.replace(/[.+^$()|[\]\\]/g, "\\$&"));
      re += `(?:${options.join("|")})`;
      i = end;
    } else re += ch.replace(/[.+^$()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}

export function compileGlob(pattern: string, cwd: string): CompiledGlob {
  const negated = pattern.startsWith("!");
  const body = negated ? pattern.slice(1) : pattern;
  const absolute = path.isAbsolute(body) ? body : path.join(cwd, body);
  const parts = absolute.split(path.sep);
  const baseParts: string[] = [];
  for (const part of parts) {
    if (/[*?{]/.test(part)) break;
    baseParts.push(part);
  }
  const base = baseParts.join(path.sep) || path.sep;
  const rest = absolute.slice(base.length).replace(/^[/\\]/, "").split(path.sep).join("/");
  if (!rest) return { base: path.dirname(base), test: (rel) => rel === path.basename(base), pattern, negated };
  const re = globToRegExp(rest);
  return { base, test: (rel) => re.test(rel), pattern, negated };
}

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".turbo", "coverage", ".cache"]);
const BINARY = /\.(?:png|jpe?g|gif|webp|avif|ico|svg|woff2?|ttf|otf|eot|mp4|webm|mp3|wav|pdf|zip|gz|map|lock)$/i;

/** Files matched by the content globs (negated globs exclude). */
export function resolveContent(patterns: string[], cwd: string): { files: string[]; dirs: string[] } {
  const globs = patterns.map((pattern) => compileGlob(pattern, cwd));
  const include = globs.filter((g) => !g.negated);
  const exclude = globs.filter((g) => g.negated);
  const files = new Set<string>();
  const dirs = new Set<string>();
  for (const glob of include) {
    if (!existsSync(glob.base)) continue;
    const stat = statSync(glob.base);
    if (stat.isFile()) {
      files.add(glob.base);
      continue;
    }
    dirs.add(glob.base);
    // Spatika's own packages live in node_modules; walk them only when the glob points there.
    const inNodeModules = glob.base.split(path.sep).includes("node_modules");
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (SKIP_DIRS.has(entry.name) && !(inNodeModules && entry.name === "dist")) continue;
          walk(full);
        } else if (entry.isFile() && !BINARY.test(entry.name)) {
          const rel = path.relative(glob.base, full).split(path.sep).join("/");
          if (glob.test(rel)) files.add(full);
        }
      }
    };
    walk(glob.base);
  }
  for (const glob of exclude) {
    for (const file of [...files]) {
      const rel = path.relative(glob.base, file).split(path.sep).join("/");
      if (!rel.startsWith("..") && glob.test(rel)) files.delete(file);
    }
  }
  return { files: [...files].sort(), dirs: [...dirs] };
}

export const DEFAULT_CONTENT = [
  "./index.html",
  "./src/**/*.{js,jsx,ts,tsx,mjs,cjs,mdx,md,html,vue,svelte,astro}",
  "./app/**/*.{js,jsx,ts,tsx,mdx}",
  "./pages/**/*.{js,jsx,ts,tsx,mdx}",
  "./components/**/*.{js,jsx,ts,tsx,mdx}",
  "./apps/**/*.{html,js,jsx,ts,tsx}",
];

/** `dist` globs for the installed Spatika packages whose components carry utility classes. */
export function spatikaContent(cwd: string): string[] {
  const require = createRequire(path.join(cwd, "package.json"));
  const out: string[] = [];
  for (const name of ["@spatika/react", "@spatika/charts", "@spatika/editor"]) {
    try {
      const pkg = require.resolve(`${name}/package.json`);
      const dist = path.join(path.dirname(pkg), "dist");
      if (existsSync(dist)) out.push(`${dist.split(path.sep).join("/")}/**/*.js`);
    } catch {
      // Not installed — nothing to scan.
    }
  }
  return out;
}

/** Custom-property names a source references as `var(--name)`. */
export function extractVariables(source: string, out: Set<string> = new Set()): Set<string> {
  for (const match of source.matchAll(/var\(\s*(--[\w-]+)/g)) out.add(match[1]);
  return out;
}

type CacheEntry = { mtime: number; candidates: Set<string>; variables: Set<string> };

/** Candidates and variable references from one file, cached by modification time. */
export class CandidateCache {
  private files = new Map<string, CacheEntry>();

  private entry(file: string): CacheEntry | null {
    let mtime = 0;
    try {
      mtime = statSync(file).mtimeMs;
    } catch {
      this.files.delete(file);
      return null;
    }
    const cached = this.files.get(file);
    if (cached && cached.mtime === mtime) return cached;
    const source = readFileSync(file, "utf8");
    const entry = {
      mtime,
      candidates: file.endsWith(".css") ? new Set<string>() : extractCandidates(source),
      variables: extractVariables(source),
    };
    this.files.set(file, entry);
    return entry;
  }

  read(file: string): Set<string> {
    return this.entry(file)?.candidates ?? new Set();
  }

  variables(file: string): Set<string> {
    return this.entry(file)?.variables ?? new Set();
  }

  forget(file: string): void {
    this.files.delete(file);
  }
}
