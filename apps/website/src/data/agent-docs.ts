import {
  componentCategories,
  components,
  componentImportPackage,
  type ComponentEntry,
} from "./navigation";
import { INSTALL, SITE } from "./site";
import { SNIPPETS } from "./agent-snippets";
import { getComponentDoc } from "../docs/catalog";

export type AgentDocFile = {
  path: string;
  body: string;
  contentType: string;
};

export const RECIPE_BOOTSTRAP = `import "@spatika/tokens/styles.css";
import { SpatikaThemeProvider, Button } from "@spatika/react";

export function App() {
  return (
    <SpatikaThemeProvider defaultTheme="neelam">
      <Button>Hello Spatika</Button>
    </SpatikaThemeProvider>
  );
}`;

export const RECIPE_THEMING = `import { SpatikaThemeProvider, useSpatikaTheme } from "@spatika/react";

export function App() {
  return (
    <SpatikaThemeProvider storageKey="spk-theme">
      <YourRoutes />
    </SpatikaThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useSpatikaTheme();
  return (
    <button onClick={() => setTheme(theme === "neelam" ? "mukta" : "neelam")}>
      Toggle
    </button>
  );
}`;

export const RECIPE_CREATE_THEME = `import {
  Button,
  SpatikaThemeProvider,
  createTheme,
} from "@spatika/react";

const brand = createTheme({
  id: "brand",
  label: "Brand",
  extends: "mukta",
  palette: {
    primary: "#7c3aed",
    primaryForeground: "#ffffff",
    ring: "#7c3aed",
    accent: "rgba(124, 58, 237, 0.12)",
    accentForeground: "#5b21b6",
  },
});

export function App() {
  return (
    <SpatikaThemeProvider defaultTheme="brand" customThemes={[brand]}>
      <Button>Brand action</Button>
    </SpatikaThemeProvider>
  );
}`;

export const RECIPE_CUSTOMIZE_ONE_OFF = `import { Button, GlassCard } from "@spatika/react";

<GlassCard className="max-w-sm p-4">
  <Button className="w-full bg-primary text-primary-foreground">Save</Button>
</GlassCard>`;

export const RECIPE_CSS_OVERRIDE = `:root {
  --primary: #7c3aed;
  --ring: #7c3aed;
}

.neelam {
  --primary: #c4b5fd;
  --ring: #c4b5fd;
}`;

export const RECIPE_BREAKPOINTS = `import { BREAKPOINTS, Grid, Paper, useBreakpoint } from "@spatika/react";

export function Dashboard() {
  const bp = useBreakpoint();
  return (
    <Grid container spacing={2}>
      <Grid xs={12} md={8} xl={9}>
        <Paper className="p-3">Main ({bp}, md={BREAKPOINTS.md}px)</Paper>
      </Grid>
      <Grid xs={12} md={4} xl={3}>
        <Paper className="p-3">Aside</Paper>
      </Grid>
    </Grid>
  );
}`;

export const RECIPE_RESPONSIVE = `import { Button, Stack, useIsMobile } from "@spatika/react";

export function Toolbar() {
  const mobile = useIsMobile();
  return (
    <Stack direction={mobile ? "column" : "row"} spacing={1}>
      <Button size={mobile ? "touch" : "sm"}>Save</Button>
      <Button size={mobile ? "touch" : "sm"} variant="ghost">
        Cancel
      </Button>
    </Stack>
  );
}`;

export const RECIPE_APP_SHELL = `import {
  AppHeader,
  Button,
  FloatingPageChromeBar,
  FloatingPageChromeIdentity,
  FloatingPageChromeSearchField,
  MobileTabBar,
  PageShell,
} from "@spatika/react";
import { Home, Inbox, Search, User } from "lucide-react";

<PageShell>
  <AppHeader variant="chrome" title="Spatika" />
  <FloatingPageChromeBar
    identity={<FloatingPageChromeIdentity title="Leads" count={128} />}
    search={
      <FloatingPageChromeSearchField
        value={query}
        onChange={setQuery}
        placeholder="Search leads…"
      />
    }
    actions={<Button size="sm">New</Button>}
  >
    <main className="app-tabbar-clearance px-4 py-6">{/* content */}</main>
  </FloatingPageChromeBar>
  <MobileTabBar
    items={[
      { id: "home", label: "Home", icon: Home, active: true },
      { id: "search", label: "Search", icon: Search },
      { id: "inbox", label: "Inbox", icon: Inbox },
      { id: "you", label: "You", icon: User },
    ]}
  />
</PageShell>`;

