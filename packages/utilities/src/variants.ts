/**
 * Variants: `hover:`, `md:`, `dark:`, `group-hover/name:`, `data-[state=open]:`, `[&>svg]:` …
 * Each variant rewrites a selector (with `&` standing for the current one) and/or adds an
 * at-rule wrapper. They stack left to right, as in Tailwind CSS v4, and sort in its order so
 * later variants (breakpoints, `dark:`) win the cascade the same way.
 */
import type { Variant } from "./parse";
import type { Theme } from "./theme";

export type Wrapper = { name: string; params: string };
export type VariantContext = {
  selector: string;
  wrappers: Wrapper[];
  /** `before:` / `after:` add `content: var(--spk-u-content)`. */
  content: boolean;
};

type StaticDef = { order: number; apply: (ctx: VariantContext, theme: Theme) => VariantContext | null };
type FunctionalDef = {
  order: number;
  apply: (ctx: VariantContext, variant: Extract<Variant, { kind: "functional" }>, theme: Theme) => VariantContext | null;
  compare?: (a: Extract<Variant, { kind: "functional" }>, b: Extract<Variant, { kind: "functional" }>, theme: Theme) => number;
};
type CompoundDef = {
  order: number;
  apply: (ctx: VariantContext, variant: Extract<Variant, { kind: "compound" }>, inner: VariantContext) => VariantContext | null;
};

const NOT_PROSE = ':not(:where([class~="not-prose"], [class~="not-prose"] *))';

/** Registration order — the cascade order Tailwind CSS v4 gives the same variants. */
const ORDER = [
  "*", "**", "not", "group", "peer", "first-letter", "first-line", "marker", "selection", "file", "placeholder",
  "backdrop", "details-content", "before", "after", "first", "last", "only", "odd", "even", "first-of-type",
  "last-of-type", "only-of-type", "visited", "target", "open", "default", "checked", "indeterminate",
  "placeholder-shown", "autofill", "optional", "required", "valid", "invalid", "user-valid", "user-invalid",
  "in-range", "out-of-range", "read-only", "empty", "focus-within", "hover", "focus", "focus-visible", "active",
  "enabled", "disabled", "inert", "in", "has", "aria", "data", "nth", "nth-last", "nth-of-type",
  "nth-last-of-type", "supports", "motion-safe", "motion-reduce", "contrast-more", "contrast-less",
  "__breakpoints", "portrait", "landscape", "ltr", "rtl", "dark", "starting", "print", "forced-colors",
  "inverted-colors", "pointer-none", "pointer-coarse", "pointer-fine", "any-pointer-none", "any-pointer-coarse",
  "any-pointer-fine", "noscript", "prose",
];
const orderOf = (name: string) => {
  const index = ORDER.indexOf(name);
  if (index === -1) throw new Error(`Unknown variant order: ${name}`);
  return index;
};

const withSelector = (ctx: VariantContext, template: string): VariantContext => ({
  ...ctx,
  selector: template.replace(/&/g, ctx.selector),
});
const withWrapper = (ctx: VariantContext, name: string, params: string): VariantContext => ({
  ...ctx,
  wrappers: [...ctx.wrappers, { name, params }],
});

