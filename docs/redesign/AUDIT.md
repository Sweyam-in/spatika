# Spatika 2.0 — audit and new visual language

This document records what the 1.x system looked like, why it felt dated, and the
decisions behind the 2.0 redesign. It lives next to the code so later changes can be
checked against the intent.

---

## Part 1 — Audit of Spatika 1.6

### Architecture as found

```
@spatika/tokens   tokens.css (4 themes, shadcn-style vars + glass vars)
                  glass.css (.glass* classes, noise + specular pseudo-elements)
                  surfaces.css (.app-card, .entity-card, .profile-liquid-card, washes)
                  chrome.css (fixed header, cover bleed, liquid toolbar)
                  charts.css, marketing.css, base.css
@spatika/react    ~150 components, Tailwind class strings inline (cva for a few)
@spatika/charts   SVG charts reading --chart-1..5
@spatika/editor   Tiptap editor, 1.1k lines of CSS on glass vars
apps/website      docs + "Relay" CRM showcase, 2.6k lines of site CSS
```

### 1. Patterns that made it feel dated

| Pattern | Where | Effect |
|---|---|---|
| Glass as the default surface | `.glass`, `.glass-panel`, `.glass-menu` used 160+ times; `Card` default is `glass-panel`; Dialog, Sheet, Popover, Tooltip, Select all `glass*` | Every surface is frosted; nothing reads as primary content |
| Heavy blur | `--glass-blur: 32px`, header `84px`, menu `68px`, `saturate(190%)` | Expensive compositing, muddy text contrast, 2019 look |
| Noise + specular pseudo-elements | `.glass::before` SVG turbulence, `.glass::after` top/left highlight | Decorative texture on every card |
| Radial colour washes on the page | `.app-page` with two radial gradients | Background competes with content |
| Gradient cards and pills | `.app-card` gradient + `::before` sheen, `.profile-liquid-card`, `.app-nav-pill[data-active]` gradient + 14px glow shadow | Glossy, "UI kit" |
| Huge soft shadows | `--shadow-raised: 0 28px 65px`, `shadow-2xl` on SectionPanel, dialogs | Cards float instead of sit |
| Over-bold type | 60× `font-black` (900) in components; eyebrows `text-[10px] font-black uppercase tracking-widest` | Shouting hierarchy; bold everywhere means nothing is bold |
| Hover lift | `hover:-translate-y-0.5/-1` on cards, entity cards, stat cards | Toy-like in dense UIs |
| Decorative blob | `SectionPanel` `blur-3xl` circle behind content | Pure decoration |
| Gradient text + animated gradient | `.spk-gradient-text` flowing background | Marketing cliché |

### 2. Inconsistencies between components

- Radii: `rounded-md` (Button, Input), `rounded-lg`, `rounded-xl` (IconButton, Tabs, chips), `rounded-2xl` (Dialog, Toast), `rounded-[1.35rem]`, `rounded-[1.75rem]` (StatCard metric, toolbar) — six different radii for peer controls.
- Heights: Button 36px, IconButton 40px (`md`), SearchField 44px, NativeSelect 44px, Tabs 32px trigger — side-by-side controls never align.
- Selected state: `bg-primary/15 text-primary` (sidebar), `bg-background shadow-sm` (tabs, segmented), gradient pill (nav), `scale-[1.02]` (preference chip).
- Focus: `ring-[3px] ring-ring/50` on some, `focus:ring-2 ring-offset-2` on Sheet close, none on Dialog close, `outline` in charts.
- Toast tones used raw `emerald-500`/`amber-500`; Tag used raw `red-50`/`green-700` — bypassing tokens and breaking dark mode.
- Dark mode via `dark:bg-input/30`-style one-offs rather than tokens.

### 3. Duplicated styles

- Overlay surface recipe repeated in Popover, Select, DropdownMenu, Tooltip, Command, NotificationBell, CommandSearchField.
- Chip styles defined twice (`lib/chips.ts` and `Chip` cva).
- Glass header treatment redefined in glass.css, chrome.css and per-theme overrides (≈400 lines of theme-specific `.neelam .glass-*` / `.sandhya .glass-*`).
- Card surfaces: `Card`, `GlassCard`, `SurfaceCard`, `Paper`, `.app-card`, `.entity-card` — six ways to draw a box.

### 4. Weak hierarchy

- Page title `font-800 -0.04em` at 38px next to card titles at `font-black` — both scream.
- Eyebrow labels at 10px/900 uppercase are the loudest thing on most cards despite being least important.
- Muted text uses `/70`, `/55`, `/60` alpha — tertiary text drops below 4.5:1.
- Everything is inside a card, so grouping carries no signal.

### 5. Excessive decorative UI

Noise textures, specular edges, radial washes, blobs, gradient pills, floating chips (`FloatChip` with `spk-float` animation), gradient accent rules, animated gradient text.

### 6. Accessibility problems

