# @spatika/react

React primitives, composites and application patterns for **Spatika UI** — a calm, information-first design system for SaaS, finance, productivity and admin software. Semantic tokens, four themes, density control, an application shell, data tables, metrics, charts, a calendar and an editor.

**Docs:** [spatika.sweyam.com](https://spatika.sweyam.com) · Machine index: [llms.txt](https://spatika.sweyam.com/llms.txt)

## Install

```bash
npm install @spatika/react @spatika/tokens
```

Peer dependencies: `react` and `react-dom` (^18 or ^19).

## Quick start

```tsx
import "@spatika/tokens/styles.css";
import { AppShell, Button, NavItem, NavSection, Sidebar, TopBar } from "@spatika/react";

export function App() {
  return (
    <AppShell
      sidebar={
        <Sidebar>
          <NavSection>
            <NavItem label="Overview" active />
            <NavItem label="Customers" meta="1,284" />
          </NavSection>
        </Sidebar>
      }
      topbar={<TopBar title="Overview" actions={<Button size="sm">New</Button>} />}
    >
      <Page />
    </AppShell>
  );
}
```

## Themes

Set a theme class on `<html>`: default Mukta, `neelam`, `usha`, or `sandhya`.

```tsx
import { applyTheme, SpatikaThemeProvider } from "@spatika/react";

applyTheme("neelam");

// or wrap the app
<SpatikaThemeProvider defaultTheme="neelam">
  <App />
</SpatikaThemeProvider>
```

Button sizes include `touch` / `icon-touch` (≥44px) for mobile-first chrome.

## What's included

- **Primitives** — Button, ButtonGroup, Accordion, Autocomplete, Grid, Menu, Dialog, Stepper, List, Fab, and more
- **Composites** — AppHeader, AppSidebar, Card, EntityCard, FloatingPageChrome, CoverHero, FilterSheet, MobileTabBar, CommandSearchField, NotificationBell, Timeline, EventCalendar, EventTimeline, AmountInput, SegmentedControl, Toaster, media cards, PIN/lock chrome, SiteNav, SiteFooter, SectionHeading, Tag
- **Charts** — install `@spatika/charts` (also re-exported from `@spatika/react`). SVG plots covering the MUI X catalog, plus `ChartContainer` composition (mixed plots, zoom/pan, brush, `syncId`, shared tooltips, dual axes, toolbar export)

## Tailwind tip

Prefer `@spatika/tokens/styles.css`. If you compile Tailwind in your app and only import token partials, also scan kit sources:

```css
@import "tailwindcss";
@source "../node_modules/@spatika/react/src/**/*.{ts,tsx}";
```

## Docs

Human docs and live previews: [spatika.sweyam.com](https://spatika.sweyam.com)

Run the documentation site from the monorepo root:

```bash
npm run dev
```

Packages on npm: [spatika scope](https://www.npmjs.com/org/spatika)

## License

MIT
