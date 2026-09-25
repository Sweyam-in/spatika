# Spatika 2.4 audit, gap matrix and inventory

The 2.0 redesign and its reasoning are in [AUDIT.md](AUDIT.md); this document covers the audit
of 2.3.0 that led to 2.4. It records what was measured, what changed and what is still open.
Every "Done" row below has a test that fails if it regresses, and the test is named in the row.

## How 2.3.0 was audited

- **Published artefacts.** The npm tarballs for 1.0.0–2.3.0 were compared with the source. This
  found the stylesheet regression and the stale files in the 2.3.0 React tarball.
- **Utility coverage.** Every class name in the component source was checked against a CSS rule
  (`packages/react/src/lib/utilities-coverage.test.ts`, `apps/website/src/utilities-coverage.test.ts`).
- **Contrast.** WCAG contrast ratios were computed for every theme's text, control and focus
  tokens (`packages/react/src/lib/theme-contrast.test.ts`).
- **Keyboard and focus.** The WAI-ARIA APG patterns for menu, listbox, dialog, tabs, tree, grid
  and spinbutton were walked through in jsdom tests and in Chromium.
- **axe-core.** WCAG 2.0/2.1/2.2 A+AA rules, run against docs and component pages in all four
  themes (`apps/website/e2e/a11y.spec.ts`).
- **Responsive.** Document overflow was checked at 320, 360, 390, 414, 600, 768, 1024, 1280, 1440
  and 1920 px, plus 200% zoom (`apps/website/e2e/responsive.spec.ts`). A screenshot sweep
  covered every component page at 320/390/768/1280 (`apps/website/scripts/visual-audit.mjs`).
- **Docs accuracy.** Hand-written prop tables were checked against the TypeScript types, and
  every example was compiled.

## Gap matrix

Priority: P0 means shipped broken or inaccessible, P1 is a gap that blocks common application
work, and P2 is an improvement.

