import type { ComponentEntry } from "../data/navigation";
import { getAppDoc } from "./app-catalog";

const intros: Record<string, string> = {
  "lead-form": "LeadForm is the email capture that does the actual converting — the newsletter row under a hero, the waitlist block, the \"talk to us\" form. Hand it an `onSubmit` that returns a promise and it handles the rest: the button goes pending, success is announced politely through a live region, and a rejection flips it to an error state. Extra fields go in as `children` and submit with it; pass `formAction` instead if you are posting straight to a Formspree or Mailchimp endpoint.",
  "split-feature": "SplitFeature is the alternating product story — copy on one side, a screenshot on the other, then flipped for the next one. Wrap a few in `SplitFeatureGroup` and the sides alternate on their own, so you are not tracking `index % 2` by hand. On phones the copy always comes first whatever `reverse` says, so the page still reads in the order you wrote it.",
  "comparison-table": "ComparisonTable is the feature matrix under your pricing cards, or the \"us vs them\" grid. Plans go across the top, features down the side, and `true` / `false` become a check or a dash. It renders a real table with row headers, and every boolean carries a hidden \"Included\" or \"Not included\" — so a screen reader hears the answer instead of a field of icons. Mark one column `featured` and the tint runs the whole way down.",
  "article-card": "ArticleCard is one entry in a blog, changelog or press listing — cover, title, excerpt, tags and a byline with the reading time. The title carries the link and stretches its hit area over the whole card, so the click target is the card but the accessible name is still the headline. Pair it with `Prose` for the post body itself.",
  "marketing-section": "MarketingSection is the band a landing page is built from — a background tone, a lot more vertical air than a product screen, and a centred max-width container for the content. Stack them: hero, proof, features, pricing, questions, closing ask. `tone=\"inverse\"` and `tone=\"accent\"` flip the ink for everything inside, and `backdrop` drops a decorative wash behind the content.",
  "section-backdrop": "SectionBackdrop is the decoration layer — an aurora of accent fields, a single spotlight glow, hairline graph paper, a dot field, or a faint prism fan. Every kind is drawn from theme tokens, so it retints across Mukta, Neelam, Usha and Sandhya instead of shipping a fixed gradient. Turn it down with `strength` on busy sections; `MarketingSection` can render one for you via its `backdrop` prop.",
  "marketing-hero": "MarketingHero is the top of the page: an optional announcement pill, the headline, one or two sentences of lede, your calls to action, and a product shot. `layout=\"split\"` puts the media beside the copy on wide screens and stacks it underneath on phones; `layout=\"stacked\"` centres everything. The lede is capped to a readable measure so long sentences do not run the full width of a monitor.",
  "announcement-pill": "AnnouncementPill is the little \"we shipped something\" chip that sits above a hero headline. Give it a `tag` for the short label and an `href` when it should lead somewhere — linked pills get a chevron that nudges on hover, and a focus ring, because they are real navigation.",
  "feature-grid": "FeatureGrid is the \"what you get\" block: a responsive grid that holds FeatureCards and collapses to one column on phones. Each card takes an icon, a title, a sentence, and an optional link. Pick the variant that matches how loud the section should be — `plain` for copy on the page, `card` for a solid surface, `outline` for hairlines, and `rail` for the accent rail that echoes Spatika's prism motif.",
  "bento-grid": "BentoGrid is the modern product overview — a few large tiles, a few small ones, arranged so the eye has somewhere to land. Tiles carry their own `span` and `rows`, so you compose the layout rather than accept an even matrix. Mark exactly one tile `emphasis` for the accent tint, and add `shine` if you want a facet highlight to sweep across it on hover.",
  "pricing-table": "PricingTable lays your plans side by side and PricingCard fills each one in — name, amount, period, a line on who it is for, what is included, and the action. Mark the plan you want chosen as `featured`: it gets the accent ring and lifts out of the row on wide screens. Features can be strings, or objects with `excluded` when you want to show what a plan does not include.",
  "testimonial-card": "TestimonialCard is a customer quote with the attribution attached — avatar, name, role, and optionally their logo or a star rating. It renders a real `figure` and `blockquote`, so the quote and its source stay connected for screen readers. Use `variant=\"featured\"` with `size=\"lg\"` for a single pull quote, and the plain card for a wall of them.",
  "logo-cloud": "LogoCloud is the row of customer or integration logos under a hero. Logos sit in greyscale at reduced opacity so the row reads as texture and your accent stays the loudest thing on the page — each one comes to full colour on hover. Set `variant=\"marquee\"` when you have more logos than fit, and `plain` when a brand needs its real colours.",
  "stat-band": "StatBand is the proof row — uptime, customers, requests, latency. Values are set in tabular figures so the numbers line up across the row, and it collapses to two columns on phones. Pre-format the values yourself (\"99.98%\", \"2.4M\", \"<40ms\") so you control units and rounding.",
  "step-flow": "StepFlow is the \"how it works\" sequence — install, theme, ship. It renders an ordered list, so the order is real for assistive tech rather than implied by the connector line. `orientation=\"horizontal\"` gives you the three-beat marketing version; `vertical` reads as a walkthrough you can hang screenshots off.",
  "cta-band": "CtaBand is the closing ask: one headline, one line of copy, one action. Keep it to that. `tone=\"accent\"` paints the band in the theme accent gradient, `inverse` gives you a dark slab against a light page, and `surface` is the quiet hairline version when the page has already made its case.",
  "faq-section": "FaqSection puts your questions on an Accordion, with an optional aside for the \"still stuck?\" links. Turn on `structuredData` and it also emits FAQPage JSON-LD — the markup search engines read for rich results. Only plain-string answers end up in the JSON-LD, since structured data cannot carry markup.",
  marquee: "Marquee scrolls a row of logos or short quotes continuously. The track is duplicated so the loop never seams, and the copy is hidden from assistive tech so nothing gets announced twice. It pauses when the pointer is over it, and under `prefers-reduced-motion` it stops entirely and wraps into a static centred row.",
  reveal: "Reveal plays a short entrance the first time its content scrolls into view — opacity plus a few pixels of travel, nothing more, because motion is the thing a landing page most often overdoes. Stagger a row by passing `delay={index * 80}`. Under `prefers-reduced-motion` the transition is dropped and content renders in place, and it renders visible when there is no IntersectionObserver at all.",
  "showcase-frame": "ShowcaseFrame wraps a screenshot, live demo or video in browser, window or phone chrome. It is drawn from tokens rather than baked into an image, so the frame follows whichever theme the visitor is on instead of pinning a light-mode PNG onto a dark page. `tilt` adds a perspective turn that relaxes on hover.",
  prose: "Prose is the long-form block — posts, changelogs, docs, legal pages. It styles whatever you nest inside it: headings, lists, quotes, code, figures and links, all from theme tokens with a capped measure so lines stay readable. Pass `html` to render sanitised markup from a CMS or MDX, or `lead` to set the first paragraph as a standfirst.",
  button:
    "When someone needs to do something, Button is usually the right call. We ship primary, secondary, outline, ghost, soft, and destructive variants, and `size=\"touch\"` gets you to the 44px mobile target without thinking about it. Pass `asChild` if you want a React Router `Link` to look and behave like a button.",
  "button-group":
    "If you have a few related actions that belong together visually, ButtonGroup wires them into one connected control. It forwards `variant` and `size` to the child buttons, and you can lay them out horizontally or stack them vertically depending on the layout.",
  "icon-button":
    "IconButton is what we reach for when space is tight and a label would clutter the toolbar. There is no visible text, so always pass `aria-label` — screen readers need a name. On mobile toolbars, `size=\"touch\"` keeps the hit target comfortable.",
  fab: "Fab is the floating action button for the one thing you want front and center on a screen — circular for a single icon, or extended when a short label helps. Circular FABs still need `aria-label`; extended FABs can lean on the visible label instead.",
  link: "Link is our inline text link with theme color and underline baked in. When the destination is a router `Link`, pass `asChild` so navigation stays client-side without restyling everything yourself.",
  typography:
    "Typography maps Spatika's type scale onto real semantic HTML so you are not guessing font sizes. Twelve variants run from display headings down to caption and overline, and you can set color and alignment independently of the variant.",
  badge:
    "Badge is a compact pill for status or counts — think \"Beta\", \"3 unread\", or a small label beside a heading. It is a standalone label, not an overlay on a child the way Material UI's Badge works, so pair it with an icon, heading, or metadata row.",
  avatar: "Avatar shows a photo or initials when you need a quick identity mark. Compose `AvatarImage` with `AvatarFallback` so a missing or slow-loading photo still renders initials instead of an empty circle.",
  "avatar-group":
    "AvatarGroup stacks overlapping avatars and shows an overflow count when you set `max`. We use it for collaborators, attendees, or anyone who shares ownership of something.",
  accordion:
    "Accordion gives you expandable panels with a summary, details, and optional actions — great for FAQs or dense settings. Use `type=\"multiple\"` when several panels should be able to stay open at once.",
  "button-base":
    "ButtonBase is the unstyled pressable underneath Button and list items. You will rarely need it directly — prefer Button, IconButton, or ListItemButton unless you are building a custom hit target from scratch.",
  rating: "Rating is a star control with hover preview and optional half-step precision when you need finer scores. Set `readOnly` when you are showing a score rather than collecting one.",
  box: "Box is a generic polymorphic wrapper when you need a layout element without opinionated spacing. Pass `component` to change what renders; if spacing is the whole point, Stack or Grid is usually clearer.",
  chip: "Chip is a toggleable pill for filters and preferences — tap to select, tap again to clear. For static metadata use Tag; for status counts use Badge.",
  tag: "Tag is a static label pill for skills, stacks, and other metadata that does not change with a click. It is not interactive — reach for Chip when the user is making a selection.",
  wordmark: "Wordmark pairs a product name with a gradient accent so marketing brands feel intentional, not pasted on. You will see it in SiteNav and hero lockups where the name is the identity.",
  "gradient-text":
    "GradientText paints display type with the theme marketing gradient — names, headlines, that kind of moment. For body copy and UI labels, Typography is the better default.",
  "availability-badge":
    "AvailabilityBadge is a short pill with a live pip for states like open-to-work or online. Keep the label brief so the pip stays readable at a glance.",
  tabs: "Tabs switch between in-page sections without a full navigation change. `TabsList` is the tablist; triggers are tabs and panels are tabpanels. If you need a compact single-select that is not really a view switcher, SegmentedControl fits better.",
  switch: "Switch is the control we use for binary settings — on or off, enabled or disabled. Pair it with FormControlLabel, or pass `aria-label`, so the state has a name assistive tech can announce.",
  input:
    "Input is the bare text field with Spatika's shared focus ring — no label, no helper text, just the control. When you want a visible label and helper copy in one piece, TextField is the friendlier choice.",
  "text-field":
    "TextField is the labeled field with helper and error text wired together. Set `error` and put the reason in `helperText` — the helper is connected via `aria-describedby`. Use `multiline` when you need a growing textarea instead of a single line.",
  autocomplete:
    "Autocomplete is a filterable combobox with multiple and free-solo modes when users need to search a long list. For a short closed list, Select is simpler; when typing to filter matters, this is the one.",
  "outlined-input":
    "OutlinedInput is an input with start and end adornments — prefixes, suffixes, icons in the field chrome. Use it when you need that adornment layout without TextField's label stack.",
  "form-control":
    "FormControl groups a label, control, and helper text when you are assembling a field by hand. For the common labeled-input case, TextField already does that wiring for you.",
  select:
    "Select is our custom listbox menu — compose `SelectTrigger`, `SelectContent`, and `SelectItem` for the pieces you need. NativeSelect is still there when you want the platform picker instead.",
  "textarea-autosize":
    "TextareaAutosize grows with its content so long notes do not scroll inside a tiny box. TextField `multiline` wraps this when you also need a label and helper alongside the growing area.",
  "spatika-editor":
    "Sometimes a textarea just won't cut it. SpatikaEditor is for those moments — when your users are drafting release notes, polishing a blog post, leaving a comment, or building a knowledge-base article and need headings, lists, links, or images along the way. It sits on Tiptap with Spatika's quiet toolbar, slash commands, @mentions, tables, resizable images, and optional AI actions that connect to your own backend. Import `@spatika/editor/styles.css` alongside `@spatika/tokens/styles.css`, and you're ready to go. If our ribbon and layout aren't quite your style, `useSpatikaEditor` lets you build your own shell around the same engine.",
  "use-spatika-editor":
    "Not every product wants our ribbon toolbar — and that's fine. `useSpatikaEditor` gives you the same editing engine as SpatikaEditor, but the chrome is yours to design. The hook hands back `{ editor, isReady }`; from there, render `EditorContent` and shape the toolbar with `EditorToolbar` or your own controls. It's a good fit when you already have a drawer, a custom shell, or branding that needs something more personal.",
  "rich-text-editor":
    "`RichTextEditor` is still in `@spatika/react` so nothing breaks on older screens, but we consider it deprecated. It wraps SpatikaEditor with a small compact toolbar. For new work, import SpatikaEditor directly from `@spatika/editor` — you'll get the full experience and everything we ship going forward.",
  "transfer-list":
    "TransferList shuttles items between two lists — the classic permission picker or assignment UI. It is for moving selections between columns, not for a single checkbox group on one screen.",
  checkbox:
    "Checkbox handles binary or indeterminate selection in forms and tables. The indeterminate state is especially useful for parent rows in trees when some children are checked and some are not.",
  "form-control-label":
    "FormControlLabel pairs a Switch, Checkbox, or radio with a visible label so the control and copy stay aligned. We prefer this over a raw control with adjacent text that might drift apart in layout.",
  slider:
    "Slider is a continuous value picker when a number input feels too fiddly. Value is a one-item array; `min`, `max`, and `step` clamp the thumb — and give it a visible label or `aria-label` so people know what they are adjusting.",
  "toggle-button":
    "ToggleButton is for exclusive or multi-select clusters where the selection is the state. Use ButtonGroup when the buttons navigate or submit; use ToggleButton when staying pressed is the point.",
  "search-field":
    "SearchField is a search input with a leading icon so the intent is obvious at a glance. Inside product chrome, pair it with FloatingPageChromeSearchField so it sits naturally in the bar.",
  "chip-group":
    "ChipGroup is a multi-select chip rail — great for filters where several options can be on at once. When exactly one option must be active, SegmentedControl is the better fit.",
  "segmented-control":
    "SegmentedControl is a single-select segmented toggle rendered as a radiogroup — compact and easy to scan. Pass `aria-label` when there is no visible legend so the group still has a name.",
  paper:
    "Paper is the low-level elevated or outlined surface when you need a plain box with depth. For structured content with header and footer slots, Card or GlassCard usually saves you layout work.",
  grid: "Grid is our twelve-column responsive layout — set `container` on the parent and `xs` / `sm` / `md` / `lg` / `xl` on items to control how they reflow. It is the workhorse for dashboards and form layouts that need to break at breakpoints.",
  masonry: "Masonry packs children into Pinterest-style columns when height varies row to row. If the children are images with a shared aspect ratio, ImageList is often simpler.",
  stack: "Stack is flex layout with consistent spacing between children — default column, or `direction=\"row\"` with `align` and `spacing` for toolbars and button rows. We reach for it anytime \"even gaps\" is the whole requirement.",
  container: "Container is a centered max-width wrapper for reading-width docs and marketing pages. Product shells typically use PageShell instead, which handles chrome as well as width.",
  list: "List renders rows with icon, primary, and secondary text in a consistent rhythm. Compose ListItem, ListItemButton, and ListItemText rather than styling bare divs and hoping spacing stays even.",
  card: "Card is a structured container for content that needs a clear frame. Compose `CardHeader`, `CardTitle`, `CardContent`, and `CardFooter` as slots, and set `padding=\"none\"` when a child manages its own inset.",
  "glass-card":
    "GlassCard is the 1.x alias of Card, kept so older screens keep working. Its variants map onto the 2.0 surface model — only `variant=\"glass\"` is translucent. Reach for Card in new code; it has the same surfaces plus header, content, and footer slots.",
  metric:
    "Metric is how Spatika shows a number that matters: a quiet label, a tabular value, a signed delta whose colour follows intent (costs going up are bad), a comparison caption and room for a sparkline. It has no container — drop it in a Card, a MetricGroup strip, or straight onto the page.",
  "data-table":
    "DataTable is the workhorse for professional screens. Rows stay rows — sorting, selection with a bulk-action bar, pinned columns, sticky headers, expandable details, inline row actions, pagination, loading and empty states — and on phones the same data becomes a stacked list instead of a squashed grid.",
  "app-shell":
    "AppShell is the application frame: a sidebar that collapses to an icon rail on desktop and becomes a sheet on phones, a sticky top bar, and an inset content panel. Compose it with Sidebar, NavSection, NavItem, TopBar, SearchTrigger, WorkspaceSwitcher and UserMenu.",
  "command-palette":
    "CommandPalette is a data-driven ⌘K dialog for navigation and actions. Pass groups of commands with icons and shortcuts; it handles filtering, keyboard movement and the legend. Pair it with SearchTrigger, which also binds the hotkey.",
  "page-section":
    "PageSection gives a page structure with typography and spacing instead of another card: a heading, an optional description, actions on the right, and your content below. Most dashboard sections should be a PageSection.",
  panel:
    "Panel is the bordered frame for objects that genuinely need one — a chart, a table, a feed. It has a header bar for title and controls, an optional footer, and a `flush` body for edge-to-edge content.",
  "stat-card":
    "StatCard is a metric tile on an elevated surface, with an optional sparkline when a trend helps. `variant=\"app\"` is label-first for dashboards; `metric` is value-first when the number is the hero on marketing pages.",
  "section-heading":
    "SectionHeading is a section title with eyebrow, subtitle, and accent rule so long pages breathe. We use it to break marketing and profile pages into labeled blocks instead of anonymous walls of content.",
  "icon-tile":
    "IconTile is a horizontal domain tile with an icon, italic title, and caption — nice for skill or service grids. For metrics with numbers front and center, StatCard is the better match.",
  "career-card":
    "CareerCard is a resume row with a period pill, bullets, and tech tags for experience sections. Pair it with Timeline when the page tells a career story in order.",
  "project-card":
    "ProjectCard is a shipped-work tile with an outcome pill and stack tags — built for portfolios and changelogs. For generic content blocks, Card is more flexible; this composite already knows the project shape.",
  "float-chip":
    "FloatChip is a calm floating fact chip meant to sit over hero portraits — location, role, a quick stat. Position it on CoverHero or ProfileHero, not inline in body copy.",
  "meta-chip": "MetaChip is a powered-by chip with an optional icon for tooling credits. Footers and project cards are the natural homes for it.",
  "entity-card":
    "EntityCard is a quiet list row for directories when you need a summary with chips. Use ListRow when the row itself is selectable; EntityCard when it is read-only context.",
  "list-row":
    "ListRow is the selectable directory row — the hit target for lists inside FloatingPageChrome. Keep primary text short so scanning a long list stays comfortable.",
  stepper: "Stepper walks people through a horizontal or vertical multi-step flow with clear progress. On compact screens, MobileStepper with dots or a progress bar is often enough without the full step labels.",
  "mobile-stepper":
    "MobileStepper is the compact dots, text, or progress variant for short wizards on phones. Pair it with a carousel or a brief flow — for long forms, full Stepper carries more context.",
  "app-bar":
    "AppBar is the flexible sticky bar if you're building chrome from scratch. Most Spatika apps don't need it — AppHeader `variant=\"chrome\"` already handles safe areas and glass. Reach for AppBar when you're composing something custom.",
  "bottom-navigation":
    "BottomNavigation gives you labeled icon destinations along the bottom of the screen. It works, but for Spatika product shells we'd steer you toward MobileTabBar — the floating capsule feels more at home on modern iOS.",
  menu: "Menu is an anchored action menu with items that dismiss on outside click and Escape. Focus returns to the trigger when it closes, which keeps keyboard users oriented.",
  breadcrumb:
    "Breadcrumb shows where someone is in a hierarchy with chevrons between levels. The root is a `nav` with `aria-label=\"Breadcrumb\"`, and the last item represents the current page.",
  pagination: "Pagination is the prev / next control when content is split across pages. When the control lives under a data table, TablePagination includes rows-per-page and range text as well.",
  "speed-dial":
    "SpeedDial is a FAB that fans out related actions from the corner. Use it when several equally important actions compete for the same spot; otherwise a single Fab is less surprising.",
  "app-header":
    "AppHeader is the bar your users see at the top of every screen — fixed, safe-area aware, and calm to match the rest of Spatika. For product apps, use `variant=\"chrome\"` and pair it with FloatingPageChromeBar for page tools and MobileTabBar for main navigation on phones. Marketing pages and docs can use `sticky` instead, which scrolls with the page until it pins.",
  "site-nav":
    "SiteNav is for marketing sites — brand lockup, doc links, GitHub, and a mobile menu. Once someone is inside your product, switch to AppHeader so the chrome feels like the app, not the website.",
  "site-footer":
    "SiteFooter closes out marketing pages with your brand, doc links, and a slot for npm or GitHub. Legal lines and external links live here rather than in AppHeader, where they'd clutter the product.",
  "contact-link":
    "ContactLink is a contact row with a tinted icon, handle, and arrow — built for profile and about pages. It is not meant for in-app navigation between screens.",
  "floating-page-chrome":
    "This is the page toolbar that sits just under AppHeader — the place for your page title, search field, filters, and the one action you want within thumb reach. Pass your scrolling content as children and it stays below the bar instead of sliding underneath. Think of it as the control panel for a list, directory, or dashboard page.",
  "page-sticky-header":
    "Sometimes you just need a title and a couple of actions to stay visible while the page scrolls — not the whole floating chrome tray. PageStickyHeader does that. It's a lighter option for detail pages, settings, or anywhere the header can be simpler.",
  "mobile-tab-bar":
    "On mobile, this is how people move between the main sections of your app — a floating capsule tab bar with that iOS feel. Give the bar an `ariaLabel` and mark whichever tab matches the current route with `active` so screen readers know where you are.",
  "filter-sheet":
    "Filters shouldn't fight your layout. FilterSheet shows them in a popover on desktop and slides up as a drawer on phone, with Clear and Done handled for you. Pass a trigger (usually a button in FloatingPageChromeBar) and put your filter controls inside.",
  "header-icon-button":
    "Toolbar icons in AppHeader and FloatingPageChromeBar need a calm treatment that matches the chrome — that's HeaderIconButton. For icons inside page content, stick with IconButton.",
  "cover-hero":
    "CoverHero is how Spatika does cover art — a wide header with an identity notch cut in for an avatar or logo. Pass a photo URL, or give us a `coverSeed` and we'll generate a pattern from your theme tokens. Set `bleed={false}` when you're previewing inside docs or a device frame so the cover doesn't paint under the header.",
  "profile-hero":
    "ProfileHero bundles the cover, avatar, name, and metadata for a person or entity page. On the live route, call `useCoverChromeBleed` so AppHeader picks up the cover colors as it floats over the top — that's what makes profile pages feel polished.",
  "entity-media-card":
    "EntityMediaCard is a photo-forward card for people and albums in a grid. EntityCard is better for text-first directory rows; this composite assumes the image is the hook.",
  "image-list":
    "ImageList lays out images in standard, quilted, or masonry grids with optional bars on each item. Compose ImageListItem and ImageListItemBar; reach for Masonry only when the children are not images.",
  progress:
    "Progress is a linear bar for determinate fractions or indeterminate loading. Determinate bars expose `aria-valuenow`; indeterminate bars should set `aria-label=\"Loading\"` so the state is announced.",
  "circular-progress":
    "CircularProgress is the round sibling — determinate arc or spinning indicator in tight spaces. Same progressbar semantics as Progress; we nest it in buttons and empty tiles when a bar would feel heavy.",
  skeleton: "Skeleton is a shimmer placeholder while real content loads so layouts do not jump. Match the shape of what replaces it — text lines, circles for avatars, rounded blocks for cards.",
  alert:
    "Alert is inline status messaging that stays on the page until dismissed or resolved. The root has `role=\"alert\"` — keep the title short and put detail in `AlertDescription`. For toast-style messages that auto-dismiss, use Snackbar or Toaster instead.",
  "empty-state":
    "EmptyState is what we show when a list or chart has nothing yet — icon, short copy, and an optional CTA to fix that. It is not a substitute for Alert when something actually went wrong.",
  toast:
    "Toaster is a transient notification stack at the edge of the screen. Wrap the tree and call `useToast()` to push `{ title, description, tone }`. For a single anchored message with one action, Snackbar can be simpler.",
  snackbar:
    "Snackbar is a single anchored message with an optional action — Undo is the classic example. It auto-hides after `autoHideDuration`, so keep the copy short and put the action in `action`.",
  dialog:
    "Dialog is a titled modal with overlay and focus trapped while open. Use Modal only when you need a fully custom surface; for page filters, FilterSheet already handles responsive layout.",
  modal:
    "Modal is the low-level overlay when Dialog's title chrome is not what you need. We still prefer Dialog for most cases so the title is exposed to assistive tech — Escape and backdrop click dismiss unless you disable them.",
  tooltip:
    "Tooltip adds a short hint on hover and focus for controls that need a nudge. Do not hide essential information only in a tooltip — on touch, it is unavailable unless the target can receive focus.",
  table:
    "Table is a semantic data table with header, body, and footer for structured rows. Pair it with TablePagination when datasets are large. Prefer ChartDataGrid when selecting a row should highlight a matching chart mark.",
  "table-pagination":
    "TablePagination is rows-per-page and range controls that sit under a table. It does not slice data for you — you still paginate the rows in your data layer and pass the current page.",
  "chart-data-grid":
    "ChartDataGrid pairs a table and chart on the same dataset so inspection and visualization stay in sync. Selecting a row highlights the matching mark — use it when a plot needs an inspectable table, not as a generic spreadsheet grid.",
  "event-calendar":
    "EventCalendar is a month, week, day, and agenda calendar with create/edit, resize, recurrence, and preferences. Hide the kit editor, replace event chips, or use a compact toolbar with month/year jump. `onVisibleRangeChange` reports the painted window. It shares `SchedulerEvent` types with EventTimeline.",
  "event-timeline":
    "EventTimeline is a horizontal resource timeline with scales from hours to years, plus resize and the shared event editor. When people think in days on a grid, EventCalendar is usually the better mental model.",
  "chart-container":
    "ChartContainer is the shared shell for bar, line, and area plots — zoom, pan, brush, dual axes, toolbar, and export in one place. Import from `@spatika/charts`. Use `syncId` to link hover across plots, `sharedTooltip` for Recharts-style category tooltips, and `referenceLines` / `referenceAreas` / `referenceDots` for overlay guides. `loading` and `emptyText` cover fetch and no-data states; `legendPosition` places the legend.",
  "bar-chart":
    "BarChart draws grouped or stacked bars when you are comparing categories side by side. Pass `showToolbar` for zoom and SVG/PNG export; colors default to theme chart tokens. `onItemClick` and `itemColors` handle per-bar actions and tints, `showBarBackground` draws category tracks, and `xAxis.tickAngle` helps with long labels.",
  "line-chart":
    "LineChart draws trend lines with monotone, linear, or step curves when change over time is the story. If the fill under the line carries meaning — volume, confidence, cumulative area — AreaChart is the natural next step.",
  "area-chart":
    "AreaChart fills the series under the line so volume over time reads at a glance. Set `stacked` for cumulative layers; use RangeAreaChart when you need a band between low and high values.",
  "pie-chart":
    "PieChart shows part-to-whole share as pie or donut slices — best when the slice count stays small. Radii accept pixels, 0–1 fractions, or percent strings so the ring stays inside the plot when a legend sits above it. Set `labelLine` for outside labels with leaders; beyond a handful of slices, a bar or funnel often reads better.",
  "scatter-chart":
    "ScatterChart plots points for correlation, clusters, and outliers in two dimensions. Set `renderer=\"webgl\"` for large clouds; SVG is the default and stays crisp for smaller sets.",
  "scatter-webgl":
    "ScatterChart with WebGL draws GPU point sprites for large clouds, with SVG axes and tooltips layered on top. Stick with the SVG renderer when you have a few hundred points or fewer — it is simpler to reason about.",
  sparkline:
    "SparkLineChart is a compact inline trend without axes — perfect inside StatCard or a table cell. Hover still shows a tooltip; pass `labels` for category text. When you need axes and a legend, step up to LineChart.",
  gauge: "Gauge is an arc gauge, or a segmented semi-donut when you want named sections around the arc. For a horizontal bounded value without the curve, LinearGauge is the flatter option.",
  "radar-chart":
    "RadarChart draws filled polygons across a shared metric set so several dimensions compare on one shape. Use PolarLineChart when you want the polar line without the filled radar area.",
  heatmap:
    "Heatmap colors a grid by intensity for two categorical axes — calendar patterns, category matrices, that kind of view. Use Treemap when values are nested rather than a flat matrix; `showCellLabels` and `onItemClick` cover in-cell counts and activation.",
  "funnel-chart":
    "FunnelChart shows stage-by-stage conversion with optional comparison overlay and inside or outside labels. PyramidChart fits hierarchical composition that is not really about drop-off between stages.",
  "pyramid-chart":
    "PyramidChart draws pyramid bands for hierarchical composition when the story is structure, not conversion. When drop-off between stages is the point, FunnelChart tells that story more directly.",
  "sankey-chart":
    "SankeyChart draws flow ribbons between source and target nodes — great when left-to-right reading matches how people think about the flow. ChordChart is better when the story is a circular matrix of directed flows.",
  "range-bar-chart":
    "RangeBarChart draws bars that span a low–high interval per category — useful for timelines, spreads, and confidence bands. BoxPlotChart adds quartiles and outliers when the distribution matters too.",
  "candlestick-chart":
    "CandlestickChart draws OHLC candles so open, high, low, and close read in one glyph. OhlcChart drops the bodies when you only need ticks without the filled candle shape.",
  "radial-bar-chart":
    "RadialBarChart places circular bars on a shared radial axis when a polar layout fits the metaphor. For everyday category comparison, cartesian BarChart is usually easier to read.",
  "radial-line-chart":
    "RadialLineChart is a polar line around a radial metric axis — cyclic data without filling a radar polygon. Use RadarChart when several series should compare as filled polygons.",
  "linear-gauge":
    "LinearGauge is a horizontal gauge for a bounded value on a straight track. Use Gauge for an arc metaphor; use Progress when the value is really a loading fraction rather than a measurement.",
  "bubble-chart":
    "BubbleChart extends scatter with a third size dimension encoded in each point's radius. Every point needs `x`, `y`, and `z` so size and position stay meaningful.",
  "range-area-chart":
    "RangeAreaChart bands the area between low and high series — uncertainty, min–max, forecast windows. AreaChart is the single-series fill when you do not need that band.",
  treemap: "Treemap sizes nested rectangles by value so hierarchy and magnitude share one view. SunburstChart reads the same tree as concentric rings when radial layout fits the page better.",
  "polar-line-chart":
    "PolarLineChart plots a line on polar axes without the filled radar area. Reach for RadarChart when the filled comparison between series is part of the insight.",
  "chord-chart":
    "ChordChart shows a circular matrix of directed flows between entities. SankeyChart is the better default when nodes naturally read left-to-right.",
  "waterfall-chart":
    "WaterfallChart builds a running total with increases, decreases, and subtotals — ideal for P&L-style stories. BarChart is still right when categories are independent, not cumulative.",
  "boxplot-chart":
    "BoxPlotChart draws quartiles, whiskers, and outliers per category when distribution shape matters. RangeBarChart is enough when you only need a low–high span without the box statistics.",
  "ohlc-chart":
    "OhlcChart draws open-high-low-close ticks without candle bodies when direction color is not the focus. CandlestickChart adds bodies when up/down encoding helps traders scan faster.",
  "sunburst-chart":
    "SunburstChart renders hierarchical rings from a nested tree — drill-friendly and compact for deep taxonomies. Treemap is the rectangle alternative when area comparison matters more than radial drill-down.",
  "map-chart":
    "MapChart is a choropleth from GeoJSON with Mercator or equirectangular projection. Pass features and a value accessor; colors follow theme chart tokens so maps match the rest of your dashboards.",
  "bar-chart-3d":
    "BarChart3D draws isometric extruded bars when you want a dimensional look for categorical comparison. For zoom, brush, or toolbar export, flat BarChart is the more capable day-to-day choice.",
  "pie-chart-3d":
    "PieChart3D is an elliptical extruded pie with a lit rim — more presentation than precision. Use PieChart when you need a donut hole or theme-token slices without the 3D treatment.",
};

export function getIntro(entry: ComponentEntry): string {
  const named = intros[entry.slug] ?? getAppDoc(entry.slug)?.intro;
  if (named) return named;
  const lead = entry.description.endsWith(".") ? entry.description : `${entry.description}.`;
  const pkg =
    entry.category === "Charts"
      ? "@spatika/charts"
      : entry.category === "Editor"
        ? "@spatika/editor"
        : "@spatika/react";
  const styles =
    entry.category === "Editor" ? " Remember to import `@spatika/editor/styles.css` alongside `@spatika/tokens/styles.css`." : "";
  return `${lead} You will find it in \`${pkg}\` — start with \`@spatika/tokens/styles.css\` at your app root.${styles} The live preview here follows whichever theme you have picked in the docs toolbar.`;
}
