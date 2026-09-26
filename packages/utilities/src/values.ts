/**
 * Value resolution shared by utilities: theme lookups, spacing steps, fractions, colours
 * with opacity modifiers, and type inference for arbitrary values such as `text-[14px]`.
 */
import type { CandidateValue, Modifier } from "./parse";
import type { Theme } from "./theme";

const COLOR_FN = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/i;
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const NAMED_COLORS = new Set(
  (
    "aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood " +
    "cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod " +
    "darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon " +
    "darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray " +
    "dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green " +
    "greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon " +
    "lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon " +
    "lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta " +
    "maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen " +
    "mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive " +
    "olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru " +
    "pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen " +
    "seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato " +
    "turquoise violet wheat white whitesmoke yellow yellowgreen transparent currentcolor canvas canvastext linktext " +
    "visitedtext activetext buttonface buttontext buttonborder field fieldtext highlight highlighttext selecteditem " +
    "selecteditemtext mark marktext graytext accentcolor accentcolortext"
  ).split(" "),
);

const LENGTH_UNITS =
  "cm|mm|q|in|pc|pt|px|em|ex|ch|rem|lh|rlh|vw|vh|vmin|vmax|vb|vi|svw|svh|lvw|lvh|dvw|dvh|cqw|cqh|cqi|cqb|cqmin|cqmax";
