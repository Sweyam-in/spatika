# Spatika UI — agent guide

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

### Marketing pages

Landing, pricing and story pages are bands, not cards — stack `MarketingSection`s and let
each own its tone and rhythm. Decoration is opt-in and token-derived.

| Need | Component |
|---|---|
| Page band (tone + rhythm + backdrop) | `MarketingSection` (marketing counterpart to `PageSection`) |
| Decorative wash | `SectionBackdrop` (`aurora` \| `glow` \| `grid` \| `dots` \| `rays`) |
| Hero | `MarketingHero` + `AnnouncementPill` |
| Feature block | `FeatureGrid` + `FeatureCard` |
| Alternating product story | `SplitFeature` + `SplitFeatureGroup` (auto-alternates sides) |
| Asymmetric overview | `BentoGrid` + `BentoCard` |
| Plans | `PricingTable` + `PricingCard` |
| Plan / competitor matrix | `ComparisonTable` |
| Quotes | `TestimonialCard` |
| Customer logos | `LogoCloud` (+ `Marquee`) |
| Proof numbers | `StatBand` |
| How it works | `StepFlow` |
| Closing ask | `CtaBand` |
| Questions (+ FAQPage JSON-LD) | `FaqSection` |
| Scroll entrance | `Reveal` |
| Product screenshot | `ShowcaseFrame` (`browser` \| `window` \| `phone`) |
| Long-form copy | `Prose` |
| Email capture | `LeadForm` |
| Blog or changelog listing | `ArticleCard` (+ `Prose` for the body) |
| Marketing nav / footer | `SiteNav`, `SiteFooter` (`columns` for the tall sitemap footer), `Wordmark` |

`tone="inverse"` and `tone="accent"` on `MarketingSection` / `CtaBand` re-point the semantic
tokens, so nested components invert on their own — never hand-paint colours inside them.
Live page: `/showcase/landing`.

1.x chrome (`PageShell`, `AppHeader`, `FloatingPageChromeBar`, `GlassCard`, `CoverHero`) still works
and is restyled; prefer `AppShell` + `Card surface` in new code. See `docs/redesign/MIGRATION.md`.

Canonical snippets: https://spatika.sweyam.com/docs/components.md
Prop types: `node_modules/@spatika/react/dist/index.d.ts`

Cursor skill (copy into the consumer repo):
`node_modules/@spatika/react/skills/spatika-ui/` → `.cursor/skills/spatika-ui/`

## Change this library

Monorepo: `packages/tokens` (CSS: tokens → recipes) → `packages/charts` → `packages/editor` →
`packages/react` (components, re-exports charts + editor) → `apps/website` (docs + showcase).

Token layering, in order — never skip one:
`theme base values → derived tokens → Spatika utility bridge → recipes (.spk-btn, .spk-field, .spk-item …) → components → patterns`.
Interaction states (hover, focus, pressed, selected, disabled) belong in the recipe layer, not in
per-component class strings.

Overlays share one dismissable-layer stack (`lib/layer-stack.ts`: `useDismissLayer`, `lockScroll`)
and one z-index scale (`--spk-z-*` = `OVERLAY_Z_INDEX`). New overlays must use both — never
hand-roll Escape or outside-click listeners.

When adding a component:
1. Export it from `packages/react/src/index.ts` (TSDoc on props becomes the API table)
2. Add a demo file in `apps/website/src/demos/app/<slug>.tsx` — it is both the live preview and the
   code shown on the page — and a docs entry in `apps/website/src/docs/app-catalog.ts`
3. Regenerate: `npm run docs:api` (props from TypeScript) and `npm run docs:demos` (demo sources)
4. Add a canonical snippet in `apps/website/src/data/agent-snippets.ts`
5. If it uses a utility class with no rule, the utilities-coverage test fails — add the rule in
   `packages/tokens/src/utilities.css`, or a recipe in `app-components.css`
6. Add a changeset: `npx changeset` (a new component is `minor`)

Checks (run before opening a PR):

| Command | What it proves |
|---|---|
| `npm test` | Unit and component tests; generated API and demo sources are current; every docs example compiles; theme contrast; utility coverage |
| `npm run typecheck` | Packages and website typecheck |
| `npm run test:e2e` | Playwright in Chromium (desktop, tablet, phone): responsive overflow, axe WCAG 2.2 AA, flows, visual baselines. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to use a system Chromium; `PW_BROWSERS=chromium,firefox,webkit` adds Firefox and WebKit (desktop + phone). CI (`.github/workflows/ci.yml`) runs all three engines |
| `npm run test:e2e -- --update-snapshots` | Only after reviewing an intended visual change |

Versioned docs (see `docs/releasing.md`): `npm run release:docs -- <site-dir>` builds the root and an
immutable `/docs/vX.Y.Z/` snapshot after `npm run version-packages`; `npm run release:docs:next -- <site-dir>`
builds `/next/`. Neither publishes or deploys. Never edit or delete an existing `docs/v*` snapshot.

Design language: [`DESIGN.md`](DESIGN.md) · Audit and rationale: [`docs/redesign/AUDIT.md`](docs/redesign/AUDIT.md)
