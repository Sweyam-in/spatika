#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const SITE_URL = "https://spatika.sweyam.com";
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(packageRoot, "..", "..");

type ComponentEntry = {
  slug: string;
  name: string;
  importName: string;
  category: string;
  description: string;
  docs: string;
  humanDocs: string;
};

type ComponentsJson = {
  name: string;
  packages: string[];
  docs: string;
  llms: string;
  themes: string[];
  components: ComponentEntry[];
};

type StaticResource = {
  name: string;
  uri: string;
  title: string;
  description: string;
  mimeType: string;
  localPaths: string[];
  remotePath: string;
};

const staticResources: StaticResource[] = [
  {
    name: "spatika_llms",
    uri: "spatika://docs/llms.txt",
    title: "Spatika llms.txt",
    description: "Machine-readable Spatika UI index for coding agents.",
    mimeType: "text/plain",
    localPaths: ["apps/website/dist/llms.txt"],
    remotePath: "/llms.txt",
  },
  {
    name: "spatika_full_reference",
    uri: "spatika://docs/llms-full.txt",
    title: "Spatika full agent reference",
    description: "Complete Spatika install rules, recipes, and component catalog.",
    mimeType: "text/plain",
    localPaths: ["apps/website/dist/llms-full.txt"],
    remotePath: "/llms-full.txt",
  },
  {
    name: "spatika_components_json",
    uri: "spatika://docs/components.json",
    title: "Spatika component JSON",
    description: "Structured Spatika component metadata with slugs, imports, categories, and docs links.",
    mimeType: "application/json",
    localPaths: ["apps/website/dist/docs/components.json"],
    remotePath: "/docs/components.json",
  },
  {
    name: "spatika_agents",
    uri: "spatika://docs/AGENTS.md",
    title: "Spatika AGENTS.md",
    description: "Agent-facing implementation guide for Spatika UI.",
    mimeType: "text/markdown",
    localPaths: ["AGENTS.md", "apps/website/dist/AGENTS.md"],
    remotePath: "/AGENTS.md",
  },
  {
    name: "spatika_skill",
    uri: "spatika://skills/spatika-ui/SKILL.md",
    title: "Spatika UI skill",
    description: "Reusable Spatika UI skill for Codex, Cursor, and other skill-capable agents.",
    mimeType: "text/markdown",
    localPaths: [
      ".cursor/skills/spatika-ui/SKILL.md",
      "packages/react/skills/spatika-ui/SKILL.md",
      "apps/website/dist/skills/spatika-ui/SKILL.md",
    ],
    remotePath: "/skills/spatika-ui/SKILL.md",
  },
];

async function readFirstLocal(relativePaths: string[]): Promise<string | null> {
  for (const relativePath of relativePaths) {
    try {
      return await readFile(path.join(repoRoot, relativePath), "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
  return null;
}

async function fetchRemote(remotePath: string): Promise<string> {
  const response = await fetch(`${SITE_URL}${remotePath}`);
  if (!response.ok) {
    throw new Error(`Unable to fetch ${remotePath}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function readStaticResource(resource: StaticResource): Promise<string> {
  const local = await readFirstLocal(resource.localPaths);
  if (local != null) return local;
  return fetchRemote(resource.remotePath);
}

function normalizeDocPath(input: string): string {
  const clean = input.trim().replace(/^\/+/, "");
  if (!clean) return "llms.txt";
  if (clean === "components.json") return "docs/components.json";
  if (clean.endsWith(".md") || clean.endsWith(".txt") || clean.endsWith(".json")) return clean;
  return `docs/${clean}.md`;
}

function isAllowedDocPath(docPath: string): boolean {
  if (docPath === "llms.txt" || docPath === "llms-full.txt" || docPath === "AGENTS.md") return true;
  if (docPath === "skills/spatika-ui/SKILL.md") return true;
  if (docPath === "docs/components.json") return true;
  return /^docs\/[a-z0-9-]+\.md$/.test(docPath);
}

function mimeTypeFor(docPath: string): string {
  if (docPath.endsWith(".json")) return "application/json";
  if (docPath.endsWith(".txt")) return "text/plain";
  return "text/markdown";
}

async function readDoc(docPath: string): Promise<string> {
  const normalized = normalizeDocPath(docPath);
  if (!isAllowedDocPath(normalized)) {
    throw new Error(`Unsupported Spatika doc path: ${docPath}`);
  }

  const matchingStatic = staticResources.find((resource) => resource.remotePath === `/${normalized}`);
  if (matchingStatic) return readStaticResource(matchingStatic);

  const local = await readFirstLocal([`apps/website/dist/${normalized}`]);
  if (local != null) return local;
  return fetchRemote(`/${normalized}`);
}

async function loadComponents(): Promise<ComponentsJson> {
  const body = await readDoc("docs/components.json");
  return JSON.parse(body) as ComponentsJson;
}

function toolText(text: string) {
  return {
    content: [{ type: "text" as const, text }],
  };
}

function scoreComponent(component: ComponentEntry, query: string): number {
  const haystack = [
    component.slug,
    component.name,
    component.importName,
    component.category,
    component.description,
  ]
    .join(" ")
    .toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

const server = new McpServer({
  name: "spatika",
  version: "0.1.0",
});

for (const resource of staticResources) {
  server.registerResource(
    resource.name,
    resource.uri,
    {
      title: resource.title,
      description: resource.description,
      mimeType: resource.mimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: resource.mimeType,
          text: await readStaticResource(resource),
        },
      ],
    }),
  );
}

server.registerTool(
  "search_spatika_components",
  {
    title: "Search Spatika components",
    description: "Search the Spatika component catalog by name, category, import, or description.",
    inputSchema: {
      query: z.string().describe("Search text such as data table, dialog, app shell, chart, or marketing hero."),
      limit: z.number().int().min(1).max(50).default(10).describe("Maximum results to return."),
    },
  },
  async ({ query, limit }) => {
    const catalog = await loadComponents();
    const matches = catalog.components
      .map((component) => ({ component, score: scoreComponent(component, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.component.name.localeCompare(b.component.name))
      .slice(0, limit)
      .map(({ component }) => ({
        name: component.name,
        importName: component.importName,
        category: component.category,
        description: component.description,
        docs: component.docs,
      }));

    return toolText(JSON.stringify({ query, results: matches }, null, 2));
  },
);

server.registerTool(
  "get_spatika_doc",
  {
    title: "Get Spatika doc",
    description:
      "Fetch a Spatika agent doc. Accepts paths like llms.txt, llms-full.txt, docs/button.md, button, app-shell, components.json, or skills/spatika-ui/SKILL.md.",
    inputSchema: {
      path: z.string().describe("Spatika doc path or component slug."),
    },
  },
  async ({ path: requestedPath }) => {
    const normalized = normalizeDocPath(requestedPath);
    const body = await readDoc(normalized);
    return toolText(body);
  },
);

server.registerTool(
  "get_spatika_skill",
  {
    title: "Get Spatika skill",
    description: "Fetch the Spatika UI SKILL.md instructions for skill-capable coding agents.",
    inputSchema: {},
  },
  async () => toolText(await readDoc("skills/spatika-ui/SKILL.md")),
);

const transport = new StdioServerTransport();
await server.connect(transport);
