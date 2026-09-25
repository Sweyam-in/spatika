import type { ComponentType } from "react";
import {
  Badge,
  Button,
  Callout,
  Checkbox,
  Chip,
  Delta,
  EmptyState,
  Input,
  NumberInput,
  Progress,
  ResultState,
  Separator,
  Skeleton,
  Spinner,
  StatusDot,
  Switch,
} from "@spatika/react";
import generatedApi from "../generated/api.json";

type GeneratedProp = { name: string; type: string; optional: boolean; default?: string; deprecated?: string };
const API = generatedApi as Record<string, { props: GeneratedProp[] }>;

export type PlaygroundValue = string | number | boolean | undefined;
export type PlaygroundProps = Record<string, PlaygroundValue>;

export type PlaygroundControl =
  | { name: string; kind: "select"; options: string[] }
  | { name: string; kind: "boolean" }
  | { name: string; kind: "text" }
  | { name: string; kind: "number" };

export type PlaygroundConfig = {
  /** Export rendered in the preview. */
  exportName: string;
  component: ComponentType<Record<string, unknown>>;
  /** Starting props — also what Reset returns to. `children` is edited as text. */
  initial: PlaygroundProps;
  /** Props edited as free text / numbers (unions and booleans are found automatically). */
  text?: string[];
  number?: string[];
  /** Props to leave out of the controls. */
  omit?: string[];
  /** Wrapper width for components that fill their container. */
  width?: string;
};

/** Props that never make sense as a control. */
const ALWAYS_OMIT = new Set(["className", "asChild", "style", "containerClassName", "locale", "id"]);

export const PLAYGROUNDS: Record<string, PlaygroundConfig> = {
  button: {
    exportName: "Button",
    component: Button as ComponentType<Record<string, unknown>>,
    initial: { children: "Save changes", variant: "primary", size: "default", loading: false, disabled: false, block: false },
    text: ["children"],
    omit: ["leadingIcon", "trailingIcon"],
  },
  badge: {
    exportName: "Badge",
    component: Badge as ComponentType<Record<string, unknown>>,
    initial: { children: "Beta", variant: "accent", size: "sm", shape: "pill", dot: false },
    text: ["children"],
  },
  input: {
    exportName: "Input",
    component: Input as ComponentType<Record<string, unknown>>,
    initial: { placeholder: "you@company.com", variant: "default", disabled: false, "aria-invalid": false },
    text: ["placeholder"],
    omit: ["size", "leading", "trailing"],
    width: "20rem",
  },
  "number-input": {
    exportName: "NumberInput",
    component: NumberInput as ComponentType<Record<string, unknown>>,
    initial: { defaultValue: 12, min: 0, max: 100, step: 1, size: "md", hideSteppers: false, disabled: false, "aria-label": "Seats" },
    number: ["min", "max", "step"],
    omit: ["value", "defaultValue", "largeStep", "precision"],
    width: "16rem",
  },
  switch: {
    exportName: "Switch",
    component: Switch as ComponentType<Record<string, unknown>>,
    initial: { defaultChecked: true, size: "md", disabled: false, "aria-label": "Email notifications" },
    omit: ["checked"],
  },
  checkbox: {
    exportName: "Checkbox",
    component: Checkbox as ComponentType<Record<string, unknown>>,
    initial: { defaultChecked: true, disabled: false, "aria-label": "Accept terms" },
  },
  progress: {
    exportName: "Progress",
    component: Progress as ComponentType<Record<string, unknown>>,
    initial: { value: 64, max: 100, size: "sm", variant: "determinate", tone: "accent", "aria-label": "Upload" },
    number: ["value", "max"],
    width: "20rem",
  },
  spinner: {
    exportName: "Spinner",
    component: Spinner as ComponentType<Record<string, unknown>>,
    initial: { size: "md", label: "Loading" },
    text: ["label"],
  },
  chip: {
    exportName: "Chip",
    component: Chip as ComponentType<Record<string, unknown>>,
    initial: { children: "Open", active: true, variant: "filter", showCheck: false },
    text: ["children"],
  },
  callout: {
    exportName: "Callout",
    component: Callout as ComponentType<Record<string, unknown>>,
    initial: { title: "Heads up", children: "Exports run in the background.", variant: "info" },
    text: ["title", "children"],
    width: "28rem",
  },
  "empty-state": {
    exportName: "EmptyState",
    component: EmptyState as ComponentType<Record<string, unknown>>,
    initial: { title: "No invoices yet", description: "Invoices you send appear here.", variant: "bordered", size: "md", tone: "neutral" },
    text: ["title", "description"],
    omit: ["actionLabel", "headingLevel"],
    width: "28rem",
  },
  "result-state": {
    exportName: "ResultState",
    component: ResultState as ComponentType<Record<string, unknown>>,
    initial: { status: "success", title: "Payment received", description: "We emailed a receipt.", variant: "plain", size: "md" },
    text: ["title", "description"],
    omit: ["actionLabel", "headingLevel"],
    width: "28rem",
  },
  "status-dot": {
    exportName: "StatusDot",
    component: StatusDot as ComponentType<Record<string, unknown>>,
    initial: { tone: "success", pulse: false, label: "Operational" },
    text: ["label"],
  },
  delta: {
    exportName: "Delta",
    component: Delta as ComponentType<Record<string, unknown>>,
    initial: { value: 0.124, format: "percent", intent: "normal", variant: "soft", showIcon: true },
    number: ["value", "precision"],
    omit: ["currency", "label"],
  },
  separator: {
    exportName: "Separator",
    component: Separator as ComponentType<Record<string, unknown>>,
    initial: { orientation: "horizontal", decorative: true },
    width: "16rem",
  },
  skeleton: {
    exportName: "Skeleton",
    component: Skeleton as ComponentType<Record<string, unknown>>,
    initial: { shape: "text" },
    width: "16rem",
  },
};

