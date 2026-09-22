# @spatika/tokens

## 2.2.0

### Minor Changes

- `AppShell` gains an opt-in `mobileNavBreakpoint` prop (`"lg"` default, unchanged; `"md"` = 768px). Shells that pass `mobileNavBreakpoint="md"` get the real sidebar starting at tablet width instead of the bottom bar + drawer, which now only takes over below 768px.

## 2.1.0

### Minor Changes

- 9f8dfe5: Add a marketing layer: landing, pricing and story pages are now first-class.

  **New components** — `MarketingSection`, `SectionBackdrop`, `MarketingHero`, `AnnouncementPill`,
  `FeatureGrid` / `FeatureCard`, `BentoGrid` / `BentoCard`, `PricingTable` / `PricingCard`,
  `TestimonialCard`, `LogoCloud`, `StatBand`, `StepFlow`, `CtaBand`, `FaqSection` (with optional
  FAQPage JSON-LD), `Marquee`, `Reveal`, `ShowcaseFrame`, `Prose`, `LeadForm`, `SplitFeature` /
  `SplitFeatureGroup`, `ComparisonTable` and `ArticleCard`.

  **`SiteFooter` gains a tall layout** — pass `columns` for a sitemap footer with `description`,
  an `action` slot for a signup form, `social` links and a `legal` row. The existing slim row is
  unchanged when `columns` is omitted, so this is additive.

  **New tokens** — a fluid `--spk-text-hero` scale above `display`, marketing rhythm tokens
  (`--spk-mk-section-py`, `--spk-mk-max`, `--spk-mk-measure`), and a `marketing-blocks.css`
  recipe layer covering backdrops, the facet sheen, marquee, reveal, frames and prose.

  Decoration is opt-in and derived from theme tokens, so every wash retints across the four
  themes; `prefers-reduced-motion` stops all entrances, loops, sheens and tilts, and
  `prefers-reduced-transparency` solidifies the washes. `tone="inverse"` and `tone="accent"`
  re-point the semantic tokens on a band, so nested components invert without hand-painted
  colours.

## 2.0.0

### Major Changes

- 7daf0d0: Spatika 2.0 — a calm, information-first design language.

  **Tokens.** A new semantic layer (`--spk-canvas`, `--spk-surface*`, `--spk-text-*`, `--spk-border*`,
  `--spk-accent*`, status, elevation, motion, density and `--spk-viz-1…8`) with per-theme base values
  and derived states. Dark themes are designed rather than inverted. All 1.x variables
  (`--primary`, `--card`, `--border`, `--radius-card`, `--glass-*`, `--chart-1`…) remain as aliases, and
  Tailwind's `rounded-*` / `shadow-*` scales are remapped to the restrained Spatika scales.

  **Surfaces.** Glass is no longer the foundation: `.glass*` classes now render as calm solid material
  and translucency is opt-in through `surface="glass"` / `.spk-glass` for chrome floating over content
  or media. New surface model on `Card` (`default · raised · subtle · sunken · outline · glass · transparent`).

  **Recipes.** Interaction states (hover, focus, pressed, selected, disabled, invalid) moved into a
  shared recipe layer — `.spk-btn`, `.spk-field`, `.spk-check`, `.spk-switch`, `.spk-item`,
  `.spk-overlay`, `.spk-table`, `.spk-nav-item`, `.spk-metric` — so components stop repeating class
  soup and non-React markup can use the same language.

  **Density.** Control height, row height, cell padding and card padding are tokens;
  `data-density="compact" | "comfortable" | "spacious"` (or `<AppShell density>`) retunes a whole region.
  Coarse pointers get ≥44px controls automatically.

  **New components.** `AppShell`, `Sidebar`, `NavSection`, `NavItem`, `TopBar`, `SearchTrigger`,
  `WorkspaceSwitcher`, `UserMenu`, `CommandPalette`, `DataTable`, `Metric`, `MetricGroup`, `Delta`,
  `PageSection`, `Panel`, plus `formatNumber` / `formatCurrency` / `formatPercent` / `formatCompact`,
  `surfaceClass`, `DialogBody`, `CommandFooter`, and `Combobox` / `SearchInput` aliases.

  **Accessibility.** One visible focus ring everywhere; roving tabindex and arrow keys for `Tabs`,
  `SegmentedControl`, `RadioGroup` and `Select`; dialog/sheet labelling wired automatically; tooltips
  described and Escape-dismissible; `FormField` injects `aria-describedby` / `aria-invalid`; toasts
  announce politely; status badges support a non-colour dot; reduced-motion and reduced-transparency
  are honoured.

  **Responsive.** Dialogs become bottom sheets on phones, `DataTable` becomes a stacked list, the
  sidebar becomes a sheet, and tables keep pinned columns with a horizontal overflow strategy.

  **Charts.** Calmer per-theme palette (8 colours), hairline grid, thinner strokes, smaller marks,
  lighter area fills, overlay tooltips and tabular numerals.

  **Editor & calendar.** Editor chrome moved off glass variables onto the semantic tokens (and list
  markers are restored); calendar views use hairline grids, token-tinted events with a tone rail, and a
  fixed week-range label.

  No component or prop was removed. `GlassCard`, `SurfaceCard`, `StatCard`, `PageShell`, `AppHeader`,
  `FloatingPageChromeBar` and `Button variant="gradient"` are deprecated but still work.
  See `docs/redesign/MIGRATION.md`.

