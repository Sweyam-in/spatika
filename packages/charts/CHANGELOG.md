# @spatika/charts

## 2.3.0

### Minor Changes

- Remove the Tailwind build dependency from Spatika tokens and ship a first-party CSS utility layer generated from hand-authored token, recipe, and utility files. The package output now uses Spatika-owned `--spk-*` theme variables, reset rules, component recipes, chart/editor styles, and compatibility utility classes without invoking the Tailwind CLI or publishing Tailwind-generated `--tw-*` scaffolding.

  This release also restores responsive component fidelity after the build change: DataTable phone layouts now render as compact record rows, panel headers regain token-driven spacing, gallery/detail previews have more reliable sizing, and shell previews no longer open escaped mobile drawers from embedded demos.

  The docs theme has been refreshed with a whiter Usha canvas and a new rangoli-inspired Spatika mark across the site logo, favicon, and Open Graph image.

### Patch Changes

- Updated dependencies
  - @spatika/tokens@2.3.0

## 2.2.0

### Patch Changes

- Updated dependencies
  - @spatika/tokens@2.2.0

## 2.1.0

### Patch Changes

- Updated dependencies [9f8dfe5]
  - @spatika/tokens@2.1.0

## 2.0.0

### Axes

- Value axes no longer pad across zero, so a chart of non-negative values stops showing a negative
  tick (the stray `-50` under an area chart).
- Domains are rounded out to the tick bounds and tick steps are idempotent, so the outermost label
  always lands inside the plot instead of painting over the legend or below the axis line.

### Packaging

- The ESM build now emits explicit file extensions, so Node can import the package directly —
  server rendering, React Server Components and `node --import` all work. Previously only bundlers
  could resolve the emitted specifiers.
- Test files are no longer included in the published tarball.

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

- Updated dependencies [7daf0d0]
  - @spatika/tokens@2.0.0

## 1.6.0

### Patch Changes

- @spatika/tokens@1.6.0

## 1.5.0

### Minor Changes

- 4e47ccd: Add chart empty/loading overlays, legend positions, rotated ticks, reversed axes, bar background tracks, and pie label lines.
- 6fe9585: Extract SVG charts into `@spatika/charts` so apps can install plots without the full UI kit, and add Recharts-parity syncId, shared tooltips, reference area/dot, error bars, 100% stack offset, and ResponsiveContainer.
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

- Updated dependencies [6fe9585]
- Updated dependencies [4e47ccd]
- Updated dependencies [6fe9585]
- Updated dependencies [163b0bf]
  - @spatika/tokens@1.5.0