/** String literals in a generated union type: `"a" | "b" | null` → ["a", "b"]. */
export function literalOptions(type: string): string[] | null {
  const parts = type.split("|").map((part) => part.trim()).filter((part) => part !== "null" && part !== "undefined");
  if (!parts.length || !parts.every((part) => /^"[^"]*"$/.test(part))) return null;
  return parts.map((part) => part.slice(1, -1));
}

/** Controls for a playground, derived from the generated API so they match the release. */
export function controlsFor(config: PlaygroundConfig): PlaygroundControl[] {
  const props = API[config.exportName]?.props ?? [];
  const omit = new Set([...ALWAYS_OMIT, ...(config.omit ?? [])]);
  const controls: PlaygroundControl[] = [];
  for (const name of config.text ?? []) controls.push({ name, kind: "text" });
  for (const name of config.number ?? []) controls.push({ name, kind: "number" });
  const taken = new Set(controls.map((control) => control.name));

  for (const prop of props) {
    if (omit.has(prop.name) || taken.has(prop.name) || prop.deprecated !== undefined) continue;
    if (/^on[A-Z]/.test(prop.name)) continue;
    const options = literalOptions(prop.type);
    if (options) {
      // Keep the starting value first so the menu reads from the default outwards.
      const start = config.initial[prop.name];
      const ordered = typeof start === "string" && options.includes(start) ? [start, ...options.filter((o) => o !== start)] : options;
      controls.push({ name: prop.name, kind: "select", options: ordered });
    } else if (/^(boolean)( \| null)?$/.test(prop.type)) {
      controls.push({ name: prop.name, kind: "boolean" });
    }
  }
  // Common HTML booleans the component forwards (disabled, aria-invalid) when the demo sets them.
  for (const name of ["disabled", "aria-invalid"]) {
    if (name in config.initial && !controls.some((control) => control.name === name)) controls.push({ name, kind: "boolean" });
  }
  return controls;
}

function attribute(name: string, value: PlaygroundValue) {
  if (value === undefined || value === false) return null;
  if (value === true) return name;
  if (typeof value === "number") return `${name}={${value}}`;
  return `${name}=${JSON.stringify(value)}`;
}

/** JSX for the current props — only what differs from the component's own defaults. */
export function playgroundCode(config: PlaygroundConfig, props: PlaygroundProps): string {
  const defaults = new Map((API[config.exportName]?.props ?? []).map((prop) => [prop.name, prop.default]));
  const { children, ...rest } = props;
  const attrs = Object.entries(rest)
    .filter(([name, value]) => {
      // Spatika variant APIs spell their default "default"; writing it out is noise.
      if (value === "default") return false;
      const def = defaults.get(name);
      return !(def !== undefined && (def === JSON.stringify(value) || def === String(value)));
    })
    .map(([name, value]) => attribute(name, value))
    .filter((item): item is string => item !== null);
  const tag = config.exportName;
  const open = attrs.length > 3 ? `<${tag}\n  ${attrs.join("\n  ")}\n` : `<${tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}`;
  const body = children !== undefined && children !== "" ? `${open}>${String(children)}</${tag}>` : `${open}${attrs.length > 3 ? "" : " "}/>`;
  return `import { ${tag} } from "@spatika/react";\n\n${body}`;
}
