---
name: spatika-ui
description: Build UI with Spatika React components from @spatika/react. Use when adding pages, forms, dashboards, data tables, app shells, dialogs, charts, or when the user mentions Spatika, Spadik, @spatika/react, or the Spatika design system.
---

# Spatika UI

React design system for product UI: SaaS, finance, productivity, and admin interfaces. Never invent
Spatika components. Import from `@spatika/react`. Fetch https://spatika.sweyam.com/llms.txt for the
live catalog, or use the Spatika MCP server when it is configured.

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

- Import `@spatika/tokens/styles.css` before any component; wrap the tree in `SpatikaThemeProvider`.
- Themes: `mukta` (light, default), `neelam` (dark), `usha` (warm light), `sandhya` (warm dark).
- Brand palettes use `createTheme({ id, extends, palette })` and `customThemes`.
- Use semantic tokens only: `--spk-*` or utilities such as `bg-surface`, `text-fg-secondary`, `border-line`.
- Do not use hardcoded hex, `bg-white`, or `text-black` inside Spatika UI.
- Structure pages with `PageHeader` and `PageSection`; use `Card` only for a concrete record/object.
- Use solid surfaces by default; `surface="glass"` is for chrome floating over content or media.
- Density comes from tokens: `data-density="compact"` on a region or `<AppShell density="compact">`.
- Prefer composites over restyling primitives; pass local tweaks through `className`.
- Animate color, shadow, and transform only.

## Pick A Component

| Need | Use |
|---|---|
| App frame | `AppShell`, `Sidebar`, `NavSection`, `NavItem`, `TopBar` |
| Workspace/account menus | `WorkspaceSwitcher`, `UserMenu` |
| Command palette | `SearchTrigger` + `CommandPalette` |
| Page title/section | `PageHeader`, `PageSection` |
| Framed chart/table/feed | `Panel` |
| Record container | `Card surface="default \| raised \| subtle \| sunken \| glass"` |
| KPI strip | `Metric`, `MetricGroup`, `Delta` |
| Rich table | `DataTable` |
| Simple table | `Table` |
| Labeled field | `FormField` + `Input` / `Select` / `Textarea` / `Combobox` |
| Filters | `FilterSheet` + `ChipGroup`, or `DataTable` `toolbar` |
| Empty list | `EmptyState` |
| Modal/confirm | `Dialog`, `AlertDialog` |
| Side panel | `Sheet`, `BottomSheet` |
| Toasts | `Toaster` + `useToast` |
| Charts | `BarChart`, `LineChart`, `AreaChart`, `PieChart`, `SparkLineChart`, `ChartContainer` |
| Rich text | `SpatikaEditor` from `@spatika/editor` plus `@spatika/editor/styles.css` |
| Calendar | `EventCalendar`, `EventTimeline` |

## Marketing Pages

Landing, pricing, and story pages are stacked bands, not cards. Use `MarketingSection` as the
marketing counterpart to `PageSection`; decoration is opt-in and token-derived.

| Need | Use |
|---|---|
| Page band | `MarketingSection` |
| Decorative wash | `SectionBackdrop` (`aurora`, `glow`, `grid`, `dots`, `rays`) |
| Hero | `MarketingHero` + `AnnouncementPill` |
| Features | `FeatureGrid` + `FeatureCard`, or `BentoGrid` + `BentoCard` |
| Alternating story | `SplitFeature` in `SplitFeatureGroup` |
| Plans | `PricingTable` + `PricingCard` |
| Matrix | `ComparisonTable` |
| Social proof | `TestimonialCard`, `LogoCloud`, `Marquee`, `StatBand` |
| How it works | `StepFlow` |
| Closing ask | `CtaBand` |
| Questions | `FaqSection` |
| Screenshot chrome | `ShowcaseFrame` |
| Scroll entrance | `Reveal` |
| Long-form copy | `Prose` |
| Email capture | `LeadForm` |
| Marketing nav/footer | `SiteNav`, `SiteFooter`, `Wordmark` |

`tone="inverse"` and `tone="accent"` re-point semantic tokens on the band, so nested components
invert automatically. Do not hand-paint colors inside those bands.

## Agent Docs

- Machine index: https://spatika.sweyam.com/llms.txt
- Full dump: https://spatika.sweyam.com/llms-full.txt
- Component snippets: `https://spatika.sweyam.com/docs/{slug}.md`
- Prop types: `node_modules/@spatika/react/dist/index.d.ts`
- MCP server from this repo: `npm run mcp:build && npm --silent run mcp`
