/**
 * The shared engine behind the Vite and PostCSS plugins: options → content files →
 * candidates → CSS, with per-file caching so rebuilds only re-read changed files.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createCompiler, type Compiler } from "./compile";
import { CandidateCache, DEFAULT_CONTENT, extractVariables, resolveContent, spatikaContent } from "./scan";
import type { ThemeOverrides } from "./theme";

export type SpatikaUtilitiesOptions = {
  /**
   * Globs (relative to `cwd`) of files that contain class names. Defaults to `index.html`,
   * `src/`, `app/`, `pages/` and `components/`. Prefix with `!` to exclude.
   */
  content?: string[];
  /** Extra globs added to the defaults instead of replacing them. */
  extraContent?: string[];
  /** Scan the installed `@spatika/react`, `charts` and `editor` packages (default true). */
  spatika?: boolean;
  /** Theme overrides: app colours, fonts, radii … layered on the Spatika theme. */
  theme?: ThemeOverrides;
  /** Enable `prose` typography classes, compatible with @tailwindcss/typography (default false). */
  typography?: boolean;
  /** Class names to always generate (e.g. ones built at runtime). */
  safelist?: string[];
  /** A module whose default export (or `theme` export) supplies these options. */
  config?: string;
  /** Project root; defaults to `process.cwd()`. */
  cwd?: string;
};

/** The at-rule the plugins replace: `@spatika utilities;`. */
export const DIRECTIVE = /@spatika\s+utilities\s*;/;

export async function loadOptions(options: SpatikaUtilitiesOptions = {}): Promise<SpatikaUtilitiesOptions> {
  if (!options.config) return options;
  const cwd = options.cwd ?? process.cwd();
  const file = path.resolve(cwd, options.config);
  if (!existsSync(file)) throw new Error(`@spatika/utilities: config not found: ${file}`);
  const mod = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
  const loaded = (mod.default ?? mod) as SpatikaUtilitiesOptions;
  return { ...loaded, ...options, theme: { ...(loaded.theme ?? {}), ...(options.theme ?? {}) } };
}

export class Engine {
  readonly cwd: string;
  readonly compiler: Compiler;
  private cache = new CandidateCache();
  private patterns: string[];
  private safelist: string[];
  files: string[] = [];
  dirs: string[] = [];
  private lastCandidates = new Set<string>();

  constructor(options: SpatikaUtilitiesOptions = {}) {
    this.cwd = options.cwd ?? process.cwd();
    this.compiler = createCompiler({ theme: options.theme, typography: options.typography });
    this.patterns = [
      ...(options.content ?? DEFAULT_CONTENT),
      ...(options.extraContent ?? []),
      ...(options.spatika === false ? [] : spatikaContent(this.cwd)),
    ];
    this.safelist = options.safelist ?? [];
  }

  /** Re-resolve globs (new files) and collect every candidate. */
  scan(): Set<string> {
    const { files, dirs } = resolveContent(this.patterns, this.cwd);
    this.files = files;
    this.dirs = dirs;
    const candidates = new Set<string>(this.safelist);
    for (const file of files) for (const candidate of this.cache.read(file)) candidates.add(candidate);
    this.lastCandidates = candidates;
    return candidates;
  }

  /** Whether a file is one of the scanned content files. */
  isContent(file: string): boolean {
    return this.files.includes(path.resolve(file));
  }

  /** Re-read one changed file; true when it brought in a class not seen before. */
  update(file: string): boolean {
    this.cache.forget(file);
    let grew = false;
    for (const candidate of this.cache.read(file)) {
      if (!this.lastCandidates.has(candidate)) {
        this.lastCandidates.add(candidate);
        if (this.compiler.isValid(candidate)) grew = true;
      }
    }
    return grew;
  }

  /** Custom properties referenced as `var(--name)` in content files and extra sources. */
  private referencedVariables(extra: string[] = []): Set<string> {
    const names = new Set<string>();
    for (const file of [...this.files, ...this.styleFiles()]) for (const name of this.cache.variables(file)) names.add(name);
    for (const text of extra) extractVariables(text, names);
    return names;
  }

  /** App stylesheets (`src/**\/*.css`), which reference theme variables too. */
  private styleFiles(): string[] {
    return resolveContent(["./src/**/*.css", "./app/**/*.css", "./styles/**/*.css"], this.cwd).files.filter((file) =>
      file.endsWith(".css"),
    );
  }

  css(source = ""): string {
    const utilities = this.compiler.build(this.scan());
    const theme = this.compiler.themeLayer(this.referencedVariables([source, utilities]));
    return theme + utilities;
  }

  /** Replace the `@spatika utilities;` directive in a stylesheet. */
  transform(source: string): string | null {
    if (!DIRECTIVE.test(source)) return null;
    return source.replace(DIRECTIVE, () => this.css(source));
  }
}
