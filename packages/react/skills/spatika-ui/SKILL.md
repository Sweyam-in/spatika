---
name: spatika-ui
description: Build UI with Spatika React components from @spatika/react. Use when adding pages, forms, dashboards, data tables, app shells, dialogs, charts, or when the user mentions Spatika, Spadik, @spatika/react, or the Spatika design system.
---

# Spatika UI

React design system for product UI — SaaS, finance, productivity, admin. Never invent Spatika
components. Import from `@spatika/react`. Fetch https://spatika.sweyam.com/llms.txt for the live catalog.

## Bootstrap

```bash
npm install @spatika/tokens @spatika/react
```

```tsx
import "@spatika/tokens/styles.css";
import { SpatikaThemeProvider, Button } from "@spatika/react";

export function App() {
  return (
    <SpatikaThemeProvider defaultTheme="mukta">
      <Button>Hello Spatika</Button>
    </SpatikaThemeProvider>
  );
}
```

## Rules

- Import `@spatika/tokens/styles.css` before any component; wrap the tree in `SpatikaThemeProvider`
- Themes: `mukta` (light, default) | `neelam` (dark) | `usha` (warm light) | `sandhya` (warm dark).
  Brand palettes: `createTheme` + `customThemes`
- Semantic tokens only — `--spk-*` or the Spatika utility bridge (`bg-surface`, `text-fg-secondary`,
  `border-line`, `text-title-2`). No hardcoded hex, no `bg-white` / `text-black`
- Structure pages with `PageHeader` + `PageSection`. A `Card` is for a thing, not for a section
- Surfaces are solid; `surface="glass"` only for chrome floating over content or media
- Density comes from tokens: `data-density="compact"` on a region, or `<AppShell density="compact">`
- Prefer composites over restyling primitives; merge extras through `className`
- Animate colour, shadow and transform only

## Application shell

```tsx
<AppShell
  sidebar={
    <Sidebar
      header={<WorkspaceSwitcher workspaces={workspaces} value={id} onValueChange={setId} />}
      footer={<UserMenu name="Maya Okafor" email="maya@sweyam.com">{menuItems}</UserMenu>}
    >
      <NavSection>
        <NavItem icon={<Home />} label="Overview" active />
        <NavItem icon={<Users />} label="Customers" meta="1,284" />
      </NavSection>
    </Sidebar>
  }
  topbar={<TopBar title="Customers"><SearchTrigger onOpen={() => setPalette(true)} /></TopBar>}
  mobileNav={<MobileTabBar items={tabs} />}
>
  {page}
</AppShell>
<CommandPalette open={palette} onOpenChange={setPalette} groups={groups} />
```

## Data-heavy UI

```tsx
<MetricGroup columns={4}>
  <Metric label="MRR" value={184320} format="currency" precision={0} delta={0.064} caption="vs August" />
  <Metric label="Churn" value={0.018} format="percent" delta={-0.004} deltaIntent="inverse" />
</MetricGroup>

<DataTable
  aria-label="Customers"
  data={rows}
  columns={columns}         // { id, header, accessor, cell?, sortable?, numeric?, pin?, hideBelow?, mobile? }
  getRowId={(r) => r.id}
  density="compact"
  selectable
  pageSize={20}
  bulkActions={(selected, clear) => <Button size="xs" variant="secondary" onClick={clear}>Export {selected.length}</Button>}
/>
```

`format`/`formatNumber` handle currency, percent and compact notation; deltas colour by intent
(`inverse` when up is bad).

## Customize

```tsx
const brand = createTheme({
  id: "brand",
  extends: "mukta",
  palette: { primary: "#7c3aed", primaryForeground: "#ffffff", ring: "#7c3aed" },
});

<SpatikaThemeProvider defaultTheme="brand" customThemes={[brand]}>…</SpatikaThemeProvider>
```

