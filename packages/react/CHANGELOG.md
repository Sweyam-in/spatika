# @spatika/react

## 2.3.0

### Minor Changes

- Remove the Tailwind build dependency from Spatika tokens and ship a first-party CSS utility layer generated from hand-authored token, recipe, and utility files. The package output now uses Spatika-owned `--spk-*` theme variables, reset rules, component recipes, chart/editor styles, and compatibility utility classes without invoking the Tailwind CLI or publishing Tailwind-generated `--tw-*` scaffolding.

  This release also restores responsive component fidelity after the build change: DataTable phone layouts now render as compact record rows, panel headers regain token-driven spacing, gallery/detail previews have more reliable sizing, and shell previews no longer open escaped mobile drawers from embedded demos.

  The docs theme has been refreshed with a whiter Usha canvas and a new rangoli-inspired Spatika mark across the site logo, favicon, and Open Graph image.

### Patch Changes

- Updated dependencies
  - @spatika/tokens@2.3.0
  - @spatika/charts@2.3.0
  - @spatika/editor@2.3.0

## 2.2.0

### Minor Changes

- `AppShell` gains an opt-in `mobileNavBreakpoint` prop (`"lg"` default, unchanged; `"md"` = 768px). Shells that pass `mobileNavBreakpoint="md"` get the real sidebar starting at tablet width instead of the bottom bar + drawer, which now only takes over below 768px.

### Patch Changes

- Updated dependencies
  - @spatika/tokens@2.2.0
  - @spatika/charts@2.2.0
  - @spatika/editor@2.2.0

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

### Patch Changes

- Fix floating overlays (DropdownMenu, Menu, Popover, Select) rendering invisibly when opened from inside a Dialog/Sheet/AlertDialog/Modal — they used a fixed z-index lower than the modal tier, so any menu triggered from a mobile drawer or dialog was hidden behind it. Overlays now escalate above the nearest open modal ancestor instead.
- Updated dependencies [9f8dfe5]
  - @spatika/tokens@2.1.0
  - @spatika/charts@2.1.0
  - @spatika/editor@2.1.0

## 2.0.0

### Packaging

- The ESM build now emits explicit file extensions, so Node can import the package directly —
  server rendering, React Server Components and `node --import` all work. Previously only bundlers
  could resolve the emitted specifiers.
- Test files are no longer included in the published tarball.
- Layout effects fall back to `useEffect` on the server, so rendering Spatika in SSR no longer logs
  `useLayoutEffect does nothing on the server`.

### Major Changes

- 7daf0d0: Spatika 2.0 — a calm, information-first design language.

  **Tokens.** A new semantic layer (`--spk-canvas`, `--spk-surface*`, `--spk-text-*`, `--spk-border*`,
  `--spk-accent*`, status, elevation, motion, density and `--spk-viz-1…8`) with per-theme base values
  and derived states. Dark themes are designed rather than inverted. All 1.x variables
  (`--primary`, `--card`, `--border`, `--radius-card`, `--glass-*`, `--chart-1`…) remain as aliases, and
  Spatika's utility `rounded-*` / `shadow-*` scales are remapped to the restrained Spatika scales.

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

### Patch Changes

- Updated dependencies [61b1c60]
- Updated dependencies [61b1c60]
- Updated dependencies [61b1c60]
- Updated dependencies [7daf0d0]
  - @spatika/editor@2.0.0
  - @spatika/tokens@2.0.0
  - @spatika/charts@2.0.0

## 1.6.0

### Minor Changes

- Add optional gallery quick-pick to the image insert panel (`galleryPhotos`, `onGalleryOpen`, `onGalleryPrefetch`) and expose `insertImage` on `SpatikaEditorHandle`. Prevent accidental form submission when inserting images from the panel.

### Patch Changes

- Updated dependencies
  - @spatika/editor@1.6.0
  - @spatika/tokens@1.6.0
  - @spatika/charts@1.6.0

## 1.5.0

### Minor Changes

- 4e47ccd: Add chart empty/loading overlays, legend positions, rotated ticks, reversed axes, bar background tracks, and pie label lines.
- 6fe9585: Extract SVG charts into `@spatika/charts` so apps can install plots without the full UI kit, and add Recharts-parity syncId, shared tooltips, reference area/dot, error bars, 100% stack offset, and ResponsiveContainer.
- 4e47ccd: Add `createTheme` custom palettes, exported breakpoints (`xs`–`xl`), and a Material-style customize guide covering theme overlays, CSS variables, Grid, and responsive hooks.
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
- Updated dependencies [6fe9585]
- Updated dependencies [4e47ccd]
- Updated dependencies [6fe9585]
- Updated dependencies [163b0bf]
  - @spatika/tokens@1.5.0
  - @spatika/charts@1.5.0
  - @spatika/editor@1.5.0