const NUMBER = String.raw`[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?`;
const LENGTH = new RegExp(`^${NUMBER}(?:${LENGTH_UNITS})$`, "i");
const PERCENT = new RegExp(`^${NUMBER}%$`);
const NUMBER_ONLY = new RegExp(`^${NUMBER}$`);
const ANGLE = new RegExp(`^${NUMBER}(?:deg|rad|grad|turn)$`, "i");
const MATH = /^(?:calc|min|max|clamp|mod|rem|round|abs|sign|sin|cos|tan|asin|acos|atan|atan2|pow|sqrt|hypot|log|exp)\(/i;
const IMAGE = /^(?:url|image|image-set|cross-fade|element|(?:repeating-)?(?:linear|radial|conic)-gradient)\(/i;

export type DataType =
  | "color"
  | "length"
  | "percentage"
  | "number"
  | "integer"
  | "angle"
  | "url"
  | "image"
  | "position"
  | "bg-size"
  | "line-width"
  | "family-name"
  | "generic-name"
  | "absolute-size"
  | "relative-size"
  | "vector"
  | "any";

function isColor(value: string): boolean {
  return HEX.test(value) || COLOR_FN.test(value) || NAMED_COLORS.has(value.toLowerCase());
}

function isLength(value: string): boolean {
  return value === "0" || LENGTH.test(value) || MATH.test(value);
}

function isPercentage(value: string): boolean {
  return PERCENT.test(value) || MATH.test(value);
}

function isNumber(value: string): boolean {
  return NUMBER_ONLY.test(value) || MATH.test(value);
}

function isPositionPart(part: string): boolean {
  return /^(?:top|right|bottom|left|center)$/.test(part) || isLength(part) || isPercentage(part);
}

const CHECKS: Record<Exclude<DataType, "any">, (value: string) => boolean> = {
  color: isColor,
  length: isLength,
  percentage: isPercentage,
  number: isNumber,
  integer: (value) => /^[+-]?\d+$/.test(value) || MATH.test(value),
  angle: (value) => ANGLE.test(value),
  url: (value) => /^url\(/i.test(value),
  image: (value) => IMAGE.test(value),
  position: (value) => value.split(/\s+/).every(isPositionPart),
  "bg-size": (value) =>
    /^(?:cover|contain|auto)$/.test(value) ||
    value.split(/\s+/).every((part) => part === "auto" || isLength(part) || isPercentage(part)),
  "line-width": (value) => /^(?:thin|medium|thick)$/.test(value) || isLength(value),
  "family-name": (value) => /^['"]/.test(value) || /,/.test(value) || /^[a-z][\w -]*$/i.test(value),
  "generic-name": (value) =>
    /^(?:serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-serif|ui-sans-serif|ui-monospace|ui-rounded|math|emoji|fangsong)$/.test(
      value,
    ),
  "absolute-size": (value) => /^(?:xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large)$/.test(value),
  "relative-size": (value) => value === "larger" || value === "smaller",
  vector: (value) => /^[+-]?\d*\.?\d+\s+[+-]?\d*\.?\d+\s+[+-]?\d*\.?\d+$/.test(value),
};

/**
 * The first of `types` an arbitrary value matches. `var(…)` matches the first type (the
 * utility's default), as Tailwind CSS does.
 */
export function inferType(value: string, types: DataType[]): DataType | null {
  if (/^var\(/.test(value) && !value.includes(" ") ) return types[0] ?? null;
  for (const type of types) {
    if (type === "any") return "any";
    if (CHECKS[type](value)) return type;
  }
  return null;
}

/** The arbitrary value's type: its `[type:value]` hint, else inferred from `types`. */
export function arbitraryType(value: { dataType: string | null; value: string }, types: DataType[]): string | null {
  if (value.dataType) return value.dataType;
  return inferType(value.value, types);
}

export function isPositiveNumber(value: string): boolean {
  return /^\d+(?:\.\d+)?$/.test(value);
}

/** Tailwind accepts spacing steps that are multiples of 0.25 (`p-0.5`, `p-13`, `p-2.25`). */
export function isSpacingStep(value: string): boolean {
  if (!isPositiveNumber(value)) return false;
  return Number.isInteger(Number(value) * 4);
}

export function negate(value: string, negative: boolean): string {
  return negative ? `calc(${value} * -1)` : value;
}

export function spacingStep(theme: Theme, step: string, negative = false): string {
  return `calc(${theme.spacing} * ${negative ? "-" : ""}${step})`;
}

/**
 * A spacing-scale value: `4` → `calc(0.25rem * 4)`, `px` → `1px`, plus any extra named
 * keywords a utility allows (`auto`, `full` …).
 */
export function spacing(
  theme: Theme,
  value: CandidateValue | null,
  negative: boolean,
  keywords: Record<string, string> = {},
  options: { fractions?: boolean; arbitraryTypes?: DataType[] } = {},
): string | null {
  if (!value) return null;
  if (value.kind === "arbitrary") {
    if (value.dataType && !["length", "percentage", "number", "any"].includes(value.dataType)) return null;
    return negate(value.value, negative);
  }
  if (value.fraction) {
    if (!options.fractions) return null;
    return negate(`calc(${value.fraction.replace("/", " / ")} * 100%)`, negative);
  }
  if (value.value in keywords) return negate(keywords[value.value], negative);
  if (value.value === "px") return negative ? "-1px" : "1px";
  if (isSpacingStep(value.value)) return spacingStep(theme, value.value, negative);
  return null;
}

export function percentModifier(modifier: Modifier): string | null {
  if (modifier.kind === "arbitrary") {
    if (/^var\(/.test(modifier.value)) return modifier.value;
    if (PERCENT.test(modifier.value)) return modifier.value;
    if (NUMBER_ONLY.test(modifier.value)) return `${Number(modifier.value) * 100}%`;
    return null;
  }
  if (!isPositiveNumber(modifier.value)) return null;
  if (!Number.isInteger(Number(modifier.value) * 4)) return null;
  return `${modifier.value}%`;
}

/** Apply an opacity modifier to a colour with `color-mix()`. */
export function withAlpha(color: string, alpha: string | null): string {
  if (alpha === null) return color;
  if (alpha === "100%") return color;
  return `color-mix(in oklab, ${color} ${alpha}, transparent)`;
}

/**
 * Resolve a colour value (`surface`, `amber-600`, `[#fff]`, `(--brand)`) with an optional
 * opacity modifier (`/20`, `/[0.35]`). Returns null for non-colours.
 */
export function color(theme: Theme, value: CandidateValue | null, modifier: Modifier | null): string | null {
  if (!value) return null;
  let base: string | null = null;
  if (value.kind === "arbitrary") {
    if (value.dataType && value.dataType !== "color") return null;
    base = value.value;
  } else if (!value.fraction) {
    base = theme.colors[value.value] ?? null;
  } else {
    // `bg-black/50` parses as a fraction candidate too; the colour reading drops it.
    base = theme.colors[value.value] ?? null;
  }
  if (base === null) return null;
  if (!modifier) return base;
  if (base === "inherit") return null;
  const alpha = percentModifier(modifier);
  if (alpha === null) return null;
  if (base === "transparent") return base;
  return withAlpha(base, alpha);
}

/** Look up a named theme key, or accept an arbitrary value. */
export function themeOrArbitrary(
  scale: Record<string, string>,
  value: CandidateValue | null,
  types: DataType[] = ["any"],
): string | null {
  if (!value) return null;
  if (value.kind === "arbitrary") {
    if (value.dataType && !types.includes(value.dataType as DataType) && !types.includes("any")) return null;
    return value.value;
  }
  if (value.fraction) return null;
  return scale[value.value] ?? null;
}
