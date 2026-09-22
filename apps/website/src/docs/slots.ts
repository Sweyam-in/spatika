import type { ComponentEntry } from "../data/navigation";
import type { SlotDoc } from "./types";

function s(
  name: string,
  defaultComponent: string,
  description: string,
  exportName?: string,
): SlotDoc {
  return {
    name,
    className: `[data-slot="${name}"]`,
    defaultComponent,
    description,
    exportName,
  };
}

function rootSlot(entry: ComponentEntry, el = "div"): SlotDoc {
  const name = rootSlotName(entry);
  const asChild =
    ["button", "icon-button", "fab", "link", "badge", "button-base"].includes(entry.slug)
      ? " Pass `asChild` to merge props onto a child element instead of this tag."
      : "";
  return s(name, el, `Root of ${entry.name}.${asChild}`);
}

function rootSlotName(entry: ComponentEntry): string {
  if (entry.slug === "toast") return "toaster";
  if (entry.slug === "scatter-webgl") return "scatter-webgl";
  return entry.slug;
}

function chartSlots(root: string, extras: SlotDoc[] = []): SlotDoc[] {
  return [
    s(root, "div", "Chart root. Also has class `.spk-chart`."),
    s("chart-surface", "div", "Plot surface that holds SVG axes and marks."),
    s("chart-grid", "g", "Cartesian grid lines."),
    s("chart-x-axis", "g", "Category or time axis."),
    s("chart-y-axis", "g", "Value axis."),
    ...extras,
  ];
}

