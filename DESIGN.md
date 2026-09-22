# Spatika Design Language (2.0)

Reusable visual patterns for **React**, documented on the site in `apps/website`.
Spatika means crystal (स्फटिक). 2.0 reads that as **clarity, not frost**.

## Architecture

```text
@spatika/tokens   primitives → semantic tokens → component recipes (CSS)
        ↓
@spatika/react    primitives + composites + patterns
        ↓
apps/website      design docs, component catalog, showcase applications
```

Layers, in order. Never skip one:

```text
theme base values   (--spk-canvas, --spk-surface, --spk-accent … per theme)
  ↓ derived tokens  (--spk-accent-hover, --spk-focus-ring, legacy aliases)
  ↓ Tailwind bridge (bg-surface, text-fg-secondary, border-line-subtle, text-title-2 …)
  ↓ recipes         (.spk-btn, .spk-field, .spk-item, .spk-table, .spk-surface--*)
  ↓ components      (Button, Card surface=…, DataTable, Metric …)
  ↓ patterns        (AppShell, PageSection, MetricGroup, Panel)
  ↓ applications    (/showcase/finance, /showcase/admin, /showcase/workspace)
```

## Principles

1. **Content first** — surfaces support information instead of competing with it. Most page
   structure is a `PageSection` (heading + spacing), not another card.
2. **Calm surfaces** — solid material, hairline borders, restrained elevation. Translucency is an
   opt-in material (`surface="glass"`), not the foundation.
3. **Hierarchy from type and space** — size, weight, alignment and grouping. No uppercase
   micro-labels, no 900-weight headings.
4. **Professional density** — controls read their size from density tokens; `data-density="compact"`
   retunes a whole region.
5. **Quiet personality** — the signature lives in details, never decoration.
6. **Respect user preferences** — `prefers-reduced-motion` collapses motion to a fade,
   `prefers-reduced-transparency` turns glass solid.

## The signature

| Motif | What it is | Where |
|---|---|---|
| Facet edge | 1px inner top highlight (`--spk-facet`) on raised material | Buttons, raised cards, overlays |
| Prism rail | 2px accent indicator with a spring settle | Active nav item, tabs, selected row, docs sidebar |
| Crystal focus | 2px ring offset by 2px of surface colour (`--spk-focus-ring`) | Every focusable control |
| Measured radii | 4 · 6 · 10 · 14px; full rounding only for tags, avatars, switches | Everywhere |
| Tabular numerals | `tnum` + slashed zero (`.spk-numeric`) | Metrics, tables, charts |
| Inset shell | Content framed as a panel beside the sidebar | `AppShell layout="inset"` |

## Tokens

| Group | Tokens |
|---|---|
| Surface | `--spk-canvas`, `--spk-surface`, `-raised`, `-overlay`, `-subtle`, `-sunken`, `-inverse` |
| Text | `--spk-text-primary`, `-secondary`, `-tertiary`, `-disabled`, `-inverse` |
| Line | `--spk-border`, `-subtle`, `-strong` |
| Accent | `--spk-accent`, `-hover`, `-active`, `-muted`, `-subtle`, `-border`, `-text`, `-fg` |
| Status | `--spk-success|warning|danger|info` (+ `-text`, `-muted`), `--spk-positive`, `--spk-negative` |
| State | `--spk-state-hover`, `--spk-state-active`, `--spk-overlay-scrim` |
| Elevation | `--spk-shadow-xs|sm|md|lg|xl`, `--spk-facet`, `--spk-facet-strong` |
| Type | `--spk-text-display|title-1|title-2|title-3|body-lg|body|body-sm|label|caption|overline|code|metric-*` |
| Density | `--spk-control-h(-xs/sm/lg)`, `--spk-row-h`, `--spk-cell-px/py`, `--spk-item-h`, `--spk-card-p` |
| Motion | `--spk-duration-*`, `--spk-ease-standard|enter|exit|spring`, `--spk-motion-hover|select|enter|exit` |
| Visualization | `--spk-viz-1 … 8`, `--spk-viz-grid`, `--spk-viz-axis` |

1.x names (`--primary`, `--card`, `--border`, `--glass-*`, `--radius-card`, `--chart-1`…) are kept as
aliases of these, so existing consumer CSS keeps working.

## Marketing surfaces

Product screens optimise for density; marketing pages optimise for pace. Both run on the same
tokens — the marketing layer only adds rhythm, a headline step above `display`, and decoration
you opt into.

