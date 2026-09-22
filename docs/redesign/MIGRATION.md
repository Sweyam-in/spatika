# Spatika 1.x → 2.0 migration

2.0 is a design-language release. **No component was removed and no required prop changed**, so most
applications upgrade by installing the new versions and reviewing the screens where the visual
language shifted. This page lists what changes on its own, what is deprecated, and the few places
where you may want to adjust code.

## TL;DR

```bash
npm install @spatika/tokens@latest @spatika/react@latest @spatika/charts@latest @spatika/editor@latest
```

Nothing else is required. Optionally:

```tsx
import "@spatika/tokens/fonts.css"; // now loads Inter + JetBrains Mono
```

## What changes without code edits

| Area | 1.x | 2.0 |
|---|---|---|
| Surfaces | Frosted glass everywhere (`.glass`, `.glass-panel`, `.glass-menu`) | Calm solid material; the same classes now render solid |
| Blur | 32–84px backdrop blur on cards, headers, menus | Blur only on floating chrome (`--app-tabbar-blur`, header) and opt-in `.spk-glass` |
| Radii | 6 competing radii up to 28px | 4 · 6 · 10 · 14px; Tailwind's `rounded-*` scale is remapped to match |
| Shadows | `0 28px 65px` soft clouds | `--spk-shadow-xs…xl`; Tailwind's `shadow-*` scale is remapped |
| Type | `font-black` (900) headings, 10px uppercase micro-labels | 600 headings, sentence-case labels, 14px body |
| Numbers | Proportional | Tabular with slashed zero in metrics, tables and charts |
| Focus | `ring-[3px]` on some controls | One crystal focus ring on every control |
| Motion | 200–400ms, hover lift on cards | 80–260ms, no levitation |
| Dark mode | Partly inverted | Neelam and Sandhya designed independently |
| Charts | Saturated 5-colour palette, dashed grid | 8-colour tuned palette per theme, solid hairline grid, calmer marks |

Consumer CSS that reads 1.x variables (`--primary`, `--card`, `--border`, `--radius-card`,
`--glass-bg`, `--chart-1` …) keeps working: those names are now aliases of the semantic tokens.

## Deprecated (still working)

| Deprecated | Use instead | Notes |
|---|---|---|
| `<GlassCard>` | `<Card surface="…">` | `GlassCard` maps variants onto the surface model; only `variant="glass"` is translucent |
| `<SurfaceCard tone>` | `<Card surface>` | tones map to raised / subtle / default / dashed |
| `<Button variant="gradient">` | `<Button>` | renders as the primary button; gradients are out of the system |
| `typographyEyebrow` & friends (uppercase) | `typographyEyebrow` (restyled) or `text-caption` | same exports, quieter styling |
| `StatCard` | `Metric` + `MetricGroup` | `StatCard` now renders a `Metric` inside a `Card` |
| `.glass*` utility classes | `.spk-surface--*`, `.spk-overlay`, `.spk-glass` | old names kept and restyled |

## Visual changes you may want to review

1. **Cards inside cards.** 1.x layouts often nested glass panels. With calm surfaces, nesting reads
   flat — replace the outer card with `PageSection` (heading + spacing).
2. **Badges.** `variant="default"` is still solid accent; `secondary` now reads as `neutral`.
   Consider `dot` so status is not colour-only.
3. **Tabs.** The default is now an underlined line-tab with a prism rail. Pass
   `<Tabs variant="segmented">` for the 1.x contained look.
4. **Accordion.** Default is a divided list rather than separate cards; `disableGutters` gives the
   bordered container.
5. **Dialogs on phones.** `DialogContent` becomes a bottom sheet below 640px. Opt out with
   `mobileLayout="dialog"`.
6. **Site default theme.** The docs site now defaults to Mukta; your app's `defaultTheme` is untouched.

## New APIs worth adopting

```tsx
// Application frame
<AppShell sidebar={<Sidebar …/>} topbar={<TopBar …/>} density="compact">…</AppShell>

// KPIs
<MetricGroup columns={4}>
  <Metric label="MRR" value={184320} format="currency" delta={0.064} caption="vs August" />
</MetricGroup>

// Professional tables
<DataTable data={rows} columns={columns} getRowId={(r) => r.id} selectable pageSize={20} />

// ⌘K
<SearchTrigger onOpen={open} />
<CommandPalette open={isOpen} onOpenChange={setOpen} groups={groups} />

// Page structure without boxes
<PageSection title="Accounts" description="…" actions={…}>…</PageSection>
<Panel title="Revenue">…</Panel>

// Density anywhere
<section data-density="compact">…</section>
```

Also new: `surfaceClass()`, `formatNumber` / `formatCurrency` / `formatPercent` / `formatCompact`,
`Delta`, `DialogBody`, `CommandFooter`, `Combobox` (alias of `Autocomplete`), `SearchInput`
(alias of `SearchField`), `Input` `leading` / `trailing` adornments, `Button` `loading`,
`Badge` `dot`, `Table` `density` / `stickyHeader` / sortable `TableHead`.

## Accessibility improvements that may change DOM/behaviour

- `Tabs` now implement roving tabindex, arrow-key navigation and `aria-controls`.
- `SegmentedControl` and `RadioGroup` support arrow keys with roving tabindex.
- `Select` supports arrow keys, Home/End, Enter, and returns focus to the trigger.
- `Dialog`, `AlertDialog` and `Sheet` wire `aria-labelledby` / `aria-describedby` automatically.
- `Tooltip` sets `aria-describedby` while open and closes on Escape.
- `FormField` injects `aria-describedby`, `aria-invalid` and `aria-required` onto its child control.
- `Toaster` renders an `aria-live` region; danger toasts use `role="alert"`.
- `Alert` renders a tone icon by default (pass `icon={null}` to opt out).

If your tests assert on 1.x class names (`glass-panel`, `font-black`, `rounded-2xl`), update them to
assert on `data-slot` / `data-*` attributes instead — those are stable.
