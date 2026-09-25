# @spatika/react — agent guide

React design system for product UI. Packages: `@spatika/tokens`, `@spatika/react`, `@spatika/charts`, `@spatika/editor`.
Human docs: https://spatika.sweyam.com · Machine index: https://spatika.sweyam.com/llms.txt

## Use this library

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

### Must do
- Import `@spatika/tokens/styles.css` before any component
- Wrap the app in `<SpatikaThemeProvider>`
- Import from `@spatika/react` — never invent Spatika components
- Use semantic tokens (`--spk-*` or the Spatika utility bridge: `bg-surface`, `text-fg-secondary`, `border-line`), never hardcoded hex
- Structure pages with `PageSection` / `PageHeader`; reach for a `Card` only when the thing *is* an object
- Solid surfaces by default — `surface="glass"` only for chrome floating over content or media
- Set density with `data-density="compact"` (or `<AppShell density>`) instead of resizing controls by hand
- Numbers people compare get `.spk-numeric` (tables, metrics and charts already do)
- Animate colour, shadow and transform only

### Themes
`mukta` (neutral light, default) · `neelam` (designed dark) · `usha` (warm light) · `sandhya` (warm dark, flat)

Brand overlay: `createTheme({ id, extends, palette })` passed as `customThemes` on `SpatikaThemeProvider`.
Breakpoints: `BREAKPOINTS` (`xs` 0 / `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280) with `Grid` `xs`–`xl`
and `useIsMobile` / `useBreakpoint`. Guide: https://spatika.sweyam.com/customize

### When to use

| Need | Component |
|---|---|
| Application frame | `AppShell` + `Sidebar` / `NavSection` / `NavItem` / `TopBar` |
| Workspace + account menus | `WorkspaceSwitcher`, `UserMenu` |
| ⌘K palette | `SearchTrigger` + `CommandPalette` |
| Page title block | `PageHeader` |
| Page section (no box) | `PageSection` |
| Framed object (chart, table, feed) | `Panel` |
| Container for a record | `Card` (`surface="default" \| "raised" \| "subtle" \| "sunken" \| "glass"`) |
| KPI / metric strip | `Metric`, `MetricGroup`, `Delta` |
| Professional table | `DataTable` |
| Simple table | `Table` (+ `density`, `stickyHeader`, sortable `TableHead`) |
| Labeled field | `FormField` + `Input` / `Select` / `Textarea` |
| Filters | `FilterSheet` + `ChipGroup`, or `DataTable` `toolbar` |
| Empty list | `EmptyState` |
| Titled modal | `Dialog` (bottom sheet on phones) · destructive confirm: `AlertDialog` |
| Side panel | `Sheet` · mobile drawer: `BottomSheet` |
| Toast stack | `Toaster` + `useToast` |
| Mobile navigation | `MobileTabBar` (pass to `AppShell mobileNav`) |
| Charts | `BarChart`, `LineChart`, `AreaChart`, `SparkLineChart`, `PieChart`, `ChartContainer` from `@spatika/charts` |
| Rich text | `SpatikaEditor` from `@spatika/editor` (import `@spatika/editor/styles.css`) |
| Calendar | `EventCalendar` · resources over time: `EventTimeline` |
| Numbers | `formatNumber`, `formatCurrency`, `formatPercent`, `formatCompact` |
| Number / tags / one-time code | `NumberInput`, `TagInput`, `OtpInput` |
| File picking | `FileUpload` (dropzone + file list, `formatBytes`) |
| Date entry | `DatePicker`, `DateRangePicker` (typed + calendar) · typed only: `DateInput` |
| Time entry | `TimeInput` (value is 24-hour `HH:mm`) |
| Hierarchy | `TreeView` |
| Key–value record | `DescriptionList` |
| Long list (1000s of rows) | `VirtualList` |
| Adjustable split | `ResizablePanels` |
| Right-click actions | `ContextMenu` (same items as `DropdownMenu`) |
| Form-level errors | `FormErrorSummary` (focus it on submit) |
| Outcome screen (success, error, 404) | `ResultState` · empty list: `EmptyState` |
| Column visibility | `DataTable hiddenColumns` + `DataTableColumnsMenu` |

1.x chrome (`PageShell`, `AppHeader`, `FloatingPageChromeBar`, `GlassCard`, `CoverHero`) still works
and is restyled; prefer `AppShell` + `Card surface` in new code. See `docs/redesign/MIGRATION.md`.

Canonical snippets: https://spatika.sweyam.com/docs/components.md
Prop types: `node_modules/@spatika/react/dist/index.d.ts`

Cursor skill (copy into the consumer repo):
`node_modules/@spatika/react/skills/spatika-ui/` → `.cursor/skills/spatika-ui/`

Design language: https://spatika.sweyam.com/design · Upgrading from 1.x: https://spatika.sweyam.com/guides