export const RECIPE_COVER = `import { CoverHero, ProfileHero, useCoverChromeBleed } from "@spatika/react";

function ProfilePage() {
  useCoverChromeBleed("dark");
  return <ProfileHero name="Alex Chen" alias="Designer" coverSeed="alex" />;
}`;

export const RECIPE_FORM = `import { Button, GlassCard, TextField } from "@spatika/react";

<form className="grid gap-4">
  <TextField label="Email" type="email" fullWidth />
  <TextField label="Note" multiline rows={3} fullWidth />
  <Button type="submit" size="touch">Save</Button>
</form>`;

export const RECIPE_CHART = `import { BarChart } from "@spatika/react";

<BarChart
  height={240}
  xAxis={[{ data: ["Jan", "Feb", "Mar"] }]}
  series={[
    { label: "Views", data: [420, 380, 510] },
    { label: "Signups", data: [120, 150, 140] },
  ]}
  onItemClick={(item) => openMonth(item.category)}
/>`;

export const RECIPE_EDITOR = `import "@spatika/editor/styles.css";
import { SpatikaEditor } from "@spatika/editor";

<SpatikaEditor
  value={html}
  onChange={setHtml}
  placeholder="Start writing…"
  mentions={[{ id: "1", label: "Asha Verma" }]}
  onAiCommand={async ({ actionId, prompt, selectedText }) => {
    if (actionId === "prompt") return runPrompt(prompt);
    return rewrite(actionId, selectedText);
  }}
/>`;

export const RECIPE_SCHEDULER = `import { EventCalendar } from "@spatika/react";

<EventCalendar
  events={events}
  resources={[
    { id: "work", title: "Work", color: "violet" },
    { id: "health", title: "Health", color: "teal" },
  ]}
  onEventChange={(event, next) => updateEvent(event.id, next)}
  showEventEditor={false}
  onEventClick={(event) => openHostEditor(event)}
  onSlotClick={(slot) => openHostCreate(slot.start)}
  onVisibleRangeChange={(range) => fetchRange(range.start, range.end)}
/>`;

const RULES = `## Must do
- Import \`@spatika/tokens/styles.css\` before any component
- Wrap the app in \`<SpatikaThemeProvider>\`
- Import components from \`@spatika/react\` — never invent Spatika components
- Prefer composites (\`PageShell\`, \`FloatingPageChromeBar\`, \`GlassCard\`) over restyling primitives
- Use token CSS variables, never hardcoded hex
- Use \`size="touch"\` for mobile primary actions (≥44px)
- Animate transform / shadow / color only — never \`transition-all\` on glass

## Themes
\`mukta\` (pearl light), \`neelam\` (sapphire dark), \`usha\` (dawn), \`sandhya\` (dusk, no blur).
Create a brand theme with \`createTheme({ id, extends, palette })\` and pass it as \`customThemes\`.
Override tokens with CSS variables (\`--primary\`, \`--background\`). Use \`BREAKPOINTS\` / \`Grid\` \`xs\`–\`xl\` for layout.

## When to use

| Need | Component |
|---|---|
| App page frame | \`PageShell\` |
| List / directory chrome | \`FloatingPageChromeBar\` |
| Fixed safe-area bar | \`AppHeader variant="chrome"\` |
| Mobile tabs | \`MobileTabBar\` |
| Profile / story header | \`CoverHero\` / \`ProfileHero\` + \`useCoverChromeBleed\` |
| Glass surface | \`GlassCard\` |
| Labeled field | \`TextField\` |
| Filters | \`FilterSheet\` + \`ChipGroup\` |
| Empty list | \`EmptyState\` |
| Titled modal | \`Dialog\` (not \`Modal\`) |
| Toast stack | \`Toaster\` + \`useToast\` |
| Charts | \`BarChart\`, \`LineChart\`, or \`ChartContainer\` from \`@spatika/charts\` (\`onItemClick\`, \`syncId\`, \`renderTooltip\`, \`referenceLines\`) |
| Rich text | \`SpatikaEditor\` from \`@spatika/editor\` — import \`@spatika/editor/styles.css\` with tokens |
| Calendar | \`EventCalendar\` |`;

function primaryImport(entry: ComponentEntry): string {
  return entry.importName.split(",")[0]!.trim().replace(/\s*\(.*\)$/, "");
}

function defaultSnippet(entry: ComponentEntry): string {
  const name = primaryImport(entry);
  return `import { ${name} } from "@spatika/react";

<${name}>${entry.name}</${name}>`;
}

