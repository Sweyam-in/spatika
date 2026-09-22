export type NavItem = { label: string; to: string };

export const topNav: NavItem[] = [
  { label: "Design", to: "/design" },
  { label: "Components", to: "/components" },
  { label: "Customize", to: "/customize" },
  { label: "Guides", to: "/guides" },
  { label: "Showcase", to: "/showcase" },
];

export const designNav: NavItem[] = [
  { label: "Principles", to: "/design#principles" },
  { label: "Themes", to: "/design#themes" },
  { label: "Glass & surfaces", to: "/design#glass" },
  { label: "Typography", to: "/design#typography" },
  { label: "Motion", to: "/design#motion" },
];

export const customizeNav: NavItem[] = [
  { label: "How to customize", to: "/customize#how-to-customize" },
  { label: "Creating a theme", to: "/customize#creating-a-theme" },
  { label: "Color palette", to: "/customize#color-palette" },
  { label: "CSS variables", to: "/customize#css-variables" },
  { label: "Breakpoints", to: "/customize#breakpoints" },
  { label: "Responsive design", to: "/customize#responsive-design" },
  { label: "Typography", to: "/customize#typography" },
  { label: "Spacing & shape", to: "/customize#spacing-shape" },
  { label: "Dark mode", to: "/customize#dark-mode" },
  { label: "Glass & motion", to: "/customize#glass-motion" },
  { label: "z-index", to: "/customize#z-index" },
];

export const guideNav: NavItem[] = [
  { label: "Installation", to: "/guides#installation" },
  { label: "Theming", to: "/guides#theming" },
  { label: "App shell", to: "/guides#app-shell" },
  { label: "Cover pages", to: "/guides#cover-pages" },
  { label: "Scheduler", to: "/guides#scheduler" },
  { label: "Charts", to: "/guides#charts" },
  { label: "Editor", to: "/guides#editor" },
  { label: "AI agents", to: "/guides#ai-agents" },
  { label: "Publishing", to: "/guides#publishing" },
  { label: "Contribute", to: "/guides#contribute" },
];

export type ComponentEntry = {
  slug: string;
  name: string;
  category:
    | "Primitives"
    | "Layout"
    | "Navigation"
    | "Feedback"
    | "Media"
    | "Forms"
    | "Data"
    | "Marketing"
    | "Charts"
    | "Editor";
  description: string;
  importName: string;
};

export type ComponentPackage = "@spatika/react" | "@spatika/charts" | "@spatika/editor";

export function componentImportPackage(category: ComponentEntry["category"]): ComponentPackage {
  if (category === "Charts") return "@spatika/charts";
  if (category === "Editor") return "@spatika/editor";
  return "@spatika/react";
}

export function componentImportCode(entry: ComponentEntry): string {
  const pkg = componentImportPackage(entry.category);
  const lines: string[] = [];
  if (entry.category === "Editor") {
    lines.push('import "@spatika/editor/styles.css";');
  }
  lines.push(`import { ${entry.importName} } from "${pkg}";`);
  return lines.join("\n");
}