/** `[data-state=open]` → `[data-state="open"]`. */
function attribute(prefix: string, value: string): string {
  const match = /^([\w-]+)\s*([~|^$*]?=)\s*(.+?)(\s+[is])?$/.exec(value);
  if (!match) return `[${prefix}${value}]`;
  const [, name, op, raw, flag = ""] = match;
  const quoted = /^["'].*["']$/.test(raw) ? raw : `"${raw}"`;
  return `[${prefix}${name}${op}${quoted}${flag}]`;
}

function escapeIdent(value: string): string {
  return value.replace(/[^\w-]/g, (ch) => `\\${ch}`);
}

/** A length in rem/px/em for breakpoint comparison. */
function toPx(value: string): number {
  const match = /^([\d.]+)(rem|em|px)?$/.exec(value.trim());
  if (!match) return Number.NaN;
  const n = Number(match[1]);
  return match[2] === "px" || !match[2] ? n : n * 16;
}

export class VariantRegistry {
  statics = new Map<string, StaticDef>();
  functionals = new Map<string, FunctionalDef>();
  compounds = new Map<string, CompoundDef>();

  hasStatic(name: string, theme: Theme): boolean {
    return this.statics.has(name) || name in theme.breakpoints;
  }

  apply(variant: Variant, ctx: VariantContext, theme: Theme): VariantContext | null {
    switch (variant.kind) {
      case "arbitrary":
        if (variant.atRule) {
          const match = /^@([\w-]+)\s*(.*)$/.exec(variant.selector);
          if (!match) return null;
          return withWrapper(ctx, match[1], match[2].trim());
        }
        return withSelector(ctx, variant.selector);
      case "static": {
        if (variant.root in theme.breakpoints) {
          return withWrapper(ctx, "media", `(width >= ${theme.breakpoints[variant.root]})`);
        }
        return this.statics.get(variant.root)?.apply(ctx, theme) ?? null;
      }
      case "functional":
        return this.functionals.get(variant.root)?.apply(ctx, variant, theme) ?? null;
      case "compound": {
        const def = this.compounds.get(variant.root);
        if (!def) return null;
        const inner = this.apply(variant.variant, { selector: "&", wrappers: [], content: false }, theme);
        if (!inner || inner.content) return null;
        return def.apply(ctx, variant, inner);
      }
    }
  }

  /** Sort key: (group order, tie-break) — lower sorts earlier in the stylesheet. */
  order(variant: Variant, theme: Theme): number {
    switch (variant.kind) {
      case "arbitrary":
        return ORDER.length + 1;
      case "static":
        if (variant.root in theme.breakpoints) return orderOf("__breakpoints");
        return this.statics.get(variant.root)?.order ?? ORDER.length;
      case "functional":
        return this.functionals.get(variant.root)?.order ?? ORDER.length;
      case "compound":
        return this.compounds.get(variant.root)?.order ?? ORDER.length;
    }
  }

  /** Compare two variants that share an order group. */
  compare(a: Variant, b: Variant, theme: Theme): number {
    const orderA = this.order(a, theme);
    const orderB = this.order(b, theme);
    if (orderA !== orderB) return orderA - orderB;
    if (orderA === orderOf("__breakpoints")) return compareBreakpoints(a, b, theme);
    if (a.kind === "functional" && b.kind === "functional") {
      const def = this.functionals.get(a.root);
      if (def?.compare) return def.compare(a, b, theme);
      if (a.root !== b.root) return a.root < b.root ? -1 : 1;
      const valueA = a.value?.value ?? "";
      const valueB = b.value?.value ?? "";
      if (valueA !== valueB) return valueA < valueB ? -1 : 1;
      return (a.modifier?.value ?? "") < (b.modifier?.value ?? "") ? -1 : (a.modifier?.value ?? "") > (b.modifier?.value ?? "") ? 1 : 0;
    }
    if (a.kind === "compound" && b.kind === "compound") {
      const inner = this.compare(a.variant, b.variant, theme);
      if (inner !== 0) return inner;
      return (a.modifier?.value ?? "") < (b.modifier?.value ?? "") ? -1 : (a.modifier?.value ?? "") > (b.modifier?.value ?? "") ? 1 : 0;
    }
    if (a.kind === "static" && b.kind === "static") return a.root === b.root ? 0 : a.root < b.root ? -1 : 1;
    if (a.kind === "arbitrary" && b.kind === "arbitrary") return a.selector === b.selector ? 0 : a.selector < b.selector ? -1 : 1;
    return 0;
  }
}

/** `max-*` (widest first), then `sm` … `2xl` and `min-*` by width. */
function compareBreakpoints(a: Variant, b: Variant, theme: Theme): number {
  const info = (variant: Variant): [number, number] => {
    if (variant.kind === "static") return [1, toPx(theme.breakpoints[variant.root])];
    if (variant.kind === "functional") {
      const raw = variant.value?.kind === "arbitrary" ? variant.value.value : theme.breakpoints[variant.value?.value ?? ""] ?? "";
      const px = toPx(raw);
      return variant.root === "max" ? [0, -px] : [1, px];
    }
    return [2, 0];
  };
  const [groupA, pxA] = info(a);
  const [groupB, pxB] = info(b);
  if (groupA !== groupB) return groupA - groupB;
  if (pxA !== pxB) return pxA - pxB;
  return 0;
}

export function createVariants(): VariantRegistry {
  const r = new VariantRegistry();
  const pseudo = (name: string, template: string, orderName = name) =>
    r.statics.set(name, { order: orderOf(orderName), apply: (ctx) => withSelector(ctx, template) });
  const media = (name: string, params: string, orderName = name) =>
    r.statics.set(name, { order: orderOf(orderName), apply: (ctx) => withWrapper(ctx, "media", params) });

  r.statics.set("*", { order: orderOf("*"), apply: (ctx) => withSelector(ctx, ":is(& > *)") });
  r.statics.set("**", { order: orderOf("**"), apply: (ctx) => withSelector(ctx, ":is(& *)") });

  // Pseudo-elements
  pseudo("first-letter", "&::first-letter");
  pseudo("first-line", "&::first-line");
  pseudo("marker", "& *::marker, &::marker, & *::-webkit-details-marker, &::-webkit-details-marker");
  pseudo("selection", "& *::selection, &::selection");
  pseudo("file", "&::file-selector-button");
  pseudo("placeholder", "&::placeholder");
  pseudo("backdrop", "&::backdrop");
  pseudo("details-content", "&::details-content");
  for (const name of ["before", "after"]) {
    r.statics.set(name, {
      order: orderOf(name),
      apply: (ctx) => ({ ...withSelector(ctx, `&::${name}`), content: true }),
    });
  }

  // Pseudo-classes
  const classes: Record<string, string> = {
    first: ":first-child",
    last: ":last-child",
    only: ":only-child",
    odd: ":nth-child(odd)",
    even: ":nth-child(even)",
    "first-of-type": ":first-of-type",
    "last-of-type": ":last-of-type",
    "only-of-type": ":only-of-type",
    visited: ":visited",
    target: ":target",
    open: ":is([open], :popover-open, :open)",
    default: ":default",
    checked: ":checked",
    indeterminate: ":indeterminate",
    "placeholder-shown": ":placeholder-shown",
    autofill: ":autofill",
    optional: ":optional",
    required: ":required",
    valid: ":valid",
    invalid: ":invalid",
    "user-valid": ":user-valid",
    "user-invalid": ":user-invalid",
    "in-range": ":in-range",
    "out-of-range": ":out-of-range",
    "read-only": ":read-only",
    empty: ":empty",
    "focus-within": ":focus-within",
    focus: ":focus",
    "focus-visible": ":focus-visible",
    active: ":active",
    enabled: ":enabled",
    disabled: ":disabled",
    inert: ":is([inert], [inert] *)",
  };
  for (const [name, selector] of Object.entries(classes)) pseudo(name, `&${selector}`);
  r.statics.set("hover", {
    order: orderOf("hover"),
    apply: (ctx) => withWrapper(withSelector(ctx, "&:hover"), "media", "(hover: hover)"),
  });

  // Media / environment
  media("motion-safe", "(prefers-reduced-motion: no-preference)");
  media("motion-reduce", "(prefers-reduced-motion: reduce)");
  media("contrast-more", "(prefers-contrast: more)");
  media("contrast-less", "(prefers-contrast: less)");
  media("portrait", "(orientation: portrait)");
  media("landscape", "(orientation: landscape)");
  media("print", "print");
  media("forced-colors", "(forced-colors: active)");
  media("inverted-colors", "(inverted-colors: inverted)");
  media("pointer-none", "(pointer: none)");
  media("pointer-coarse", "(pointer: coarse)");
  media("pointer-fine", "(pointer: fine)");
  media("any-pointer-none", "(any-pointer: none)");
  media("any-pointer-coarse", "(any-pointer: coarse)");
  media("any-pointer-fine", "(any-pointer: fine)");
  media("noscript", "(scripting: none)");
  pseudo("ltr", '&:where(:dir(ltr), [dir="ltr"], [dir="ltr"] *)');
  pseudo("rtl", '&:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)');
  r.statics.set("dark", {
    order: orderOf("dark"),
    apply: (ctx, theme) => withSelector(ctx, `&:is(${theme.darkSelector})`),
  });
  r.statics.set("starting", { order: orderOf("starting"), apply: (ctx) => withWrapper(ctx, "starting-style", "") });

  // Typography-plugin element variants (`prose-p:`, `prose-headings:` …).
  const proseElements: Record<string, string> = {
    headings: "h1, h2, h3, h4, h5, h6, th",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    p: "p",
    a: "a",
    blockquote: "blockquote",
    figure: "figure",
    figcaption: "figcaption",
    strong: "strong",
    em: "em",
    kbd: "kbd",
    code: "code",
    pre: "pre",
    ol: "ol",
    ul: "ul",
    li: "li",
    dl: "dl",
    dt: "dt",
    dd: "dd",
    table: "table",
    thead: "thead",
    tr: "tr",
    th: "th",
    td: "td",
    img: "img",
    picture: "picture",
    video: "video",
    hr: "hr",
    lead: '[class~="lead"]',
  };
  for (const [name, elements] of Object.entries(proseElements)) {
    pseudo(`prose-${name}`, `& :is(:where(${elements})${NOT_PROSE})`, "prose");
  }

  // Functional
  r.functionals.set("aria", {
    order: orderOf("aria"),
    apply: (ctx, variant) => {
      if (!variant.value) return null;
      if (variant.value.kind === "arbitrary") return withSelector(ctx, `&${attribute("aria-", variant.value.value)}`);
      return withSelector(ctx, `&[aria-${variant.value.value}="true"]`);
    },
  });
  r.functionals.set("data", {
    order: orderOf("data"),
    apply: (ctx, variant) => {
      if (!variant.value) return null;
      if (variant.value.kind === "arbitrary") return withSelector(ctx, `&${attribute("data-", variant.value.value)}`);
      return withSelector(ctx, `&[data-${variant.value.value}]`);
    },
  });
  const nth = (root: string, pseudoClass: string) =>
    r.functionals.set(root, {
      order: orderOf(root),
      apply: (ctx, variant) => {
        if (!variant.value) return null;
        const value = variant.value.value;
        if (variant.value.kind === "named" && !/^\d+$/.test(value)) return null;
        return withSelector(ctx, `&:${pseudoClass}(${value})`);
      },
    });
  nth("nth", "nth-child");
  nth("nth-last", "nth-last-child");
  nth("nth-of-type", "nth-of-type");
  nth("nth-last-of-type", "nth-last-of-type");
  r.functionals.set("supports", {
    order: orderOf("supports"),
    apply: (ctx, variant) => {
      if (!variant.value) return null;
      const value = variant.value.value;
      if (variant.value.kind === "arbitrary") {
        const params = /^[\w-]+\s*:/.test(value) ? `(${value})` : value;
        return withWrapper(ctx, "supports", params);
      }
      return withWrapper(ctx, "supports", `(${value}: var(--spk-u))`);
    },
  });
  const breakpointValue = (variant: Extract<Variant, { kind: "functional" }>, theme: Theme) => {
    if (!variant.value) return null;
    if (variant.value.kind === "arbitrary") return variant.value.value;
    return theme.breakpoints[variant.value.value] ?? null;
  };
  r.functionals.set("max", {
    order: orderOf("__breakpoints"),
    apply: (ctx, variant, theme) => {
      const value = breakpointValue(variant, theme);
      return value ? withWrapper(ctx, "media", `(width < ${value})`) : null;
    },
  });
  r.functionals.set("min", {
    order: orderOf("__breakpoints"),
    apply: (ctx, variant, theme) => {
      const value = breakpointValue(variant, theme);
      return value ? withWrapper(ctx, "media", `(width >= ${value})`) : null;
    },
  });

  // Compound
  const target = (name: string, modifier: Extract<Variant, { kind: "compound" }>["modifier"]) =>
    modifier ? `:where(.${name}\\/${escapeIdent(modifier.value)})` : `:where(.${name})`;
  const merge = (ctx: VariantContext, inner: VariantContext, template: (innerSelector: string) => string) => {
    // The inner variant must be selector-based: `&` followed by pseudo-classes/attributes.
    if (!inner.selector.startsWith("&") || inner.selector === "&") {
      if (inner.selector === "&" && inner.wrappers.length) return null;
    }
    return { ...withSelector(ctx, template(inner.selector)), wrappers: [...ctx.wrappers, ...inner.wrappers] };
  };
  r.compounds.set("group", {
    order: orderOf("group"),
    apply: (ctx, variant, inner) =>
      merge(ctx, inner, (sel) => `&:is(${sel.replace(/&/g, target("group", variant.modifier))} *)`),
  });
  r.compounds.set("peer", {
    order: orderOf("peer"),
    apply: (ctx, variant, inner) =>
      merge(ctx, inner, (sel) => `&:is(${sel.replace(/&/g, target("peer", variant.modifier))} ~ *)`),
  });
  r.compounds.set("not", {
    order: orderOf("not"),
    apply: (ctx, _variant, inner) => {
      if (inner.wrappers.length) {
        if (inner.selector !== "&" || inner.wrappers.length !== 1) return null;
        const [w] = inner.wrappers;
        return withWrapper(ctx, w.name, `not ${w.params}`);
      }
      if (!inner.selector.startsWith("&")) return null;
      return withSelector(ctx, `&:not(${inner.selector.slice(1)})`);
    },
  });
  r.compounds.set("in", {
    order: orderOf("in"),
    apply: (ctx, _variant, inner) => {
      if (!inner.selector.startsWith("&")) return null;
      return { ...withSelector(ctx, `:where(${inner.selector.replace(/&/g, "*").replace(/^\*/, "")}) &`), wrappers: [...ctx.wrappers, ...inner.wrappers] };
    },
  });
  r.compounds.set("has", {
    order: orderOf("has"),
    apply: (ctx, _variant, inner) => {
      if (!inner.selector.startsWith("&") || inner.wrappers.length) return null;
      return withSelector(ctx, `&:has(${inner.selector.slice(1)})`);
    },
  });
  // `has-[>img]` — an arbitrary relative selector.
  r.functionals.set("has", {
    order: orderOf("has"),
    apply: (ctx, variant) => {
      if (variant.value?.kind !== "arbitrary") return null;
      const selector = variant.value.value.replace(/^([>+~])\s*/, " $1 ");
      return withSelector(ctx, `&:has(${selector})`);
    },
  });
  for (const root of ["group", "peer"] as const) {
    // `group-[.is-open]` / `peer-[:checked]` — arbitrary selectors on the group.
    r.functionals.set(root, {
      order: orderOf(root),
      apply: (ctx, variant) => {
        if (variant.value?.kind !== "arbitrary") return null;
        const t = target(root, variant.modifier);
        const sel = variant.value.value.includes("&") ? variant.value.value.replace(/&/g, t) : `${t}${variant.value.value}`;
        return withSelector(ctx, root === "group" ? `&:is(${sel} *)` : `&:is(${sel} ~ *)`);
      },
    });
  }
  r.functionals.set("in", {
    order: orderOf("in"),
    apply: (ctx, variant) => {
      if (variant.value?.kind !== "arbitrary") return null;
      return withSelector(ctx, `:where(${variant.value.value}) &`);
    },
  });
  r.functionals.set("not", {
    order: orderOf("not"),
    apply: (ctx, variant) => {
      if (variant.value?.kind !== "arbitrary") return null;
      return withSelector(ctx, `&:not(${variant.value.value})`);
    },
  });

  return r;
}
