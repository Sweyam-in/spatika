/**
 * Enter/exit animation utilities — `animate-in fade-in zoom-in-95 slide-in-from-top-2` —
 * compatible with tw-animate-css (MIT, see NOTICE.md), composed from `--spk-u-*` variables.
 */
import { decl, type Node } from "./ast";
import type { Theme } from "./theme";
import { type UtilityRegistry, PROPERTIES } from "./utilities";
import { isPositiveNumber, spacing } from "./values";

const v = (name: string) => `--spk-u-${name}`;

const DEFAULTS: Record<string, string> = {
  "animation-delay": "0s",
  "animation-direction": "normal",
  "animation-fill-mode": "none",
  "animation-iteration-count": "1",
  "enter-blur": "0",
  "enter-opacity": "1",
  "enter-rotate": "0",
  "enter-scale": "1",
  "enter-translate-x": "0",
  "enter-translate-y": "0",
  "exit-blur": "0",
  "exit-opacity": "1",
  "exit-rotate": "0",
  "exit-scale": "1",
  "exit-translate-x": "0",
  "exit-translate-y": "0",
};
for (const [name, initial] of Object.entries(DEFAULTS)) {
  PROPERTIES[v(name)] = { syntax: "*", inherits: false, initial };
}
PROPERTIES[v("animation-duration")] = { syntax: "*", inherits: false };

const timing = (name: string, duration: string, ease: string) =>
  `${name} var(${v("animation-duration")},var(${v("duration")},${duration}))var(${v("ease")},${ease})var(${v(
    "animation-delay",
  )},0s)var(${v("animation-iteration-count")},1)var(${v("animation-direction")},normal)var(${v("animation-fill-mode")},none)`;

const frame = (kind: "enter" | "exit") =>
  `opacity: var(${v(`${kind}-opacity`)},1); transform: translate3d(var(${v(`${kind}-translate-x`)},0),var(${v(
    `${kind}-translate-y`,
  )},0),0)scale3d(var(${v(`${kind}-scale`)},1),var(${v(`${kind}-scale`)},1),var(${v(`${kind}-scale`)},1))rotate(var(${v(
    `${kind}-rotate`,
  )},0)); filter: blur(var(${v(`${kind}-blur`)},0));`;

const KEYFRAMES = {
  enter: `@keyframes enter {\n  from { ${frame("enter")} }\n}`,
  exit: `@keyframes exit {\n  to { ${frame("exit")} }\n}`,
};

const RADIX_HEIGHT = (kind: "accordion" | "collapsible") =>
  `var(--radix-${kind}-content-height,var(--bits-${kind}-content-height,var(--reka-${kind}-content-height,var(--kb-${kind}-content-height,var(--ngp-${kind}-content-height,auto)))))`;

/** Accordion/collapsible animations, added to the theme's `animate` scale. */
export const ANIMATE_EXTRAS: Theme["animate"] = {
  "accordion-down": {
    value: timing("accordion-down", ".2s", "ease-out"),
    keyframes: `@keyframes accordion-down {\n  from { height: 0; }\n  to { height: ${RADIX_HEIGHT("accordion")}; }\n}`,
  },
  "accordion-up": {
    value: timing("accordion-up", ".2s", "ease-out"),
    keyframes: `@keyframes accordion-up {\n  from { height: ${RADIX_HEIGHT("accordion")}; }\n  to { height: 0; }\n}`,
  },
  "collapsible-down": {
    value: timing("collapsible-down", ".2s", "ease-out"),
    keyframes: `@keyframes collapsible-down {\n  from { height: 0; }\n  to { height: ${RADIX_HEIGHT("collapsible")}; }\n}`,
  },
  "collapsible-up": {
    value: timing("collapsible-up", ".2s", "ease-out"),
    keyframes: `@keyframes collapsible-up {\n  from { height: ${RADIX_HEIGHT("collapsible")}; }\n  to { height: 0; }\n}`,
  },
};

const allProps = [...Object.keys(DEFAULTS).map(v), v("animation-duration")];

