/**
 * The utility registry. Names and output follow Tailwind CSS v4 so existing markup renders
 * unchanged, but every themed value resolves through {@link Theme} (Spatika tokens by default)
 * and internal composition variables use the `--spk-u-*` namespace.
 */
import { atRule, decl, rule, type Node, type Output, type PropertyDef } from "./ast";
import type { Candidate, CandidateValue, Modifier } from "./parse";
import type { Theme } from "./theme";
import {
  arbitraryType,
  color,
  isPositiveNumber,
  isSpacingStep,
  negate,
  percentModifier,
  spacing,
  spacingStep,
  themeOrArbitrary,
  withAlpha,
  type DataType,
} from "./values";

type Functional = Extract<Candidate, { kind: "functional" }>;
type Static = Extract<Candidate, { kind: "static" }>;
type Result = Output | Node[] | null;
type StaticHandler = (c: Static, theme: Theme) => Result;
type FunctionalHandler = (c: Functional, theme: Theme) => Result;

const v = (name: string) => `--spk-u-${name}`;
const ref = (name: string, fallback?: string) =>
  fallback === undefined ? `var(${v(name)})` : `var(${v(name)}, ${fallback})`;
/** `var(--x,)` — resolves to nothing when unset, for composed `filter` / `transform` lists. */
const opt = (name: string) => `var(${v(name)},)`;

/** `@property` registrations for the composition variables. */
export const PROPERTIES: Record<string, PropertyDef> = {};
function prop(name: string, def: PropertyDef = { syntax: "*", inherits: false }): string {
  PROPERTIES[v(name)] = def;
  return v(name);
}
const initial = (value: string, syntax = "*"): PropertyDef => ({ syntax, inherits: false, initial: value });

prop("translate-x", initial("0"));
prop("translate-y", initial("0"));
prop("translate-z", initial("0"));
prop("scale-x", initial("1"));
prop("scale-y", initial("1"));
prop("scale-z", initial("1"));
for (const name of ["rotate-x", "rotate-y", "rotate-z", "skew-x", "skew-y"]) prop(name);
prop("border-style", initial("solid"));
prop("outline-style", initial("solid"));
prop("space-x-reverse", initial("0"));
prop("space-y-reverse", initial("0"));
prop("divide-x-reverse", initial("0"));
prop("divide-y-reverse", initial("0"));
for (const name of ["leading", "tracking", "font-weight", "duration", "ease"]) prop(name);
prop("content", initial('""'));
for (const name of ["shadow", "inset-shadow", "inset-ring-shadow", "ring-offset-shadow", "ring-shadow"]) {
  prop(name, initial("0 0 #0000"));
}
for (const name of ["shadow-color", "inset-shadow-color", "ring-color", "inset-ring-color", "ring-inset"]) prop(name);
prop("shadow-alpha", initial("100%", "<percentage>"));
prop("inset-shadow-alpha", initial("100%", "<percentage>"));
prop("ring-offset-width", initial("0px", "<length>"));
prop("ring-offset-color", initial("#fff"));
for (const name of ["blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", "saturate", "sepia"]) {
  prop(name);
  prop(`backdrop-${name}`);
}
prop("backdrop-opacity");
for (const name of ["drop-shadow", "drop-shadow-color", "drop-shadow-size"]) prop(name);
prop("drop-shadow-alpha", initial("100%", "<percentage>"));
prop("text-shadow-color");
prop("text-shadow-alpha", initial("100%", "<percentage>"));
for (const name of ["gradient-position", "gradient-stops", "gradient-via-stops"]) prop(name);
prop("gradient-from", initial("#0000", "<color>"));
prop("gradient-via", initial("#0000", "<color>"));
prop("gradient-to", initial("#0000", "<color>"));
prop("gradient-from-position", initial("0%", "<length-percentage>"));
prop("gradient-via-position", initial("50%", "<length-percentage>"));
prop("gradient-to-position", initial("100%", "<length-percentage>"));
for (const name of ["ordinal", "slashed-zero", "numeric-figure", "numeric-spacing", "numeric-fraction"]) prop(name);
prop("pan-x");
prop("pan-y");
prop("pinch-zoom");
prop("scroll-snap-strictness", initial("proximity"));
for (const name of ["contain-size", "contain-layout", "contain-paint", "contain-style"]) prop(name);

export class UtilityRegistry {
  private statics = new Map<string, StaticHandler>();
  private functionals = new Map<string, FunctionalHandler[]>();

  static(name: string, handler: StaticHandler | Node[]): void {
    this.statics.set(name, typeof handler === "function" ? handler : () => handler);
  }

  functional(root: string, handler: FunctionalHandler): void {
    const list = this.functionals.get(root) ?? [];
    list.push(handler);
    this.functionals.set(root, list);
  }

  hasStatic(name: string): boolean {
    return this.statics.has(name);
  }

  hasFunctional(root: string): boolean {
    return this.functionals.has(root);
  }

  compile(candidate: Candidate, theme: Theme): Output | null {
    if (candidate.kind === "arbitrary") return compileArbitraryProperty(candidate, theme);
    if (candidate.kind === "static") {
      if (candidate.negative) return null;
      return normalize(this.statics.get(candidate.root)?.(candidate, theme) ?? null);
    }
    for (const handler of this.functionals.get(candidate.root) ?? []) {
      const out = normalize(handler(candidate, theme));
      if (out) return out;
    }
    return null;
  }
}

function normalize(result: Result): Output | null {
  if (!result) return null;
  if (Array.isArray(result)) return result.length ? { nodes: result } : null;
  return result.nodes.length ? result : null;
}

function compileArbitraryProperty(c: Extract<Candidate, { kind: "arbitrary" }>, _theme: Theme): Output | null {
  let value = c.value;
  if (c.modifier) {
    const alpha = percentModifier(c.modifier);
    if (alpha === null) return null;
    value = withAlpha(value, alpha);
  }
  return { nodes: [decl(c.property, value)] };
}

// ─── helpers ──────────────────────────────────────────────────────────────────────────

/** A candidate with no value and no modifier (`border`, `shadow`, `rounded`). */
const bare = (c: Functional) => c.value === null && c.modifier === null;

function named(c: Functional): string | null {
  return c.value?.kind === "named" && !c.value.fraction ? c.value.value : null;
}

function arbitrary(c: Functional): { value: string; dataType: string | null } | null {
  return c.value?.kind === "arbitrary" ? c.value : null;
}

/** Candidates that must not carry a modifier (`p-4/2` is invalid). */
function noModifier(c: Functional): boolean {
  return c.modifier === null || Boolean(c.value?.kind === "named" && c.value.fraction);
}

function colorOf(c: Functional, theme: Theme, types: DataType[] = ["color"]): string | null {
  if (c.value?.kind === "arbitrary" && !c.value.dataType) {
    if (arbitraryType(c.value, types) !== "color") return null;
  }
  if (c.value?.kind === "named" && c.value.fraction) {
    return color(theme, { kind: "named", value: c.value.value, fraction: null }, c.modifier);
  }
  return color(theme, c.value, c.modifier);
}

const SHADOW_COMPOSE = [
  ref("inset-shadow"),
  ref("inset-ring-shadow"),
  ref("ring-offset-shadow"),
  ref("ring-shadow"),
  ref("shadow"),
].join(", ");
const SHADOW_PROPS = ["shadow", "inset-shadow", "inset-ring-shadow", "ring-offset-shadow", "ring-shadow"];

const FILTER = ["blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", "saturate", "sepia", "drop-shadow"]
  .map(opt)
  .join(" ");
const BACKDROP = ["blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", "opacity", "saturate", "sepia"]
  .map((name) => opt(`backdrop-${name}`))
  .join(" ");
const TRANSFORM = ["rotate-x", "rotate-y", "rotate-z", "skew-x", "skew-y"].map(opt).join(" ");
const NUMERIC = ["ordinal", "slashed-zero", "numeric-figure", "numeric-spacing", "numeric-fraction"].map(opt).join(" ");

const GRADIENT_STOPS = `${ref("gradient-via-stops")}, ${ref("gradient-position")}, ${ref("gradient-from")} ${ref(
  "gradient-from-position",
)}, ${ref("gradient-to")} ${ref("gradient-to-position")}`;
const GRADIENT_STOPS_FALLBACK = `var(${v("gradient-via-stops")}, ${ref("gradient-position")}, ${ref("gradient-from")} ${ref(
  "gradient-from-position",
)}, ${ref("gradient-to")} ${ref("gradient-to-position")})`;
const GRADIENT_PROPS = [
  "gradient-position",
  "gradient-stops",
  "gradient-via-stops",
  "gradient-from",
  "gradient-via",
  "gradient-to",
  "gradient-from-position",
  "gradient-via-position",
  "gradient-to-position",
];

/**
 * Wrap each colour in a shadow list with `var(--spk-u-<name>, colour)` so `shadow-black/5`
 * can recolour it. Theme shadows that are a single `var(--spk-shadow-*)` pass through.
 */
function recolorShadow(value: string, name: string): string {
  if (/^var\([^,]+\)$/.test(value.trim())) return value;
  const shadows = splitTopLevel(value, ",");
  return shadows
    .map((shadow) => {
      const parts = splitTopLevel(shadow.trim(), " ").filter(Boolean);
      const index = parts.findIndex(
        (part) =>
          /^(?:#|rgb|hsl|oklch|oklab|lab|lch|hwb|color|color-mix|var\()/i.test(part) ||
          /^(?:transparent|currentcolor|black|white)$/i.test(part),
      );
      if (index === -1) {
        const lengths = parts.filter((part) => part !== "inset");
        if (lengths.length < 2) return shadow.trim();
        parts.push(`var(${v(name)}, currentcolor)`);
        return parts.join(" ");
      }
      parts[index] = `var(${v(name)}, ${parts[index]})`;
      return parts.join(" ");
    })
    .join(", ");
}

/** Shadow-like utilities read a bare `var()` as a shadow, not a colour. */
function isShadowValue(a: { value: string; dataType: string | null }): boolean {
  if (a.dataType) return a.dataType !== "color";
  if (/^var\(/.test(a.value)) return true;
  return arbitraryType(a, ["color", "any"]) !== "color";
}

function splitTopLevel(input: string, separator: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === separator && depth === 0) {
      out.push(input.slice(start, i));
      start = i + 1;
    }
  }
  out.push(input.slice(start));
  return out.filter((part) => part.length > 0);
}

// ─── registry ─────────────────────────────────────────────────────────────────────────

