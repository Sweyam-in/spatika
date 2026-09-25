/** Copy-paste recipes shown on the Guides and Customize pages and in the agent Markdown. */

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
