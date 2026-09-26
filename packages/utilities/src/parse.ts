/**
 * Class-name parsing. A candidate such as `md:hover:bg-surface/80!` splits into variants
 * (`md`, `hover`), a utility root (`bg`), a value (`surface`), a modifier (`80`) and flags.
 */

export type NamedValue = { kind: "named"; value: string; fraction: string | null };
export type ArbitraryValue = { kind: "arbitrary"; value: string; dataType: string | null };
export type CandidateValue = NamedValue | ArbitraryValue;
export type Modifier = { kind: "named" | "arbitrary"; value: string };

export type Variant =
  | { kind: "arbitrary"; selector: string; atRule: boolean }
  | { kind: "static"; root: string }
  | { kind: "functional"; root: string; value: CandidateValue | null; modifier: Modifier | null }
  | { kind: "compound"; root: string; modifier: Modifier | null; variant: Variant };

type Flags = { raw: string; variants: Variant[]; important: boolean };

export type Candidate =
  | (Flags & { kind: "arbitrary"; property: string; value: string; modifier: Modifier | null })
  | (Flags & { kind: "static"; root: string; negative: boolean })
  | (Flags & {
      kind: "functional";
      root: string;
      value: CandidateValue | null;
      modifier: Modifier | null;
      negative: boolean;
    });

/** Split on `separator` outside brackets, parentheses and quotes. */
export function segment(input: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "\\") {
      i++;
      continue;
    }
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "[" || ch === "(" || ch === "{") depth++;
    else if (ch === "]" || ch === ")" || ch === "}") depth--;
    else if (ch === separator && depth === 0) {
      parts.push(input.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(input.slice(start));
  return parts;
}

/** Index of the last `char` outside brackets, or -1. */
function lastTopLevel(input: string, char: string): number {
  const parts = segment(input, char);
  if (parts.length === 1) return -1;
  return input.length - parts[parts.length - 1].length - 1;
}

const MATH_FNS = [
  "calc", "min", "max", "clamp", "mod", "rem", "sin", "cos", "tan", "asin", "acos", "atan",
  "atan2", "pow", "sqrt", "hypot", "log", "exp", "round",
];

/**
 * Put spaces around `+ - * /` inside CSS math functions (`calc(100%-2rem)` →
 * `calc(100% - 2rem)`), leaving signs, exponents and identifiers alone. Mirrors Tailwind CSS v4.
 */
function spaceMathOperators(input: string): string {
  if (!MATH_FNS.some((fn) => input.includes(fn))) return input;
  let out = "";
  const stack: boolean[] = [];
  let lastValueEnd: number | null = null;
  let prevValueEnd: number | null = null;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    const isDigit = code >= 48 && code <= 57;
    const isUnitChar = code === 37 || (code >= 97 && code <= 122) || (code >= 65 && code <= 90);
    if (isDigit || (lastValueEnd !== null && isUnitChar)) lastValueEnd = i;
    else {
      prevValueEnd = lastValueEnd;
      lastValueEnd = null;
    }
    if (code === 40) {
      out += input[i];
      let fnStart = i;
      for (let j = i - 1; j >= 0; j--) {
        const c = input.charCodeAt(j);
        if ((c >= 48 && c <= 57) || (c >= 97 && c <= 122)) fnStart = j;
        else break;
      }
      const fn = input.slice(fnStart, i);
      if (MATH_FNS.includes(fn)) stack.unshift(true);
      else if (stack[0] && fn === "") stack.unshift(true);
      else stack.unshift(false);
      continue;
    }
    if (code === 41) {
      out += input[i];
      stack.shift();
      continue;
    }
    if (code === 44 && stack[0]) {
      out += ", ";
      continue;
    }
    if (code === 32 && stack[0] && out.charCodeAt(out.length - 1) === 32) continue;
    if ((code === 43 || code === 42 || code === 47 || code === 45) && stack[0]) {
      const trimmed = out.trimEnd();
      const prev = trimmed.charCodeAt(trimmed.length - 1);
      const prev2 = trimmed.charCodeAt(trimmed.length - 2);
      const next = input.charCodeAt(i + 1);
      if ((prev === 101 || prev === 69) && prev2 >= 48 && prev2 <= 57) out += input[i];
      else if (prev === 43 || prev === 42 || prev === 47 || prev === 45) out += input[i];
      else if (prev === 40 || prev === 44) out += input[i];
      else if (input.charCodeAt(i - 1) === 32) out += `${input[i]} `;
      else if (
        (prev >= 48 && prev <= 57) ||
        (next >= 48 && next <= 57) ||
        prev === 41 ||
        next === 40 ||
        next === 43 ||
        next === 42 ||
        next === 47 ||
        next === 45 ||
        (prevValueEnd !== null && prevValueEnd === i - 1)
      ) {
        out += ` ${input[i]} `;
      } else out += input[i];
      continue;
    }
    out += input[i];
  }
  return out;
}

