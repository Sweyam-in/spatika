import { SNIPPETS } from "./agent-snippets";
import { components, type ComponentEntry } from "./navigation";
import { appDemoSource } from "../docs/app-catalog";

/** The usage code shown on a component page (and in its agent Markdown). */
export function primaryImport(entry: ComponentEntry): string {
  return entry.importName.split(",")[0]!.trim().replace(/\s*\(.*\)$/, "");
}

function defaultSnippet(entry: ComponentEntry): string {
  const name = primaryImport(entry);
  return `import { ${name} } from "@spatika/react";

<${name}>${entry.name}</${name}>`;
}

export function usageSnippet(slug: string): string {
  const snippet = SNIPPETS[slug] ?? appDemoSource(slug);
  if (snippet) return snippet;
  const entry = components.find((item) => item.slug === slug);
  if (!entry) return "";
  return defaultSnippet(entry);
}