export function usageSnippet(slug: string): string {
  const snippet = SNIPPETS[slug];
  if (snippet) return snippet;
  const entry = components.find((item) => item.slug === slug);
  if (!entry) return "";
  return defaultSnippet(entry);
}

function packageTypesPath(entry: ComponentEntry): string {
  const pkg = componentImportPackage(entry.category);
  if (pkg === "@spatika/charts") return "node_modules/@spatika/charts/dist/index.d.ts";
  if (pkg === "@spatika/editor") return "node_modules/@spatika/editor/dist/index.d.ts";
  return "node_modules/@spatika/react/dist/index.d.ts";
}

export function componentMarkdown(entry: ComponentEntry): string {
  const snippet = usageSnippet(entry.slug);
  const name = primaryImport(entry);
  const pkg = componentImportPackage(entry.category);
  const doc = getComponentDoc(entry);
  const usage = doc.usage
    .map((section) => `### ${section.title}\n\n${section.paragraphs.join("\n\n")}`)
    .join("\n\n");
  const props = doc.api
    .map((section) => {
      const rows = section.props.map((prop) => [
        `\`${prop.name}\``,
        `\`${escapeCell(prop.type)}\``,
        prop.default ? `\`${escapeCell(prop.default)}\`` : "—",
        escapeCell(prop.description),
      ]);
      return `### ${section.name}\n\n${mdTable(["Name", "Type", "Default", "Description"], rows)}`;
    })
    .join("\n\n");
  const slots = mdTable(
    ["Slot name", "Class name", "Default component", "Description"],
    doc.slots.map((slot) => [
      `\`${slot.name}\``,
      `\`${escapeCell(slot.className)}\``,
      `\`${escapeCell(slot.defaultComponent)}\``,
      escapeCell(slot.description),
    ]),
  );
  const classes = mdTable(
    ["Class name", "Rule name", "Description"],
    doc.classes.map((row) => [
      `\`${escapeCell(row.className)}\``,
      `\`${row.ruleName}\``,
      escapeCell(row.description),
    ]),
  );

  return `# ${entry.name}

${doc.intro}

- **Import:** \`${name}\` from \`${pkg}\`${entry.category === "Editor" ? " (also import `@spatika/editor/styles.css`)" : ""}
- **Category:** ${entry.category}
- **Human docs:** ${SITE.url}/components/${entry.slug}

## Usage

${usage}

\`\`\`tsx
${snippet}
\`\`\`

## Props

${props}

## Slots

${slots}

## CSS classes

${classes}

Icons in examples use \`lucide-react\`. For the full prop surface, read \`${packageTypesPath(entry)}\`.
`;
}

function escapeCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function mdTable(headers: string[], rows: string[][]): string {
  if (!rows.length) return "_None._";
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  return `${head}\n${sep}\n${body}`;
}

function guideInstallMd(): string {
  return `# Install Spatika UI

Packages: [\`@spatika/tokens\`](${SITE.npmTokens}) and [\`@spatika/react\`](${SITE.npmReact}).

\`\`\`bash
${INSTALL.both}
\`\`\`

Then bootstrap:

\`\`\`tsx
${RECIPE_BOOTSTRAP}
\`\`\`

${RULES}
`;
}

function guideThemingMd(): string {
  return `# Theming

Four built-in themes: Mukta, Neelam, Usha, Sandhya. Persist with \`storageKey\`. For palettes, breakpoints, and \`createTheme\`, see [customize.md](./customize.md).

\`\`\`tsx
${RECIPE_THEMING}
\`\`\`
`;
}

function guideCustomizeMd(): string {
  return `# Customize

Spatika is customized with token CSS variables, not an \`sx\` prop. Narrowest to broadest:

1. One-off \`className\` using token utilities (\`bg-primary\`, \`text-muted-foreground\`)
2. Reusable wrapper components
3. \`createTheme\` + \`SpatikaThemeProvider customThemes\`
4. Global CSS variable overrides on \`:root\` / \`.neelam\` / \`.usha\` / \`.sandhya\`

## Create a theme

\`\`\`tsx
${RECIPE_CREATE_THEME}
\`\`\`

\`extends\` picks the built-in CSS variable set. Unspecified tokens inherit. \`themeToCss(theme)\` emits a stylesheet if you prefer static CSS.

## Color palette

Map camelCase keys to CSS variables: \`primary\` → \`--primary\`, \`mutedForeground\` → \`--muted-foreground\`, \`chart1\` → \`--chart-1\`. Tailwind utilities (\`bg-primary\`, \`text-foreground\`) read those variables.

## Breakpoints

| Key | Width |
|---|---|
| xs | 0 |
| sm | 640 |
| md | 768 |
| lg | 1024 |
| xl | 1280 |

\`\`\`tsx
${RECIPE_BREAKPOINTS}
\`\`\`

## Responsive

\`useIsMobile()\` is the viewport below \`md\` (767px). Use \`size="touch"\` for ≥44px targets.

\`\`\`tsx
${RECIPE_RESPONSIVE}
\`\`\`

Human guide: ${SITE.url}/customize
`;
}