/** `_` → space, except an escaped `\_` (and everything when `keep` is set). */
function underscores(input: string, keep = false): string {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "\\" && input[i + 1] === "_") {
      out += "_";
      i++;
    } else out += ch === "_" && !keep ? " " : ch;
  }
  return out;
}

/**
 * Decode an arbitrary value. Underscores become spaces except inside `url()` and in the
 * name passed to `var()`; math operators gain surrounding spaces.
 */
export function decodeArbitrary(input: string): string {
  if (!input.includes("(")) return underscores(input);
  let out = "";
  let i = 0;
  while (i < input.length) {
    const fn = /^([\w-]*)\(/.exec(input.slice(i));
    if (fn && (fn[1] === "url" || fn[1].endsWith("_url"))) {
      const end = matchingParen(input, i + fn[0].length - 1);
      out += underscores(fn[1]) + input.slice(i + fn[1].length, end + 1);
      i = end + 1;
      continue;
    }
    if (fn && (fn[1] === "var" || fn[1].endsWith("_var"))) {
      const open = i + fn[0].length - 1;
      const end = matchingParen(input, open);
      const inner = input.slice(open + 1, end);
      const comma = segment(inner, ",");
      const name = comma.shift() ?? "";
      const rest = comma.length ? `,${decodeArbitrary(comma.join(","))}` : "";
      out += `${underscores(fn[1])}(${underscores(name, true)}${rest})`;
      i = end + 1;
      continue;
    }
    out += input[i] === "_" ? " " : input[i] === "\\" && input[i + 1] === "_" ? "_" : input[i];
    if (input[i] === "\\" && input[i + 1] === "_") i++;
    i++;
  }
  return spaceMathOperators(out);
}

function matchingParen(input: string, open: number): number {
  let depth = 0;
  for (let i = open; i < input.length; i++) {
    if (input[i] === "(") depth++;
    else if (input[i] === ")" && --depth === 0) return i;
  }
  return input.length - 1;
}

/** Brackets, parentheses and quotes inside an arbitrary value must balance. */
function isBalanced(input: string): boolean {
  const stack: string[] = [];
  let quote: string | null = null;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "\\") {
      i++;
      continue;
    }
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "[" || ch === "(" || ch === "{") stack.push(ch);
    else if (ch === "]" || ch === ")" || ch === "}") {
      const open = stack.pop();
      if (open !== { "]": "[", ")": "(", "}": "{" }[ch]) return false;
    }
  }
  return stack.length === 0 && quote === null;
}

function parseArbitrary(inner: string): ArbitraryValue | null {
  if (!inner || !isBalanced(inner)) return null;
  const hint = /^([a-z-]+):(?![:])/.exec(inner);
  // A `[length:10px]` hint names the value type; `[color:var(--x)]` too. `url:` is not a hint.
  if (hint && !inner.startsWith("url(") && /^[a-z-]+$/.test(hint[1]) && !hint[1].startsWith("-")) {
    return { kind: "arbitrary", dataType: hint[1], value: decodeArbitrary(inner.slice(hint[0].length)) };
  }
  return { kind: "arbitrary", dataType: null, value: decodeArbitrary(inner) };
}

