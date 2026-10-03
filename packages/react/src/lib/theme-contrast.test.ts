/**
 * WCAG 2.2 contrast checks for every built-in theme.
 *
 * Reads the theme base values straight from `tokens.css` and recomputes the derived tokens
 * the same way CSS does (`color-mix(in oklab, …)`), so a palette edit that drops a text or
 * control pair below its minimum fails here instead of shipping.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

type Rgb = [number, number, number];

const tokensCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../tokens/src/tokens.css"),
  "utf8",
);

const THEME_BLOCKS: Record<string, RegExp> = {
  mukta: /:root,\s*\.mukta\s*\{([\s\S]*?)\n\}/,
  neelam: /\n\.neelam\s*\{([\s\S]*?)\n\}/,
  usha: /\n\.usha\s*\{([\s\S]*?)\n\}/,
  sandhya: /\n\.sandhya\s*\{([\s\S]*?)\n\}/,
};

function hex(value: string): Rgb {
  const h = value.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function luminance([r, g, b]: Rgb) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrast(a: Rgb, b: Rgb) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function toOklab(rgb: Rgb): Rgb {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, a, b]: Rgb): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => Math.min(1, Math.max(0, toGamma(c)))) as Rgb;
}

/** `color-mix(in oklab, a p, b)` */
function mix(a: Rgb, b: Rgb, p: number): Rgb {
  const A = toOklab(a);
  const B = toOklab(b);
  return fromOklab(A.map((v, i) => v * p + B[i] * (1 - p)) as Rgb);
}

/** A translucent tint (`color-mix(in oklab, c p, transparent)`) composited over a surface. */
function tint(color: Rgb, alpha: number, over: Rgb): Rgb {
  return color.map((c, i) => c * alpha + over[i] * (1 - alpha)) as Rgb;
}

const WHITE: Rgb = [1, 1, 1];
const BLACK: Rgb = [0, 0, 0];