export function createUtilities(): UtilityRegistry {
  const u = new UtilityRegistry();
  const s = (name: string, ...nodes: Node[]) => u.static(name, nodes);
  const sp = (name: string, properties: string[], ...nodes: Node[]) =>
    u.static(name, () => ({ nodes, properties: properties.map(v) }));

  // Accessibility
  s(
    "sr-only",
    decl("position", "absolute"),
    decl("width", "1px"),
    decl("height", "1px"),
    decl("padding", "0"),
    decl("margin", "-1px"),
    decl("overflow", "hidden"),
    decl("clip-path", "inset(50%)"),
    decl("white-space", "nowrap"),
    decl("border-width", "0"),
  );
  s(
    "not-sr-only",
    decl("position", "static"),
    decl("width", "auto"),
    decl("height", "auto"),
    decl("padding", "0"),
    decl("margin", "0"),
    decl("overflow", "visible"),
    decl("clip-path", "none"),
    decl("white-space", "normal"),
  );

  // Interactivity
  for (const value of ["none", "auto"]) s(`pointer-events-${value}`, decl("pointer-events", value));
  s("visible", decl("visibility", "visible"));
  s("invisible", decl("visibility", "hidden"));
  s("collapse", decl("visibility", "collapse"));
  for (const value of ["static", "fixed", "absolute", "relative", "sticky"]) s(value, decl("position", value));
  s("isolate", decl("isolation", "isolate"));
  s("isolation-auto", decl("isolation", "auto"));

  // Inset
  const insetKeywords = { auto: "auto", full: "100%" };
  const insetUtility = (root: string, properties: string[]) => {
    u.functional(root, (c, theme) => {
      if (!noModifier(c) && !c.value?.kind) return null;
      const value = spacing(theme, c.value, c.negative, insetKeywords, { fractions: true });
      return value === null ? null : properties.map((p) => decl(p, value));
    });
  };
  insetUtility("inset", ["inset"]);
  insetUtility("inset-x", ["inset-inline"]);
  insetUtility("inset-y", ["inset-block"]);
  insetUtility("start", ["inset-inline-start"]);
  insetUtility("end", ["inset-inline-end"]);
  insetUtility("top", ["top"]);
  insetUtility("right", ["right"]);
  insetUtility("bottom", ["bottom"]);
  insetUtility("left", ["left"]);

  // z-index / order / grid placement
  u.functional("z", (c) => {
    if (c.modifier) return null;
    const n = named(c);
    if (n === "auto" && !c.negative) return [decl("z-index", "auto")];
    if (n !== null && /^\d+$/.test(n)) return [decl("z-index", negate(n, c.negative))];
    const a = arbitrary(c);
    return a ? [decl("z-index", negate(a.value, c.negative))] : null;
  });
  u.functional("order", (c) => {
    if (c.modifier) return null;
    const n = named(c);
    if (n === "first" && !c.negative) return [decl("order", "-9999")];
    if (n === "last" && !c.negative) return [decl("order", "9999")];
    if (n === "none" && !c.negative) return [decl("order", "0")];
    if (n !== null && /^\d+$/.test(n)) return [decl("order", negate(n, c.negative))];
    const a = arbitrary(c);
    return a ? [decl("order", negate(a.value, c.negative))] : null;
  });
  const gridLine = (root: string, property: string, keywords: Record<string, string>, span = false) => {
    u.functional(root, (c) => {
      if (c.modifier || c.negative) return null;
      const n = named(c);
      if (n !== null && n in keywords) return [decl(property, keywords[n])];
      if (n !== null && /^\d+$/.test(n)) return [decl(property, span ? `span ${n} / span ${n}` : n)];
      const a = arbitrary(c);
      return a ? [decl(property, span ? `span ${a.value} / span ${a.value}` : a.value)] : null;
    });
  };
  gridLine("col-span", "grid-column", { full: "1 / -1" }, true);
  gridLine("col-start", "grid-column-start", { auto: "auto" });
  gridLine("col-end", "grid-column-end", { auto: "auto" });
  gridLine("col", "grid-column", { auto: "auto" });
  gridLine("row-span", "grid-row", { full: "1 / -1" }, true);
  gridLine("row-start", "grid-row-start", { auto: "auto" });
  gridLine("row-end", "grid-row-end", { auto: "auto" });
  gridLine("row", "grid-row", { auto: "auto" });

  for (const value of ["left", "right", "start", "end", "none"]) {
    s(`float-${value}`, decl("float", value === "start" ? "inline-start" : value === "end" ? "inline-end" : value));
  }
  for (const value of ["left", "right", "both", "start", "end", "none"]) {
    s(`clear-${value}`, decl("clear", value === "start" ? "inline-start" : value === "end" ? "inline-end" : value));
  }

  // Margin
  const marginUtility = (root: string, properties: string[]) => {
    u.functional(root, (c, theme) => {
      if (c.modifier) return null;
      const value = spacing(theme, c.value, c.negative, { auto: "auto" });
      return value === null ? null : properties.map((p) => decl(p, value));
    });
  };
  marginUtility("m", ["margin"]);
  marginUtility("mx", ["margin-inline"]);
  marginUtility("my", ["margin-block"]);
  marginUtility("ms", ["margin-inline-start"]);
  marginUtility("me", ["margin-inline-end"]);
  marginUtility("mt", ["margin-top"]);
  marginUtility("mr", ["margin-right"]);
  marginUtility("mb", ["margin-bottom"]);
  marginUtility("ml", ["margin-left"]);

  s("box-border", decl("box-sizing", "border-box"));
  s("box-content", decl("box-sizing", "content-box"));

  u.functional("line-clamp", (c) => {
    if (c.modifier || c.negative) return null;
    const n = named(c);
    if (n === "none") {
      return [
        decl("overflow", "visible"),
        decl("display", "block"),
        decl("-webkit-box-orient", "horizontal"),
        decl("-webkit-line-clamp", "unset"),
      ];
    }
    const value = n !== null && /^\d+$/.test(n) ? n : arbitrary(c)?.value;
    if (!value) return null;
    return [
      decl("overflow", "hidden"),
      decl("display", "-webkit-box"),
      decl("-webkit-box-orient", "vertical"),
      decl("-webkit-line-clamp", value),
    ];
  });

  // Display
  for (const [name, value] of Object.entries({
    block: "block",
    "inline-block": "inline-block",
    inline: "inline",
    flex: "flex",
    "inline-flex": "inline-flex",
    table: "table",
    "inline-table": "inline-table",
    "table-caption": "table-caption",
    "table-cell": "table-cell",
    "table-column": "table-column",
    "table-column-group": "table-column-group",
    "table-footer-group": "table-footer-group",
    "table-header-group": "table-header-group",
    "table-row-group": "table-row-group",
    "table-row": "table-row",
    "flow-root": "flow-root",
    grid: "grid",
    "inline-grid": "inline-grid",
    contents: "contents",
    "list-item": "list-item",
    hidden: "none",
  })) {
    s(name, decl("display", value));
  }

  // Aspect ratio
  u.functional("aspect", (c, theme) => {
    if (c.negative) return null;
    const n = named(c);
    if (n === "auto") return [decl("aspect-ratio", "auto")];
    if (n === "square") return [decl("aspect-ratio", "1 / 1")];
    if (n !== null && n in theme.aspect) return [decl("aspect-ratio", theme.aspect[n])];
    if (c.value?.kind === "named" && c.value.fraction) return [decl("aspect-ratio", c.value.fraction.replace("/", " / "))];
    const a = arbitrary(c);
    return a && !c.modifier ? [decl("aspect-ratio", a.value)] : null;
  });

  // Sizing
  const sizing = (
    root: string,
    properties: string[],
    keywords: Record<string, string>,
    options: { fractions?: boolean; containers?: boolean } = {},
  ) => {
    u.functional(root, (c, theme) => {
      if (c.negative) return null;
      const n = named(c);
      if (n !== null && options.containers && n in theme.containers) {
        if (c.modifier) return null;
        return properties.map((p) => decl(p, theme.containers[n]));
      }
      if (c.modifier && !(c.value?.kind === "named" && c.value.fraction)) return null;
      const value = spacing(theme, c.value, false, keywords, { fractions: options.fractions });
      return value === null ? null : properties.map((p) => decl(p, value));
    });
  };
  const common = { auto: "auto", full: "100%", min: "min-content", max: "max-content", fit: "fit-content" };
  const widths = { ...common, screen: "100vw", svw: "100svw", lvw: "100lvw", dvw: "100dvw" };
  const heights = { ...common, screen: "100vh", svh: "100svh", lvh: "100lvh", dvh: "100dvh", lh: "1lh" };
  sizing("w", ["width"], widths, { fractions: true, containers: true });
  sizing("min-w", ["min-width"], { ...widths }, { containers: true });
  sizing("max-w", ["max-width"], { ...widths, none: "none", prose: "65ch" }, { containers: true });
  sizing("h", ["height"], heights, { fractions: true });
  sizing("min-h", ["min-height"], { ...heights }, {});
  sizing("max-h", ["max-height"], { ...heights, none: "none" }, {});
  sizing("size", ["width", "height"], common, { fractions: true, containers: true });
  u.functional("max-w", (c, theme) => {
    const n = named(c);
    const match = n ? /^screen-(.+)$/.exec(n) : null;
    if (!match || c.modifier || c.negative) return null;
    const bp = theme.breakpoints[match[1]];
    return bp ? [decl("max-width", bp)] : null;
  });
  u.functional("inline", (c, theme) => {
    if (c.negative || c.modifier) return null;
    const value = spacing(theme, c.value, false, { ...widths }, { fractions: true });
    return value === null ? null : [decl("inline-size", value)];
  });

  // Flex
  u.functional("flex", (c) => {
    if (c.negative) return null;
    const n = named(c);
    const keywords: Record<string, string> = { auto: "auto", initial: "0 auto", none: "none" };
    if (n !== null && n in keywords && !c.modifier) return [decl("flex", keywords[n])];
    if (n !== null && /^\d+$/.test(n) && !c.modifier) return [decl("flex", n)];
    if (c.value?.kind === "named" && c.value.fraction) return [decl("flex", `calc(${c.value.fraction.replace("/", " / ")} * 100%)`)];
    const a = arbitrary(c);
    return a && !c.modifier ? [decl("flex", a.value)] : null;
  });
  const flexFactor = (root: string, property: string) => {
    u.functional(root, (c) => {
      if (c.negative || c.modifier) return null;
      if (c.value === null) return [decl(property, "1")];
      const n = named(c);
      if (n !== null && /^\d+$/.test(n)) return [decl(property, n)];
      const a = arbitrary(c);
      return a ? [decl(property, a.value)] : null;
    });
  };
  flexFactor("shrink", "flex-shrink");
  flexFactor("grow", "flex-grow");
  flexFactor("flex-shrink", "flex-shrink");
  flexFactor("flex-grow", "flex-grow");
  u.functional("basis", (c, theme) => {
    if (c.negative) return null;
    const n = named(c);
    if (n !== null && n in theme.containers && !c.modifier) return [decl("flex-basis", theme.containers[n])];
    if (c.modifier && !(c.value?.kind === "named" && c.value.fraction)) return null;
    const value = spacing(theme, c.value, false, { auto: "auto", full: "100%" }, { fractions: true });
    return value === null ? null : [decl("flex-basis", value)];
  });

  // Tables
  s("table-auto", decl("table-layout", "auto"));
  s("table-fixed", decl("table-layout", "fixed"));
  s("caption-top", decl("caption-side", "top"));
  s("caption-bottom", decl("caption-side", "bottom"));
  s("border-collapse", decl("border-collapse", "collapse"));
  s("border-separate", decl("border-collapse", "separate"));
  for (const [root, properties] of [
    ["border-spacing", ["--spk-u-border-spacing-x", "--spk-u-border-spacing-y"]],
    ["border-spacing-x", ["--spk-u-border-spacing-x"]],
    ["border-spacing-y", ["--spk-u-border-spacing-y"]],
  ] as const) {
    u.functional(root, (c, theme) => {
      if (c.negative || c.modifier) return null;
      const value = spacing(theme, c.value, false);
      if (value === null) return null;
      return {
        nodes: [
          ...properties.map((p) => decl(p, value)),
          decl("border-spacing", `var(--spk-u-border-spacing-x) var(--spk-u-border-spacing-y)`),
        ],
        properties: [prop("border-spacing-x", initial("0", "<length>")), prop("border-spacing-y", initial("0", "<length>"))],
      };
    });
  }

  // Transform origin, perspective
  const origins: Record<string, string> = {
    center: "center",
    top: "top",
    "top-right": "100% 0",
    right: "100%",
    "bottom-right": "100% 100%",
    bottom: "bottom",
    "bottom-left": "0 100%",
    left: "0",
    "top-left": "0 0",
  };
  u.functional("origin", (c) => {
    if (c.negative || c.modifier) return null;
    const n = named(c);
    if (n !== null && n in origins) return [decl("transform-origin", origins[n])];
    const a = arbitrary(c);
    return a ? [decl("transform-origin", a.value)] : null;
  });
  u.functional("perspective-origin", (c) => {
    const n = named(c);
    if (n !== null && n in origins) return [decl("perspective-origin", origins[n])];
    const a = arbitrary(c);
    return a ? [decl("perspective-origin", a.value)] : null;
  });
  u.functional("perspective", (c, theme) => {
    if (c.negative || c.modifier) return null;
    const n = named(c);
    if (n === "none") return [decl("perspective", "none")];
    const value = themeOrArbitrary(theme.perspective, c.value);
    return value ? [decl("perspective", value)] : null;
  });

  // Translate
  const translateValue = (c: Functional, theme: Theme) =>
    spacing(theme, c.value, c.negative, { full: "100%" }, { fractions: true });
  const translate2d = `${ref("translate-x")} ${ref("translate-y")}`;
  const translateProps = [v("translate-x"), v("translate-y"), v("translate-z")];
  u.functional("translate", (c, theme) => {
    const value = translateValue(c, theme);
    if (value === null) return null;
    return {
      nodes: [decl(v("translate-x"), value), decl(v("translate-y"), value), decl("translate", translate2d)],
      properties: translateProps,
    };
  });
  for (const axis of ["x", "y"] as const) {
    u.functional(`translate-${axis}`, (c, theme) => {
      const value = translateValue(c, theme);
      if (value === null) return null;
      return { nodes: [decl(v(`translate-${axis}`), value), decl("translate", translate2d)], properties: translateProps };
    });
  }
  u.functional("translate-z", (c, theme) => {
    const value = spacing(theme, c.value, c.negative, {}, {});
    if (value === null) return null;
    return {
      nodes: [decl(v("translate-z"), value), decl("translate", `${translate2d} ${ref("translate-z")}`)],
      properties: translateProps,
    };
  });
  s("translate-none", decl("translate", "none"));
  sp("translate-3d", ["translate-x", "translate-y", "translate-z"], decl("translate", `${translate2d} ${ref("translate-z")}`));

  // Scale
  const scaleValue = (c: Functional): string | null => {
    const n = named(c);
    if (c.modifier) return null;
    if (n !== null && isPositiveNumber(n)) return negate(`${n}%`, c.negative);
    const a = arbitrary(c);
    return a ? negate(a.value, c.negative) : null;
  };
  const scaleProps = [v("scale-x"), v("scale-y"), v("scale-z")];
  const scale2d = `${ref("scale-x")} ${ref("scale-y")}`;
  u.functional("scale", (c) => {
    if (named(c) === "none" && !c.negative) return [decl("scale", "none")];
    const value = scaleValue(c);
    if (value === null) return null;
    return {
      nodes: [decl(v("scale-x"), value), decl(v("scale-y"), value), decl(v("scale-z"), value), decl("scale", scale2d)],
      properties: scaleProps,
    };
  });
  for (const axis of ["x", "y"] as const) {
    u.functional(`scale-${axis}`, (c) => {
      const value = scaleValue(c);
      if (value === null) return null;
      return { nodes: [decl(v(`scale-${axis}`), value), decl("scale", scale2d)], properties: scaleProps };
    });
  }
  u.functional("scale-z", (c) => {
    const value = scaleValue(c);
    if (value === null) return null;
    return {
      nodes: [decl(v("scale-z"), value), decl("scale", `${scale2d} ${ref("scale-z")}`)],
      properties: scaleProps,
    };
  });
  sp("scale-3d", ["scale-x", "scale-y", "scale-z"], decl("scale", `${scale2d} ${ref("scale-z")}`));

  // Rotate / skew / transform
  const angle = (c: Functional): string | null => {
    if (c.modifier) return null;
    const n = named(c);
    if (n !== null && isPositiveNumber(n)) return negate(`${n}deg`, c.negative);
    const a = arbitrary(c);
    return a ? negate(a.value, c.negative) : null;
  };
  u.functional("rotate", (c) => {
    if (named(c) === "none" && !c.negative) return [decl("rotate", "none")];
    const value = angle(c);
    return value === null ? null : [decl("rotate", value)];
  });
  const transformProps = ["rotate-x", "rotate-y", "rotate-z", "skew-x", "skew-y"].map(v);
  for (const axis of ["x", "y", "z"] as const) {
    u.functional(`rotate-${axis}`, (c) => {
      const value = angle(c);
      if (value === null) return null;
      return {
        nodes: [decl(v(`rotate-${axis}`), `rotate${axis.toUpperCase()}(${value})`), decl("transform", TRANSFORM)],
        properties: transformProps,
      };
    });
  }
  u.functional("skew", (c) => {
    const value = angle(c);
    if (value === null) return null;
    return {
      nodes: [decl(v("skew-x"), `skewX(${value})`), decl(v("skew-y"), `skewY(${value})`), decl("transform", TRANSFORM)],
      properties: transformProps,
    };
  });
  for (const axis of ["x", "y"] as const) {
    u.functional(`skew-${axis}`, (c) => {
      const value = angle(c);
      if (value === null) return null;
      return {
        nodes: [decl(v(`skew-${axis}`), `skew${axis.toUpperCase()}(${value})`), decl("transform", TRANSFORM)],
        properties: transformProps,
      };
    });
  }
  u.functional("transform", (c) => {
    if (c.value === null && c.modifier === null) return { nodes: [decl("transform", TRANSFORM)], properties: transformProps };
    const a = arbitrary(c);
    return a && !c.modifier ? [decl("transform", a.value)] : null;
  });
  sp("transform-cpu", ["rotate-x"], decl("transform", TRANSFORM));
  u.static("transform-gpu", () => ({ nodes: [decl("transform", `translateZ(0) ${TRANSFORM}`)], properties: transformProps }));
  s("transform-none", decl("transform", "none"));
  s("transform-flat", decl("transform-style", "flat"));
  s("transform-3d", decl("transform-style", "preserve-3d"));
  s("transform-content", decl("transform-box", "content-box"));
  s("transform-border", decl("transform-box", "border-box"));
  s("transform-fill", decl("transform-box", "fill-box"));
  s("transform-stroke", decl("transform-box", "stroke-box"));
  s("transform-view", decl("transform-box", "view-box"));
  s("backface-visible", decl("backface-visibility", "visible"));
  s("backface-hidden", decl("backface-visibility", "hidden"));

  // Animation
  u.functional("animate", (c, theme) => {
    if (c.negative || c.modifier) return null;
    const n = named(c);
    if (n === "none") return [decl("animation", "none")];
    if (n !== null && n in theme.animate) {
      const anim = theme.animate[n];
      return { nodes: [decl("animation", anim.value)], keyframes: anim.keyframes ? [anim.keyframes] : [] };
    }
    const a = arbitrary(c);
    return a ? [decl("animation", a.value)] : null;
  });

  // Cursor / touch / select / resize / scroll
  u.functional("cursor", (c) => {
    if (c.negative || c.modifier) return null;
    const n = named(c);
    if (n !== null) return [decl("cursor", n)];
    const a = arbitrary(c);
    return a ? [decl("cursor", a.value)] : null;
  });
  s("touch-auto", decl("touch-action", "auto"));
  s("touch-none", decl("touch-action", "none"));
  s("touch-manipulation", decl("touch-action", "manipulation"));
  const touchCompose = `${opt("pan-x")} ${opt("pan-y")} ${opt("pinch-zoom")}`;
  for (const [name, variable] of [
    ["pan-x", "pan-x"],
    ["pan-left", "pan-x"],
    ["pan-right", "pan-x"],
    ["pan-y", "pan-y"],
    ["pan-up", "pan-y"],
    ["pan-down", "pan-y"],
    ["pinch-zoom", "pinch-zoom"],
  ]) {
    u.static(`touch-${name}`, () => ({
      nodes: [decl(v(variable), name), decl("touch-action", touchCompose)],
      properties: [v("pan-x"), v("pan-y"), v("pinch-zoom")],
    }));
  }
  s("select-none", decl("-webkit-user-select", "none"), decl("user-select", "none"));
  s("select-text", decl("-webkit-user-select", "text"), decl("user-select", "text"));
  s("select-all", decl("-webkit-user-select", "all"), decl("user-select", "all"));
  s("select-auto", decl("-webkit-user-select", "auto"), decl("user-select", "auto"));
  s("resize", decl("resize", "both"));
  s("resize-none", decl("resize", "none"));
  s("resize-x", decl("resize", "horizontal"));
  s("resize-y", decl("resize", "vertical"));
  s("snap-none", decl("scroll-snap-type", "none"));
  for (const axis of ["x", "y", "both", "block", "inline"]) {
    u.static(`snap-${axis}`, () => ({
      nodes: [decl("scroll-snap-type", `${axis} ${ref("scroll-snap-strictness")}`)],
      properties: [v("scroll-snap-strictness")],
    }));
  }
  sp("snap-mandatory", ["scroll-snap-strictness"], decl(v("scroll-snap-strictness"), "mandatory"));
  sp("snap-proximity", ["scroll-snap-strictness"], decl(v("scroll-snap-strictness"), "proximity"));
  for (const value of ["start", "end", "center"]) s(`snap-${value}`, decl("scroll-snap-align", value));
  s("snap-align-none", decl("scroll-snap-align", "none"));
  s("snap-normal", decl("scroll-snap-stop", "normal"));
  s("snap-always", decl("scroll-snap-stop", "always"));
  const scrollSpacing = (root: string, property: string, allowNegative: boolean) => {
    u.functional(root, (c, theme) => {
      if (c.modifier || (c.negative && !allowNegative)) return null;
      const value = spacing(theme, c.value, c.negative);
      return value === null ? null : [decl(property, value)];
    });
  };
  for (const [suffix, property] of [
    ["", ""],
    ["x", "-inline"],
    ["y", "-block"],
    ["s", "-inline-start"],
    ["e", "-inline-end"],
    ["t", "-top"],
    ["r", "-right"],
    ["b", "-bottom"],
    ["l", "-left"],
  ]) {
    scrollSpacing(`scroll-m${suffix}`, `scroll-margin${property}`, true);
    scrollSpacing(`scroll-p${suffix}`, `scroll-padding${property}`, false);
  }
  s("scroll-auto", decl("scroll-behavior", "auto"));
  s("scroll-smooth", decl("scroll-behavior", "smooth"));

  // Lists
  s("list-inside", decl("list-style-position", "inside"));
  s("list-outside", decl("list-style-position", "outside"));
  u.functional("list", (c) => {
    if (c.negative || c.modifier) return null;
    const n = named(c);
    const keywords: Record<string, string> = { none: "none", disc: "disc", decimal: "decimal" };
    if (n !== null && n in keywords) return [decl("list-style-type", keywords[n])];
    const a = arbitrary(c);
    return a ? [decl("list-style-type", a.value)] : null;
  });
  u.functional("list-image", (c) => {
    const n = named(c);
    if (n === "none") return [decl("list-style-image", "none")];
    const a = arbitrary(c);
    return a ? [decl("list-style-image", a.value)] : null;
  });
  s("appearance-none", decl("appearance", "none"));
  s("appearance-auto", decl("appearance", "auto"));
  u.functional("columns", (c, theme) => {
    if (c.negative || c.modifier) return null;
    const n = named(c);
    if (n === "auto") return [decl("columns", "auto")];
    if (n !== null && /^\d+$/.test(n)) return [decl("columns", n)];
    if (n !== null && n in theme.containers) return [decl("columns", theme.containers[n])];
    const a = arbitrary(c);
    return a ? [decl("columns", a.value)] : null;
  });
  for (const [prefix, property] of [
    ["break-before", "break-before"],
    ["break-after", "break-after"],
  ]) {
    for (const value of ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"]) {
      s(`${prefix}-${value}`, decl(property, value));
    }
  }
  for (const value of ["auto", "avoid", "avoid-page", "avoid-column"]) s(`break-inside-${value}`, decl("break-inside", value));
  s("box-decoration-clone", decl("-webkit-box-decoration-break", "clone"), decl("box-decoration-break", "clone"));
  s("box-decoration-slice", decl("-webkit-box-decoration-break", "slice"), decl("box-decoration-break", "slice"));

  // Grid
  const gridTemplate = (root: string, property: string) => {
    u.functional(root, (c) => {
      if (c.negative || c.modifier) return null;
      const n = named(c);
      if (n === "none") return [decl(property, "none")];
      if (n === "subgrid") return [decl(property, "subgrid")];
      if (n !== null && /^\d+$/.test(n)) return [decl(property, `repeat(${n}, minmax(0, 1fr))`)];
      const a = arbitrary(c);
      return a ? [decl(property, a.value)] : null;
    });
  };
  gridTemplate("grid-cols", "grid-template-columns");
  gridTemplate("grid-rows", "grid-template-rows");
  const autoTrack = (root: string, property: string) => {
    u.functional(root, (c) => {
      if (c.negative || c.modifier) return null;
      const keywords: Record<string, string> = {
        auto: "auto",
        min: "min-content",
        max: "max-content",
        fr: "minmax(0, 1fr)",
      };
      const n = named(c);
      if (n !== null && n in keywords) return [decl(property, keywords[n])];
      const a = arbitrary(c);
      return a ? [decl(property, a.value)] : null;
    });
  };
  autoTrack("auto-cols", "grid-auto-columns");
  autoTrack("auto-rows", "grid-auto-rows");
  for (const value of ["row", "col", "dense", "row-dense", "col-dense"]) {
    s(`grid-flow-${value}`, decl("grid-auto-flow", value.replace("col", "column").replace("-", " ")));
  }

  // Flexbox & alignment
  s("flex-row", decl("flex-direction", "row"));
  s("flex-row-reverse", decl("flex-direction", "row-reverse"));
  s("flex-col", decl("flex-direction", "column"));
  s("flex-col-reverse", decl("flex-direction", "column-reverse"));
  s("flex-wrap", decl("flex-wrap", "wrap"));
  s("flex-nowrap", decl("flex-wrap", "nowrap"));
  s("flex-wrap-reverse", decl("flex-wrap", "wrap-reverse"));
  const align: Record<string, string> = {
    start: "flex-start",
    end: "flex-end",
    "end-safe": "safe flex-end",
    "center-safe": "safe center",
    center: "center",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
    stretch: "stretch",
    baseline: "baseline",
    normal: "normal",
  };
  for (const value of ["center", "start", "end", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"]) {
    s(`place-content-${value}`, decl("place-content", align[value].replace("flex-", "")));
  }
  for (const value of ["start", "end", "center", "stretch", "baseline", "center-safe", "end-safe"]) {
    s(`place-items-${value}`, decl("place-items", value.replace("-safe", "").replace(/^(center|end)$/, "$1")));
  }
  for (const value of ["auto", "start", "end", "center", "stretch", "center-safe", "end-safe"]) {
    s(`place-self-${value}`, decl("place-self", value.includes("safe") ? `safe ${value.replace("-safe", "")}` : value));
  }
  for (const value of ["normal", "center", "start", "end", "between", "around", "evenly", "baseline", "stretch", "center-safe", "end-safe"]) {
    s(`content-${value}`, decl("align-content", align[value]));
  }
  for (const value of ["start", "end", "center", "baseline", "stretch", "center-safe", "end-safe"]) {
    s(`items-${value}`, decl("align-items", align[value]));
  }
  s("items-baseline-last", decl("align-items", "last baseline"));
  for (const value of ["normal", "start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"]) {
    s(`justify-${value}`, decl("justify-content", align[value]));
  }
  for (const value of ["normal", "start", "end", "center", "stretch", "center-safe", "end-safe"]) {
    s(`justify-items-${value}`, decl("justify-items", value.includes("safe") ? `safe ${value.replace("-safe", "")}` : value));
  }
  for (const value of ["auto", "start", "end", "center", "stretch", "center-safe", "end-safe"]) {
    s(
      `justify-self-${value}`,
      decl("justify-self", value.includes("safe") ? `safe ${value.replace("-safe", "")}` : value === "start" ? "flex-start" : value === "end" ? "flex-end" : value),
    );
  }
  for (const value of ["auto", "start", "end", "center", "stretch", "baseline", "center-safe", "end-safe"]) {
    s(`self-${value}`, decl("align-self", value === "auto" ? "auto" : align[value]));
  }
  s("self-baseline-last", decl("align-self", "last baseline"));

  // Gap / space / divide
  for (const [root, properties] of [
    ["gap", ["gap"]],
    ["gap-x", ["column-gap"]],
    ["gap-y", ["row-gap"]],
  ] as const) {
    u.functional(root, (c, theme) => {
      if (c.negative || c.modifier) return null;
      const value = spacing(theme, c.value, false);
      return value === null ? null : properties.map((p) => decl(p, value));
    });
  }
  for (const axis of ["x", "y"] as const) {
    const [start, end] = axis === "x" ? ["margin-inline-start", "margin-inline-end"] : ["margin-block-start", "margin-block-end"];
    u.functional(`space-${axis}`, (c, theme) => {
      if (c.modifier) return null;
      const value = spacing(theme, c.value, c.negative);
      if (value === null) return null;
      return {
        nodes: [
          rule(":where(& > :not(:last-child))", [
            decl(v(`space-${axis}-reverse`), "0"),
            decl(start, `calc(${value} * ${ref(`space-${axis}-reverse`)})`),
            decl(end, `calc(${value} * calc(1 - ${ref(`space-${axis}-reverse`)}))`),
          ]),
        ],
        properties: [v(`space-${axis}-reverse`)],
      };
    });
    u.static(`space-${axis}-reverse`, () => ({
      nodes: [rule(":where(& > :not(:last-child))", [decl(v(`space-${axis}-reverse`), "1")])],
      properties: [v(`space-${axis}-reverse`)],
    }));
    u.functional(`divide-${axis}`, (c) => {
      if (c.negative || c.modifier) return null;
      let width: string | null = null;
      if (c.value === null) width = "1px";
      else if (named(c) !== null && /^\d+$/.test(named(c)!)) width = `${named(c)}px`;
      else if (arbitrary(c)) width = arbitrary(c)!.value;
      if (width === null) return null;
      const reverse = ref(`divide-${axis}-reverse`);
      const nodes =
        axis === "x"
          ? [
              decl(v("divide-x-reverse"), "0"),
              decl("border-inline-style", ref("border-style")),
              decl("border-inline-start-width", `calc(${width} * ${reverse})`),
              decl("border-inline-end-width", `calc(${width} * calc(1 - ${reverse}))`),
            ]
          : [
              decl(v("divide-y-reverse"), "0"),
              decl("border-bottom-style", ref("border-style")),
              decl("border-top-style", ref("border-style")),
              decl("border-top-width", `calc(${width} * ${reverse})`),
              decl("border-bottom-width", `calc(${width} * calc(1 - ${reverse}))`),
            ];
      return {
        nodes: [rule(":where(& > :not(:last-child))", nodes)],
        properties: [v(`divide-${axis}-reverse`), v("border-style")],
      };
    });
    u.static(`divide-${axis}-reverse`, () => ({
      nodes: [rule(":where(& > :not(:last-child))", [decl(v(`divide-${axis}-reverse`), "1")])],
      properties: [v(`divide-${axis}-reverse`)],
    }));
  }
  u.functional("divide", (c, theme) => {
    if (c.negative) return null;
    const value = colorOf(c, theme);
    return value === null ? null : [rule(":where(& > :not(:last-child))", [decl("border-color", value)])];
  });
  for (const style of ["solid", "dashed", "dotted", "double", "hidden", "none"]) {
    u.static(`divide-${style}`, () => ({
      nodes: [rule(":where(& > :not(:last-child))", [decl(v("border-style"), style), decl("border-style", style)])],
      properties: [v("border-style")],
    }));
  }

  // Overflow
  for (const value of ["auto", "hidden", "clip", "visible", "scroll"]) {
    s(`overflow-${value}`, decl("overflow", value));
    s(`overflow-x-${value}`, decl("overflow-x", value));
    s(`overflow-y-${value}`, decl("overflow-y", value));
  }
  for (const value of ["auto", "contain", "none"]) {
    s(`overscroll-${value}`, decl("overscroll-behavior", value));
    s(`overscroll-x-${value}`, decl("overscroll-behavior-x", value));
    s(`overscroll-y-${value}`, decl("overscroll-behavior-y", value));
  }

  // Text overflow / whitespace / wrapping
  s("truncate", decl("overflow", "hidden"), decl("text-overflow", "ellipsis"), decl("white-space", "nowrap"));
  s("text-ellipsis", decl("text-overflow", "ellipsis"));
  s("text-clip", decl("text-overflow", "clip"));
  for (const value of ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]) {
    s(`whitespace-${value}`, decl("white-space", value));
  }
  s("text-wrap", decl("text-wrap", "wrap"));
  s("text-nowrap", decl("text-wrap", "nowrap"));
  s("text-balance", decl("text-wrap", "balance"));
  s("text-pretty", decl("text-wrap", "pretty"));
  s("break-normal", decl("overflow-wrap", "normal"), decl("word-break", "normal"));
  s("break-words", decl("overflow-wrap", "break-word"));
  s("break-all", decl("word-break", "break-all"));
  s("break-keep", decl("word-break", "keep-all"));
  s("wrap-anywhere", decl("overflow-wrap", "anywhere"));
  s("wrap-break-word", decl("overflow-wrap", "break-word"));
  s("wrap-normal", decl("overflow-wrap", "normal"));
  s("hyphens-none", decl("-webkit-hyphens", "none"), decl("hyphens", "none"));
  s("hyphens-manual", decl("-webkit-hyphens", "manual"), decl("hyphens", "manual"));
  s("hyphens-auto", decl("-webkit-hyphens", "auto"), decl("hyphens", "auto"));

  // Border radius
  const corners: Record<string, string[]> = {
    rounded: ["border-radius"],
    "rounded-s": ["border-start-start-radius", "border-end-start-radius"],
    "rounded-e": ["border-start-end-radius", "border-end-end-radius"],
    "rounded-t": ["border-top-left-radius", "border-top-right-radius"],
    "rounded-r": ["border-top-right-radius", "border-bottom-right-radius"],
    "rounded-b": ["border-bottom-right-radius", "border-bottom-left-radius"],
    "rounded-l": ["border-top-left-radius", "border-bottom-left-radius"],
    "rounded-ss": ["border-start-start-radius"],
    "rounded-se": ["border-start-end-radius"],
    "rounded-ee": ["border-end-end-radius"],
    "rounded-es": ["border-end-start-radius"],
    "rounded-tl": ["border-top-left-radius"],
    "rounded-tr": ["border-top-right-radius"],
    "rounded-br": ["border-bottom-right-radius"],
    "rounded-bl": ["border-bottom-left-radius"],
  };
  for (const [root, properties] of Object.entries(corners)) {
    u.functional(root, (c, theme) => {
      if (c.negative || c.modifier) return null;
      let value: string | null;
      if (c.value === null) value = theme.radius[""] ?? null;
      else if (named(c) === "none") value = "0";
      else if (named(c) === "full") value = "calc(infinity * 1px)";
      else value = themeOrArbitrary(theme.radius, c.value);
      return value === null ? null : properties.map((p) => decl(p, value!));
    });
  }

  // Borders
  const borderSides: Record<string, { style: string[]; width: string[]; color: string[] }> = {
    border: { style: ["border-style"], width: ["border-width"], color: ["border-color"] },
    "border-x": { style: ["border-inline-style"], width: ["border-inline-width"], color: ["border-inline-color"] },
    "border-y": { style: ["border-block-style"], width: ["border-block-width"], color: ["border-block-color"] },
    "border-s": { style: ["border-inline-start-style"], width: ["border-inline-start-width"], color: ["border-inline-start-color"] },
    "border-e": { style: ["border-inline-end-style"], width: ["border-inline-end-width"], color: ["border-inline-end-color"] },
    "border-t": { style: ["border-top-style"], width: ["border-top-width"], color: ["border-top-color"] },
    "border-r": { style: ["border-right-style"], width: ["border-right-width"], color: ["border-right-color"] },
    "border-b": { style: ["border-bottom-style"], width: ["border-bottom-width"], color: ["border-bottom-color"] },
    "border-l": { style: ["border-left-style"], width: ["border-left-width"], color: ["border-left-color"] },
  };
  for (const [root, side] of Object.entries(borderSides)) {
    u.functional(root, (c, theme) => {
      if (c.negative) return null;
      const widthNodes = (width: string): Output => ({
        nodes: [...side.style.map((p) => decl(p, ref("border-style"))), ...side.width.map((p) => decl(p, width))],
        properties: [v("border-style")],
      });
      if (c.value === null) return c.modifier ? null : widthNodes("1px");
      const n = named(c);
      if (n !== null && /^\d+$/.test(n) && !c.modifier) return widthNodes(`${n}px`);
      if (n === "px" && !c.modifier) return widthNodes("1px");
      const a = arbitrary(c);
      if (a && !c.modifier) {
        const type = arbitraryType(a, ["color", "line-width", "length"]);
        if (type === "line-width" || type === "length") return widthNodes(a.value);
      }
      const value = colorOf(c, theme, ["color", "line-width", "length"]);
      return value === null ? null : side.color.map((p) => decl(p, value));
    });
  }
  for (const style of ["solid", "dashed", "dotted", "double", "hidden", "none"]) {
    u.static(`border-${style}`, () => ({
      nodes: [decl(v("border-style"), style), decl("border-style", style)],
      properties: [v("border-style")],
    }));
  }

  // Backgrounds
  u.functional("bg", (c, theme) => {
    if (c.negative) return null;
    const n = named(c);
    if (n === "none" && !c.modifier) return [decl("background-image", "none")];
    const a = arbitrary(c);
    if (a && !c.modifier) {
      const type = arbitraryType(a, ["color", "image", "url", "bg-size", "position"]);
      if (type === "image" || type === "url") return [decl("background-image", a.value)];
      if (type === "bg-size" || type === "length" || type === "percentage" || type === "size") return [decl("background-size", a.value)];
      if (type === "position") return [decl("background-position", a.value)];
    }
    const value = colorOf(c, theme, ["color", "image", "url", "bg-size", "position"]);
    return value === null ? null : [decl("background-color", value)];
  });
  for (const value of ["fixed", "local", "scroll"]) s(`bg-${value}`, decl("background-attachment", value));
  s("bg-clip-text", decl("background-clip", "text"));
  for (const value of ["border", "padding", "content"]) {
    s(`bg-clip-${value}`, decl("background-clip", `${value}-box`));
    s(`bg-origin-${value}`, decl("background-origin", `${value}-box`));
  }
  s("bg-repeat", decl("background-repeat", "repeat"));
  s("bg-no-repeat", decl("background-repeat", "no-repeat"));
  s("bg-repeat-x", decl("background-repeat", "repeat-x"));
  s("bg-repeat-y", decl("background-repeat", "repeat-y"));
  s("bg-repeat-round", decl("background-repeat", "round"));
  s("bg-repeat-space", decl("background-repeat", "space"));
  s("bg-auto", decl("background-size", "auto"));
  s("bg-cover", decl("background-size", "cover"));
  s("bg-contain", decl("background-size", "contain"));
  for (const value of ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top", "top-left", "top-right", "bottom-left", "bottom-right"]) {
    s(`bg-${value}`, decl("background-position", value.replace("-", " ")));
  }
  for (const [name, mode] of Object.entries({
    normal: "normal",
    multiply: "multiply",
    screen: "screen",
    overlay: "overlay",
    darken: "darken",
    lighten: "lighten",
    "color-dodge": "color-dodge",
    "color-burn": "color-burn",
    "hard-light": "hard-light",
    "soft-light": "soft-light",
    difference: "difference",
    exclusion: "exclusion",
    hue: "hue",
    saturation: "saturation",
    color: "color",
    luminosity: "luminosity",
    "plus-darker": "plus-darker",
    "plus-lighter": "plus-lighter",
  })) {
    s(`mix-blend-${name}`, decl("mix-blend-mode", mode));
    s(`bg-blend-${name}`, decl("background-blend-mode", mode));
  }

  // Gradients
  const directions: Record<string, string> = {
    t: "to top",
    tr: "to top right",
    r: "to right",
    br: "to bottom right",
    b: "to bottom",
    bl: "to bottom left",
    l: "to left",
    tl: "to top left",
  };
  const gradientProps = GRADIENT_PROPS.map(v);
  for (const [dir, value] of Object.entries(directions)) {
    for (const prefix of ["bg-gradient-to", "bg-linear-to"]) {
      u.static(`${prefix}-${dir}`, () => ({
        nodes: [decl(v("gradient-position"), `${value} in oklab`), decl("background-image", `linear-gradient(${ref("gradient-stops")})`)],
        properties: gradientProps,
      }));
    }
  }
  const interpolation = (m: Modifier | null): string | null => {
    if (!m) return "in oklab";
    if (m.kind === "arbitrary") return m.value;
    const spaces = ["srgb", "hsl", "oklab", "oklch", "longer", "shorter", "increasing", "decreasing"];
    if (!spaces.includes(m.value)) return null;
    return ["longer", "shorter", "increasing", "decreasing"].includes(m.value) ? `in oklch ${m.value} hue` : `in ${m.value}`;
  };
  u.functional("bg-linear", (c) => {
    const interp = interpolation(c.modifier);
    if (interp === null) return null;
    const n = named(c);
    if (n !== null && isPositiveNumber(n)) {
      return {
        nodes: [
          decl(v("gradient-position"), `${negate(`${n}deg`, c.negative)} ${interp}`),
          decl("background-image", `linear-gradient(${ref("gradient-stops")})`),
        ],
        properties: gradientProps,
      };
    }
    const a = arbitrary(c);
    if (!a) return null;
    const type = arbitraryType(a, ["angle"]);
    if (type === "angle" || /^to /.test(a.value)) {
      return {
        nodes: [decl(v("gradient-position"), `${a.value} ${interp}`.trim()), decl("background-image", `linear-gradient(${ref("gradient-stops")})`)],
        properties: gradientProps,
      };
    }
    return [decl(v("gradient-position"), a.value), decl("background-image", `linear-gradient(${ref("gradient-stops")})`)];
  });
  for (const kind of ["radial", "conic"] as const) {
    u.functional(`bg-${kind}`, (c) => {
      const interp = interpolation(c.modifier);
      if (interp === null) return null;
      const fn = kind === "radial" ? "radial-gradient" : "conic-gradient";
      if (c.value === null) {
        return {
          nodes: [decl(v("gradient-position"), interp), decl("background-image", `${fn}(${ref("gradient-stops")})`)],
          properties: gradientProps,
        };
      }
      const n = named(c);
      if (kind === "conic" && n !== null && isPositiveNumber(n)) {
        return {
          nodes: [
            decl(v("gradient-position"), `from ${negate(`${n}deg`, c.negative)} ${interp}`),
            decl("background-image", `${fn}(${ref("gradient-stops")})`),
          ],
          properties: gradientProps,
        };
      }
      const a = arbitrary(c);
      if (!a) return null;
      return {
        nodes: [decl(v("gradient-position"), a.value), decl("background-image", `${fn}(${ref("gradient-stops")}, ${ref("gradient-stops")})`.replace(`, ${ref("gradient-stops")})`, ")"))],
        properties: gradientProps,
      };
    });
  }
  for (const stop of ["from", "via", "to"] as const) {
    u.functional(stop, (c, theme) => {
      if (c.negative) return null;
      const n = named(c);
      const a = arbitrary(c);
      // Stop positions: `from-10%`, `via-[20%]`.
      if ((n !== null && /^\d+(?:\.\d+)?%$/.test(n) && !c.modifier) || (a && !c.modifier && ["percentage", "length"].includes(arbitraryType(a, ["color", "percentage", "length"]) ?? ""))) {
        return { nodes: [decl(v(`gradient-${stop}-position`), n ?? a!.value)], properties: gradientProps };
      }
      const value = colorOf(c, theme, ["color", "percentage", "length"]);
      if (value === null) return null;
      if (stop === "via") {
        return {
          nodes: [
            decl(v("gradient-via"), value),
            decl(
              v("gradient-via-stops"),
              `${ref("gradient-position")}, ${ref("gradient-from")} ${ref("gradient-from-position")}, ${ref("gradient-via")} ${ref(
                "gradient-via-position",
              )}, ${ref("gradient-to")} ${ref("gradient-to-position")}`,
            ),
            decl(v("gradient-stops"), ref("gradient-via-stops")),
          ],
          properties: gradientProps,
        };
      }
      return {
        nodes: [decl(v(`gradient-${stop}`), value), decl(v("gradient-stops"), GRADIENT_STOPS_FALLBACK)],
        properties: gradientProps,
      };
    });
  }
  void GRADIENT_STOPS;

  // SVG
  u.functional("fill", (c, theme) => {
    if (c.negative) return null;
    if (named(c) === "none" && !c.modifier) return [decl("fill", "none")];
    const value = colorOf(c, theme);
    return value === null ? null : [decl("fill", value)];
  });
  u.functional("stroke", (c, theme) => {
    if (c.negative) return null;
    const n = named(c);
    if (n === "none" && !c.modifier) return [decl("stroke", "none")];
    if (n !== null && /^\d+$/.test(n) && !c.modifier) return [decl("stroke-width", n)];
    const a = arbitrary(c);
    if (a && !c.modifier) {
      const type = arbitraryType(a, ["color", "number", "length", "percentage"]);
      if (type === "number" || type === "length" || type === "percentage") return [decl("stroke-width", a.value)];
    }
    const value = colorOf(c, theme, ["color", "number", "length", "percentage"]);
    return value === null ? null : [decl("stroke", value)];
  });

  // Object fit / position
  for (const value of ["contain", "cover", "fill", "none", "scale-down"]) s(`object-${value}`, decl("object-fit", value));
  u.functional("object", (c) => {
    if (c.negative || c.modifier) return null;
    const positions: Record<string, string> = {
      bottom: "bottom",
      center: "center",
      left: "left",
      "left-bottom": "left bottom",
      "left-top": "left top",
      right: "right",
      "right-bottom": "right bottom",
      "right-top": "right top",
      top: "top",
      "top-left": "top left",
      "top-right": "top right",
      "bottom-left": "bottom left",
      "bottom-right": "bottom right",
    };
    const n = named(c);
    if (n !== null && n in positions) return [decl("object-position", positions[n])];
    const a = arbitrary(c);
    return a ? [decl("object-position", a.value)] : null;
  });

  // Padding
  for (const [root, properties] of Object.entries({
    p: ["padding"],
    px: ["padding-inline"],
    py: ["padding-block"],
    ps: ["padding-inline-start"],
    pe: ["padding-inline-end"],
    pt: ["padding-top"],
    pr: ["padding-right"],
    pb: ["padding-bottom"],
    pl: ["padding-left"],
  })) {
    u.functional(root, (c, theme) => {
      if (c.negative || c.modifier) return null;
      const value = spacing(theme, c.value, false);
      return value === null ? null : properties.map((p) => decl(p, value));
    });
  }

  // Typography
  for (const value of ["left", "center", "right", "justify", "start", "end"]) s(`text-${value}`, decl("text-align", value));
  u.functional("indent", (c, theme) => {
    if (c.modifier) return null;
    const value = spacing(theme, c.value, c.negative);
    return value === null ? null : [decl("text-indent", value)];
  });
  for (const value of ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super"]) {
    s(`align-${value}`, decl("vertical-align", value));
  }
  u.functional("align", (c) => {
    const a = arbitrary(c);
    return a && !c.modifier ? [decl("vertical-align", a.value)] : null;
  });
  u.functional("font", (c, theme) => {
    if (c.negative || c.modifier) return null;
    const n = named(c);
    if (n !== null && n in theme.fontFamily) return [decl("font-family", theme.fontFamily[n])];
    if (n !== null && n in theme.fontWeight) {
      return { nodes: [decl(v("font-weight"), theme.fontWeight[n]), decl("font-weight", theme.fontWeight[n])], properties: [v("font-weight")] };
    }
    const a = arbitrary(c);
    if (!a) return null;
    const type = arbitraryType(a, ["number", "generic-name", "family-name"]);
    if (type === "number") {
      return { nodes: [decl(v("font-weight"), a.value), decl("font-weight", a.value)], properties: [v("font-weight")] };
    }
    if (a.dataType === "weight") {
      return { nodes: [decl(v("font-weight"), a.value), decl("font-weight", a.value)], properties: [v("font-weight")] };
    }
    return [decl("font-family", a.value)];
  });
  u.functional("text", (c, theme) => {
    if (c.negative) return null;
    const n = named(c);
    const lineHeightFromModifier = (m: Modifier | null): string | null => {
      if (!m) return null;
      if (m.kind === "arbitrary") return m.value;
      if (m.value in theme.leading) return theme.leading[m.value];
      if (isSpacingStep(m.value)) return spacingStep(theme, m.value);
      return null;
    };
    if (n !== null && n in theme.fontSize) {
      const size = theme.fontSize[n];
      if (c.modifier) {
        const lh = lineHeightFromModifier(c.modifier);
        if (lh === null) return null;
        return [decl("font-size", size.size), decl("line-height", lh)];
      }
      const nodes = [decl("font-size", size.size)];
      const properties: string[] = [];
      if (size.lineHeight) {
        nodes.push(decl("line-height", `var(${v("leading")}, ${size.lineHeight})`));
        properties.push(v("leading"));
      }
      if (size.letterSpacing) {
        nodes.push(decl("letter-spacing", `var(${v("tracking")}, ${size.letterSpacing})`));
        properties.push(v("tracking"));
      }
      if (size.fontWeight) {
        nodes.push(decl("font-weight", `var(${v("font-weight")}, ${size.fontWeight})`));
        properties.push(v("font-weight"));
      }
      return { nodes, properties };
    }
    const a = arbitrary(c);
    if (a) {
      const type = arbitraryType(a, ["color", "length", "percentage", "absolute-size", "relative-size"]);
      if (type === "length" || type === "percentage" || type === "absolute-size" || type === "relative-size" || type === "size") {
        if (c.modifier) {
          const lh = lineHeightFromModifier(c.modifier);
          return lh === null ? null : [decl("font-size", a.value), decl("line-height", lh)];
        }
        return [decl("font-size", a.value)];
      }
    }
    const value = colorOf(c, theme, ["color", "length", "percentage", "absolute-size", "relative-size"]);
    return value === null ? null : [decl("color", value)];
  });
  u.functional("leading", (c, theme) => {
    if (c.negative || c.modifier) return null;
    const n = named(c);
    let value: string | null = null;
    if (n === "none") value = "1";
    else if (n !== null && n in theme.leading) value = theme.leading[n];
    else if (n !== null && isSpacingStep(n)) value = spacingStep(theme, n);
    else if (n === "px") value = "1px";
    else value = arbitrary(c)?.value ?? null;
    if (value === null) return null;
    return { nodes: [decl(v("leading"), value), decl("line-height", value)], properties: [v("leading")] };
  });
  u.functional("tracking", (c, theme) => {
    if (c.modifier) return null;
    const value = themeOrArbitrary(theme.tracking, c.value);
    if (value === null) return null;
    const final = negate(value, c.negative);
    return { nodes: [decl(v("tracking"), final), decl("letter-spacing", final)], properties: [v("tracking")] };
  });
  s("uppercase", decl("text-transform", "uppercase"));
  s("lowercase", decl("text-transform", "lowercase"));
  s("capitalize", decl("text-transform", "capitalize"));
  s("normal-case", decl("text-transform", "none"));
  s("italic", decl("font-style", "italic"));
  s("not-italic", decl("font-style", "normal"));
  s("underline", decl("text-decoration-line", "underline"));
  s("overline", decl("text-decoration-line", "overline"));
  s("line-through", decl("text-decoration-line", "line-through"));
  s("no-underline", decl("text-decoration-line", "none"));
  s("antialiased", decl("-webkit-font-smoothing", "antialiased"), decl("-moz-osx-font-smoothing", "grayscale"));
  s("subpixel-antialiased", decl("-webkit-font-smoothing", "auto"), decl("-moz-osx-font-smoothing", "auto"));
  const numericProps = ["ordinal", "slashed-zero", "numeric-figure", "numeric-spacing", "numeric-fraction"].map(v);
  s("normal-nums", decl("font-variant-numeric", "normal"));
  for (const [name, variable] of [
    ["ordinal", "ordinal"],
    ["slashed-zero", "slashed-zero"],
    ["lining-nums", "numeric-figure"],
    ["oldstyle-nums", "numeric-figure"],
    ["proportional-nums", "numeric-spacing"],
    ["tabular-nums", "numeric-spacing"],
    ["diagonal-fractions", "numeric-fraction"],
    ["stacked-fractions", "numeric-fraction"],
  ]) {
    u.static(name, () => ({ nodes: [decl(v(variable), name), decl("font-variant-numeric", NUMERIC)], properties: numericProps }));
  }
  u.functional("decoration", (c, theme) => {
    if (c.negative) return null;
    const n = named(c);
    if (n !== null && ["solid", "double", "dotted", "dashed", "wavy"].includes(n) && !c.modifier) {
      return [decl("text-decoration-style", n)];
    }
    if (n === "auto" && !c.modifier) return [decl("text-decoration-thickness", "auto")];
    if (n === "from-font" && !c.modifier) return [decl("text-decoration-thickness", "from-font")];
    if (n !== null && /^\d+$/.test(n) && !c.modifier) return [decl("text-decoration-thickness", `${n}px`)];
    const a = arbitrary(c);
    if (a && !c.modifier) {
      const type = arbitraryType(a, ["color", "length", "percentage"]);
      if (type === "length" || type === "percentage") return [decl("text-decoration-thickness", a.value)];
    }
    const value = colorOf(c, theme, ["color", "length", "percentage"]);
    return value === null ? null : [decl("text-decoration-color", value)];
  });
  u.functional("underline-offset", (c) => {
    if (c.modifier) return null;
    const n = named(c);
    if (n === "auto" && !c.negative) return [decl("text-underline-offset", "auto")];
    if (n !== null && /^\d+$/.test(n)) return [decl("text-underline-offset", negate(`${n}px`, c.negative))];
    const a = arbitrary(c);
    return a ? [decl("text-underline-offset", negate(a.value, c.negative))] : null;
  });
  u.functional("placeholder", (c, theme) => {
    if (c.negative) return null;
    const value = colorOf(c, theme);
    return value === null ? null : [rule("&::placeholder", [decl("color", value)])];
  });
  u.functional("caret", (c, theme) => {
    if (c.negative) return null;
    const value = colorOf(c, theme);
    return value === null ? null : [decl("caret-color", value)];
  });
  u.functional("accent", (c, theme) => {
    if (c.negative) return null;
    if (named(c) === "auto" && !c.modifier) return [decl("accent-color", "auto")];
    const value = colorOf(c, theme);
    return value === null ? null : [decl("accent-color", value)];
  });
  u.functional("scheme", (c) => {
    const n = named(c);
    const schemes: Record<string, string> = {
      normal: "normal",
      dark: "dark",
      light: "light",
      "light-dark": "light dark",
      "only-dark": "only dark",
      "only-light": "only light",
    };
    return n !== null && n in schemes && !c.modifier ? [decl("color-scheme", schemes[n])] : null;
  });

  // Opacity
  u.functional("opacity", (c) => {
    if (c.negative || c.modifier) return null;
    const n = named(c);
    if (n !== null && isPositiveNumber(n)) return [decl("opacity", `${n}%`)];
    const a = arbitrary(c);
    return a ? [decl("opacity", a.value)] : null;
  });

  // Shadows & rings
  u.functional("shadow", (c, theme) => {
    if (c.negative) return null;
    const n = named(c);
    const alpha = c.modifier ? percentModifier(c.modifier) : null;
    if (c.modifier && alpha === null && c.value === null) return null;
    const sized = (value: string): Output => ({
      nodes: [
        decl(v("shadow"), alpha ? recolorShadow(value, "shadow-color").replace(/var\(--spk-u-shadow-color, ([^()]*(?:\([^()]*\))?[^()]*)\)/g, (_m, col) => `var(--spk-u-shadow-color, ${withAlpha(col, alpha)})`) : recolorShadow(value, "shadow-color")),
        decl("box-shadow", SHADOW_COMPOSE),
      ],
      properties: SHADOW_PROPS.map(v),
    });
    if (c.value === null) return theme.shadow[""] ? sized(theme.shadow[""]) : null;
    if (n === "none" && !c.modifier) {
      return { nodes: [decl(v("shadow"), "0 0 #0000"), decl("box-shadow", SHADOW_COMPOSE)], properties: SHADOW_PROPS.map(v) };
    }
    if (n !== null && n in theme.shadow) return sized(theme.shadow[n]);
    const a = arbitrary(c);
    if (a && isShadowValue(a)) return sized(a.value);
    const value = colorOf(c, theme);
    if (value === null) return null;
    return { nodes: [decl(v("shadow-color"), value)], properties: [v("shadow-color"), v("shadow-alpha")] };
  });
  u.functional("inset-shadow", (c, theme) => {
    if (c.negative) return null;
    const n = named(c);
    const sized = (value: string): Output => ({
      nodes: [decl(v("inset-shadow"), recolorShadow(value, "inset-shadow-color")), decl("box-shadow", SHADOW_COMPOSE)],
      properties: SHADOW_PROPS.map(v),
    });
    if (n === "none" && !c.modifier) {
      return { nodes: [decl(v("inset-shadow"), "0 0 #0000"), decl("box-shadow", SHADOW_COMPOSE)], properties: SHADOW_PROPS.map(v) };
    }
    if (n !== null && n in theme.insetShadow && !c.modifier) return sized(theme.insetShadow[n]);
    const a = arbitrary(c);
    if (a && !c.modifier && isShadowValue(a)) return sized(a.value);
    const value = colorOf(c, theme);
    return value === null ? null : { nodes: [decl(v("inset-shadow-color"), value)], properties: [v("inset-shadow-color")] };
  });
  const ringWidth = (c: Functional): string | null => {
    if (c.value === null) return c.modifier ? null : "1px";
    const n = named(c);
    if (n !== null && /^\d+$/.test(n) && !c.modifier) return `${n}px`;
    const a = arbitrary(c);
    if (a && !c.modifier && ["length", "line-width"].includes(arbitraryType(a, ["color", "length"]) ?? "")) return a.value;
    return null;
  };
  u.functional("ring", (c, theme) => {
    if (c.negative) return null;
    const width = ringWidth(c);
    if (width !== null) {
      return {
        nodes: [
          decl(
            v("ring-shadow"),
            `var(${v("ring-inset")},) 0 0 0 calc(${width} + ${ref("ring-offset-width")}) var(${v("ring-color")}, ${theme.ringColor})`,
          ),
          decl("box-shadow", SHADOW_COMPOSE),
        ],
        properties: [...SHADOW_PROPS.map(v), v("ring-inset"), v("ring-offset-width"), v("ring-color")],
      };
    }
    const value = colorOf(c, theme, ["color", "length"]);
    return value === null ? null : { nodes: [decl(v("ring-color"), value)], properties: [v("ring-color")] };
  });
  sp("ring-inset", ["ring-inset"], decl(v("ring-inset"), "inset"));
  u.functional("inset-ring", (c, theme) => {
    if (c.negative) return null;
    const width = ringWidth(c);
    if (width !== null) {
      return {
        nodes: [
          decl(v("inset-ring-shadow"), `inset 0 0 0 ${width} var(${v("inset-ring-color")}, currentcolor)`),
          decl("box-shadow", SHADOW_COMPOSE),
        ],
        properties: [...SHADOW_PROPS.map(v), v("inset-ring-color")],
      };
    }
    const value = colorOf(c, theme, ["color", "length"]);
    return value === null ? null : { nodes: [decl(v("inset-ring-color"), value)], properties: [v("inset-ring-color")] };
  });
  u.functional("ring-offset", (c, theme) => {
    if (c.negative) return null;
    const n = named(c);
    let width: string | null = null;
    if (n !== null && /^\d+$/.test(n) && !c.modifier) width = `${n}px`;
    const a = arbitrary(c);
    if (a && !c.modifier && arbitraryType(a, ["color", "length"]) === "length") width = a.value;
    if (width !== null) {
      return {
        nodes: [
          decl(v("ring-offset-width"), width),
          decl(v("ring-offset-shadow"), `var(${v("ring-inset")},) 0 0 0 ${ref("ring-offset-width")} ${ref("ring-offset-color")}`),
        ],
        properties: [...SHADOW_PROPS.map(v), v("ring-inset"), v("ring-offset-width"), v("ring-offset-color")],
      };
    }
    const value = colorOf(c, theme, ["color", "length"]);
    return value === null ? null : { nodes: [decl(v("ring-offset-color"), value)], properties: [v("ring-offset-color")] };
  });

  // Outline
  u.functional("outline", (c, theme) => {
    if (c.negative) return null;
    if (c.value === null && !c.modifier) {
      return { nodes: [decl("outline-style", ref("outline-style")), decl("outline-width", "1px")], properties: [v("outline-style")] };
    }
    const n = named(c);
    if (n !== null && /^\d+$/.test(n) && !c.modifier) {
      return { nodes: [decl("outline-style", ref("outline-style")), decl("outline-width", `${n}px`)], properties: [v("outline-style")] };
    }
    const a = arbitrary(c);
    if (a && !c.modifier && arbitraryType(a, ["color", "length"]) === "length") {
      return { nodes: [decl("outline-style", ref("outline-style")), decl("outline-width", a.value)], properties: [v("outline-style")] };
    }
    const value = colorOf(c, theme, ["color", "length"]);
    return value === null ? null : [decl("outline-color", value)];
  });
  for (const style of ["solid", "dashed", "dotted", "double"]) {
    u.static(`outline-${style}`, () => ({
      nodes: [decl(v("outline-style"), style), decl("outline-style", style)],
      properties: [v("outline-style")],
    }));
  }
  u.static("outline-none", () => ({
    nodes: [decl(v("outline-style"), "none"), decl("outline-style", "none")],
    properties: [v("outline-style")],
  }));
  u.static("outline-hidden", () => ({
    nodes: [
      decl(v("outline-style"), "none"),
      decl("outline-style", "none"),
      atRule("media", "(forced-colors: active)", [decl("outline", "2px solid transparent"), decl("outline-offset", "2px")]),
    ],
    properties: [v("outline-style")],
  }));
  u.functional("outline-offset", (c) => {
    if (c.modifier) return null;
    const n = named(c);
    if (n !== null && /^\d+$/.test(n)) return [decl("outline-offset", negate(`${n}px`, c.negative))];
    const a = arbitrary(c);
    return a ? [decl("outline-offset", negate(a.value, c.negative))] : null;
  });

  // Filters
  const filterUtility = (
    root: string,
    variable: string,
    fn: string,
    options: { unit?: string; scale?: Record<string, string>; bareValue?: string; negative?: boolean; composed: string; backdrop?: boolean },
  ) => {
    u.functional(root, (c, theme) => {
      if (c.modifier) return null;
      if (c.negative && !options.negative) return null;
      let value: string | null = null;
      const n = named(c);
      if (c.value === null) value = options.bareValue ?? null;
      else if (n !== null && options.scale && n in options.scale) value = options.scale[n];
      else if (n !== null && isPositiveNumber(n) && options.unit) value = `${n}${options.unit}`;
      else if (arbitrary(c)) value = arbitrary(c)!.value;
      if (value === null) return null;
      if (c.negative) value = `calc(${value} * -1)`;
      void theme;
      const composed = `${fn}(${value})`;
      const nodes: Node[] = [decl(v(variable), composed)];
      if (options.backdrop) {
        nodes.push(decl("-webkit-backdrop-filter", options.composed), decl("backdrop-filter", options.composed));
      } else nodes.push(decl("filter", options.composed));
      const names = options.backdrop
        ? ["blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", "opacity", "saturate", "sepia"].map((x) => v(`backdrop-${x}`))
        : ["blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", "saturate", "sepia", "drop-shadow"].map(v);
      return { nodes, properties: names };
    });
  };
  const blurScale = (theme: Theme) => theme.blur;
  u.functional("blur", (c, theme) => {
    if (c.modifier || c.negative) return null;
    const n = named(c);
    let value: string | null = null;
    if (c.value === null) value = blurScale(theme)[""] ?? null;
    else if (n === "none") value = "";
    else value = themeOrArbitrary(blurScale(theme), c.value);
    if (value === null) return null;
    return {
      nodes: [decl(v("blur"), value === "" ? " " : `blur(${value})`), decl("filter", FILTER)],
      properties: ["blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", "saturate", "sepia", "drop-shadow"].map(v),
    };
  });
  u.functional("backdrop-blur", (c, theme) => {
    if (c.modifier || c.negative) return null;
    const n = named(c);
    let value: string | null = null;
    if (c.value === null) value = blurScale(theme)[""] ?? null;
    else if (n === "none") value = "";
    else value = themeOrArbitrary(blurScale(theme), c.value);
    if (value === null) return null;
    return {
      nodes: [
        decl(v("backdrop-blur"), value === "" ? " " : `blur(${value})`),
        decl("-webkit-backdrop-filter", BACKDROP),
        decl("backdrop-filter", BACKDROP),
      ],
      properties: ["blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", "opacity", "saturate", "sepia"].map((x) => v(`backdrop-${x}`)),
    };
  });
  for (const [name, fn, opts] of [
    ["brightness", "brightness", { unit: "%" }],
    ["contrast", "contrast", { unit: "%" }],
    ["grayscale", "grayscale", { unit: "%", bareValue: "100%" }],
    ["hue-rotate", "hue-rotate", { unit: "deg", negative: true }],
    ["invert", "invert", { unit: "%", bareValue: "100%" }],
    ["saturate", "saturate", { unit: "%" }],
    ["sepia", "sepia", { unit: "%", bareValue: "100%" }],
  ] as const) {
    filterUtility(name, name, fn, { ...opts, composed: FILTER });
    filterUtility(`backdrop-${name}`, `backdrop-${name}`, fn, { ...opts, composed: BACKDROP, backdrop: true });
  }
  filterUtility("backdrop-opacity", "backdrop-opacity", "opacity", { unit: "%", composed: BACKDROP, backdrop: true });
  u.functional("filter", (c) => {
    if (c.negative || c.modifier) return null;
    if (c.value === null) {
      return {
        nodes: [decl("filter", FILTER)],
        properties: ["blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", "saturate", "sepia", "drop-shadow"].map(v),
      };
    }
    if (named(c) === "none") return [decl("filter", "none")];
    const a = arbitrary(c);
    return a ? [decl("filter", a.value)] : null;
  });
  u.functional("backdrop-filter", (c) => {
    if (c.negative || c.modifier) return null;
    if (c.value === null) {
      return {
        nodes: [decl("-webkit-backdrop-filter", BACKDROP), decl("backdrop-filter", BACKDROP)],
        properties: ["blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", "opacity", "saturate", "sepia"].map((x) => v(`backdrop-${x}`)),
      };
    }
    if (named(c) === "none") return [decl("-webkit-backdrop-filter", "none"), decl("backdrop-filter", "none")];
    const a = arbitrary(c);
    return a ? [decl("-webkit-backdrop-filter", a.value), decl("backdrop-filter", a.value)] : null;
  });
  u.functional("drop-shadow", (c, theme) => {
    if (c.negative) return null;
    const n = named(c);
    const filterProps = ["blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", "saturate", "sepia", "drop-shadow"].map(v);
    const sized = (value: string): Output => {
      const parts = splitTopLevel(value, ",").map((part) => part.trim());
      return {
        nodes: [
          decl(
            v("drop-shadow-size"),
            parts.map((part) => `drop-shadow(${recolorShadow(part, "drop-shadow-color")})`).join(" "),
          ),
          decl(v("drop-shadow"), parts.map((part) => `drop-shadow(${part})`).join(" ")),
          decl("filter", FILTER),
        ],
        properties: [...filterProps, v("drop-shadow-size"), v("drop-shadow-color")],
      };
    };
    if (c.value === null && !c.modifier) return theme.dropShadow[""] ? sized(theme.dropShadow[""]) : null;
    if (n === "none" && !c.modifier) return { nodes: [decl(v("drop-shadow"), " "), decl("filter", FILTER)], properties: filterProps };
    if (n !== null && n in theme.dropShadow && !c.modifier) return sized(theme.dropShadow[n]);
    const a = arbitrary(c);
    if (a && !c.modifier && isShadowValue(a)) return sized(a.value);
    const value = colorOf(c, theme);
    if (value === null) return null;
    return {
      nodes: [decl(v("drop-shadow-color"), value), decl(v("drop-shadow"), ref("drop-shadow-size"))],
      properties: [v("drop-shadow-color"), v("drop-shadow-size"), v("drop-shadow")],
    };
  });
  u.functional("text-shadow", (c, theme) => {
    if (c.negative) return null;
    const n = named(c);
    if (n === "none" && !c.modifier) return [decl("text-shadow", "none")];
    if (n !== null && n in theme.textShadow && !c.modifier) {
      return [decl("text-shadow", recolorShadow(theme.textShadow[n], "text-shadow-color"))];
    }
    const a = arbitrary(c);
    if (a && !c.modifier && isShadowValue(a)) {
      return [decl("text-shadow", recolorShadow(a.value, "text-shadow-color"))];
    }
    const value = colorOf(c, theme);
    return value === null ? null : { nodes: [decl(v("text-shadow-color"), value)], properties: [v("text-shadow-color")] };
  });

  // Transitions
  const transitionLists: Record<string, string> = {
    "": `color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, ${v("gradient-from")}, ${v(
      "gradient-via",
    )}, ${v("gradient-to")}, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events`,
    all: "all",
    colors: `color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, ${v("gradient-from")}, ${v(
      "gradient-via",
    )}, ${v("gradient-to")}`,
    opacity: "opacity",
    shadow: "box-shadow",
    transform: "transform, translate, scale, rotate",
  };
  u.functional("transition", (c, theme) => {
    if (c.negative || c.modifier) return null;
    const n = c.value === null ? "" : named(c);
    let list: string | null = n !== null && n in transitionLists ? transitionLists[n] : null;
    if (n === "none") return [decl("transition-property", "none")];
    if (list === null) list = arbitrary(c)?.value ?? null;
    if (list === null) return null;
    return {
      nodes: [
        decl("transition-property", list),
        decl("transition-timing-function", `var(${v("ease")}, ${theme.transition.timing})`),
        decl("transition-duration", `var(${v("duration")}, ${theme.transition.duration})`),
      ],
      properties: [v("ease"), v("duration")],
    };
  });
  s("transition-discrete", decl("transition-behavior", "allow-discrete"));
  s("transition-normal", decl("transition-behavior", "normal"));
  const timeUtility = (root: string, property: string, variable: string | null) => {
    u.functional(root, (c) => {
      if (c.negative || c.modifier) return null;
      const n = named(c);
      let value: string | null = null;
      if (n === "initial" && root === "duration") value = "initial";
      else if (n !== null && isPositiveNumber(n)) value = `${n}ms`;
      else value = arbitrary(c)?.value ?? null;
      if (value === null) return null;
      if (!variable) return [decl(property, value)];
      return { nodes: [decl(v(variable), value), decl(property, value)], properties: [v(variable)] };
    });
  };
  timeUtility("duration", "transition-duration", "duration");
  u.functional("ease", (c, theme) => {
    if (c.negative || c.modifier) return null;
    const n = named(c);
    let value: string | null = null;
    if (n === "linear") value = "linear";
    else if (n === "initial") value = "initial";
    else value = themeOrArbitrary(theme.ease, c.value);
    if (value === null) return null;
    return { nodes: [decl(v("ease"), value), decl("transition-timing-function", value)], properties: [v("ease")] };
  });
  u.functional("will-change", (c) => {
    if (c.negative || c.modifier) return null;
    const keywords: Record<string, string> = {
      auto: "auto",
      scroll: "scroll-position",
      contents: "contents",
      transform: "transform",
    };
    const n = named(c);
    if (n !== null && n in keywords) return [decl("will-change", keywords[n])];
    const a = arbitrary(c);
    return a ? [decl("will-change", a.value)] : null;
  });
  u.functional("content", (c) => {
    if (c.negative || c.modifier) return null;
    const n = named(c);
    const value = n === "none" ? "none" : arbitrary(c)?.value ?? null;
    if (value === null) return null;
    return { nodes: [decl(v("content"), value), decl("content", ref("content"))], properties: [v("content")] };
  });
  s("forced-color-adjust-auto", decl("forced-color-adjust", "auto"));
  s("forced-color-adjust-none", decl("forced-color-adjust", "none"));
  s("field-sizing-content", decl("field-sizing", "content"));
  s("field-sizing-fixed", decl("field-sizing", "fixed"));
  for (const value of ["none", "strict", "content"]) s(`contain-${value}`, decl("contain", value));

  // Layout container (legacy Tailwind `container`).
  u.static("container", (_c, theme) => {
    const nodes: Node[] = [decl("width", "100%")];
    for (const bp of Object.values(theme.breakpoints)) {
      nodes.push(atRule("media", `(width >= ${bp})`, [decl("max-width", bp)]));
    }
    return nodes;
  });

  return u;
}

/** Utility values used by other modules (e.g. the typography plugin). */
export { v as utilityVar, ref as utilityRef, bare, named, arbitrary };
export type { CandidateValue };