function parseModifier(input: string): Modifier | null {
  if (!input) return null;
  if (input.startsWith("[") && input.endsWith("]")) {
    if (!isBalanced(input.slice(1, -1))) return null;
    const value = decodeArbitrary(input.slice(1, -1));
    return value ? { kind: "arbitrary", value } : null;
  }
  if (input.startsWith("(") && input.endsWith(")")) {
    const inner = input.slice(1, -1);
    return inner.startsWith("--") ? { kind: "arbitrary", value: `var(${inner})` } : null;
  }
  return /^[\w.-]+$/.test(input) ? { kind: "named", value: input } : null;
}

/**
 * The value part after a root: `[…]` arbitrary, `(--var)` shorthand, or a named value.
 * Returns null when the input cannot be a value.
 */
function parseValue(input: string): CandidateValue | null {
  if (input.startsWith("[")) {
    if (!input.endsWith("]")) return null;
    return parseArbitrary(input.slice(1, -1));
  }
  if (input.startsWith("(")) {
    if (!input.endsWith(")")) return null;
    const inner = input.slice(1, -1);
    if (!isBalanced(inner)) return null;
    const hint = /^([a-z-]+):(--[\w-]+)$/.exec(inner);
    if (hint) return { kind: "arbitrary", dataType: hint[1], value: `var(${hint[2]})` };
    return inner.startsWith("--") ? { kind: "arbitrary", dataType: null, value: `var(${inner})` } : null;
  }
  if (!/^[\w.%-]+$/.test(input) || input.endsWith("-")) return null;
  return { kind: "named", value: input, fraction: null };
}

export type Registry = {
  /** Exact static utility names (`flex`, `sr-only`). */
  hasStatic(name: string): boolean;
  /** Functional utility roots (`bg`, `border-t`, `translate-x`). */
  hasFunctional(root: string): boolean;
  hasStaticVariant(name: string): boolean;
  hasFunctionalVariant(root: string): boolean;
  hasCompoundVariant(root: string): boolean;
};

/** Every (root, rest) split of `input` at a dash outside brackets, longest root first. */
function* rootSplits(input: string): Generator<[string, string]> {
  const dashes: number[] = [];
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "[" || ch === "(") depth++;
    else if (ch === "]" || ch === ")") depth--;
    else if (ch === "-" && depth === 0 && i > 0) dashes.push(i);
  }
  for (let j = dashes.length - 1; j >= 0; j--) {
    const i = dashes[j];
    yield [input.slice(0, i), input.slice(i + 1)];
  }
}

/** `&>svg` → `& > svg`: space top-level combinators as a stylesheet author would. */
function spaceCombinators(selector: string): string {
  let out = "";
  let depth = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (ch === "[" || ch === "(") depth++;
    else if (ch === "]" || ch === ")") depth--;
    if (depth === 0 && (ch === ">" || ch === "+" || (ch === "~" && selector[i + 1] !== "="))) {
      out = `${out.trimEnd()} ${ch} `;
      while (selector[i + 1] === " ") i++;
      continue;
    }
    out += ch;
  }
  return out.trim();
}

