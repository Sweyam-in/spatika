export const SITE = {
  name: "Spatika",
  brand: "Spatika UI",
  tagline: "An AI-first React toolkit for serious product UI.",
  description:
    "Spatika UI is an AI-first, open-source React toolkit for SaaS, finance, productivity and data-heavy products — semantic tokens, density control, an application shell, data tables, SVG charts (@spatika/charts), a Tiptap editor (@spatika/editor), scheduling (EventCalendar), and agent-ready docs through llms.txt, a reusable skill, and @spatika/mcp.",
  url: "https://spatika.sweyam.com",
  ogImage: "https://spatika.sweyam.com/og.png",
  author: "Sreelal Chalil",
  authorUrl: "https://github.com/SreelalChalil",
  sweyam: "Sweyam",
  sweyamUrl: "https://sweyam.com",
  license: "MIT",
  github: "https://github.com/Sweyam-in/spatika",
  githubIssues: "https://github.com/Sweyam-in/spatika/issues",
  githubNewIssue: "https://github.com/Sweyam-in/spatika/issues/new",
  npmOrg: "https://www.npmjs.com/org/spatika",
  npmReact: "https://www.npmjs.com/package/@spatika/react",
  npmTokens: "https://www.npmjs.com/package/@spatika/tokens",
  npmCharts: "https://www.npmjs.com/package/@spatika/charts",
  npmEditor: "https://www.npmjs.com/package/@spatika/editor",
  alternateNames: ["Spatika", "Spadik UI", "Spadik", "Spatika React"] as const,
  /** Docs site initial theme when nothing is stored in localStorage. */
  defaultTheme: "mukta" as const,
} as const;

export const INSTALL = {
  tokens: "npm install @spatika/tokens",
  react: "npm install @spatika/react",
  charts: "npm install @spatika/charts @spatika/tokens",
  editor: "npm install @spatika/editor @spatika/tokens",
  both: "npm install @spatika/tokens @spatika/react",
} as const;

export function absoluteUrl(path = "/"): string {
  const normalized = path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${normalized}`;
}