Breakpoints: `BREAKPOINTS` (`xs` 0 / `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280). `Grid` `xs`–`xl`,
`useIsMobile()`, `useBreakpoint()`. Guide: https://spatika.sweyam.com/docs/customize.md

## Pick a component

| Need | Use |
|---|---|
| App frame | `AppShell`, `Sidebar`, `NavSection`, `NavItem`, `TopBar` |
| ⌘K | `SearchTrigger` + `CommandPalette` |
| Page title / section | `PageHeader`, `PageSection` |
| Framed chart or table | `Panel` |
| Record container | `Card surface="default \| raised \| subtle \| sunken \| glass"` |
| KPI | `Metric`, `MetricGroup`, `Delta` |
| Table | `DataTable` (rich) or `Table` (simple) |
| Field | `FormField` + `Input` / `Textarea` / `Select` / `Combobox` |
| Status | `Badge` (`dot` for non-colour cue), `Tag`, `StatusDot` |
| Overlay | `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `DropdownMenu`, `Tooltip` |
| Feedback | `Toaster` + `useToast`, `Alert`, `EmptyState`, `Skeleton`, `Progress` |
| Charts | `@spatika/charts`: `BarChart`, `LineChart`, `AreaChart`, `PieChart`, `SparkLineChart`, `ChartContainer` |
| Calendar | `EventCalendar`, `EventTimeline` |
| Rich text | `SpatikaEditor` (import `@spatika/editor/styles.css`) |
| Specialised inputs | `NumberInput`, `TagInput`, `OtpInput`, `FileUpload`, `DatePicker`, `DateRangePicker` |
| Structure | `TreeView`, `DescriptionList`, `VirtualList`, `ResizablePanels`, `ScrollArea`, `AspectRatio` |
| Outcomes | `ResultState`, `FormErrorSummary` · right-click: `ContextMenu` |

## Marketing pages

Landing, pricing and story pages are stacked bands, not cards. `MarketingSection` is the
marketing counterpart to `PageSection`; decoration is opt-in and derived from theme tokens.

| Need | Use |
|---|---|
| Page band | `MarketingSection` (`tone`, `width`, `edge`, `backdrop`) |
| Decorative wash | `SectionBackdrop` — `aurora` \| `glow` \| `grid` \| `dots` \| `rays` |
| Hero | `MarketingHero` (+ `AnnouncementPill`) |
| Features | `FeatureGrid` + `FeatureCard`, or `BentoGrid` + `BentoCard` |
| Alternating story | `SplitFeature` in a `SplitFeatureGroup` (sides alternate automatically) |
| Plans | `PricingTable` + `PricingCard` (`featured`, `badge`, excluded features) |
| Feature matrix | `ComparisonTable` (`columns` + `rows` or `groups`; booleans get hidden text) |
| Social proof | `TestimonialCard`, `LogoCloud`, `Marquee`, `StatBand` |
| How it works | `StepFlow` |
| Closing ask | `CtaBand` (`tone="accent" \| "inverse" \| "surface"`) |
| Questions | `FaqSection` (`structuredData` emits FAQPage JSON-LD) |
| Screenshot chrome | `ShowcaseFrame` (`browser` \| `window` \| `phone`, `tilt`, `shine`) |
| Scroll entrance | `Reveal` (`delay={index * 80}` to stagger) |
| Long-form copy | `Prose` (`html` for CMS markup, `lead` for a standfirst) |
| Email capture | `LeadForm` (`onSubmit` returning a promise drives the pending state) |
| Blog listing | `ArticleCard` |
| Marketing nav / footer | `SiteNav`, `SiteFooter` (pass `columns` for the tall sitemap footer), `Wordmark` |

```tsx
<MarketingSection backdrop="aurora">
  <MarketingHero
    layout="split"
    announcement={<AnnouncementPill href="/changelog" tag="New">v2.1 is out</AnnouncementPill>}
    title="Ship the interface, not the CSS"
    lede="One sentence on what it does and who it is for."
    actions={<><Button size="lg">Get started</Button><Button size="lg" variant="secondary">Docs</Button></>}
    media={<ShowcaseFrame url="app.sweyam.com" tilt><img src="/shot.png" alt="" /></ShowcaseFrame>}
  />
</MarketingSection>
```

`tone="inverse"` / `tone="accent"` re-point the semantic tokens on the band, so nested
components invert automatically — never hand-paint colours inside them.

1.x components (`GlassCard`, `PageShell`, `AppHeader`, `FloatingPageChromeBar`, `CoverHero`) still
work and are restyled — prefer the 2.0 equivalents above in new code.