| Area / component | What 2.3.0 had | Gap | Solution | Priority | Status |
|---|---|---|---|---|---|
| Stylesheet | Tailwind-free token build | ~200 utility classes used by components had no rule (spacing steps, z-index layers, `line-clamp`, `animate-spin`, `peer-disabled:` …); `bg-gradient-to-*` ignored direction; `dark:` never matched | Rules restored; `dark:` targets the dark themes; guard test | P0 | Done (`utilities-coverage.test.ts`) |
| Published tarball | `dist` built in place | Files from renamed modules shipped (stale chart files in `@spatika/react` 2.3.0) | Build scripts clean `dist` first | P1 | Done |
| Contrast | Four themes | Tertiary text < 4.5:1 on some surfaces; control borders < 3:1; focus ring at partial strength; white on dark-theme danger < 4.5:1 | Retuned base values, derived `--spk-control-border`, full-strength focus token | P0 | Done (`theme-contrast.test.ts`) |
| DropdownMenu | Mouse only | Items were unreachable by keyboard; no submenus | APG menu model (arrows, Home/End, type-ahead, Escape), submenus, checkbox/radio items | P0 | Done (`overlays.test.tsx`) |
| Overlay stacking | Each overlay had its own listeners | Escape closed every open overlay; outside clicks dismissed parents; z-index spread across three scales | One dismissable-layer stack and one z scale shared with `OVERLAY_Z_INDEX` | P0 | Done (`overlays.test.tsx`) |
| Tooltip | Hover tooltip | Couldn't be hovered (WCAG 1.4.13); no Escape; appeared on touch | Hoverable with a grace period, Escape from anywhere, touch guard, `skipDelayDuration` | P1 | Done |
| Popover | Portaled content | Focus stayed on the trigger; Tab skipped the content | Focus moves in and back; Tab bridges to the portal | P1 | Done |
| Select | Listbox | No type-ahead; focus not returned; label lost when wrapped in FormField | Type-ahead, focus return, FormField wiring | P1 | Done (`FormField.test.tsx`, e2e playground flow) |
| Button `loading` | `disabled` while loading | Keyboard focus was lost mid-submit | `aria-disabled` + `aria-busy`, clicks blocked | P1 | Done (`Button.test.tsx`) |
| FormField | Required `id` | Consumers had to wire ids by hand; radio groups had no name; errors used `role="alert"` | Generated id, `aria-labelledby` for groups, polite error region | P1 | Done |
| Tabs | Tabs | `aria-controls` pointed at panels that weren't mounted | Panel registry | P1 | Done (axe) |
| NavItem | `<li>` always | Invalid list markup outside a NavSection | `<li>` only inside NavSection lists | P1 | Done (axe) |
| Number entry | `AmountInput` (currency) | No general numeric field | `NumberInput` (spinbutton, locale parsing, steppers) | P1 | Done |
| Tag / code entry | — | No multi-value text entry; no OTP field | `TagInput`, `OtpInput` | P1 | Done |
| File upload | — | None | `FileUpload` (dropzone, keyboard, limits, file list) | P1 | Done |
| Dates | `EventCalendar` (scheduling) | No date picker, no typed entry | `Calendar`, `DatePicker`, `DateRangePicker` (APG date grid) with typed segments, and a standalone `DateInput` | P1 | Done (`app-components.test.tsx`, e2e date flows) |
| Hierarchy | — | None | `TreeView` (APG tree, lazy children) | P1 | Done |
| Record details | — | None | `DescriptionList` (container-query layout) | P2 | Done |
| Long lists | — | None | `VirtualList` | P2 | Done |
| Split panes | — | None | `ResizablePanels` (window splitter, keyboard) | P2 | Done |
| Context menu | — | None | `ContextMenu` on the DropdownMenu model | P2 | Done |
| Scroll / media | — | None | `ScrollArea`, `AspectRatio` | P2 | Done |
| Form errors | Per-field errors | No summary for long forms | `FormErrorSummary` | P1 | Done (e2e flow) |
| Outcome screens | `EmptyState` | No success/error result screen | `ResultState`, `EmptyState tone` | P2 | Done |
| DataTable | Sorting, selection, toolbar | No column visibility | `hiddenColumns`, `DataTableColumnsMenu` | P2 | Done |
| Docs: API tables | Hand-written | Out of date (wrong props on Skeleton, charts, SiteNav …) | Generated from TypeScript; test fails when stale | P0 | Done (`api-sync.test.ts`) |
| Docs: examples | Strings | 58 examples didn't compile | Demo files are the source; every example is type-checked | P0 | Done (`examples-compile.test.ts`) |
| Docs: coverage | 149 component pages | 23 existing exports had no page (AlertDialog, DropdownMenu, Popover, Sheet, FormField, RadioGroup, Textarea …) | Pages from runnable demos, which also cover the 16 new components | P1 | Done |
| Docs: playground | — | None | Props playground driven by the generated API | P2 | Done (`playground.test.ts`, e2e) |
| Docs: search | Title match | Found nothing by task ("file browser", "date") | Ranked search with synonyms | P2 | Done (`search-index.test.ts`, e2e) |
| Docs: versions | One site | No history, no selector, no policy | Snapshots, API archives for 1.0–2.3, selector, support policy, release script | P1 | Done (`versions-policy.test.ts`, e2e) |
| Docs: bundle | Code-split by nothing | 2.1 MB entry chunk; every component page loaded the rich-text editor | Route-level code splitting (554 kB entry); editor demos and agent Markdown load only where used (component page chunks ~370 → ~193 kB gzip) | P2 | Done |
| Cross-browser | — | Only Chromium was exercised | CI runs the responsive, axe and flow suites in Chromium, Firefox and WebKit (desktop and phone, WebKit phone as iPhone) | P1 | Done (`.github/workflows/ci.yml`) |
| Screen readers | — | No screen-reader checks at all | Virtual screen-reader tests of names, states and live announcements (caught toasts running title and description together); manual protocol for NVDA, JAWS, VoiceOver, TalkBack | P1 | Automated: done (`a11y/screen-reader.test.tsx`). Manual pass with real screen readers: **not yet run** (`docs/testing/screen-readers.md`) |
| CI | — | No workflow ran tests | Unit, typecheck, docs checks, three-engine e2e, visual regression, Docker image build | P1 | Done (`.github/workflows/ci.yml`) |
| Docker image | Built one site from the checkout | Build broke on this branch (docs pages import `docs/*.md`, never copied); `/AGENTS.md` never shipped; no versioned docs | Image carries released snapshots forward and adds the checkout (`release-docs.mjs site`) | P1 | Done; image build checked in CI |
| Overlays | Glass-derived gradient | Top of menus, popovers and selects was 24% transparent | Solid base under the sheen | P1 | Done |
| Editor | Tiptap wrapper | Crash when StrictMode destroyed the instance before effects ran (seen on cold loads) | Effects skip destroyed editors | P1 | Done (`use-spatika-editor.test.tsx`) |
| Charts a11y | Charts have titles and a data table | Data points unreachable by keyboard unless clickable (then one tab stop each) | The plot is one tab stop; arrows walk points, the tooltip follows, values are announced; every chart type with marks | P2 | Done (`chart-keyboard.test.tsx`, e2e flow). WebGL scatter excluded — documented |
| Time entry | — | No time field | `TimeInput` (locale 12/24-hour, 24-hour value) | P2 | Done |