export function parseVariant(input: string, registry: Registry): Variant | null {
  if (input.startsWith("[") && input.endsWith("]")) {
    if (!isBalanced(input.slice(1, -1))) return null;
    const selector = decodeArbitrary(input.slice(1, -1));
    if (!selector) return null;
    if (selector.startsWith("@")) return { kind: "arbitrary", selector, atRule: true };
    const formatted = spaceCombinators(selector);
    return { kind: "arbitrary", selector: formatted.includes("&") ? formatted : `&:is(${formatted})`, atRule: false };
  }
  if (registry.hasStaticVariant(input)) return { kind: "static", root: input };

  const slash = lastTopLevel(input, "/");
  const base = slash === -1 ? input : input.slice(0, slash);
  const modifier = slash === -1 ? null : parseModifier(input.slice(slash + 1));
  if (slash !== -1 && !modifier) return null;
  if (!modifier && registry.hasStaticVariant(base)) return { kind: "static", root: base };

  for (const [root, rest] of rootSplits(base)) {
    if (registry.hasCompoundVariant(root)) {
      const inner = parseVariant(rest, registry);
      if (inner) return { kind: "compound", root, modifier, variant: inner };
    }
    if (registry.hasFunctionalVariant(root)) {
      const value = parseValue(rest);
      if (value) return { kind: "functional", root, value, modifier };
    }
  }
  return null;
}

/**
 * Parse a class name into every plausible candidate, longest utility root first. The
 * compiler takes the first one a utility accepts.
 */
export function parseCandidate(raw: string, registry: Registry): Candidate[] {
  const parts = segment(raw, ":");
  let base = parts.pop() ?? "";
  if (!base || parts.some((part) => part === "")) return [];

  const variants: Variant[] = [];
  for (const part of parts) {
    const variant = parseVariant(part, registry);
    if (!variant) return [];
    variants.push(variant);
  }

  let important = false;
  if (base.endsWith("!")) {
    important = true;
    base = base.slice(0, -1);
  } else if (base.startsWith("!")) {
    important = true;
    base = base.slice(1);
  }
  if (!base) return [];
  const flags = { raw, variants, important };

  // `[property:value]` — an arbitrary property.
  if (base.startsWith("[")) {
    const slash = lastTopLevel(base, "/");
    const body = slash === -1 ? base : base.slice(0, slash);
    const modifier = slash === -1 ? null : parseModifier(base.slice(slash + 1));
    if (!body.endsWith("]")) return [];
    const inner = body.slice(1, -1);
    if (!isBalanced(inner)) return [];
    const colon = inner.indexOf(":");
    if (colon <= 0) return [];
    const property = inner.slice(0, colon);
    if (!/^(--[\w-]+|-?[a-z][a-z-]*)$/.test(property)) return [];
    const value = decodeArbitrary(inner.slice(colon + 1));
    if (!value) return [];
    return [{ ...flags, kind: "arbitrary", property, value, modifier }];
  }

  const results: Candidate[] = [];
  let negative = false;
  if (base.startsWith("-") && !base.startsWith("--")) {
    negative = true;
    base = base.slice(1);
  }

  if (registry.hasStatic(base)) results.push({ ...flags, kind: "static", root: base, negative });
  if (registry.hasFunctional(base)) {
    results.push({ ...flags, kind: "functional", root: base, value: null, modifier: null, negative });
  }

  const slash = lastTopLevel(base, "/");
  const withoutModifier = slash === -1 ? base : base.slice(0, slash);
  const modifier = slash === -1 ? null : parseModifier(base.slice(slash + 1));
  if (slash !== -1 && !modifier) return results;

  // A bare root with a modifier (`shadow/20`, `text-sm/6` is handled below).
  if (slash !== -1 && registry.hasFunctional(withoutModifier)) {
    results.push({ ...flags, kind: "functional", root: withoutModifier, value: null, modifier, negative });
  }

  for (const [root, rest] of rootSplits(withoutModifier)) {
    if (!registry.hasFunctional(root)) continue;
    const value = parseValue(rest);
    if (!value) continue;
    // `w-1/2` — a fraction reads the "modifier" as the denominator.
    if (value.kind === "named" && modifier?.kind === "named" && /^\d+$/.test(rest) && /^\d+$/.test(modifier.value)) {
      results.push({
        ...flags,
        kind: "functional",
        root,
        value: { kind: "named", value: rest, fraction: `${rest}/${modifier.value}` },
        modifier,
        negative,
      });
      continue;
    }
    results.push({ ...flags, kind: "functional", root, value, modifier, negative });
  }
  return results;
}
