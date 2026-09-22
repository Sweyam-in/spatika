---
name: spatika-ui
description: Build UI with Spatika glass React components from @spatika/react. Use when adding pages, forms, app chrome, dialogs, charts, or when the user mentions Spatika, Spadik, @spatika/react, glass UI, or the Spatika design system.
---

# Spatika UI

Glass React design system. Never invent Spatika components. Import from `@spatika/react`. Fetch https://spatika.sweyam.com/llms.txt for the live catalog.

## Bootstrap

```bash
npm install @spatika/tokens @spatika/react
```

```tsx
import "@spatika/tokens/styles.css";
import { SpatikaThemeProvider, Button } from "@spatika/react";

export function App() {
  return (
    <SpatikaThemeProvider defaultTheme="neelam">
      <Button>Hello Spatika</Button>
    </SpatikaThemeProvider>
  );
}
```

## Rules

- Import `@spatika/tokens/styles.css` before any component
- Wrap the tree in `SpatikaThemeProvider`
- Themes: `mukta` | `neelam` | `usha` | `sandhya`. Brand palettes: `createTheme` + `customThemes`
- Prefer composites over restyling primitives
- Token CSS variables only — no hardcoded hex
- `size="touch"` on mobile primary actions
- Never `transition-all` on glass

## Customize

```tsx
import { Button, SpatikaThemeProvider, createTheme } from "@spatika/react";

const brand = createTheme({
  id: "brand",
  extends: "mukta",
  palette: { primary: "#7c3aed", primaryForeground: "#ffffff", ring: "#7c3aed" },
});

<SpatikaThemeProvider defaultTheme="brand" customThemes={[brand]}>
  <Button>Brand</Button>
</SpatikaThemeProvider>
```

Breakpoints: `BREAKPOINTS` (`xs` 0 / `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280). `Grid` `xs`–`xl`, `useIsMobile()`, `useBreakpoint()`. Guide: https://spatika.sweyam.com/docs/customize.md

## Pick a component

| Need | Use |
|---|---|
| Page frame | `PageShell` |
| Directory chrome | `FloatingPageChromeBar` + `FloatingPageChromeIdentity` |
| Safe-area bar | `AppHeader variant="chrome"` |
| Mobile tabs | `MobileTabBar` |
| Cover / profile | `CoverHero` / `ProfileHero` + `useCoverChromeBleed` |
| Glass panel | `GlassCard` |
| Labeled field | `TextField` |
| Filters | `FilterSheet` + `ChipGroup` |
| Empty | `EmptyState` |
| Modal | `Dialog` |
| Toasts | `Toaster` + `useToast` |
| Chart | `BarChart` / `LineChart` / `ChartContainer` from `@spatika/charts` |
| Calendar | `EventCalendar` |
| Landing page band | `MarketingSection` (+ `SectionBackdrop`) |
| Hero | `MarketingHero` + `AnnouncementPill` |
| Features | `FeatureGrid` / `BentoGrid` |
| Alternating story | `SplitFeature` + `SplitFeatureGroup` |
| Plans | `PricingTable` + `PricingCard` |
| Feature matrix | `ComparisonTable` |
| Quotes / logos | `TestimonialCard`, `LogoCloud`, `Marquee` |
| Proof numbers / steps | `StatBand`, `StepFlow` |
| Closing ask / FAQ | `CtaBand`, `FaqSection` |
| Screenshot chrome | `ShowcaseFrame` |
| Long-form copy | `Prose` |
| Email capture | `LeadForm` |
| Blog listing | `ArticleCard` |

Charts: install `@spatika/charts` (re-exported from `@spatika/react`). `onItemClick` for mark navigation, `syncId` to link hover across plots, `itemColors` for per-bar tints (inline fill so theme CSS cannot override), `renderTooltip` / `renderMark` for host chrome, `referenceLines` / `referenceAreas` for capacity guides, `fillHeight` or `ResponsiveContainer` when the parent sets height. Pie radii accept `"42%"`. Horizontal bars size the left gutter from category labels. Line/area series accept `strokeDasharray` and `connectNulls`. `yAxis.valueFormatter` formats ticks; `yAxis.reversed` flips the domain. `xAxis.tickAngle` rotates category labels. `stackOffset="expand"` is 100% stacked. `legendPosition`, `loading`, and `emptyText` cover layout and fetch states. Bar charts accept `showBarBackground`. Pie `labelLine` draws outside labels. SparkLineChart hover takes optional `labels`.

Prefer `toolbarDensity="compact"` and `showDateJump` for a dense product toolbar. `NativeSelect size="sm"` is the compact pill. `onVisibleRangeChange` is the fetch window (`end` exclusive). Use `showEventEditor={false}` when the host owns create/edit.

## App shell

```tsx
import {
  AppHeader,
  Button,
  FloatingPageChromeBar,
  FloatingPageChromeIdentity,
  FloatingPageChromeSearchField,
  MobileTabBar,
  PageShell,
} from "@spatika/react";
import { Home, Search, User } from "lucide-react";

<PageShell>
  <AppHeader variant="chrome" title="Spatika" />
  <FloatingPageChromeBar
    identity={<FloatingPageChromeIdentity title="Leads" count={128} />}
    search={
      <FloatingPageChromeSearchField value={query} onChange={setQuery} placeholder="Search…" />
    }
    actions={<Button size="sm">New</Button>}
  >
    <main className="app-tabbar-clearance px-4 py-6">{children}</main>
  </FloatingPageChromeBar>
  <MobileTabBar
    items={[
      { id: "home", label: "Home", icon: Home, active: true },
      { id: "search", label: "Search", icon: Search },
      { id: "you", label: "You", icon: User },
    ]}
  />
</PageShell>
```

## Next

1. Fetch the customize guide: `https://spatika.sweyam.com/docs/customize.md`
2. Fetch the component markdown: `https://spatika.sweyam.com/docs/{slug}.md`
3. Read prop types from `node_modules/@spatika/react/dist/index.d.ts`
4. Icons in examples use `lucide-react`