## Inventory

190 documented entries on `/components` (394 exported names, counting sub-components, hooks
and helpers). New in 2.4 are marked with *.

| Category | Count | Components |
|---|---|---|
| Primitives | 20 | Button, ButtonGroup, IconButton, Fab, Link, Typography, Badge, Avatar, AvatarGroup, Accordion, ButtonBase, Rating, Box, Chip, Tag, Wordmark, GradientText, AvailabilityBadge, Tabs, Switch |
| Forms | 31 | Input, TextField, Autocomplete, OutlinedInput, FormControl, Select, TextareaAutosize, TransferList, Checkbox, FormControlLabel, Slider, ToggleButton, SearchField, ChipGroup, SegmentedControl, FormField, Label, Textarea, NativeSelect, RadioGroup, NumberInput*, TagInput*, OtpInput*, FileUpload*, Calendar*, DateInput*, TimeInput*, DatePicker*, DateRangePicker*, AmountInput, FormErrorSummary* |
| Layout | 25 | Paper, Grid, Masonry, Stack, Container, List, Card, GlassCard, StatCard, PageSection, Panel, SectionHeading, IconTile, CareerCard, ProjectCard, FloatChip, MetaChip, EntityCard, ListRow, PageHeader, ResizablePanels*, ScrollArea*, AspectRatio*, Separator, Toolbar |
| Navigation | 18 | AppShell, CommandPalette, Stepper, MobileStepper, AppBar, BottomNavigation, Breadcrumb, Pagination, SpeedDial, AppHeader, SiteNav, SiteFooter, ContactLink, FloatingPageChromeBar, PageStickyHeader, MobileTabBar, FilterSheet, HeaderIconButton |
| Overlays | 10 | Menu, Dialog, Modal, Tooltip, AlertDialog, Sheet, Popover, DropdownMenu, ContextMenu*, BottomSheet |
| Media | 5 | CoverHero, ProfileHero, EntityMediaCard, ImageList, PhotoViewer |
| Feedback | 11 | Progress, CircularProgress, Skeleton, Alert, EmptyState, Toaster, Snackbar, ResultState*, Spinner, Callout, NotificationBell |
| Data | 15 | DataTable, Metric, Table, TablePagination, ChartDataGrid, EventCalendar, EventTimeline, TreeView*, DescriptionList*, VirtualList*, Timeline, Delta, MetricGroup, StatusDot, Kbd |
| Charts (`@spatika/charts`) | 31 | ChartContainer, BarChart, LineChart, AreaChart, PieChart, ScatterChart, ScatterChart (WebGL), SparkLineChart, Gauge, RadarChart, Heatmap, FunnelChart, PyramidChart, SankeyChart, RangeBarChart, CandlestickChart, RadialBarChart, RadialLineChart, LinearGauge, BubbleChart, RangeAreaChart, Treemap, PolarLineChart, ChordChart, WaterfallChart, BoxPlotChart, OhlcChart, SunburstChart, MapChart, BarChart3D, PieChart3D |
| Marketing | 21 | MarketingSection, SectionBackdrop, MarketingHero, AnnouncementPill, FeatureGrid, BentoGrid, PricingTable, TestimonialCard, LogoCloud, StatBand, StepFlow, CtaBand, FaqSection, Marquee, Reveal, ShowcaseFrame, Prose, LeadForm, SplitFeature, ComparisonTable, ArticleCard |
| Editor (`@spatika/editor`) | 3 | SpatikaEditor, useSpatikaEditor, RichTextEditor |
