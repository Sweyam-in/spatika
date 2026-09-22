# @spatika/editor

## 2.2.0

### Patch Changes

- Updated dependencies
  - @spatika/tokens@2.2.0

## 2.1.0

### Patch Changes

- Updated dependencies [9f8dfe5]
  - @spatika/tokens@2.1.0

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

### Patch Changes

- 61b1c60: Constrain portaled image-insert popover width and gallery thumbnail size. Add `galleryInsertWidth` for gallery quick-pick inserts.
- 61b1c60: Use compact rectangular popover action buttons (not pills) and a text-only Insert control for image URL inserts.
- 61b1c60: Relax `@spatika/tokens` dependency to `^1.5.0` so consumers can install without requiring `@spatika/tokens@1.6.0`.
- Updated dependencies [7daf0d0]
  - @spatika/tokens@2.0.0

## 1.6.0

### Minor Changes

- Add optional gallery quick-pick to the image insert panel (`galleryPhotos`, `onGalleryOpen`, `onGalleryPrefetch`) and expose `insertImage` on `SpatikaEditorHandle`. Prevent accidental form submission when inserting images from the panel.

### Patch Changes

- @spatika/tokens@1.6.0

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

- Updated dependencies [6fe9585]
- Updated dependencies [4e47ccd]
- Updated dependencies [6fe9585]
- Updated dependencies [163b0bf]
  - @spatika/tokens@1.5.0