function guideAppShellMd(): string {
  return `# App shell

Typical product layout: fixed chrome, liquid-glass page toolbar, floating tab bar.

\`\`\`tsx
${RECIPE_APP_SHELL}
\`\`\`
`;
}

function guideCoverMd(): string {
  return `# Cover pages

Call \`useCoverChromeBleed\` so the fixed header frosts over generated cover art.

\`\`\`tsx
${RECIPE_COVER}
\`\`\`
`;
}

function guideFormsMd(): string {
  return `# Forms

Prefer \`TextField\` when a label is visible. Pair filters with \`FilterSheet\`.

\`\`\`tsx
${RECIPE_FORM}
\`\`\`
`;
}

function guideChartsMd(): string {
  return `# Charts

Theme colors come from CSS variables (\`--chart-1\` …). Enable \`zoom\` and \`showToolbar\` for interactive cartesian charts. Use \`renderer="webgl"\` on \`ScatterChart\` for large clouds.

\`\`\`tsx
${RECIPE_CHART}
\`\`\`

See [components.md](./components.md) for the full chart catalog.
`;
}

function guideEditorMd(): string {
  return `# Editor

Import \`@spatika/editor/styles.css\` alongside \`@spatika/tokens/styles.css\`. \`SpatikaEditor\` wraps Tiptap with quiet toolbar, slash commands, @mentions, tables, resizable images, and generic AI hooks. Use \`useSpatikaEditor\` when you need a fully custom chrome.

\`\`\`tsx
${RECIPE_EDITOR}
\`\`\`

See [components.md](./components.md) for the editor catalog. \`RichTextEditor\` in \`@spatika/react\` is deprecated — migrate to \`SpatikaEditor\`.
`;
}

function guideSchedulerMd(): string {
  return `# Scheduler

\`EventCalendar\` covers month, week, day, and agenda with create, edit, drag, resize, and recurrence. \`EventTimeline\` lays the same \`SchedulerEvent\` types on resource rows. Both ship in \`@spatika/react\`.

\`\`\`tsx
${RECIPE_SCHEDULER}
\`\`\`

See [components.md](./components.md) for EventCalendar and EventTimeline.
`;
}

