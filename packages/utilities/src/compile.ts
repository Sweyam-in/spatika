/**
 * The compiler: class names in, CSS out. Only classes that parse and resolve produce rules,
 * so feeding it every token found in source files is safe.
 */
import { ANIMATE_EXTRAS, registerAnimate } from "./animate";
import type { Node, Output } from "./ast";
import { parseCandidate, type Registry, type Variant } from "./parse";
import { PROPERTY_ORDER } from "./property-order";
import { registerTypography } from "./typography";
import { resolveTheme, themeVariables, type Theme, type ThemeOverrides } from "./theme";
import { createUtilities, PROPERTIES, type UtilityRegistry } from "./utilities";
import { createVariants, type VariantContext, type VariantRegistry, type Wrapper } from "./variants";

export type CompilerOptions = {
  /** Theme overrides layered on the Spatika default theme. */
  theme?: ThemeOverrides;
  /** Wrap output in `@layer utilities` (default true). */
  layer?: boolean;
  /** Enable the `prose` typography classes (default false). */
  typography?: boolean;
};

type FlatRule = { wrappers: Wrapper[]; selector: string; decls: { property: string; value: string; important: boolean }[] };

type Compiled = {
  raw: string;
  rules: FlatRule[];
  properties: string[];
  keyframes: string[];
  variants: { key: string; variant: Variant }[];
  sort: { order: number[]; count: number };
};

const PROPERTY_INDEX = new Map(PROPERTY_ORDER.map((property, index) => [property, index]));

/** CSS.escape for class selectors. */
export function escapeClass(value: string): string {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    const code = value.charCodeAt(i);
    if (code === 0) out += "�";
    else if ((code >= 1 && code <= 31) || code === 127) out += `\\${code.toString(16)} `;
    else if (i === 0 && code >= 48 && code <= 57) out += `\\${code.toString(16)} `;
    else if (i === 1 && code >= 48 && code <= 57 && value[0] === "-") out += `\\${code.toString(16)} `;
    else if (i === 0 && ch === "-" && value.length === 1) out += `\\${ch}`;
    else if (code >= 128 || ch === "-" || ch === "_" || /[0-9A-Za-z]/.test(ch)) out += ch;
    else out += `\\${ch}`;
  }
  return out;
}

/** Natural string compare, so `p-2` sorts before `p-10`. */
function naturalCompare(a: string, b: string): number {
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i++) {
    let ca = a.charCodeAt(i);
    let cb = b.charCodeAt(i);
    if (ca >= 48 && ca <= 57 && cb >= 48 && cb <= 57) {
      let ea = i + 1;
      let eb = i + 1;
      for (ca = a.charCodeAt(ea); ca >= 48 && ca <= 57; ca = a.charCodeAt(++ea));
      for (cb = b.charCodeAt(eb); cb >= 48 && cb <= 57; cb = b.charCodeAt(++eb));
      const na = a.slice(i, ea);
      const nb = b.slice(i, eb);
      const diff = Number(na) - Number(nb);
      if (diff) return diff;
      if (na !== nb) return na < nb ? -1 : 1;
      i = Math.min(ea, eb) - 1;
      continue;
    }
    if (ca !== cb) return ca - cb;
  }
  return a.length - b.length;
}

function flatten(nodes: Node[], selector: string, wrappers: Wrapper[], important: boolean, out: FlatRule[]): void {
  const decls: FlatRule["decls"] = [];
  const own: FlatRule = { wrappers, selector, decls };
  out.push(own);
  for (const node of nodes) {
    if (node.kind === "decl") decls.push({ property: node.property, value: node.value, important: important || Boolean(node.important) });
    else if (node.kind === "rule") {
      // A nested selector without `&` is a descendant of the utility — never a global rule.
      const nested = node.selector.includes("&") ? node.selector.replace(/&/g, selector) : `${selector} ${node.selector}`;
      flatten(node.nodes, nested, wrappers, important, out);
    }
    else flatten(node.nodes, selector, [...wrappers, { name: node.name, params: node.params }], important, out);
  }
}