export const components: ComponentEntry[] = [
  { slug: "button", name: "Button", category: "Primitives", description: "Actions in five weights — primary, secondary, ghost, soft and destructive — with density-aware sizes and a loading state.", importName: "Button" },
  { slug: "button-group", name: "ButtonGroup", category: "Primitives", description: "A row of related actions that read as one control — perfect for toolbars and split decisions.", importName: "ButtonGroup" },
  { slug: "icon-button", name: "IconButton", category: "Primitives", description: "A compact square button for icons only — pair it with aria-label so everyone knows what it does.", importName: "IconButton" },
  { slug: "fab", name: "Fab", category: "Primitives", description: "A floating action that stays reachable — circular for one tap, extended when you need a label.", importName: "Fab" },
  { slug: "link", name: "Link", category: "Primitives", description: "Text that navigates — underline styles that feel at home in product screens and marketing pages alike.", importName: "Link" },
  { slug: "typography", name: "Typography", category: "Primitives", description: "Your app's type scale in one component — display headlines down to quiet captions.", importName: "Typography" },
  { slug: "badge", name: "Badge", category: "Primitives", description: "Small labels for status, counts, and context — sits lightly on cards and list rows.", importName: "Badge" },
  { slug: "avatar", name: "Avatar", category: "Primitives", description: "A face or initials in a circle — the quick way to show who something belongs to.", importName: "Avatar" },
  { slug: "avatar-group", name: "AvatarGroup", category: "Primitives", description: "Overlapping avatars with a +N overflow — great for teams and shared ownership.", importName: "AvatarGroup" },
  { slug: "accordion", name: "Accordion", category: "Primitives", description: "Expandable sections when screen space is tight — summary row, details tucked inside.", importName: "Accordion" },
  { slug: "button-base", name: "ButtonBase", category: "Primitives", description: "The unstyled pressable underneath buttons and list rows — build your own hit target.", importName: "ButtonBase" },
  { slug: "rating", name: "Rating", category: "Primitives", description: "Star ratings with hover and half steps — for reviews, feedback, and display-only scores.", importName: "Rating" },
  { slug: "box", name: "Box", category: "Primitives", description: "A flexible layout wrapper with a polymorphic `as` — spacing and styling without extra div soup.", importName: "Box" },
  { slug: "chip", name: "Chip", category: "Primitives", description: "Toggleable pills for filters and preferences — active state built in.", importName: "Chip" },
  { slug: "tag", name: "Tag", category: "Primitives", description: "Static labels for skills and metadata — not clickable, just there to inform.", importName: "Tag" },
  { slug: "wordmark", name: "Wordmark", category: "Primitives", description: "Your product name with an optional accent — made for navbars and hero moments.", importName: "Wordmark" },
  { slug: "gradient-text", name: "GradientText", category: "Primitives", description: "Display type with a quiet ink fade — kept for 1.x marketing pages.", importName: "GradientText" },
  { slug: "availability-badge", name: "AvailabilityBadge", category: "Primitives", description: "A small pill with a live dot — open to work, online now, that kind of signal.", importName: "AvailabilityBadge" },
  { slug: "tabs", name: "Tabs", category: "Primitives", description: "Switch between sections on the same page — triggers up top, panels below.", importName: "Tabs" },
  { slug: "switch", name: "Switch", category: "Primitives", description: "A satisfying on/off for settings — pair with FormControlLabel for a bigger tap target.", importName: "Switch" },
  { slug: "input", name: "Input", category: "Forms", description: "A bare text field when you already own the label — shared focus ring with the rest of the form kit.", importName: "Input" },
  { slug: "text-field", name: "TextField", category: "Forms", description: "Label, input, and helper text in one piece — the default for most forms.", importName: "TextField" },
  { slug: "autocomplete", name: "Autocomplete", category: "Forms", description: "Type to filter a list of options — single or multi-select, with free-solo when needed.", importName: "Autocomplete" },
  { slug: "outlined-input", name: "OutlinedInput", category: "Forms", description: "An input with icons or units at the start or end — adornments without rebuilding the field.", importName: "OutlinedInput" },
  { slug: "form-control", name: "FormControl", category: "Forms", description: "Groups label, control, and helper into one accessible unit — the building block for custom fields.", importName: "FormControl" },
  { slug: "select", name: "Select", category: "Forms", description: "A custom dropdown when native `<select>` won't cut it — keyboard-friendly listbox inside.", importName: "Select" },
  { slug: "textarea-autosize", name: "TextareaAutosize", category: "Forms", description: "A textarea that grows as people type — no scroll trap on short notes.", importName: "TextareaAutosize" },
  { slug: "transfer-list", name: "TransferList", category: "Forms", description: "Move items between two lists — permissions, assignees, and shuttle UIs.", importName: "TransferList" },
  { slug: "checkbox", name: "Checkbox", category: "Forms", description: "Check one, check many, or show indeterminate — selection with a clear visual state.", importName: "Checkbox" },
  { slug: "form-control-label", name: "FormControlLabel", category: "Forms", description: "Wraps a control beside its label — bigger hit area for checkboxes and switches.", importName: "FormControlLabel" },
  { slug: "slider", name: "Slider", category: "Forms", description: "Pick a value along a track — volume, opacity, anything continuous.", importName: "Slider" },
  { slug: "toggle-button", name: "ToggleButton", category: "Forms", description: "A cluster of toggles that can behave like tabs or multi-select filters.", importName: "ToggleButton" },
  { slug: "search-field", name: "SearchField", category: "Forms", description: "Search with a leading icon baked in — the usual pattern for toolbars and chrome.", importName: "SearchField" },
  { slug: "chip-group", name: "ChipGroup", category: "Forms", description: "A row of selectable chips — filters and tags that behave like a multi-select.", importName: "ChipGroup" },
  { slug: "segmented-control", name: "SegmentedControl", category: "Forms", description: "One choice from a few segments — compact mode switching on mobile and desktop.", importName: "SegmentedControl" },
  { slug: "paper", name: "Paper", category: "Layout", description: "A low-level surface with elevation or outline — the quiet foundation under cards and panels.", importName: "Paper" },
  { slug: "grid", name: "Grid", category: "Layout", description: "A responsive twelve-column grid — set `xs` through `xl` and let items reflow.", importName: "Grid" },
  { slug: "masonry", name: "Masonry", category: "Layout", description: "Packed columns for uneven tiles — Pinterest-style grids without manual positioning.", importName: "Masonry" },
  { slug: "stack", name: "Stack", category: "Layout", description: "Flex layout with consistent gap — column by default, row when you need a toolbar.", importName: "Stack" },
  { slug: "container", name: "Container", category: "Layout", description: "Centers content at a sensible max-width — the page wrapper most screens start with.", importName: "Container" },
  { slug: "list", name: "List", category: "Layout", description: "Rows with icon, primary, and secondary text — directories and settings menus.", importName: "List" },
  { slug: "card", name: "Card", category: "Layout", description: "A container for a discrete object — solid by default, with `surface` for raised, subtle, sunken or glass.", importName: "Card" },
  { slug: "glass-card", name: "GlassCard", category: "Layout", description: "1.x alias of Card — variants map onto the 2.0 surface model; only `variant=\"glass\"` is translucent.", importName: "GlassCard" },
  { slug: "stat-card", name: "StatCard", category: "Layout", description: "A Metric in a card — number, label, delta and an optional sparkline. Prefer MetricGroup for KPI strips.", importName: "StatCard" },
  { slug: "page-section", name: "PageSection", category: "Layout", description: "Heading, description and actions over content — structure a page without boxing every section.", importName: "PageSection" },
  { slug: "panel", name: "Panel", category: "Layout", description: "A bordered frame with a header bar for charts, tables and feeds that need their own container.", importName: "Panel" },
  { slug: "section-heading", name: "SectionHeading", category: "Layout", description: "Section titles with eyebrow, subtitle, and accent rule — structure for long pages.", importName: "SectionHeading" },
  { slug: "icon-tile", name: "IconTile", category: "Layout", description: "A horizontal tile with icon and caption — domain pickers and feature grids.", importName: "IconTile" },
  { slug: "career-card", name: "CareerCard", category: "Layout", description: "A resume row with period, bullets, and tech tags — timelines for people and teams.", importName: "CareerCard" },
  { slug: "project-card", name: "ProjectCard", category: "Layout", description: "A shipped-work tile — outcome pill and stack tags for portfolio grids.", importName: "ProjectCard" },
  { slug: "float-chip", name: "FloatChip", category: "Layout", description: "A small fact chip for hero portraits — location, role, little details.", importName: "FloatChip" },
  { slug: "meta-chip", name: "MetaChip", category: "Layout", description: "A quiet powered-by or attribution chip — optional icon, stays out of the way.", importName: "MetaChip" },
  { slug: "entity-card", name: "EntityCard", category: "Layout", description: "A quiet list row for people and records — avatar, title, and metadata in one line.", importName: "EntityCard" },
  { slug: "list-row", name: "ListRow", category: "Layout", description: "A selectable directory row — pressable base with room for avatar and chevron.", importName: "ListRow" },
  { slug: "app-shell", name: "AppShell", category: "Navigation", description: "Sidebar, top bar and content frame — collapses to a rail on desktop and becomes a sheet on phones.", importName: "AppShell" },
  { slug: "command-palette", name: "CommandPalette", category: "Navigation", description: "A ⌘K palette for navigation and actions — grouped commands, shortcuts and a keyboard legend.", importName: "CommandPalette" },
  { slug: "stepper", name: "Stepper", category: "Navigation", description: "Walk people through a multi-step flow — horizontal on desktop, vertical when you need room.", importName: "Stepper" },
  { slug: "mobile-stepper", name: "MobileStepper", category: "Navigation", description: "Compact step progress for small screens — dots, text, or a thin bar.", importName: "MobileStepper" },
  { slug: "app-bar", name: "AppBar", category: "Navigation", description: "A flexible sticky bar if you're building chrome from scratch — most apps start with AppHeader instead.", importName: "AppBar" },
  { slug: "bottom-navigation", name: "BottomNavigation", category: "Navigation", description: "Labeled icon tabs along the bottom — MobileTabBar is what we use in Spatika product shells.", importName: "BottomNavigation" },
  { slug: "menu", name: "Menu", category: "Navigation", description: "An anchored menu of actions — click the trigger, pick an item, focus returns cleanly.", importName: "Menu" },
  { slug: "breadcrumb", name: "Breadcrumb", category: "Navigation", description: "Show where someone is in a hierarchy — chevrons between clickable crumbs.", importName: "Breadcrumb" },
  { slug: "pagination", name: "Pagination", category: "Navigation", description: "Step through pages of results — prev and next with room for page numbers.", importName: "Pagination" },
  { slug: "speed-dial", name: "SpeedDial", category: "Navigation", description: "A FAB that fans out related shortcuts — secondary actions without cluttering the bar.", importName: "SpeedDial" },
  { slug: "app-header", name: "AppHeader", category: "Navigation", description: "The fixed bar at the top of your product — safe-area aware, lightly translucent over scrolling content.", importName: "AppHeader" },
  { slug: "site-nav", name: "SiteNav", category: "Navigation", description: "A marketing navbar with your brand, links, and a mobile menu — for landing pages, not logged-in apps.", importName: "SiteNav" },
  { slug: "site-footer", name: "SiteFooter", category: "Navigation", description: "A marketing footer for brand, links, and npm/GitHub — keep legal stuff here, not in product chrome.", importName: "SiteFooter" },
  { slug: "contact-link", name: "ContactLink", category: "Navigation", description: "A contact row with tinted icon and arrow — email, phone, social handles in a list.", importName: "ContactLink" },
  { slug: "floating-page-chrome", name: "FloatingPageChromeBar", category: "Navigation", description: "The page toolbar under your header — room for the page title, search, filters, and primary action.", importName: "FloatingPageChromeBar" },
  { slug: "page-sticky-header", name: "PageStickyHeader", category: "Navigation", description: "A title row that sticks as you scroll — handy when you don't need the full floating toolbar.", importName: "PageStickyHeader" },
  { slug: "mobile-tab-bar", name: "MobileTabBar", category: "Navigation", description: "Floating bottom navigation for phones — hides from `lg` up, where the sidebar takes over.", importName: "MobileTabBar" },
  { slug: "filter-sheet", name: "FilterSheet", category: "Navigation", description: "Filters that feel native — a popover on desktop, a drawer on mobile, with clear and Done built in.", importName: "FilterSheet" },
  { slug: "header-icon-button", name: "HeaderIconButton", category: "Navigation", description: "Icon buttons for headers and page toolbars, with an unread badge — not the same as in-content IconButton.", importName: "HeaderIconButton" },
  { slug: "cover-hero", name: "CoverHero", category: "Media", description: "A cover image with a built-in identity notch — use a photo or let us generate one from a seed.", importName: "CoverHero" },
  { slug: "profile-hero", name: "ProfileHero", category: "Media", description: "The full profile header — cover art, avatar, and metadata, ready for people and story pages.", importName: "ProfileHero" },
  { slug: "entity-media-card", name: "EntityMediaCard", category: "Media", description: "A photo-forward card for people and albums — image on top, details tucked below.", importName: "EntityMediaCard" },
  { slug: "image-list", name: "ImageList", category: "Media", description: "Image grids in standard, quilted, or masonry layouts — galleries without hand-rolling CSS.", importName: "ImageList" },
  { slug: "progress", name: "Progress", category: "Feedback", description: "A horizontal bar for known or unknown wait times — determinate fill or a smooth indeterminate sweep.", importName: "Progress" },
  { slug: "circular-progress", name: "CircularProgress", category: "Feedback", description: "A spinning or filling ring — loading states that fit in tight corners.", importName: "CircularProgress" },
  { slug: "skeleton", name: "Skeleton", category: "Feedback", description: "Shimmer placeholders while content loads — match the shape you're about to show.", importName: "Skeleton" },
  { slug: "alert", name: "Alert", category: "Feedback", description: "Inline status messages on the page — info, warning, and error without blocking the flow.", importName: "Alert" },
  { slug: "empty-state", name: "EmptyState", category: "Feedback", description: "What people see when there's nothing yet — illustration, copy, and a clear next step.", importName: "EmptyState" },
  { slug: "toast", name: "Toaster", category: "Feedback", description: "Transient notifications that stack in a corner — quick confirmations and gentle nudges.", importName: "Toaster" },
  { slug: "snackbar", name: "Snackbar", category: "Feedback", description: "One anchored message with an optional action — Undo, Retry, that kind of thing.", importName: "Snackbar" },
  { slug: "dialog", name: "Dialog", category: "Feedback", description: "A titled modal over a dimmed backdrop — confirmations, forms, and focused tasks.", importName: "Dialog" },
  { slug: "modal", name: "Modal", category: "Feedback", description: "A low-level overlay when you need a custom surface — reach for Dialog first if you want chrome.", importName: "Modal" },
  { slug: "tooltip", name: "Tooltip", category: "Feedback", description: "A short hint on hover or focus — great for icon buttons, not for essential instructions.", importName: "Tooltip" },
  { slug: "data-table", name: "DataTable", category: "Data", description: "Sorting, selection with bulk actions, pinned columns, sticky header, expandable rows and a stacked list on phones.", importName: "DataTable" },
  { slug: "metric", name: "Metric", category: "Data", description: "A typography-led KPI — value, delta, comparison caption and optional sparkline, with tabular numerals.", importName: "Metric" },
  { slug: "table", name: "Table", category: "Data", description: "Semantic tables with header, body, and footer — data grids that screen readers understand.", importName: "Table" },
  { slug: "table-pagination", name: "TablePagination", category: "Data", description: "Rows-per-page and range controls for tables — pairs naturally with Table.", importName: "TablePagination" },
  { slug: "chart-data-grid", name: "ChartDataGrid", category: "Data", description: "A table and chart that share one dataset — select a row and the matching mark highlights.", importName: "ChartDataGrid" },
  { slug: "event-calendar", name: "EventCalendar", category: "Data", description: "Month, week, day, and agenda views in one calendar — create, drag, resize, and recurring events.", importName: "EventCalendar" },
  { slug: "event-timeline", name: "EventTimeline", category: "Data", description: "A horizontal timeline for resources and schedules — hours to years, with the same event editor.", importName: "EventTimeline" },
  { slug: "chart-container", name: "ChartContainer", category: "Charts", description: "The composer for mixed charts — zoom, sync, dual axes, and export when presets aren't enough.", importName: "ChartContainer" },
  { slug: "bar-chart", name: "BarChart", category: "Charts", description: "Compare categories with grouped or stacked bars — clicks, colors, and export out of the box.", importName: "BarChart" },
  { slug: "line-chart", name: "LineChart", category: "Charts", description: "Trend lines over time — monotone, linear, or stepped curves with theme-aware strokes.", importName: "LineChart" },
  { slug: "area-chart", name: "AreaChart", category: "Charts", description: "Filled series that show volume — stack them for cumulative layers over the same axis.", importName: "AreaChart" },
  { slug: "pie-chart", name: "PieChart", category: "Charts", description: "Part-to-whole at a glance — pie or donut slices with labels that stay readable.", importName: "PieChart" },
  { slug: "scatter-chart", name: "ScatterChart", category: "Charts", description: "Plot points to spot correlation and outliers — switch to WebGL when the cloud gets huge.", importName: "ScatterChart" },
  { slug: "scatter-webgl", name: "ScatterChart (WebGL)", category: "Charts", description: "GPU-rendered scatter for massive datasets — SVG axes and tooltips on top.", importName: "ScatterChart" },
  { slug: "sparkline", name: "SparkLineChart", category: "Charts", description: "A tiny trend line without axes — embed metrics inline in tables and stat cards.", importName: "SparkLineChart" },
  { slug: "gauge", name: "Gauge", category: "Charts", description: "An arc or segmented semi-donut for a single KPI — thresholds and labels included.", importName: "Gauge" },
  { slug: "radar-chart", name: "RadarChart", category: "Charts", description: "Compare metrics on a shared spider web — skills, ratings, multi-axis profiles.", importName: "RadarChart" },
  { slug: "heatmap", name: "Heatmap", category: "Charts", description: "Color intensity across two categorical axes — calendars, matrices, and density at a glance.", importName: "Heatmap" },
  { slug: "funnel-chart", name: "FunnelChart", category: "Charts", description: "Stage-by-stage conversion — optional comparison overlay and flexible label placement.", importName: "FunnelChart" },
  { slug: "pyramid-chart", name: "PyramidChart", category: "Charts", description: "Pyramid bands for hierarchical composition — population, budget, layered breakdowns.", importName: "PyramidChart" },
  { slug: "sankey-chart", name: "SankeyChart", category: "Charts", description: "Flow ribbons between sources and targets — see how volume moves through a system.", importName: "SankeyChart" },
  { slug: "range-bar-chart", name: "RangeBarChart", category: "Charts", description: "Bars that span a low–high interval — ranges, confidence, and min–max comparisons.", importName: "RangeBarChart" },
  { slug: "candlestick-chart", name: "CandlestickChart", category: "Charts", description: "OHLC candles for trading and finance — open, high, low, close in one mark.", importName: "CandlestickChart" },
  { slug: "radial-bar-chart", name: "RadialBarChart", category: "Charts", description: "Circular bars on a shared radial axis — rankings and cyclical comparisons.", importName: "RadialBarChart" },
  { slug: "radial-line-chart", name: "RadialLineChart", category: "Charts", description: "A line on a polar axis — cyclical trends without filling the radar.", importName: "RadialLineChart" },
  { slug: "linear-gauge", name: "LinearGauge", category: "Charts", description: "A horizontal gauge for one bounded value — progress toward a target or limit.", importName: "LinearGauge" },
  { slug: "bubble-chart", name: "BubbleChart", category: "Charts", description: "Scatter with a third dimension as bubble size — three variables on one plot.", importName: "BubbleChart" },
  { slug: "range-area-chart", name: "RangeAreaChart", category: "Charts", description: "A band between low and high series — uncertainty and envelopes over time.", importName: "RangeAreaChart" },
  { slug: "treemap", name: "Treemap", category: "Charts", description: "Nested rectangles sized by value — hierarchical share in a compact block.", importName: "Treemap" },
  { slug: "polar-line-chart", name: "PolarLineChart", category: "Charts", description: "Lines on polar axes without the filled radar look — angular trends, lighter footprint.", importName: "PolarLineChart" },
  { slug: "chord-chart", name: "ChordChart", category: "Charts", description: "A circular matrix of directed flows — relationships between many nodes at once.", importName: "ChordChart" },
  { slug: "waterfall-chart", name: "WaterfallChart", category: "Charts", description: "Running totals with rises and drops — bridge charts for how you got to the number.", importName: "WaterfallChart" },
  { slug: "boxplot-chart", name: "BoxPlotChart", category: "Charts", description: "Quartiles, whiskers, and outliers per category — distribution without plotting every point.", importName: "BoxPlotChart" },
  { slug: "ohlc-chart", name: "OhlcChart", category: "Charts", description: "Open-high-low-close ticks without candle bodies — a leaner financial mark.", importName: "OhlcChart" },
  { slug: "sunburst-chart", name: "SunburstChart", category: "Charts", description: "Concentric rings from a nested tree — drill-friendly hierarchical share.", importName: "SunburstChart" },
  { slug: "map-chart", name: "MapChart", category: "Charts", description: "Choropleth maps from GeoJSON — Mercator or equirectangular, colored by your metric.", importName: "MapChart" },
  { slug: "bar-chart-3d", name: "BarChart3D", category: "Charts", description: "Isometric extruded bars — categorical comparison with a bit more depth.", importName: "BarChart3D" },
  { slug: "pie-chart-3d", name: "PieChart3D", category: "Charts", description: "An extruded pie with a lit rim — part-to-whole with a dimensional read.", importName: "PieChart3D" },
  { slug: "marketing-section", name: "MarketingSection", category: "Marketing", description: "A full-bleed band of a landing page — background tone, generous rhythm, and an optional decorative backdrop.", importName: "MarketingSection" },
  { slug: "section-backdrop", name: "SectionBackdrop", category: "Marketing", description: "Aurora, spotlight, grid, dot and prism-ray washes drawn from theme tokens — decoration that retints with the theme.", importName: "SectionBackdrop" },
  { slug: "marketing-hero", name: "MarketingHero", category: "Marketing", description: "The top of a landing page: announcement, headline, lede, calls to action and a product shot.", importName: "MarketingHero" },
  { slug: "announcement-pill", name: "AnnouncementPill", category: "Marketing", description: "The small \"what's new\" pill above a hero headline — links to a changelog or launch post.", importName: "AnnouncementPill" },
  { slug: "feature-grid", name: "FeatureGrid", category: "Marketing", description: "The \"what you get\" block — a responsive grid of FeatureCards in plain, card, outline or accent-rail styles.", importName: "FeatureGrid" },
  { slug: "bento-grid", name: "BentoGrid", category: "Marketing", description: "Asymmetric product overview — tiles carry their own span so the layout has a real focal point.", importName: "BentoGrid" },
  { slug: "pricing-table", name: "PricingTable", category: "Marketing", description: "Plans side by side, with a featured plan that lifts out of the row and struck-through exclusions.", importName: "PricingTable" },
  { slug: "testimonial-card", name: "TestimonialCard", category: "Marketing", description: "A customer quote with avatar, role, logo and rating — as a card, a plain block, or an accent pull quote.", importName: "TestimonialCard" },
  { slug: "logo-cloud", name: "LogoCloud", category: "Marketing", description: "Customer logos as a quiet greyscale row that comes to colour on hover, or as a continuous marquee.", importName: "LogoCloud" },
  { slug: "stat-band", name: "StatBand", category: "Marketing", description: "Proof numbers in a row — uptime, customers, latency — set in tabular figures so they stay aligned.", importName: "StatBand" },
  { slug: "step-flow", name: "StepFlow", category: "Marketing", description: "A numbered \"how it works\" sequence with connectors, laid out as a real ordered list.", importName: "StepFlow" },
  { slug: "cta-band", name: "CtaBand", category: "Marketing", description: "The closing ask — one headline, one line, one action, on a surface, accent or inverse slab.", importName: "CtaBand" },
  { slug: "faq-section", name: "FaqSection", category: "Marketing", description: "Questions on an Accordion, with optional FAQPage JSON-LD for search engines.", importName: "FaqSection" },
  { slug: "marquee", name: "Marquee", category: "Marketing", description: "A seamless scrolling row for logos or short quotes. Pauses on hover, stops under reduced motion.", importName: "Marquee" },
  { slug: "reveal", name: "Reveal", category: "Marketing", description: "Plays a short entrance the first time content scrolls into view — and none at all under reduced motion.", importName: "Reveal" },
  { slug: "showcase-frame", name: "ShowcaseFrame", category: "Marketing", description: "Browser, window or phone chrome around a screenshot or live demo, drawn from tokens so it follows the theme.", importName: "ShowcaseFrame" },
  { slug: "prose", name: "Prose", category: "Marketing", description: "Long-form typography for posts, changelogs and legal pages — headings, lists, quotes, code and figures.", importName: "Prose" },
  { slug: "lead-form", name: "LeadForm", category: "Marketing", description: "Email capture for a landing page — inline or stacked, with pending, success and error states handled.", importName: "LeadForm" },
  { slug: "split-feature", name: "SplitFeature", category: "Marketing", description: "One beat of the product story — copy on one side, a visual on the other. Stack them and the sides alternate.", importName: "SplitFeature" },
  { slug: "comparison-table", name: "ComparisonTable", category: "Marketing", description: "Feature matrix for a pricing page or an \"us vs them\" — a real table with row headers and a highlighted column.", importName: "ComparisonTable" },
  { slug: "article-card", name: "ArticleCard", category: "Marketing", description: "One entry in a blog, changelog or press listing — cover, title, excerpt, byline and reading time.", importName: "ArticleCard" },
  { slug: "spatika-editor", name: "SpatikaEditor", category: "Editor", description: "A rich-text editor for notes and docs in your app — quiet toolbar, slash shortcuts, @mentions, tables, images, and room for your own AI.", importName: "SpatikaEditor" },
  { slug: "use-spatika-editor", name: "useSpatikaEditor", category: "Editor", description: "Love the editing experience but not our toolbar? Same engine as SpatikaEditor, with the UI entirely up to you.", importName: "useSpatikaEditor" },
  { slug: "rich-text-editor", name: "RichTextEditor", category: "Editor", description: "Still here for older screens. For anything new, SpatikaEditor is the way to go.", importName: "RichTextEditor" },
];

export const componentCategories = [
  "Primitives",
  "Forms",
  "Layout",
  "Navigation",
  "Feedback",
  "Media",
  "Data",
  "Marketing",
  "Charts",
  "Editor",
] as const;

export const componentNavGroups = componentCategories.map((category) => ({
  title: category,
  items: components
    .filter((item) => item.category === category)
    .map((item) => ({ label: item.name, to: `/components/${item.slug}` })),
}));