## 1.6.0

## 1.5.0

### Minor Changes

- 163b0bf: Add `@spatika/editor` — Tiptap v3 rich text editor with Spatika glass theming.

  **New package (`@spatika/editor`)**

  - `SpatikaEditor` composite with ribbon/compact toolbar, bubble menus, slash commands, and @mentions
  - Headless `useSpatikaEditor` + composable toolbar/menu primitives
  - Insert panels: link popover, table grid picker, image drop/upload with resizable image NodeView
  - Extended formatting: strike, inline/code block, task lists, highlight, text color, sub/superscript, justify alignment
  - BYO-AI hooks: `onAiCommand`, customizable `aiCommandMenu`, Tiptap-style bottom AI dock (default) or toolbar placement
  - Mobile: horizontal toolbar scroll, 44px touch targets, safe-area dock padding, optional `mobileFullscreen`
  - Import `@spatika/editor/styles.css` alongside `@spatika/tokens/styles.css`

  **`@spatika/react`**

  - Re-export `SpatikaEditor`, `useSpatikaEditor`, and editor types from `@spatika/editor`
  - Deprecate the basic `RichTextEditor` contenteditable shim (still available)

  Ready for journalD to replace its custom editor via `SpatikaEditor` + app-specific `toolbarActions`, `extensions`, and `imageInsert.onUpload`.

### Patch Changes

- 6fe9585: Fix chart plot layout: percent pie radii, fillHeight without a 280px fallback, auto horizontal-bar gutters, itemColors that win over CSS fill, dashed/gapped series, axis valueFormatter, sparkline hover, and tooltip title de-dupe.
- 4e47ccd: Add chart empty/loading overlays, legend positions, rotated ticks, reversed axes, bar background tracks, and pie label lines.
- 6fe9585: Extract SVG charts into `@spatika/charts` so apps can install plots without the full UI kit, and add Recharts-parity syncId, shared tooltips, reference area/dot, error bars, 100% stack offset, and ResponsiveContainer.

## 1.4.0

### Patch Changes

- 8110f42: Charts gain item click, per-mark colors, custom tooltips, reference lines, bar labels, and fill-height so hosts can wire navigation without forking the plot.

## 1.3.1

### Patch Changes

- 323bbf4: Point npm package pages at spatika.sweyam.com (homepage, READMEs, and tokens bugs URL).

## 1.3.0

### Minor Changes

- 5ec7579: Make EventCalendar customizable while keeping the kit editor, chips, and toolbar as defaults. Hosts can hide EventEditor, render event chips, replace the toolbar, and attach opaque `data` on SchedulerEvent.

## 1.2.0

### Minor Changes

- 29b4033: Add Spatika-native SVG charts covering the MUI X catalog, plus composition (mixed plots), zoom/pan, brush, dual axes, highlighting, toolbar export (SVG/PNG), dataset helper, WebGL scatter, GeoJSON maps, isometric 3D bar/pie, and a table+chart data grid. Comparison funnels, stacked areas, heatmap color scales, segmented gauges, and sparkline KPI cards match the MUI X dashboard patterns.
- 29b4033: Add Material-style primitives covering the core MUI catalog (Accordion through Autocomplete, Grid, Menu, Snackbar, and related layout/form/feedback components).
- Add `animate-progress-indeterminate` for linear progress bars.

### Patch Changes

- Contain CoverHero and ProfileHero covers unless bleed is on, align the profile identity notch with the avatar, and give EntityMediaCard / ImageList a consistent media layout.
- 29b4033: Fix FloatingPageChromeBar docs/showcase previews: keep the glass tray pinned above a nested scroller so the list scrolls under the bar without a double header gap.

## 1.1.0

### Minor Changes

- Add marketing-site primitives: Tag, SectionHeading, SiteNav, SiteFooter, and a metric StatCard variant.
- Add `marketing.css`: gradient type, accent rule, nav enter, and float motion used by the marketing composites.

## 1.0.0

### Major Changes

- 85239d3: Rename the design system to Spatika. Packages move to `@spatika/tokens` and `@spatika/react`; theme APIs, CSS helpers, and data attributes use the `spk` prefix.

### Minor Changes

- b8ba16a: Sync page chrome with journalD: liquid-glass toolbar tray, cover-bleed heroes, EntityCard rows, FilterSheet, and the iOS 26 tab bar.
- 85239d3: Name the four themes Mukta, Neelam, Usha, and Sandhya. CSS classes and theme ids follow those names.

## 0.2.0

### Minor Changes

- Export theme providers, add touch button sizes, reduced-motion and focus utilities, and Vitest coverage for core React primitives.