function propertySort(nodes: Node[]): { order: number[]; count: number } {
  const order = new Set<number>();
  let count = 0;
  const walk = (list: Node[]) => {
    for (const node of list) {
      if (node.kind === "decl") {
        count++;
        const index = PROPERTY_INDEX.get(node.property);
        if (index !== undefined) order.add(index);
      } else walk(node.nodes);
    }
  };
  walk(nodes);
  return { order: [...order].sort((a, b) => a - b), count };
}

function variantKey(variant: Variant): string {
  return JSON.stringify(variant);
}

export type Compiler = {
  theme: Theme;
  /** CSS for the given class names (unknown ones are ignored). */
  build(candidates: Iterable<string>): string;
  /** Whether a class name produces CSS. */
  isValid(candidate: string): boolean;
  /**
   * `@layer theme` declarations for the theme variables a stylesheet references
   * (`var(--radius-lg)`), so they resolve without Tailwind.
   */
  themeLayer(referenced: Iterable<string>): string;
};

export function createCompiler(options: CompilerOptions = {}): Compiler {
  const resolved = resolveTheme(options.theme);
  const theme: Theme = { ...resolved, animate: { ...ANIMATE_EXTRAS, ...resolved.animate } };
  const utilities: UtilityRegistry = createUtilities();
  registerAnimate(utilities);
  if (options.typography) registerTypography(utilities);
  const variants: VariantRegistry = createVariants();
  const registry: Registry = {
    hasStatic: (name) => utilities.hasStatic(name),
    hasFunctional: (root) => utilities.hasFunctional(root),
    hasStaticVariant: (name) => variants.hasStatic(name, theme),
    hasFunctionalVariant: (root) => variants.functionals.has(root),
    hasCompoundVariant: (root) => variants.compounds.has(root),
  };
  const cache = new Map<string, Compiled | null>();

  function compileOne(raw: string): Compiled | null {
    if (cache.has(raw)) return cache.get(raw)!;
    let result: Compiled | null = null;
    for (const candidate of parseCandidate(raw, registry)) {
      const output: Output | null = utilities.compile(candidate, theme);
      if (!output) continue;
      let ctx: VariantContext | null = { selector: `.${escapeClass(raw)}`, wrappers: [], content: false };
      for (const variant of candidate.variants) {
        ctx = variants.apply(variant, ctx, theme);
        if (!ctx) break;
      }
      if (!ctx) break;
      const setsContent = output.nodes.some((node) => node.kind === "decl" && node.property === "content");
      const nodes = ctx.content && !setsContent
        ? [{ kind: "decl" as const, property: "content", value: "var(--spk-u-content)" }, ...output.nodes]
        : output.nodes;
      const rules: FlatRule[] = [];
      flatten(nodes, ctx.selector, ctx.wrappers, candidate.important, rules);
      // Never let one malformed candidate break the whole stylesheet.
      if (rules.some((r) => r.decls.some((d) => !safeValue(d.value)))) break;
      const properties = [...(output.properties ?? [])];
      if (ctx.content) properties.push("--spk-u-content");
      result = {
        raw,
        rules: rules.filter((r) => r.decls.length > 0),
        properties,
        keyframes: output.keyframes ?? [],
        variants: candidate.variants.map((variant) => ({ key: variantKey(variant), variant })),
        sort: propertySort(output.nodes),
      };
      break;
    }
    cache.set(raw, result);
    return result;
  }

  function build(candidates: Iterable<string>): string {
    const compiled: Compiled[] = [];
    const seen = new Set<string>();
    for (const raw of candidates) {
      if (seen.has(raw)) continue;
      seen.add(raw);
      const item = compileOne(raw);
      if (item) compiled.push(item);
    }

    // Variant order → bit positions, as Tailwind CSS assigns them.
    const unique = new Map<string, Variant>();
    for (const item of compiled) for (const { key, variant } of item.variants) unique.set(key, variant);
    const sortedVariants = [...unique.entries()].sort(([, a], [, b]) => variants.compare(a, b, theme));
    const bit = new Map<string, number>();
    let index = 0;
    sortedVariants.forEach(([key, variant], i) => {
      if (i > 0 && variants.compare(sortedVariants[i - 1][1], variant, theme) !== 0) index++;
      bit.set(key, index);
    });
    const masks = new Map<Compiled, bigint>();
    for (const item of compiled) {
      let mask = 0n;
      for (const { key } of item.variants) mask |= 1n << BigInt(bit.get(key)!);
      masks.set(item, mask);
    }

    compiled.sort((a, b) => {
      const ma = masks.get(a)!;
      const mb = masks.get(b)!;
      if (ma !== mb) return ma < mb ? -1 : 1;
      let i = 0;
      while (i < a.sort.order.length && i < b.sort.order.length && a.sort.order[i] === b.sort.order[i]) i++;
      const oa = a.sort.order[i] ?? Infinity;
      const ob = b.sort.order[i] ?? Infinity;
      if (oa !== ob) return oa - ob;
      if (a.sort.count !== b.sort.count) return b.sort.count - a.sort.count;
      return naturalCompare(a.raw, b.raw);
    });

    const body: string[] = [];
    const properties = new Set<string>();
    const keyframes = new Set<string>();
    for (const item of compiled) {
      for (const flat of item.rules) body.push(printRule(flat));
      for (const name of item.properties) properties.add(name);
      for (const block of item.keyframes) keyframes.add(block);
    }
    if (!body.length) return "";

    const layered = options.layer === false ? body.join("\n") : `@layer utilities {\n${indent(body.join("\n"))}\n}`;
    const tail: string[] = [];
    for (const name of [...properties].sort()) {
      const def = PROPERTIES[name];
      if (!def) continue;
      tail.push(
        `@property ${name} {\n  syntax: "${def.syntax}";\n  inherits: ${def.inherits};${def.initial !== undefined ? `\n  initial-value: ${def.initial};` : ""}\n}`,
      );
    }
    for (const block of keyframes) tail.push(block);
    return [layered, ...tail].join("\n") + "\n";
  }

  const variables = themeVariables(theme);
  function themeLayer(referenced: Iterable<string>): string {
    const lines: string[] = [];
    for (const name of [...new Set(referenced)].sort()) {
      const value = variables.get(name);
      if (value !== undefined) lines.push(`    ${name}: ${value};`);
    }
    return lines.length ? `@layer theme {\n  :root, :host {\n${lines.join("\n")}\n  }\n}\n` : "";
  }

  return {
    theme,
    build,
    isValid: (candidate) => compileOne(candidate) !== null,
    themeLayer,
  };
}

/** A declaration value must not contain `{`, `}` or `;` outside quotes, nor unbalanced brackets. */
function safeValue(value: string): boolean {
  let quote: string | null = null;
  let depth = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === "\\") {
      i++;
      continue;
    }
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "{" || ch === "}" || ch === ";") return false;
    else if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    if (depth < 0) return false;
  }
  return depth === 0 && quote === null;
}

function printRule(flat: FlatRule): string {
  const decls = flat.decls.map((d) => `  ${d.property}: ${d.value}${d.important ? " !important" : ""};`).join("\n");
  let css = `${flat.selector} {\n${decls}\n}`;
  for (let i = flat.wrappers.length - 1; i >= 0; i--) {
    const w = flat.wrappers[i];
    css = `@${w.name}${w.params ? ` ${w.params}` : ""} {\n${indent(css)}\n}`;
  }
  return css;
}

function indent(css: string): string {
  return css
    .split("\n")
    .map((line) => (line ? `  ${line}` : line))
    .join("\n");
}