| Layer | What it adds |
|---|---|
| Rhythm | `--spk-mk-section-py` (3.5 → 6.5rem), `--spk-mk-max`, `--spk-mk-measure` |
| Type | `--spk-text-hero` — fluid `clamp(2.25rem, 5.4vw, 3.75rem)`, above `display` |
| Decoration | `.spk-mk-backdrop` — aurora, glow, grid, dots, rays, all mixed from `--spk-accent` and `--spk-viz-*` |
| Signature | `.spk-mk-shine` sweeps the facet edge across featured tiles on hover |
| Motion | `.spk-mk-reveal` entrances, `.spk-mk-marquee` loops |

Three rules keep it Spatika rather than generic:

1. **Decoration is opt-in and derived.** No backdrop ships a fixed gradient — every wash is
   mixed from theme tokens, so it retints across all four themes.
2. **Tone flips tokens, not text.** `data-tone="inverse"` and `"accent"` re-point
   `--spk-text-*`, `--spk-surface-*` and `--spk-border-*` on the band, so nested components
   invert on their own instead of being hand-painted.
3. **Preferences win.** `prefers-reduced-motion` stops every entrance, marquee, sheen and tilt;
   `prefers-reduced-transparency` solidifies the washes; `.sandhya` never blurs.

## Themes

| Id | Class on `<html>` | Character |
|---|---|---|
| `mukta` | _(none)_ or `.mukta` | Neutral cool light — the default |
| `neelam` | `.neelam` | Designed dark: layered near-black with a sapphire tint |
| `usha` | `.usha` | Warm paper light, terracotta accent |
| `sandhya` | `.sandhya` | Warm dark, flat — never blurs |

Dark themes declare their own base values; they are not inverted light themes. Derived states are
computed per theme root, so a `createTheme` brand override flows into hover, muted and focus.

## Surfaces

```tsx
<Card surface="default">   // solid + hairline — everyday container
<Card surface="raised">    // focal object: subtle shadow + facet edge
<Card surface="subtle">    // quiet grouping
<Card surface="sunken">    // wells (tracks, code, empty areas)
<Card surface="outline">   // border only
<Card surface="glass">     // translucent — floating chrome and media overlays only
<Card surface="transparent">
```

Recipes for non-React markup: `.spk-surface--*`, `.spk-overlay`, `.spk-item`, `.spk-glass`.

## Density

```tsx
<AppShell density="compact">…</AppShell>
<section data-density="compact"><DataTable … /></section>
```

`compact` (admin consoles) · `comfortable` (default) · `spacious` (touch-first). Coarse pointers get
≥44px controls automatically unless a region opts into compact.

## Shell & patterns

| Concept | React |
|---|---|
| Application frame | `AppShell` (+ `Sidebar`, `NavSection`, `NavItem`, `TopBar`) |
| Workspace / account | `WorkspaceSwitcher`, `UserMenu` |
| ⌘K | `SearchTrigger` + `CommandPalette` |
| Page structure | `PageHeader`, `PageSection`, `Panel` |
| KPIs | `Metric`, `MetricGroup`, `Delta` |
| Tables | `DataTable` (sorting, selection, pinning, expansion, mobile list) |
| Mobile navigation | `MobileTabBar` |
| Calendar | `EventCalendar`, `EventTimeline` |
| Rich text | `SpatikaEditor` |
| Charts | `@spatika/charts` — line, area, bar, pie, sparkline, 30+ more |

1.x chrome (`PageShell`, `AppHeader`, `FloatingPageChromeBar`, `PageStickyHeader`, `CoverHero`) is
still supported and restyled; new applications should start from `AppShell`.

## Motion

| Role | Duration | Easing |
|---|---|---|
| Hover / colour | 120ms | standard |
| Press | 80ms | standard |
| Selection (prism rail, thumbs) | 180ms | spring |
| Entrance (popover, dialog, toast) | 260ms | enter |
| Exit | 180ms | exit |
| Expand / layout | 260ms | standard |

Animate colour, shadow and transform only. Cards do not levitate on hover.

## Utilities

| Class | Role |
|---|---|
| `.spk-focus-ring` | Crystal focus ring for custom controls |
| `.spk-touch-target` | ≥44px hit area |
| `.spk-numeric` | Tabular, slashed-zero numerals |
| `.spk-surface--*` | Surface model |
| `.spk-overlay` | Floating material (menus, popovers, toasts) |
| `.spk-item` | Interactive row (menu, option, command, nav) |
| `.spk-prism` | Active indicator rail |
| `.spk-glass` | Opt-in translucent material |
| `.app-chrome-header`, `.glass-tabbar`, `.glass-page-toolbar` | 1.x chrome, restyled |

Full audit and rationale: [`docs/redesign/AUDIT.md`](docs/redesign/AUDIT.md).
Upgrade notes: [`docs/redesign/MIGRATION.md`](docs/redesign/MIGRATION.md).
