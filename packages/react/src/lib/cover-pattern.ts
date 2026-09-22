/**
 * Seeded cover scenes for profile / story heroes.
 * Compact kit set — journalD ships a larger catalog; kinds here keep the same
 * contract (palette, headerInk, chromeInk, layered SVG geometry).
 */

export const COVER_PATTERN_KINDS = [
  "mountains",
  "aurora",
  "ocean",
  "meadow",
  "dusk",
  "lake",
] as const;

export type CoverPatternKind = (typeof COVER_PATTERN_KINDS)[number];

export type CoverPatternInput = {
  seed: string;
  hue: number;
  secondaryHue?: number;
  tertiaryHue?: number;
  dark?: boolean;
  warm?: boolean;
  kind?: CoverPatternKind | null;
};

export type CoverNaturePalette = {
  skyTop: string;
  skyBottom: string;
  far: string;
  mid: string;
  near: string;
  accent: string;
  water: string;
  highlight: string;
  star: string;
};

export type CoverCircle = {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity?: number;
};

export type CoverEllipse = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill?: string;
  opacity?: number;
};

export type CoverPath = {
  d: string;
  fill?: string;
  opacity?: number;
};

export type CoverPolygon = {
  points: string;
  fill: string;
  opacity?: number;
};

/** `light` = white-ish text on a dark scene; `dark` = near-black text on a pale scene. */
export type CoverHeaderInk = "light" | "dark";

export type CoverScene = {
  kind: CoverPatternKind;
  palette: CoverNaturePalette;
  uid: string;
  skyStyle: { backgroundColor: string; backgroundImage: string };
  headerInk: CoverHeaderInk;
  chromeInk: CoverHeaderInk;
  polygons: CoverPolygon[];
  paths: CoverPath[];
  ellipses: CoverEllipse[];
  circles: CoverCircle[];
};

export type CoverPattern = CoverScene;

const VW = 1600;
const VH = 420;

