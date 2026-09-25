/**
 * Finds utility classes in source files so tests can check each one has a CSS rule.
 * Shared by the @spatika/react coverage test and the docs site's coverage test.
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export function definedClasses(css) {
  const defined = new Set();
  for (const match of css.matchAll(/\.((?:\\.|[\w-])+)/g)) {
    defined.add(match[1].replace(/\\(.)/g, "$1"));
  }
  return defined;
}

export function sourceFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== "test" && name !== "__tests__") sourceFiles(path, out);
    } else if (/\.tsx?$/.test(name) && !/\.(test|spec)\.tsx?$/.test(name)) {
      out.push(path);
    }
  }
  return out;
}

/** Utility roots Spatika's class strings are built from. Anything else is prose or an identifier. */
const UTILITY =
  /^!?-?(?:(?:flex|grid|inline|outline|text|bg|border|rounded|shadow|ring|font|leading|tracking|whitespace|break|line-clamp|cursor|pointer-events|select|transition|duration|ease|animate|opacity|z|inset|top|left|right|bottom|start|end|order|col|row|grid-cols|grid-rows|gap|space|divide|p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|w|h|size|min-w|min-h|max-w|max-h|items|justify|self|content|place|shrink|grow|basis|aspect|object|overflow|overscroll|scroll|snap|fill|stroke|from|via|to|translate|scale|rotate|origin|backdrop|blur|decoration|underline-offset|align|list|accent|caret|appearance|resize|touch|will-change|columns|table|caption|field-sizing)-[^\s]+)$/;

/** Utilities that take no value suffix. */
const STANDALONE = new Set([
  "flex", "grid", "inline", "inline-flex", "inline-block", "inline-grid", "block", "hidden",
  "contents", "absolute", "relative", "fixed", "sticky", "static", "isolate", "truncate",
  "underline", "uppercase", "lowercase", "capitalize", "italic", "tabular-nums", "sr-only",
  "outline", "grow", "shrink", "border", "rounded", "shadow", "ring", "transition", "invisible",
  "visible", "line-through", "antialiased", "container",
]);

/** Utility-shaped tokens that are really identifiers (slot names, token names, prop values). */
const NOT_CLASSES = new Set([
  "text-field",
  "text-field-helper",
  "text-style",
  "grid-template-rows",
  "z-index",
  "gap-start",
  "gap-end",
]);

function isUtility(token) {
  if (NOT_CLASSES.has(token)) return false;
  // Strip variant prefixes (hover:, md:, data-[state=open]:, [&>svg]: …) before matching the root.
  const base = token.replace(/^(?:(?:[\w-]+(?:-\[[^\]]*\])?(?:\/[\w-]+)?|\[[^\]]*\]):)+/, "");
  return STANDALONE.has(base.replace(/^!/, "")) || UTILITY.test(base);
}

/**
 * A string is a class list when it has two or more tokens and most of them are utilities.
 * A lone token counts only when it is unmistakably a utility — it carries a step, an
 * arbitrary value or a variant (`left-5`, `aspect-[4/3]`, `active:translate-y-px`), or is an
 * `animate-*` class. Bare words ("list-item", "bottom-center") are slot names and prop values.
 */
export function classCandidates(source) {
  const tokens = [];
  for (const match of source.matchAll(/(["'`])((?:(?!\1)[^\n\\]|\\.)*)\1/g)) {
    const value = match[2];
    if (/[{}();=<>]|\$\{/.test(value.replace(/\[[^\]]*\]/g, ""))) continue;
    // Tokens ending in punctuation are prose ("bg-card, bg-muted and …"), never classes.
    const parts = value.split(/\s+/).filter(Boolean).filter((part) => !/[,;.]$/.test(part));
    const utilities = parts.filter(isUtility);
    if (parts.length === 1) {
      const [token] = parts;
      if (utilities.length && (/[\d[:/]/.test(token) || token.startsWith("animate-"))) {
        tokens.push(token);
      }
      continue;
    }
    if (utilities.length * 2 < parts.length) continue;
    tokens.push(...utilities);
  }
  return tokens;
}