## 1.4.0

### Minor Changes

- 8110f42: Add a compact EventCalendar toolbar with month/year jump, NativeSelect `size="sm"`, and `onVisibleRangeChange` for host fetches.
- 8110f42: Charts gain item click, per-mark colors, custom tooltips, reference lines, bar labels, and fill-height so hosts can wire navigation without forking the plot.

### Patch Changes

- Updated dependencies [8110f42]
  - @spatika/tokens@1.4.0

## 1.3.1

### Patch Changes

- 323bbf4: Point npm package pages at spatika.sweyam.com (homepage, READMEs, and tokens bugs URL).
- Updated dependencies [323bbf4]
  - @spatika/tokens@1.3.1

## 1.3.0

### Minor Changes

- 5ec7579: Make EventCalendar customizable while keeping the kit editor, chips, and toolbar as defaults. Hosts can hide EventEditor, render event chips, replace the toolbar, and attach opaque `data` on SchedulerEvent.

### Patch Changes

- Updated dependencies [5ec7579]
  - @spatika/tokens@1.3.0

## 1.2.0

### Minor Changes

- 29b4033: Add Spatika-native SVG charts covering the MUI X catalog, plus composition (mixed plots), zoom/pan, brush, dual axes, highlighting, toolbar export (SVG/PNG), dataset helper, WebGL scatter, GeoJSON maps, isometric 3D bar/pie, and a table+chart data grid. Comparison funnels, stacked areas, heatmap color scales, segmented gauges, and sparkline KPI cards match the MUI X dashboard patterns.
- 29b4033: Add EventCalendar and EventTimeline — Spatika-native scheduling with agenda, create/edit, resize, recurrence, preferences, and a resource Gantt.
- 29b4033: Add Material-style primitives covering the core MUI catalog (Accordion through Autocomplete, Grid, Menu, Snackbar, and related layout/form/feedback components).
- Add Material-style primitives: Accordion (summary/details/actions), ButtonGroup, AvatarGroup, Fab, IconButton, Link, Typography, Paper, Stack, Container, List, Stepper, ToggleButton, TextField, FormControlLabel, SpeedDial, Collapse, Backdrop, CircularProgress, LinearProgress, Autocomplete, Grid, Box, FormControl, InputAdornment, ImageList, Rating, Snackbar, MobileStepper, Modal, AppBar, BottomNavigation, Masonry, Menu, TransferList, TablePagination, and transitions.

### Patch Changes

- Contain CoverHero and ProfileHero covers unless bleed is on, align the profile identity notch with the avatar, and give EntityMediaCard / ImageList a consistent media layout.
- 29b4033: Fix FloatingPageChromeBar docs/showcase previews: keep the glass tray pinned above a nested scroller so the list scrolls under the bar without a double header gap.
- Updated dependencies [29b4033]
- Updated dependencies
- Updated dependencies [29b4033]
- Updated dependencies [29b4033]
  - @spatika/tokens@1.2.0

## 1.1.0

### Minor Changes

- Add marketing-site primitives: Tag, SectionHeading, SiteNav, SiteFooter, and a metric StatCard variant.
- Lift portfolio chrome into the kit: Wordmark, GradientText, AccentRule, AvailabilityBadge, FloatChip, MetaChip, IconTile, ContactLink, CareerCard, ProjectCard, plus Tag color tones and a gradient Button.

### Patch Changes

- Updated dependencies
  - @spatika/tokens@1.1.0

## 1.0.0

### Major Changes

- 85239d3: Rename the design system to Spatika. Packages move to `@spatika/tokens` and `@spatika/react`; theme APIs, CSS helpers, and data attributes use the `spk` prefix.

### Minor Changes

- b8ba16a: Sync page chrome with journalD: liquid-glass toolbar tray, cover-bleed heroes, EntityCard rows, FilterSheet, and the iOS 26 tab bar.
- 85239d3: Name the four themes Mukta, Neelam, Usha, and Sandhya. CSS classes and theme ids follow those names.

### Patch Changes

- b8ba16a: Keep the selected appearance: persist theme to localStorage, apply it before paint, and default the docs site to light instead of forcing dark.
- Updated dependencies [b8ba16a]
- Updated dependencies [85239d3]
- Updated dependencies [85239d3]
  - @spatika/tokens@1.0.0

## 0.2.0

### Minor Changes

- Export theme providers, add touch button sizes, reduced-motion and focus utilities, and Vitest coverage for core React primitives.

### Patch Changes

- Updated dependencies
  - @spatika/tokens@0.2.0
