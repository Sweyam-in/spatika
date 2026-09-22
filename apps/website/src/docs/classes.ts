import type { ComponentEntry } from "../data/navigation";
import type { ClassDoc } from "./types";
import { getSlots } from "./slots";

function camel(name: string) {
  return name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function c(className: string, ruleName: string, description: string): ClassDoc {
  return { className, ruleName, description };
}

const extraBySlug: Record<string, ClassDoc[]> = {
  card: [
    c(".glass", "glass", "Applied when `variant=\"default\"`."),
    c(".glass-panel", "glassPanel", "Applied when `variant=\"panel\"` (the default)."),
    c(".glass-subtle", "glassSubtle", "Applied when `variant=\"subtle\"`."),
    c(".app-card-elevated", "elevated", "Applied when `variant=\"elevated\"`."),
  ],
  "glass-card": [
    c(".glass", "glass", "Default frost utility."),
    c(".glass-panel", "glassPanel", "Panel variant."),
    c(".glass-subtle", "glassSubtle", "Subtle variant."),
  ],
  "gradient-text": [
    c(".spk-gradient-text", "gradientText", "Animated theme marketing gradient on the text fill."),
  ],
  "site-nav": [c(".spk-site-nav", "siteNav", "Entrance animation for the marketing navbar.")],
  "chart-data-grid": [
    c(".spk-chart-data-grid", "chartDataGrid", "Shared table and chart layout."),
  ],
  "scatter-webgl": [c(".spk-chart-webgl", "chartWebgl", "Canvas host for GPU point sprites.")],
  heatmap: [c(".spk-chart-color-scale", "colorScale", "Value legend beside the heatmap.")],
  "page-shell": [c(".app-page", "appPage", "Full-height product page frame.")],
};

function chartClasses(): ClassDoc[] {
  return [
    c(".spk-chart", "chart", "Root chart frame. Series colors follow `--chart-*` tokens."),
    c(".spk-chart--animated", "chartAnimated", "Applied when `animated` is true."),
    c(".spk-chart-surface", "chartSurface", "SVG plot surface."),
    c(".spk-chart-mark", "chartMark", "Series mark (bar, point, or path)."),
    c(".spk-chart-tick", "chartTick", "Axis tick label."),
  ];
}

export function getClasses(entry: ComponentEntry): ClassDoc[] {
  const seen = new Set<string>();
  const rows: ClassDoc[] = [];

  function add(item: ClassDoc) {
    if (item.className === "—" || seen.has(item.className)) return;
    seen.add(item.className);
    rows.push(item);
  }

  for (const slot of getSlots(entry)) {
    add({
      className: slot.className,
      ruleName: camel(slot.name),
      description: `Applied to the ${slot.name} slot.`,
    });
  }
  for (const item of extraBySlug[entry.slug] ?? []) add(item);
  if (entry.category === "Charts") {
    for (const item of chartClasses()) add(item);
  }
  if (!rows.length) {
    add(
      c(
        "className",
        "className",
        "This composite has no public `data-slot` hook. Merge utilities via the `className` prop on the root or trigger.",
      ),
    );
  }
  return rows;
}