function themeValues(name: string) {
  const block = tokensCss.match(THEME_BLOCKS[name])?.[1];
  if (!block) throw new Error(`theme ${name} not found in tokens.css`);
  const values: Record<string, Rgb> = {};
  for (const match of block.matchAll(/--spk-([\w-]+):\s*(#[0-9a-f]{6})\b/gi)) {
    values[match[1]] = hex(match[2]);
  }
  return values;
}

describe.each(Object.keys(THEME_BLOCKS))("%s theme contrast", (name) => {
  const t = themeValues(name);

  it.each(["canvas", "surface", "surface-raised", "surface-subtle", "surface-sunken"])(
    "body text tiers reach 4.5:1 on %s",
    (surface) => {
      for (const text of ["text-primary", "text-secondary", "text-tertiary"]) {
        expect(contrast(t[text], t[surface]), `${text} on ${surface}`).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it("keeps accent and status text readable on surfaces and their muted tints", () => {
    const tints = { accent: 0.11, success: 0.12, warning: 0.14, danger: 0.11, info: 0.12 };
    for (const [role, alpha] of Object.entries(tints)) {
      const text = t[`${role}-text`];
      expect(contrast(text, t.surface), `${role}-text on surface`).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(text, tint(t[role], alpha, t.surface)),
        `${role}-text on ${role}-muted`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps labels on solid primary and destructive buttons at 4.5:1 across states", () => {
    const accentHover = mix(t.accent, BLACK, 0.9);
    const dangerHover = mix(t.danger, BLACK, 0.88);
    for (const [label, fill] of [
      ["accent", t.accent],
      ["accent-hover", accentHover],
      ["danger", t.danger],
      ["danger-hover", dangerHover],
    ] as const) {
      const fg = label.startsWith("accent") ? t["accent-fg"] : WHITE;
      expect(contrast(fg, fill), `label on ${label}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("draws the focus ring at 3:1 against surfaces (WCAG 2.4.13)", () => {
    for (const surface of ["canvas", "surface", "surface-subtle"]) {
      expect(contrast(t["accent-text"], t[surface]), `focus on ${surface}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("draws opt-in high-contrast control boundaries at 3:1 against the surface (WCAG 1.4.11)", () => {
    const controlBorder = mix(t["text-tertiary"], t.border, 0.8);
    expect(contrast(controlBorder, t.surface)).toBeGreaterThanOrEqual(3);
    expect(contrast(controlBorder, t.canvas)).toBeGreaterThanOrEqual(3);
  });
});

describe("derived token formulas", () => {
  it("derives focus, control border and hovers from the values checked above", () => {
    expect(tokensCss).toContain("--spk-focus: var(--spk-accent-text);");
    expect(tokensCss).toContain("--spk-focus-ring: 0 0 0 2px var(--spk-surface), 0 0 0 4px var(--spk-focus);");
    expect(tokensCss).toContain("--spk-control-border: var(--spk-border);");
    expect(tokensCss).toMatch(
      /\[data-contrast="more"\][^{]*\{\s*--spk-control-border: color-mix\(in oklab, var\(--spk-text-tertiary\) 80%, var\(--spk-border\)\);/,
    );
    expect(tokensCss).toContain("--spk-accent-hover: color-mix(in oklab, var(--spk-accent) 90%, black);");
    expect(tokensCss).toContain("--spk-danger-hover: color-mix(in oklab, var(--spk-danger) 88%, black);");
  });

  it("defines a complete overlay layer scale", () => {
    for (const layer of ["sticky", "chrome", "popover", "select", "menu", "modal", "toast", "tooltip"]) {
      expect(tokensCss).toMatch(new RegExp(`--spk-z-${layer}: \\d+;`));
    }
  });
});

/** Liquid glass must stay legible over the worst backdrop: pure black or pure white after blur. */
describe.each(["mukta", "neelam", "usha"])("%s liquid glass legibility", (name) => {
  const t = themeValues(name);
  const block = tokensCss.match(THEME_BLOCKS[name])![1];
  const glass = block.match(/--spk-glass-tint:\s*rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/)!;
  const tintRgb = [glass[1], glass[2], glass[3]].map((v) => Number(v) / 255) as Rgb;
  const alpha = Number(glass[4]);
  const secondary = mix(t["text-secondary"], t["text-primary"], 0.45);

  it.each([
    ["black", BLACK],
    ["white", WHITE],
  ] as const)("keeps text at 4.5:1 over a %s backdrop", (_label, backdrop) => {
    const fill = tint(tintRgb, alpha, backdrop);
    expect(contrast(t["text-primary"], fill), "primary").toBeGreaterThanOrEqual(4.5);
    expect(contrast(secondary, fill), "secondary/tertiary").toBeGreaterThanOrEqual(4.5);
  });
});

describe("clear glass", () => {
  it("keeps white text at 4.5:1 over a white backdrop under the dim layer", () => {
    for (const [name, re] of [["mukta", THEME_BLOCKS.mukta], ["neelam", THEME_BLOCKS.neelam]] as const) {
      const m = tokensCss.match(re)![1].match(/--spk-glass-clear-tint:\s*rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/)!;
      const dim = [m[1], m[2], m[3]].map((v) => Number(v) / 255) as Rgb;
      expect(contrast(WHITE, tint(dim, Number(m[4]), WHITE)), name).toBeGreaterThanOrEqual(4.5);
    }
  });
});

/** Content and control glass sit over the ambient canvas wash: keep every text tier at 4.5:1. */
describe.each(["mukta", "neelam", "usha"])("%s content glass legibility", (name) => {
  const t = themeValues(name);
  const liquid = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../../../tokens/src/liquid.css"),
    "utf8",
  );
  const content = Number(liquid.match(/--spk-lg-content:\s*(\d+)%/)![1]) / 100;
  const control = Number(liquid.match(/--spk-lg-control:\s*(\d+)%/)![1]) / 100;
  const panel = Number(liquid.match(/--spk-lg-panel:\s*(\d+)%/)![1]) / 100;
  // Worst case wash: the accent at 25% over the canvas, far past the 13% actually painted.
  const washed = mix(t.accent, t.canvas, 0.25);

  it.each(["surface", "surface-raised", "surface-subtle"])("keeps all tiers at 4.5:1 for %s glass", (s) => {
    for (const [alpha, label] of [[content, "content"], [control, "control"], ...(s === "surface" ? [[panel, "panel"] as const] : [])] as const) {
      const fill = tint(t[s], alpha, washed);
      for (const text of ["text-primary", "text-secondary", "text-tertiary"]) {
        expect(contrast(t[text], fill), `${text} on ${label} ${s}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