export function registerAnimate(u: UtilityRegistry): void {
  const out = (nodes: Node[], keyframes: string[] = []) => ({ nodes, properties: allProps, keyframes });

  u.static("animate-in", () => out([decl("animation", timing("enter", ".15s", "ease"))], [KEYFRAMES.enter]));
  u.static("animate-out", () => out([decl("animation", timing("exit", ".15s", "ease"))], [KEYFRAMES.exit]));

  const percent = (value: string) => (isPositiveNumber(value) ? String(Number(value) / 100) : null);

  for (const kind of ["enter", "exit"] as const) {
    const [fade, zoom, spin, slide, blur] =
      kind === "enter"
        ? ["fade-in", "zoom-in", "spin-in", "slide-in-from", "blur-in"]
        : ["fade-out", "zoom-out", "spin-out", "slide-out-to", "blur-out"];

    u.functional(fade, (c) => {
      if (c.negative || c.modifier) return null;
      if (c.value === null) return out([decl(v(`${kind}-opacity`), "0")]);
      if (c.value.kind === "arbitrary") return out([decl(v(`${kind}-opacity`), c.value.value)]);
      const value = percent(c.value.value);
      return value === null ? null : out([decl(v(`${kind}-opacity`), value)]);
    });
    u.functional(zoom, (c) => {
      if (c.modifier) return null;
      if (c.value === null) return c.negative ? null : out([decl(v(`${kind}-scale`), "0")]);
      if (c.value.kind === "arbitrary") return out([decl(v(`${kind}-scale`), c.value.value)]);
      const value = percent(c.value.value);
      if (value === null) return null;
      return out([decl(v(`${kind}-scale`), c.negative ? `-${value}` : value)]);
    });
    u.functional(spin, (c) => {
      if (c.modifier) return null;
      if (c.value === null) return out([decl(v(`${kind}-rotate`), c.negative ? "-30deg" : "30deg")]);
      if (c.value.kind === "arbitrary") return out([decl(v(`${kind}-rotate`), c.value.value)]);
      if (!isPositiveNumber(c.value.value)) return null;
      return out([decl(v(`${kind}-rotate`), `${c.negative ? "-" : ""}${c.value.value}deg`)]);
    });
    u.functional(blur, (c) => {
      if (c.negative || c.modifier) return null;
      if (c.value === null) return out([decl(v(`${kind}-blur`), "20px")]);
      if (c.value.kind === "arbitrary") return out([decl(v(`${kind}-blur`), c.value.value)]);
      return null;
    });
    for (const [side, axis, sign] of [
      ["top", "y", -1],
      ["bottom", "y", 1],
      ["left", "x", -1],
      ["right", "x", 1],
    ] as const) {
      u.functional(`${slide}-${side}`, (c, theme) => {
        if (c.negative || c.modifier) return null;
        const variable = v(`${kind}-translate-${axis}`);
        if (c.value === null) return out([decl(variable, sign < 0 ? "-100%" : "100%")]);
        if (c.value.kind === "named" && c.value.value === "full") return out([decl(variable, sign < 0 ? "-100%" : "100%")]);
        const value = spacing(theme, c.value, sign < 0, {}, { fractions: true });
        return value === null ? null : out([decl(variable, value)]);
      });
    }
  }

  u.functional("delay", (c) => {
    // Complements the transition-delay utility: tw-animate delays animations too.
    if (c.negative || c.modifier) return null;
    const n = c.value?.kind === "named" ? c.value.value : null;
    const value = n !== null && isPositiveNumber(n) ? `${Number(n) / 1000}s` : c.value?.kind === "arbitrary" ? c.value.value : null;
    if (value === null) return null;
    return out([decl("transition-delay", n !== null ? `${n}ms` : value), decl("animation-delay", value), decl(v("animation-delay"), value)]);
  });
  u.functional("animation-duration", (c) => {
    if (c.negative || c.modifier) return null;
    const n = c.value?.kind === "named" ? c.value.value : null;
    const value = n !== null && isPositiveNumber(n) ? `${n}ms` : c.value?.kind === "arbitrary" ? c.value.value : null;
    return value === null ? null : out([decl(v("animation-duration"), value), decl("animation-duration", value)]);
  });
  for (const [root, property, values] of [
    ["fill-mode", "animation-fill-mode", ["none", "forwards", "backwards", "both"]],
    ["direction", "animation-direction", ["normal", "reverse", "alternate", "alternate-reverse"]],
    ["repeat", "animation-iteration-count", ["0", "1", "infinite"]],
  ] as const) {
    for (const value of values) {
      const variable = v(`animation-${root === "repeat" ? "iteration-count" : root}`);
      u.static(`${root}-${value}`, () => out([decl(property, value), decl(variable, value)]));
    }
  }
  u.static("paused", [decl("animation-play-state", "paused")]);
  u.static("running", [decl("animation-play-state", "running")]);
  u.static("play-state-paused", [decl("animation-play-state", "paused")]);
  u.static("play-state-running", [decl("animation-play-state", "running")]);
}