const slotsBySlug: Record<string, SlotDoc[]> = {
  button: [rootSlot({ slug: "button", name: "Button" } as ComponentEntry, "button")],
  "button-group": [s("button-group", "div", "Connected cluster wrapping child buttons.")],
  "icon-button": [s("icon-button", "button", "Icon-only root. Pass `asChild` to render a link.")],
  fab: [s("fab", "button", "Circular or extended floating action root.")],
  link: [s("link", "a", "Anchor root. Pass `asChild` for a router Link.")],
  typography: [s("typography", "p", "Maps `variant` to a semantic element unless `component` is set.")],
  badge: [s("badge", "span", "Standalone status pill. Pass `asChild` to merge onto a child.")],
  avatar: [
    s("avatar", "span", "Identity mark root.", "Avatar"),
    s("avatar-image", "img", "Photo. Hidden when loading fails.", "AvatarImage"),
    s("avatar-fallback", "span", "Initials or placeholder when the image is missing.", "AvatarFallback"),
  ],
  "avatar-group": [
    s("avatar-group", "div", "Overlapping stack."),
    s("avatar-group-surplus", "span", "Overflow count when `max` is exceeded."),
  ],
  accordion: [
    s("accordion", "div", "Accordion root.", "Accordion"),
    s("accordion-item", "div", "One panel. `value` is the stable id.", "AccordionItem"),
    s("accordion-trigger", "button", "Summary that toggles the panel.", "AccordionSummary"),
    s("accordion-content", "div", "Collapsible details.", "AccordionContent"),
    s("accordion-actions", "div", "Optional action row under the details.", "AccordionActions"),
  ],
  "button-base": [s("button-base", "button", "Unstyled pressable. Pass `asChild` to merge onto a child.")],
  rating: [s("rating", "span", "Star group root.")],
  box: [s("box", "div", "Polymorphic wrapper. Change the tag with `component`.")],
  chip: [s("chip", "button", "Toggleable filter pill.")],
  tag: [s("tag", "span", "Static label pill.")],
  wordmark: [s("wordmark", "span", "Brand name plus gradient accent.")],
  "gradient-text": [s("gradient-text", "span", "Gradient display type. Also uses `.spk-gradient-text`.")],
  "availability-badge": [s("availability-badge", "span", "Pill with a live status pip.")],
  tabs: [
    s("tabs", "div", "Tabs root.", "Tabs"),
    s("tabs-list", "div", "Tab list (`tablist`).", "TabsList"),
    s("tabs-trigger", "button", "One tab.", "TabsTrigger"),
    s("tabs-content", "div", "Selected panel (`tabpanel`).", "TabsContent"),
  ],
  switch: [
    s("switch", "button", "Switch root (`role=\"switch\"`)."),
    s("switch-thumb", "span", "Sliding thumb."),
  ],
  input: [s("input", "input", "Unadorned text field.")],
  "text-field": [
    s("text-field", "div", "Labeled field root."),
    s("text-field-helper", "p", "Helper or error text, wired to `aria-describedby`."),
  ],
  autocomplete: [
    s("autocomplete", "div", "Combobox root."),
    s("autocomplete-list", "ul", "Filtered options list."),
  ],
  "outlined-input": [
    s("outlined-input", "div", "Input with adornment slots."),
    s("input-adornment", "div", "Start or end adornment.", "InputAdornment"),
  ],
  "form-control": [
    s("form-control", "div", "Label, control, and helper grouping.", "FormControl"),
    s("form-label", "label", "Visible label.", "FormLabel"),
    s("form-helper-text", "p", "Helper under the control.", "FormHelperText"),
  ],
  select: [
    s("select-trigger", "button", "Closed-state trigger.", "SelectTrigger"),
    s("select-value", "span", "Selected value placeholder.", "SelectValue"),
    s("select-content", "div", "Listbox popup.", "SelectContent"),
    s("select-item", "div", "One option.", "SelectItem"),
    s("select-group", "div", "Option group.", "SelectGroup"),
    s("select-label", "div", "Group label.", "SelectLabel"),
    s("select-separator", "div", "Divider between groups.", "SelectSeparator"),
  ],
  "textarea-autosize": [s("textarea-autosize", "textarea", "Growing textarea.")],
  "transfer-list": [s("transfer-list", "div", "Two lists plus shuttle controls.")],
  checkbox: [
    s("checkbox", "button", "Checkbox root."),
    s("checkbox-indicator", "span", "Check / indeterminate mark."),
  ],
  "form-control-label": [s("form-control-label", "label", "Control plus visible label.")],
  slider: [
    s("slider", "span", "Slider root."),
    s("slider-track", "span", "Full track."),
    s("slider-range", "span", "Filled range between thumbs."),
    s("slider-thumb", "span", "Draggable thumb. Keyboard-operable."),
  ],
  "toggle-button": [
    s("toggle-button-group", "div", "Cluster root.", "ToggleButtonGroup"),
    s("toggle-button", "button", "One toggle.", "ToggleButton"),
  ],
  "search-field": [s("search-field", "div", "Search input with leading icon.")],
  "chip-group": [s("chip-group", "div", "Multi-select chip rail.")],
  "segmented-control": [s("segmented-control", "div", "Single-select radiogroup.")],
  paper: [s("paper", "div", "Elevated or outlined surface.")],
  grid: [s("grid", "div", "Twelve-column grid container or item.")],
  masonry: [s("masonry", "div", "Packed columns.")],
  stack: [s("stack", "div", "Flex stack with `spacing`.")],
  container: [s("container", "div", "Centered max-width wrapper.")],
  list: [
    s("list", "ul", "List root.", "List"),
    s("list-item", "li", "Row.", "ListItem"),
    s("list-item-button", "div", "Selectable row.", "ListItemButton"),
    s("list-item-icon", "div", "Leading icon.", "ListItemIcon"),
    s("list-item-text", "div", "Primary and secondary text.", "ListItemText"),
  ],
  card: [
    s("card", "div", "Card root.", "Card"),
    s("card-header", "div", "Title row.", "CardHeader"),
    s("card-title", "h3", "Title.", "CardTitle"),
    s("card-description", "p", "Supporting copy.", "CardDescription"),
    s("card-content", "div", "Body.", "CardContent"),
    s("card-footer", "div", "Action row.", "CardFooter"),
    s("card-media", "div", "Optional media block.", "CardMedia"),
    s("card-action-area", "div", "Pressable region.", "CardActionArea"),
  ],
  "glass-card": [s("glass-card", "div", "Frosted surface. Variant maps to `.glass` utilities.")],
  "stat-card": [s("stat-card", "div", "Metric tile. Optional sparkline is a child, not a slot component.")],
  "section-heading": [s("section-heading", "header", "Eyebrow, title, subtitle, and accent rule.")],
  "icon-tile": [s("icon-tile", "div", "Icon, italic title, and caption.")],
  "career-card": [
    s("career-card", "article", "Resume row."),
    s("career-timeline", "div", "Optional timeline wrapper around several cards."),
  ],
  "project-card": [s("project-card", "article", "Shipped-work tile.")],
  "float-chip": [s("float-chip", "div", "Frosted fact chip for heroes.")],
  "meta-chip": [s("meta-chip", "span", "Powered-by chip.")],
  "entity-card": [
    s("entity-card", "div", "Directory row root.", "EntityCard"),
    s("entity-card-title", "div", "Primary name.", "EntityCardTitle"),
    s("entity-card-meta", "div", "Secondary line.", "EntityCardMeta"),
    s("entity-card-chip", "span", "Trailing chip.", "EntityCardChip"),
  ],
  "list-row": [s("list-row", "button", "Selectable directory row.")],
  stepper: [
    s("stepper", "div", "Stepper root.", "Stepper"),
    s("step", "div", "One step.", "Step"),
    s("step-label", "div", "Step title.", "StepLabel"),
    s("step-content", "div", "Optional body under a vertical step.", "StepContent"),
    s("step-connector", "div", "Line between steps.", "StepConnector"),
  ],
  "mobile-stepper": [s("mobile-stepper", "div", "Compact dots, text, or progress stepper.")],
  "app-bar": [s("app-bar", "header", "Sticky or fixed bar.")],
  "bottom-navigation": [
    s("bottom-navigation", "nav", "Destination row.", "BottomNavigation"),
    s("bottom-navigation-action", "button", "One destination.", "BottomNavigationAction"),
  ],
  menu: [
    s("menu", "div", "Menu popup.", "Menu"),
    s("menu-list", "div", "Item list (`role=\"menu\"`).", "MenuList"),
    s("menu-item", "div", "One action.", "MenuItem"),
    s("menu-anchor", "button", "Trigger that anchors the menu."),
  ],
  breadcrumb: [s("breadcrumb", "nav", "Path root with `aria-label=\"Breadcrumb\"`.")],
  pagination: [s("pagination", "nav", "Prev / next control.")],
  "speed-dial": [
    s("speed-dial", "div", "FAB plus actions.", "SpeedDial"),
    s("speed-dial-action", "button", "One fanned-out action.", "SpeedDialAction"),
  ],
  "app-header": [s("app-header", "header", "Fixed safe-area chrome bar.")],
  "site-nav": [s("site-nav", "header", "Marketing navbar. Also uses `.spk-site-nav`.")],
  "site-footer": [s("site-footer", "footer", "Marketing footer.")],
  "contact-link": [s("contact-link", "a", "Contact row with icon, handle, and arrow.")],
  "floating-page-chrome": [
    s("floating-page-chrome", "div", "Liquid-quiet toolbar tray.", "FloatingPageChromeBar"),
    s("floating-page-chrome-identity", "div", "Title and count.", "FloatingPageChromeIdentity"),
    s("floating-page-chrome-search", "div", "Search field slot.", "FloatingPageChromeSearchField"),
    s("floating-page-chrome-shell", "div", "Optional outer shell around the tray and page body."),
  ],
  "page-sticky-header": [s("page-sticky-header", "header", "Sticky title row with actions.")],
  "mobile-tab-bar": [s("mobile-tab-bar", "nav", "Floating capsule tab bar.")],
  "filter-sheet": [
    {
      name: "trigger",
      className: "—",
      defaultComponent: "ReactElement",
      description: "Desktop / `md+` control. Typically a Button.",
    },
    {
      name: "mobileTrigger",
      className: "—",
      defaultComponent: "ReactElement",
      description: "Optional compact control for small screens. Defaults to `trigger`.",
    },
    {
      name: "children",
      className: "—",
      defaultComponent: "ReactNode",
      description: "Filter body. The shell owns layout, clear, and the mobile Done footer.",
    },
  ],
  "header-icon-button": [s("header-icon-button", "button", "Frosted toolbar icon control.")],
  "cover-hero": [s("cover-hero", "header", "Generated cover with identity notch.")],
  "profile-hero": [s("profile-hero", "header", "Cover plus profile metadata.")],
  "entity-media-card": [s("entity-media-card", "article", "Photo card for people and albums.")],
  "image-list": [
    s("image-list", "ul", "Image grid.", "ImageList"),
    s("image-list-item", "li", "One tile.", "ImageListItem"),
    s("image-list-item-bar", "div", "Caption bar.", "ImageListItemBar"),
  ],
  progress: [
    s("progress", "div", "Linear bar root."),
    s("progress-indicator", "div", "Filled portion."),
  ],
  "circular-progress": [s("circular-progress", "span", "Circular indicator root.")],
  skeleton: [s("skeleton", "div", "Shimmer placeholder.")],
  alert: [
    s("alert", "div", "Inline status root (`role=\"alert\"`).", "Alert"),
    s("alert-title", "div", "Short title.", "AlertTitle"),
    s("alert-description", "div", "Detail copy.", "AlertDescription"),
  ],
  "empty-state": [s("empty-state", "div", "Zero-data placeholder with optional CTA.")],
  toast: [
    s("toaster", "div", "Notification stack host. Wrap the app tree.", "Toaster"),
    s("toast", "div", "One notification."),
  ],
  snackbar: [
    s("snackbar", "div", "Anchored message root."),
    s("snackbar-content", "div", "Message body."),
  ],
  dialog: [
    s("dialog-trigger", "button", "Opens the dialog. Pass `asChild` for a custom trigger.", "DialogTrigger"),
    s("dialog-overlay", "div", "Dimmed backdrop.", "DialogOverlay"),
    s("dialog-content", "div", "Titled surface. Focus is trapped here.", "DialogContent"),
    s("dialog-title", "h2", "Accessible title.", "DialogTitle"),
    s("dialog-description", "p", "Supporting copy.", "DialogDescription"),
    s("dialog-close", "button", "Dismiss control.", "DialogClose"),
  ],
  modal: [s("modal", "div", "Low-level overlay root.")],
  tooltip: [
    s("tooltip", "div", "Hint popup."),
    s("tooltip-trigger", "button", "Hover and focus target."),
  ],
  table: [
    s("table-container", "div", "Scroll wrapper.", "Table"),
    s("table", "table", "Semantic table."),
    s("table-header", "thead", "Header.", "TableHeader"),
    s("table-body", "tbody", "Body.", "TableBody"),
    s("table-footer", "tfoot", "Footer.", "TableFooter"),
    s("table-row", "tr", "Row.", "TableRow"),
    s("table-head", "th", "Header cell.", "TableHead"),
    s("table-cell", "td", "Body cell.", "TableCell"),
    s("table-caption", "caption", "Caption.", "TableCaption"),
  ],
  "table-pagination": [s("table-pagination", "div", "Rows-per-page and range controls.")],
  "chart-data-grid": [s("chart-data-grid", "div", "Shared table + chart. Also uses `.spk-chart-data-grid`.")],
  "event-calendar": [s("event-calendar", "div", "Calendar root."), s("scheduler-toolbar", "div", "Default navigation toolbar.")],
  "event-timeline": [s("event-timeline", "div", "Resource timeline root.")],
  "chart-container": chartSlots("chart-container", [
    s("bar-plot", "g", "Bar marks when composing mixed plots."),
    s("line-plot", "g", "Line marks."),
    s("area-plot", "g", "Area marks."),
    s("chart-brush", "g", "Brush overlay when zoom/brush is on."),
    s("chart-y-axis-right", "g", "Optional dual-axis right value axis."),
  ]),
  "bar-chart": chartSlots("bar-chart", [s("bar-plot", "g", "Bar marks.")]),
  "line-chart": chartSlots("line-chart", [s("line-plot", "g", "Line path.")]),
  "area-chart": chartSlots("area-chart", [s("area-plot", "g", "Filled area path.")]),
  "pie-chart": [s("pie-chart", "div", "Pie or donut root. Also has class `.spk-chart`.")],
  "scatter-chart": chartSlots("scatter-chart", [s("scatter-plot", "g", "SVG point marks.")]),
  "scatter-webgl": [
    s("scatter-chart", "div", "Chart frame (SVG axes and tooltip)."),
    s("scatter-webgl", "canvas", "GPU point sprites. Also uses `.spk-chart-webgl`."),
  ],
  sparkline: [s("sparkline", "div", "Inline trend without axes.")],
  gauge: [s("gauge", "div", "Arc or segmented semi-donut.")],
  "radar-chart": [s("radar-chart", "div", "Radar polygons.")],
  heatmap: [
    s("heatmap", "div", "Intensity grid root."),
    s("heatmap-color-scale", "g", "Value scale. Also uses `.spk-chart-color-scale`."),
  ],
  "funnel-chart": [s("funnel-chart", "div", "Stage funnel.")],
  "pyramid-chart": [s("pyramid-chart", "div", "Pyramid bands.")],
  "sankey-chart": [s("sankey-chart", "div", "Flow ribbons.")],
  "range-bar-chart": chartSlots("range-bar-chart"),
  "candlestick-chart": chartSlots("candlestick-chart"),
  "radial-bar-chart": [s("radial-bar-chart", "div", "Circular bars.")],
  "radial-line-chart": [s("radial-line-chart", "div", "Polar line.")],
  "linear-gauge": [s("linear-gauge", "div", "Horizontal bounded gauge.")],
  "bubble-chart": chartSlots("bubble-chart", [s("scatter-plot", "g", "Sized point marks.")]),
  "range-area-chart": chartSlots("range-area-chart", [s("area-plot", "g", "Low–high band.")]),
  treemap: [s("treemap", "div", "Nested rectangles.")],
  "polar-line-chart": [s("polar-line-chart", "div", "Polar line without a filled radar.")],
  "chord-chart": [s("chord-chart", "div", "Circular directed-flow matrix.")],
  "waterfall-chart": chartSlots("waterfall-chart"),
  "boxplot-chart": chartSlots("boxplot-chart"),
  "ohlc-chart": chartSlots("ohlc-chart"),
  "sunburst-chart": [s("sunburst-chart", "div", "Hierarchical rings.")],
  "map-chart": [s("map-chart", "div", "Choropleth root.")],
  "bar-chart-3d": [s("bar-chart-3d", "div", "Isometric extruded bars.")],
  "pie-chart-3d": [s("pie-chart-3d", "div", "Elliptical extruded pie.")],
};

export function getSlots(entry: ComponentEntry): SlotDoc[] {
  return slotsBySlug[entry.slug] ?? [rootSlot(entry)];
}