- `muted-foreground/70` and `/55` text on glass: below 4.5:1 in Mukta and Usha.
- Blur behind text reduces effective contrast unpredictably (content-dependent).
- Dialog close button had no visible focus state; Sheet close used a ring-offset that disappears on glass.
- Tabs had no arrow-key navigation, `aria-controls`, or roving tabindex.
- SegmentedControl declared `role="radiogroup"` with no arrow keys.
- Slider thumb focus ring was on a `pointer-events-none` span (never focused).
- Toasts had no `aria-live` region.
- Status conveyed by colour only (StatusDot, Toast tone, Tag colours).

### 7. Mobile behaviour

- Heavy blur disabled on mobile via a large `@media (max-width: 767px)` override block — the default was desktop-first.
- Dialogs stay centred modals on phones instead of becoming sheets.
- Tables only had horizontal overflow; no list transformation.
- Many controls 32–36px with no coarse-pointer adjustment.

### 8. Components that did not work for dense applications

- `Table` had no density, no sticky header, no sorting affordance, no selection model.
- `StatCard` 24px/900 values, uppercase 10px labels, no delta/trend.
- `DataTableToolbar` 40px rounded-xl search.
- No KPI/metric, delta, or number formatting primitives.
- Chart ticks at `font-weight: 600`, dashed grid, saturated palette.

### 9. APIs that made customisation difficult

- Surface choice encoded in component identity (`GlassCard` vs `Card` vs `SurfaceCard`) rather than a prop.
- No density control.
- Components baked `backdrop-blur-xl` into class strings — impossible to switch off per product.
- `createTheme` only mapped legacy shadcn names; derived colours (hover, muted) could not follow a brand colour.

### 10. Opportunities to simplify

- One surface model (`surface` prop + `.spk-surface--*` recipes).
- One overlay recipe (`.spk-overlay`) for every floating element.
- One interactive-row recipe (`.spk-item`) for menu, select, command, nav.
- Token-driven density instead of per-component `sm/md/touch` guesses.
- Theme files reduced to base colour declarations; everything else derived.

---

## Part 2 — The Spatika 2.0 visual language

### Positioning

Spatika (स्फटिक) means *crystal*. 1.x read that literally as frosted glass. 2.0 reads it
as **clarity and facets**: clean solid material, precise edges, light that catches an edge
rather than fogging a surface.

### Principles

1. **Content first.** Surfaces are quiet; information carries the colour.
2. **Calm surfaces.** Solid by default. Translucency is a material you opt into
   (`surface="glass"`) for floating chrome, media and overlays.
3. **Hierarchy from type and space**, not boxes. Sections are typographic; cards are for
   things that are genuinely objects.
4. **Professional density.** Every control reads its size from density tokens;
   `data-density="compact"` tightens a whole region.
5. **Quiet personality.** One accent, used sparingly. The signature lives in details.

### The Spatika signature

| Motif | What it is | Where |
|---|---|---|
| **Facet edge** | 1px inner top highlight (`--spk-facet`) on raised material | Buttons, raised cards, overlays |
| **Prism rail** | 2px accent indicator with a spring settle | Active nav item, tabs, selected table row, segmented control |
| **Crystal focus** | 2px ring offset by 2px of the surface colour, accent at full strength | All focusable controls |
| **Measured radii** | 6px controls, 10px containers, 14px sheets; pills only for tags/avatars | Everywhere |
| **Tabular numerals** | `tnum` + slashed zero for data | Metrics, tables, charts |
| **Crystal easing** | `cubic-bezier(.2,0,0,1)` standard, quick 120–260ms | Motion |

### Token architecture

```
primitive values (per theme)        --spk-canvas, --spk-surface, --spk-text-primary, --spk-accent …
      ↓ derived (one rule for all)  --spk-accent-hover, --spk-accent-muted, --spk-focus-ring, legacy aliases
      ↓ Tailwind bridge             bg-canvas, bg-surface-raised, text-fg-secondary, border-line-subtle …
      ↓ recipes (CSS)               .spk-surface--*, .spk-overlay, .spk-item, .spk-focus-ring, .spk-table
      ↓ components                  Button, Card surface=…, DataTable, Metric …
      ↓ patterns                    AppShell, PageHeader, PageSection, MetricGroup
      ↓ applications                showcase screens
```

### Themes

| Id | Character in 2.0 |
|---|---|
| `mukta` | Default. Neutral cool light, indigo accent. |
| `neelam` | Designed dark: layered near-black with a sapphire tint, lifted accent for text. |
| `usha` | Warm paper light, terracotta accent. |
| `sandhya` | Warm dark, flat (never blurs), terracotta accent. |

### Quality bar applied to every change

Does it look like 2026 software? Would it be credible in a paid product? Is information
easier to scan? Is there less decoration? Does it hold at high density, in dark mode, and on
mobile? Is feedback polished? Is it still recognisably Spatika?