function hashSeed(value: string): number {
  let hash = 2166136261;
  const source = value || "User";
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function wrapHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

function pick(hash: number, salt: number, modulo: number): number {
  return (hash + salt * 2654435761) % modulo;
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${Math.round(wrapHue(h))} ${Math.round(s)}% ${Math.round(l)}%)`;
}

function parseHslL(color: string): number | null {
  const match = color.match(/hsl\(\s*[\d.]+\s+[\d.]+%\s+([\d.]+)%\s*\)/i);
  return match ? Number(match[1]) : null;
}

export function isCoverPatternKind(value: string | null | undefined): value is CoverPatternKind {
  return Boolean(value && (COVER_PATTERN_KINDS as readonly string[]).includes(value));
}

function buildPalette(
  kind: CoverPatternKind,
  hue: number,
  secondary: number,
  dark: boolean,
): CoverNaturePalette {
  const skyL = dark ? 14 : kind === "dusk" || kind === "aurora" ? 28 : 78;
  const landL = dark ? 18 : 42;
  const shift = kind === "ocean" || kind === "lake" ? 18 : 0;
  return {
    skyTop: hsl(hue + (kind === "aurora" ? 40 : 8), dark ? 38 : 52, skyL + (dark ? 0 : 8)),
    skyBottom: hsl(hue + shift, dark ? 32 : 48, skyL - 8),
    far: hsl(secondary, 28, landL + 12),
    mid: hsl(hue + 12, 34, landL),
    near: hsl(hue - 8, 38, landL - 8),
    accent: hsl(hue + 48, 62, dark ? 58 : 52),
    water: hsl(hue + 18 + shift, 42, dark ? 28 : 48),
    highlight: hsl(hue + 20, 70, dark ? 72 : 88),
    star: hsl(hue, 20, 96),
  };
}

function getCoverHeaderInk(palette: CoverNaturePalette): CoverHeaderInk {
  const samples = [palette.near, palette.mid, palette.skyBottom];
  const luma =
    samples.reduce((sum, color) => sum + (parseHslL(color) ?? 50), 0) / samples.length;
  return luma < 36 ? "light" : "dark";
}

function getCoverChromeInk(palette: CoverNaturePalette): CoverHeaderInk {
  const luma = parseHslL(palette.skyTop);
  return (luma ?? 50) < 42 ? "light" : "dark";
}

function ridge(y: number, amp: number, phase: number, fill: string): CoverPath {
  const steps = 8;
  let d = `M0 ${VH} L0 ${y}`;
  for (let i = 1; i <= steps; i++) {
    const x = (VW / steps) * i;
    const wave = Math.sin((i + phase) * 0.9) * amp;
    d += ` L${x} ${y + wave}`;
  }
  d += ` L${VW} ${VH} Z`;
  return { d, fill };
}

function buildScene(
  kind: CoverPatternKind,
  hash: number,
  palette: CoverNaturePalette,
): Pick<CoverScene, "polygons" | "paths" | "ellipses" | "circles"> {
  const sunX = 220 + pick(hash, 3, 1100);
  const sunY = kind === "dusk" ? 90 : 70;
  const sunR = kind === "aurora" ? 28 : 46;
  const paths: CoverPath[] = [
    ridge(250, 28, pick(hash, 5, 6), palette.far),
    ridge(290, 36, pick(hash, 7, 6), palette.mid),
    ridge(340, 22, pick(hash, 9, 6), palette.near),
  ];
  const circles: CoverCircle[] = [
    { cx: sunX, cy: sunY, r: sunR, fill: palette.highlight, opacity: 0.9 },
  ];
  const ellipses: CoverEllipse[] = [];

  if (kind === "ocean" || kind === "lake") {
    paths.push({
      d: `M0 310 Q400 280 800 320 T${VW} 300 L${VW} ${VH} L0 ${VH} Z`,
      fill: palette.water,
      opacity: 0.85,
    });
  }
  if (kind === "aurora") {
    ellipses.push(
      { cx: 480, cy: 90, rx: 340, ry: 48, fill: palette.accent, opacity: 0.35 },
      { cx: 980, cy: 70, rx: 280, ry: 36, fill: palette.highlight, opacity: 0.28 },
    );
  }
  if (kind === "meadow") {
    circles.push(
      { cx: 180, cy: 360, r: 14, fill: palette.accent, opacity: 0.7 },
      { cx: 420, cy: 380, r: 10, fill: palette.highlight, opacity: 0.65 },
      { cx: 1280, cy: 350, r: 12, fill: palette.accent, opacity: 0.6 },
    );
  }

  return { polygons: [], paths, ellipses, circles };
}

export function getCoverPattern(input: CoverPatternInput): CoverScene {
  const seed = input.seed || "User";
  const hash = hashSeed(seed);
  const kind = isCoverPatternKind(input.kind)
    ? input.kind
    : COVER_PATTERN_KINDS[pick(hash, 1, COVER_PATTERN_KINDS.length)];
  const dark = Boolean(input.dark);
  const warmth = input.warm ? 8 : 0;
  const hue = wrapHue(input.hue + warmth);
  const secondary = wrapHue((input.secondaryHue ?? input.hue + 28) + warmth);
  const palette = buildPalette(kind, hue, secondary, dark);
  const drawn = buildScene(kind, hash, palette);

  return {
    kind,
    palette,
    uid: `n${hash.toString(36)}-${kind}`,
    headerInk: getCoverHeaderInk(palette),
    chromeInk: getCoverChromeInk(palette),
    skyStyle: {
      backgroundColor: palette.skyBottom,
      backgroundImage: `linear-gradient(180deg, ${palette.skyTop} 0%, ${palette.skyBottom} 72%)`,
    },
    ...drawn,
  };
}

export function getCoverPatternStyle(input: CoverPatternInput): CoverScene["skyStyle"] {
  return getCoverPattern(input).skyStyle;
}

export function getCoverPatternKind(input: CoverPatternInput): CoverPatternKind {
  return getCoverPattern(input).kind;
}
