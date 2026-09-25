import { SHOWCASE_SCREENS } from "@/showcase/screens/ShowcaseIndexPage";
import { components, customizeNav, designNav, guideNav, resourcesNav, type NavItem } from "./navigation";

export type SearchEntry = {
  id: string;
  title: string;
  description?: string;
  to: string;
  group: "Components" | "Guides" | "Foundations" | "Customize" | "Resources" | "Showcase";
  keywords: string[];
};

/**
 * Words people search for that are not Spatika's names for things. Matched against slugs,
 * so "modal" finds Dialog and "loader" finds Spinner without knowing the component name.
 */
const SYNONYMS: Record<string, string[]> = {
  dialog: ["modal", "popup", "lightbox", "overlay"],
  "alert-dialog": ["confirm", "confirmation", "are you sure", "destructive"],
  sheet: ["drawer", "side panel", "slide over", "flyout"],
  "bottom-sheet": ["drawer", "action sheet", "mobile sheet"],
  popover: ["popup", "flyout", "overlay"],
  tooltip: ["hint", "title", "hover"],
  "dropdown-menu": ["menu", "actions", "kebab", "more", "overflow"],
  "context-menu": ["right click", "right-click", "long press"],
  toast: ["notification", "snackbar", "flash message"],
  snackbar: ["toast", "notification"],
  spinner: ["loader", "loading", "busy", "throbber"],
  skeleton: ["placeholder", "loading", "shimmer"],
  progress: ["loading bar", "percent", "meter"],
  "data-table": ["grid", "datagrid", "spreadsheet", "table", "sort", "filter", "rows"],
  table: ["grid", "rows", "columns"],
  "virtual-list": ["infinite scroll", "windowing", "large list", "log"],
  autocomplete: ["combobox", "typeahead", "search select", "multi select"],
  select: ["dropdown", "picker", "combobox"],
  "native-select": ["dropdown", "select"],
  "tag-input": ["chips input", "tokens", "multi value", "emails"],
  "number-input": ["stepper", "spinbutton", "quantity", "currency"],
  "amount-input": ["money", "currency", "price"],
  "otp-input": ["one time code", "2fa", "verification", "pin"],
  "file-upload": ["dropzone", "drag and drop", "attachment", "upload"],
  "date-picker": ["calendar", "date input", "datepicker"],
  "date-range-picker": ["range", "period", "from to"],
  calendar: ["date", "month", "schedule"],
  switch: ["toggle", "on off"],
  slider: ["range", "track"],
  rating: ["stars", "review"],
  stepper: ["wizard", "steps", "multi step", "progress steps"],
  tabs: ["tab bar", "segmented"],
  accordion: ["collapse", "expand", "disclosure", "faq"],
  breadcrumb: ["path", "trail"],
  pagination: ["pages", "paging"],
  "tree-view": ["tree", "file browser", "folders", "hierarchy", "nested"],
  "description-list": ["key value", "details", "properties", "definition list"],
  "metric-group": ["kpi", "stats", "numbers", "dashboard"],
  delta: ["change", "trend", "percent change"],
  "empty-state": ["no results", "zero state", "blank"],
  "result-state": ["success", "error page", "404", "outcome"],
  "form-field": ["label", "validation", "error message", "helper text"],
  "form-error-summary": ["validation summary", "errors"],
  "resizable-panels": ["split", "splitter", "pane", "divider"],
  "scroll-area": ["scrollbar", "overflow"],
  "app-shell": ["layout", "sidebar", "navigation", "dashboard layout"],
  "command-palette": ["cmd k", "search", "spotlight", "quick open"],
  "mobile-tab-bar": ["bottom navigation", "tab bar"],
  "page-header": ["title", "heading", "header"],
  avatar: ["profile picture", "user image", "initials"],
  badge: ["label", "status", "pill", "count"],
  kbd: ["keyboard", "shortcut", "hotkey"],
  "spatika-editor": ["rich text", "wysiwyg", "markdown editor"],
};

function words(text: string | undefined) {
  return (text ?? "")
    .toLowerCase()
    .replace(/`/g, "")
    .split(/[^a-z0-9+#-]+/)
    .filter((word) => word.length > 2);
}

function pageEntries(items: NavItem[], group: SearchEntry["group"], section: string): SearchEntry[] {
  return items.map((item) => ({
    id: `${group}:${item.to}`,
    title: item.label,
    description: section,
    to: item.to,
    group,
    keywords: [section.toLowerCase(), ...words(item.label)],
  }));
}

export function buildSearchIndex(): SearchEntry[] {
  const componentEntries: SearchEntry[] = components.map((entry) => ({
    id: `component:${entry.slug}`,
    title: entry.name,
    description: entry.description,
    to: `/components/${entry.slug}`,
    group: "Components",
    keywords: [
      entry.category.toLowerCase(),
      entry.slug,
      ...entry.importName.toLowerCase().split(/\s*,\s*/),
      ...(SYNONYMS[entry.slug] ?? []),
      ...words(entry.description),
    ],
  }));

  return [
    ...componentEntries,
    ...pageEntries(designNav, "Foundations", "Design"),
    ...pageEntries(customizeNav, "Customize", "Customize"),
    ...pageEntries(guideNav, "Guides", "Guides"),
    ...pageEntries(resourcesNav, "Resources", "Resources"),
    ...SHOWCASE_SCREENS.map((screen) => ({
      id: `showcase:${screen.to}`,
      title: screen.title,
      description: screen.body,
      to: screen.to,
      group: "Showcase" as const,
      keywords: ["example", "showcase", "template", ...words(screen.body)],
    })),
  ];
}

/**
 * Word-aware ranking for docs search: every term must match the title or a keyword. Title
 * matches outrank keyword matches, and whole words outrank prefixes — so "modal" ranks
 * Dialog (keyword) above components that merely contain the letters m-o-d-a-l.
 */
export function scoreSearch(value: string, search: string, keywords: string[] = []): number {
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return 1;
  // CommandPalette values are `${label} ${id}`; rank on the label only.
  const title = value.replace(/\s\S+$/, "").toLowerCase();
  const words = keywords.map((keyword) => keyword.toLowerCase());
  let total = 0;
  for (const term of terms) {
    let best = 0;
    if (title === term) best = 1;
    else if (title.startsWith(term)) best = 0.9;
    else if (title.split(/[\s-]+/).some((word) => word.startsWith(term))) best = 0.8;
    else if (title.includes(term)) best = 0.65;
    if (best < 0.75) {
      for (const keyword of words) {
        // An exact synonym ("datagrid" → DataTable) beats letters buried inside a longer name.
        if (keyword === term) best = Math.max(best, 0.75);
        else if (keyword.split(/[\s-]+/).some((word) => word === term)) best = Math.max(best, 0.55);
        else if (term.length > 2 && keyword.startsWith(term)) best = Math.max(best, 0.4);
      }
    }
    if (best === 0) return 0;
    total += best;
  }
  return total / terms.length;
}