function componentsIndexMd(): string {
  const groups = componentCategories
    .map((category) => {
      const items = components.filter((item) => item.category === category);
      if (!items.length) return "";
      const rows = items
        .map(
          (item) =>
            `- [${item.name}](./${item.slug}.md) — ${item.description} (\`${primaryImport(item)}\`)`,
        )
        .join("\n");
      return `## ${category}\n\n${rows}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return `# Spatika UI components

Import every component from \`@spatika/react\`. Fetch a component file for the canonical snippet.

${groups}
`;
}

export function llmsTxt(): string {
  const catalog = components
    .map(
      (item) =>
        `- [${item.name}](${SITE.url}/docs/${item.slug}.md): ${item.description}`,
    )
    .join("\n");

  return `# Spatika UI

> Glass React design system. Packages: \`@spatika/tokens\`, \`@spatika/react\`, \`@spatika/charts\`, \`@spatika/editor\`. Docs: ${SITE.url}

Spatika (Sanskrit स्फटिक, crystal — often spelled Spadik) ships CSS tokens, four themes, and production React composites.

${RULES}

## Guides
- [Install](${SITE.url}/docs/install.md)
- [Theming](${SITE.url}/docs/theming.md)
- [Customize](${SITE.url}/docs/customize.md)
- [App shell](${SITE.url}/docs/app-shell.md)
- [Cover pages](${SITE.url}/docs/cover-pages.md)
- [Forms](${SITE.url}/docs/forms.md)
- [Charts](${SITE.url}/docs/charts.md)
- [Editor](${SITE.url}/docs/editor.md)
- [Scheduler](${SITE.url}/docs/scheduler.md)
- [Component index](${SITE.url}/docs/components.md)
- [Full dump](${SITE.url}/llms-full.txt)
- [Agent rules](${SITE.url}/AGENTS.md)
- [Cursor skill](${SITE.url}/skills/spatika-ui/SKILL.md)
- [Design language](${SITE.url}/design)
- [Customize](${SITE.url}/customize)
- [Human docs](${SITE.url}/components)

## Components
${catalog}
`;
}

export function llmsFullTxt(): string {
  const catalog = componentCategories
    .map((category) => {
      const items = components.filter((item) => item.category === category);
      if (!items.length) return "";
      const rows = items
        .map(
          (item) =>
            `- ${item.name} (\`${primaryImport(item)}\`) — ${item.description}\n  ${SITE.url}/docs/${item.slug}.md`,
        )
        .join("\n");
      return `### ${category}\n\n${rows}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return `# Spatika UI — agent reference

Packages: \`@spatika/tokens\` + \`@spatika/react\`. Site: ${SITE.url}

## Install

\`\`\`bash
${INSTALL.both}
\`\`\`

\`\`\`tsx
${RECIPE_BOOTSTRAP}
\`\`\`

${RULES}

## Recipes

### Theming

\`\`\`tsx
${RECIPE_THEMING}
\`\`\`

### Create a theme

\`\`\`tsx
${RECIPE_CREATE_THEME}
\`\`\`

### Breakpoints

\`\`\`tsx
${RECIPE_BREAKPOINTS}
\`\`\`

### App shell

\`\`\`tsx
${RECIPE_APP_SHELL}
\`\`\`

### Cover pages

\`\`\`tsx
${RECIPE_COVER}
\`\`\`

### Forms

\`\`\`tsx
${RECIPE_FORM}
\`\`\`

### Charts

\`\`\`tsx
${RECIPE_CHART}
\`\`\`

### Editor

\`\`\`tsx
${RECIPE_EDITOR}
\`\`\`

## Components

${catalog}

Fetch the linked \`.md\` file for the canonical snippet. Prop types live in \`@spatika/react/dist/index.d.ts\`.
`;
}

export function componentsJson(): string {
  return `${JSON.stringify(
    {
      name: "Spatika UI",
      packages: ["@spatika/tokens", "@spatika/react", "@spatika/charts", "@spatika/editor"],
      docs: SITE.url,
      llms: `${SITE.url}/llms.txt`,
      themes: ["mukta", "neelam", "usha", "sandhya"],
      components: components.map((item) => ({
        slug: item.slug,
        name: item.name,
        importName: primaryImport(item),
        category: item.category,
        description: item.description,
        docs: `${SITE.url}/docs/${item.slug}.md`,
        humanDocs: `${SITE.url}/components/${item.slug}`,
      })),
    },
    null,
    2,
  )}\n`;
}

function assertCatalogCoverage() {
  const missing = components.filter((item) => !SNIPPETS[item.slug]);
  if (missing.length) {
    throw new Error(
      `Agent docs missing snippets: ${missing.map((item) => item.slug).join(", ")}`,
    );
  }
}

export function agentDocFiles(): AgentDocFile[] {
  assertCatalogCoverage();
  const files: AgentDocFile[] = [
    { path: "llms.txt", body: llmsTxt(), contentType: "text/plain; charset=utf-8" },
    { path: "llms-full.txt", body: llmsFullTxt(), contentType: "text/plain; charset=utf-8" },
    { path: "docs/install.md", body: guideInstallMd(), contentType: "text/markdown; charset=utf-8" },
    { path: "docs/theming.md", body: guideThemingMd(), contentType: "text/markdown; charset=utf-8" },
    { path: "docs/customize.md", body: guideCustomizeMd(), contentType: "text/markdown; charset=utf-8" },
    { path: "docs/app-shell.md", body: guideAppShellMd(), contentType: "text/markdown; charset=utf-8" },
    { path: "docs/cover-pages.md", body: guideCoverMd(), contentType: "text/markdown; charset=utf-8" },
    { path: "docs/forms.md", body: guideFormsMd(), contentType: "text/markdown; charset=utf-8" },
    { path: "docs/charts.md", body: guideChartsMd(), contentType: "text/markdown; charset=utf-8" },
    { path: "docs/editor.md", body: guideEditorMd(), contentType: "text/markdown; charset=utf-8" },
    { path: "docs/scheduler.md", body: guideSchedulerMd(), contentType: "text/markdown; charset=utf-8" },
    { path: "docs/components.md", body: componentsIndexMd(), contentType: "text/markdown; charset=utf-8" },
    {
      path: "docs/components.json",
      body: componentsJson(),
      contentType: "application/json; charset=utf-8",
    },
    ...components.map((entry) => ({
      path: `docs/${entry.slug}.md`,
      body: componentMarkdown(entry),
      contentType: "text/markdown; charset=utf-8",
    })),
  ];
  return files;
}
