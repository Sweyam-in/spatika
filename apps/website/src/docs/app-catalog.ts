/**
 * Catalog records for components documented from `src/demos/app/*.tsx`.
 *
 * Each record carries the catalog row, the intro, accessibility notes and related links.
 * The live demo and the code shown on the page both come from the same demo file (see
 * `scripts/sync-demo-sources.mjs`), so the example is always the code that ran.
 */
import type { ComponentEntry } from "../data/navigation";
import demoSources from "../generated/demo-sources.json";

export type AppDoc = ComponentEntry & {
  intro: string;
  accessibility: string[];
  related?: string[];
  /** Version the component first shipped in — shown as a "New" badge while current. */
  since?: string;
};

export const APP_DOCS: AppDoc[] = [
  // ── Overlays ──────────────────────────────────────────────────────────────
  {
    slug: "alert-dialog",
    name: "AlertDialog",
    category: "Overlays",
    importName: "AlertDialog",
    description: "A confirmation that interrupts — for destructive or irreversible actions only.",
    intro:
      "AlertDialog is the \"are you sure?\" step before something that cannot be undone — deleting a workspace, voiding an invoice. Unlike Dialog it does not close when the scrim is clicked, so a stray click cannot confirm or cancel by accident. Say exactly what will happen in the description, and label the action with the verb (\"Delete\"), never \"OK\".",
    accessibility: [
      "Renders `role=\"alertdialog\"` with `aria-modal`; the title and description are wired to `aria-labelledby` / `aria-describedby`.",
      "Focus moves inside on open, Tab is trapped, and focus returns to the trigger on close.",
      "Escape cancels; pass `onEscapeKeyDown` and call `preventDefault()` when the choice must be explicit.",
    ],
    related: ["dialog", "sheet", "toast"],
  },
  {
    slug: "sheet",
    name: "Sheet",
    category: "Overlays",
    importName: "Sheet",
    description: "A side panel for editing a record or showing detail without leaving the page.",
    intro:
      "Sheet slides a panel in from an edge — the right for record detail and edit forms, the left for secondary navigation, the bottom for short tasks. The page stays visible behind it, which keeps people oriented while they work. Use `onInteractOutside` with `preventDefault()` to stop an accidental scrim click from discarding unsaved changes.",
    accessibility: [
      "Modal: `role=\"dialog\"` with `aria-modal`, focus trapped inside and restored to the trigger on close.",
      "Escape and the scrim close it; both can be vetoed with `onEscapeKeyDown` / `onInteractOutside`.",
      "Selects, menus and popovers opened inside a sheet stack above it automatically.",
    ],
    related: ["dialog", "bottom-sheet", "filter-sheet"],
  },
  {
    slug: "popover",
    name: "Popover",
    category: "Overlays",
    importName: "Popover",
    description: "Non-modal floating content anchored to a trigger — small forms, filters and detail.",
    intro:
      "Popover floats a small panel next to the control that opened it — a couple of filter fields, a colour picker, a preview. It is non-modal: the rest of the page stays usable, and pressing anywhere outside closes it. Focus moves into the content when it opens and back to the trigger when it closes, and Tab flows between the two even though the content is portaled.",
    accessibility: [
      "Trigger exposes `aria-haspopup=\"dialog\"`, `aria-expanded` and `aria-controls`; the content is a labelled `role=\"dialog\"` — pass `aria-label`.",
      "Focus moves to the first control on open (`onOpenAutoFocus` + `preventDefault()` keeps it on the trigger) and returns on close.",
      "Tab from the trigger enters the content; Tab past the last control continues to the element after the trigger.",
    ],
    related: ["dropdown-menu", "tooltip", "date-picker"],
  },
  {
    slug: "dropdown-menu",
    name: "DropdownMenu",
    category: "Overlays",
    importName: "DropdownMenu",
    description: "A menu of actions behind a button — items, checkboxes, radios, shortcuts and submenus.",
    intro:
      "DropdownMenu tucks secondary actions behind one button — the \"…\" on a row, an \"Actions\" menu in a page header. It supports plain items, checkbox and radio items, keyboard shortcuts, labels, separators and nested submenus. Keep destructive actions last and mark them `variant=\"destructive\"`.",
    accessibility: [
      "Follows the WAI-ARIA menu button pattern: the trigger has `aria-haspopup=\"menu\"`, `aria-expanded` and `aria-controls`.",
      "ArrowDown / Enter / Space open onto the first item and ArrowUp onto the last; arrows, Home / End and type-ahead move between items; disabled items are skipped.",
      "Escape closes and returns focus to the trigger; Tab closes and moves on. Submenus open with ArrowRight and close with ArrowLeft.",
    ],
    related: ["context-menu", "menu", "popover"],
  },
  {
    slug: "context-menu",
    name: "ContextMenu",
    category: "Overlays",
    importName: "ContextMenu",
    description: "Right-click actions for a region — with keyboard and long-press equivalents.",
    intro:
      "ContextMenu opens a menu where the pointer is — right-click on a file, a row, a canvas object. It shares DropdownMenu's items and keyboard model, so you compose it with `DropdownMenuItem` and friends. Every action in a context menu should also be reachable some other way (a row menu or toolbar), because right-click is invisible to anyone who does not know to try it.",
    accessibility: [
      "Keyboard users open it with Shift+F10 or the ContextMenu key on a focused trigger; touch users with a long press.",
      "Focus moves into the menu and returns to the trigger region on close; the menu is named \"Context menu\" unless you pass `aria-label`.",
      "Do not make the context menu the only path to an action.",
    ],
    related: ["dropdown-menu", "tree-view", "data-table"],
    since: "2.4.0",
  },
  {
    slug: "bottom-sheet",
    name: "BottomSheet",
    category: "Overlays",
    importName: "BottomSheet",
    description: "A draggable sheet from the bottom edge — filters and overflow menus on phones.",
    intro:
      "BottomSheet is the phone-native way to show filters, sort options or an overflow menu: a sheet that rises from the bottom edge and can be dragged away. On larger screens prefer Sheet or Popover. Selects and menus opened inside it stack above it.",
    accessibility: [
      "Modal with a focus trap; Escape and the scrim close it, as does dragging it down.",
      "Give the content a visible heading so screen-reader users know what opened.",
    ],
    related: ["sheet", "filter-sheet", "mobile-tab-bar"],
  },
  // ── Forms ─────────────────────────────────────────────────────────────────
  {
    slug: "form-field",
    name: "FormField",
    category: "Forms",
    importName: "FormField",
    description: "Label, help text and error around any control — wired for assistive tech automatically.",
    intro:
      "FormField is the wrapper to reach for around every input: a label, optional help text, an error message and a required or optional marker. It wires `id`, `aria-labelledby`, `aria-describedby`, `aria-invalid` and `aria-required` onto its single child, so the control is fully described without hand-written ids. Errors are announced politely as they appear.",
    accessibility: [
      "The label is associated with the control, and controls a `<label>` cannot name (radio groups, custom widgets) get `aria-labelledby`.",
      "Help text and errors are linked with `aria-describedby`; errors set `aria-invalid` and are announced through a polite live region.",
      "`required` shows an asterisk and sets `aria-required`; prefer marking the few `optional` fields instead.",
    ],
    related: ["input", "form-error-summary", "text-field"],
  },
  {
    slug: "label",
    name: "Label",
    category: "Forms",
    importName: "Label",
    description: "A form label that dims with its disabled control.",
    intro:
      "Label is a styled `<label>` for when you lay out a field yourself. Point `htmlFor` at the control's id — clicking the label then focuses or toggles the control. Inside FormField you do not need it; the field renders its own.",
    accessibility: ["Always associate it with a control through `htmlFor`, or wrap the control."],
    related: ["form-field", "checkbox", "switch"],
  },
  {
    slug: "textarea",
    name: "Textarea",
    category: "Forms",
    importName: "Textarea",
    description: "Multi-line text with the same focus, invalid and disabled states as Input.",
    intro:
      "Textarea is the multi-line counterpart to Input, sharing its border, focus ring and invalid styling. It resizes vertically; reach for TextareaAutosize when it should grow with its content instead.",
    accessibility: ["Label it with FormField or a Label; long help belongs in the description, not the placeholder."],
    related: ["input", "textarea-autosize", "form-field"],
  },
  {
    slug: "native-select",
    name: "NativeSelect",
    category: "Forms",
    importName: "NativeSelect",
    description: "The browser's own select, styled — best on phones and for long, plain lists.",
    intro:
      "NativeSelect keeps the platform's own picker — the wheel on iOS, the sheet on Android — with Spatika's field styling. Use it for plain option lists, especially on mobile; use Select when options need icons or rich content.",
    accessibility: ["Native semantics and keyboard support; label it with FormField."],
    related: ["select", "autocomplete", "form-field"],
  },
  {
    slug: "radio-group",
    name: "RadioGroup",
    category: "Forms",
    importName: "RadioGroup",
    description: "Pick exactly one of a few visible options.",
    intro:
      "RadioGroup shows every option at once and allows exactly one choice — billing cycles, plan tiers, notification frequency. Use it for two to about six options; beyond that a Select saves space.",
    accessibility: [
      "`role=\"radiogroup\"` with roving focus: Tab enters the group, arrow keys move and select.",
      "Name the group with FormField (it adds `aria-labelledby`) and each option with a Label.",
    ],
    related: ["checkbox", "segmented-control", "select"],
  },
  {
    slug: "number-input",
    name: "NumberInput",
    category: "Forms",
    importName: "NumberInput",
    description: "Numbers with steppers, keyboard stepping, min / max and locale formatting.",
    intro:
      "NumberInput is for quantities people adjust — seats, prices, thresholds. Arrow keys step, Page Up / Page Down take a large step, and Home / End jump to the limits. Typing is free-form and the value is parsed in the reader's locale, clamped and rounded when the field is left; `formatOptions` displays currency or units while it is not being edited.",
    accessibility: [
      "`role=\"spinbutton\"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and a formatted `aria-valuetext`.",
      "The stepper buttons are pointer conveniences and are skipped by Tab — the arrow keys do the same job.",
      "Uses `inputMode` so phones show a numeric keypad.",
    ],
    related: ["amount-input", "slider", "form-field"],
    since: "2.4.0",
  },
  {
    slug: "tag-input",
    name: "TagInput",
    category: "Forms",
    importName: "TagInput",
    description: "Free-form multiple values — emails, labels, keywords — as removable chips.",
    intro:
      "TagInput collects several short values in one field. Enter or a comma commits the typed text, pasting a list splits it, and Backspace in an empty field removes the last tag. `validate` can reject an entry with a message; rejected text stays in the field so it can be fixed.",
    accessibility: [
      "Each chip has a remove button named \"Remove <tag>\"; ArrowLeft from the start of the field moves onto the chips, Delete / Backspace removes the focused one.",
      "Additions, removals and rejections are announced through a polite live region.",
    ],
    related: ["autocomplete", "chip", "form-field"],
    since: "2.4.0",
  },
  {
    slug: "otp-input",
    name: "OtpInput",
    category: "Forms",
    importName: "OtpInput",
    description: "One-time codes, one cell per character, with paste and SMS autofill.",
    intro:
      "OtpInput is the verification-code field: one cell per character, focus that advances as you type and steps back on Backspace, and paste or SMS autofill that fills every cell at once. `onComplete` fires once when the code is full, so you can verify without a submit button.",
    accessibility: [
      "The cells sit in a named group (\"Verification code\" by default), each labelled \"Character n of N\".",
      "The first cell sets `autocomplete=\"one-time-code\"` so iOS and Android can offer the code from SMS.",
    ],
    related: ["pin-pad", "input", "form-field"],
    since: "2.4.0",
  },
  {
    slug: "file-upload",
    name: "FileUpload",
    category: "Forms",
    importName: "FileUpload",
    description: "Drag-and-drop or browse, with type, size and count validation and per-file progress.",
    intro:
      "FileUpload handles picking files: drop them on the zone or click to browse, and it validates type, size and count before they reach your code. It does not upload — you do, and pass `progress` and `errors` keyed by `fileKey(file)` to show state in the list. With `name`, it also works in a plain HTML form post.",
    accessibility: [
      "The drop zone wraps a real file input, so it is reachable with Tab and opens the picker with Enter or Space.",
      "Rejections (\"notes.txt is not an accepted file type\") and additions are announced; each file has a named remove button and a labelled progress bar.",
    ],
    related: ["form-field", "progress", "result-state"],
    since: "2.4.0",
  },
  {
    slug: "calendar",
    name: "Calendar",
    category: "Forms",
    importName: "Calendar",
    description: "An inline month grid for picking a date or a range.",
    intro:
      "Calendar is the month grid on its own — for booking pages, availability pickers and anywhere a date should be chosen in context rather than in a popover. It selects a single date or, with `mode=\"range\"`, a start and end with a live preview. `min`, `max` and `isDateDisabled` rule out days that cannot be chosen.",
    accessibility: [
      "Follows the WAI-ARIA date grid pattern: one tab stop; arrows move by day and week, Home / End to the week's ends, Page Up / Page Down by month (Shift for a year).",
      "Each day is labelled with its full date; today is marked `aria-current=\"date\"`; disabled days are `aria-disabled`.",
    ],
    related: ["date-picker", "date-range-picker", "event-calendar"],
    since: "2.4.0",
  },
  {
    slug: "date-picker",
    name: "DatePicker",
    category: "Forms",
    importName: "DatePicker",
    description: "A date field you can type into or pick from a calendar — with min, max and disabled days.",
    intro:
      "DatePicker is the date field for forms. Type the date straight into its month / day / year segments (ordered for the reader's locale), or open the calendar with the button at the end — it opens on the typed day, and picking closes it. With `name` it submits an ISO `yyyy-mm-dd` value.",
    accessibility: [
      "Each segment is a spinbutton named by its unit and the FormField label (\"month, Due date\"); ↑ ↓ step, digits type, Backspace clears.",
      "The calendar button is named \"Open calendar\" plus the field label; the calendar takes focus on open and returns it on close.",
      "Dates outside `min` / `max` mark the field `aria-invalid` instead of silently changing what was typed.",
    ],
    related: ["date-input", "date-range-picker", "calendar", "form-field"],
    since: "2.4.0",
  },
  {
    slug: "date-range-picker",
    name: "DateRangePicker",
    category: "Forms",
    importName: "DateRangePicker",
    description: "Type or pick a start and end date, with presets like \"Last 30 days\".",
    intro:
      "DateRangePicker is for reporting periods and bookings. Type both dates (focus runs from the start date into the end date), or open the calendar and pick a start and an end — the span previews as you move — or apply a preset in one click. Two months show side by side and stack when the popover is narrow; with `name` it submits `name.from` and `name.to`.",
    accessibility: [
      "The two halves are named \"Start date\" and \"End date\" followed by the field label; a start after the end marks the field invalid.",
      "Same keyboard model as Calendar in the popover; presets are ordinary buttons in a labelled group.",
    ],
    related: ["date-picker", "date-input", "calendar"],
    since: "2.4.0",
  },
  {
    slug: "date-input",
    name: "DateInput",
    category: "Forms",
    importName: "DateInput",
    description: "Typed date entry in segments — no calendar, for dates people know (birthdays, expiry).",
    intro:
      "DateInput is the typed half of DatePicker on its own: month, day and year segments in the locale's order. Use it where a calendar gets in the way — a date of birth, a card expiry, a date copied from a document. It reports a `Date` only once every segment is filled, clamps the day when the month changes under it, and submits ISO `yyyy-mm-dd` with `name`.",
    accessibility: [
      "The field is a group; each segment is a spinbutton with `aria-valuenow`, `aria-valuetext` and a name made of its unit and the field label.",
      "Digits type and focus advances when a unit is complete; ↑ ↓ step (Page ↑ ↓ in bigger steps), Home / End jump, ← → move, Backspace clears; a separator key (/ . -) moves on.",
      "Segments are contentEditable with a numeric `inputmode`, so phones raise the number pad; clicking the FormField label focuses the first empty segment.",
    ],
    related: ["date-picker", "time-input", "form-field"],
    since: "2.4.0",
  },
  {
    slug: "time-input",
    name: "TimeInput",
    category: "Forms",
    importName: "TimeInput",
    description: "Typed time entry — 12- or 24-hour by locale, always a 24-hour value.",
    intro:
      "TimeInput takes a time of day in hour, minute (optionally second) and AM/PM segments, following the reader's clock convention while the value stays a 24-hour `HH:mm` string — the format of `<input type=\"time\">` and most APIs. `minuteStep` sets how far the arrow keys move; `min` / `max` mark out-of-range times invalid.",
    accessibility: [
      "Same segment model as DateInput; the AM/PM segment takes A or P (or the locale's first letter) and ↑ ↓.",
      "With `name` it submits the 24-hour value, so server code never parses a locale format.",
    ],
    related: ["date-input", "date-picker", "form-field"],
    since: "2.4.0",
  },
  {
    slug: "amount-input",
    name: "AmountInput",
    category: "Forms",
    importName: "AmountInput",
    description: "A money field with a currency prefix and tabular figures.",
    intro:
      "AmountInput is a text field shaped for money: a currency code in front and tabular figures so amounts line up. It keeps the value as a string, which is what payment APIs expect. For stepping, min / max or locale formatting, use NumberInput with a currency `formatOptions`.",
    accessibility: ["Label it with FormField; the currency code is visible text, not only a symbol."],
    related: ["number-input", "input", "form-field"],
  },
  {
    slug: "form-error-summary",
    name: "FormErrorSummary",
    category: "Forms",
    importName: "FormErrorSummary",
    description: "Every validation error after submit, each linking to its field.",
    intro:
      "FormErrorSummary appears above a form after a failed submit and lists what needs fixing, each item a link that jumps to its field. Focus moves to the summary so people hear how many problems there are, then follow a link to each. Keep the inline FormField errors as well — the summary is the index, the field message is the detail.",
    accessibility: [
      "Rendered as `role=\"alert\"` and focused when the set of errors changes, so the problem count is announced.",
      "Each link moves focus to its field (pass the field's `id` as `fieldId`).",
    ],
    related: ["form-field", "alert", "callout"],
    since: "2.4.0",
  },
  // ── Data ──────────────────────────────────────────────────────────────────
  {
    slug: "tree-view",
    name: "TreeView",
    category: "Data",
    importName: "TreeView",
    description: "Hierarchical lists — file browsers, folders, org structures — with full keyboard support.",
    intro:
      "TreeView shows nested items you can expand, collapse and select: a file browser, a folder picker, a chart of accounts. Give nodes icons and trailing `meta` (a count or size); `onActivate` fires on Enter or double-click to open the item.",
    accessibility: [
      "WAI-ARIA tree: one tab stop; Up / Down between visible nodes, Right expands or enters, Left collapses or goes to the parent, Home / End, `*` expands siblings, type-ahead.",
      "Nodes expose `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded` and `aria-selected`.",
    ],
    related: ["list", "context-menu", "resizable-panels"],
    since: "2.4.0",
  },
  {
    slug: "description-list",
    name: "DescriptionList",
    category: "Data",
    importName: "DescriptionList",
    description: "Label–value pairs for record details that adapt to the space they get.",
    intro:
      "DescriptionList shows the facts about one record — plan, owner, renewal date. It stacks label over value when narrow and places them side by side once the list itself has room, using container queries, so the same list works in a sheet, a card or a full page. Empty values render an em dash instead of collapsing.",
    accessibility: ["Uses `<dl>`, `<dt>` and `<dd>`, so each value is announced with its label."],
    related: ["card", "sheet", "table"],
    since: "2.4.0",
  },
  {
    slug: "virtual-list",
    name: "VirtualList",
    category: "Data",
    importName: "VirtualList",
    description: "Render tens of thousands of rows smoothly — only visible rows are in the DOM.",
    intro:
      "VirtualList keeps long lists fast: logs, activity feeds, large pickers. Only the rows in view (plus a small overscan) exist in the DOM. Rows have a fixed height; `onEndReached` loads the next page, and a ref exposes `scrollToIndex`.",
    accessibility: [
      "Rows keep `aria-setsize` / `aria-posinset`, so screen readers report the full length, not just what is rendered.",
      "The scroller is focusable and scrolls with the arrow, Page and Home / End keys. Find-in-page only sees rendered rows — add a search field for long lists.",
    ],
    related: ["data-table", "list", "scroll-area"],
    since: "2.4.0",
  },
  {
    slug: "timeline",
    name: "Timeline",
    category: "Data",
    importName: "Timeline",
    description: "A vertical history of events — payments, status changes, audit trails.",
    intro:
      "Timeline lists what happened to a record, newest first: invoice sent, payment received, plan changed. Each item takes a title, meta (the time), an optional description and a tone for its marker.",
    accessibility: ["Renders a list; tone is decorative, so say the outcome in the title."],
    related: ["description-list", "career-card", "notification-bell"],
  },
  {
    slug: "delta",
    name: "Delta",
    category: "Data",
    importName: "Delta",
    description: "Change versus a baseline, with direction, sign and colour that follow intent.",
    intro:
      "Delta shows how much something moved: +12.4% vs last month. It formats the number, picks the arrow and colour from the sign, and flips the colour with `intent=\"inverse\"` for metrics where down is good — churn, latency, cost.",
    accessibility: ["The sign and arrow carry the direction, not colour alone; tabular figures keep columns aligned."],
    related: ["metric-group", "stat-card", "sparkline"],
  },
  {
    slug: "metric-group",
    name: "MetricGroup",
    category: "Data",
    importName: "MetricGroup, Metric",
    description: "A strip of KPIs — label, value, delta and optional sparkline.",
    intro:
      "MetricGroup lays out the three to five numbers a dashboard opens with. Each Metric formats its value (currency, percent, compact), carries a Delta and optionally a sparkline. `divided` draws hairlines between metrics instead of boxing each one.",
    accessibility: ["Values use tabular figures; each metric reads as label, value, change."],
    related: ["delta", "stat-card", "panel"],
  },
  {
    slug: "status-dot",
    name: "StatusDot",
    category: "Data",
    importName: "StatusDot",
    description: "A small coloured dot for status — always paired with a label.",
    intro:
      "StatusDot marks state at a glance — operational, degraded, offline. It is a dot, so pair it with text; `label` gives screen readers the status and `pulse` draws attention to something live.",
    accessibility: ["Pass `label` — colour alone never carries the meaning."],
    related: ["badge", "presence-dot", "availability-badge"],
  },
  {
    slug: "kbd",
    name: "Kbd",
    category: "Data",
    importName: "Kbd",
    description: "Keyboard keys in text and menus.",
    intro:
      "Kbd renders a key the way it looks on a keyboard — for shortcuts in help text, tooltips and menus. One key per Kbd; separate combinations with a space.",
    accessibility: ["Renders `<kbd>`, which screen readers announce as keyboard input."],
    related: ["command-palette", "dropdown-menu", "tooltip"],
  },
  // ── Feedback ──────────────────────────────────────────────────────────────
  {
    slug: "result-state",
    name: "ResultState",
    category: "Feedback",
    importName: "ResultState",
    description: "The outcome of an action or load — success, warning, error or info.",
    intro:
      "ResultState reports what just happened: payment received, export failed, no access. It pairs a status icon with a title that states the outcome and the next action. For an empty list, use EmptyState — ResultState is for outcomes.",
    accessibility: [
      "Announced politely with `role=\"status\"`; each status has its own icon so colour is not the only signal.",
    ],
    related: ["empty-state", "alert", "toast"],
    since: "2.4.0",
  },
  {
    slug: "spinner",
    name: "Spinner",
    category: "Feedback",
    importName: "Spinner",
    description: "An indeterminate loading indicator for short waits.",
    intro:
      "Spinner says \"working on it\" for waits under a few seconds. For longer loads show a Skeleton of the content, and for known progress use Progress. Buttons have their own `loading` state — use that rather than a spinner beside the button.",
    accessibility: ["Give it a `label` so screen readers announce what is loading; the animation stops under reduced motion."],
    related: ["skeleton", "progress", "button"],
  },
  {
    slug: "callout",
    name: "Callout",
    category: "Feedback",
    importName: "Callout",
    description: "An inline note in page content — tips, warnings and important context.",
    intro:
      "Callout highlights one paragraph of context inside a page: a tip, a warning about a consequence, a note about how something works. It is static content; use Alert when the message is about the current state of the app.",
    accessibility: ["Put the key point in the title; tone is reinforced by the heading text, not only colour."],
    related: ["alert", "result-state", "prose"],
  },
  {
    slug: "notification-bell",
    name: "NotificationBell",
    category: "Feedback",
    importName: "NotificationBell",
    description: "An inbox button with unread count and a notification panel.",
    intro:
      "NotificationBell is the bell in the top bar: an unread badge, a panel of recent notifications, and \"mark all read\". You own the list and the read state; it handles the button, the panel and dismissal.",
    accessibility: [
      "The button's name includes the unread count (\"Notifications, 3 unread\"); the panel is a labelled dialog.",
      "Escape closes the panel and returns focus to the bell.",
    ],
    related: ["top-bar", "toast", "timeline"],
  },
  // ── Layout ────────────────────────────────────────────────────────────────
  {
    slug: "page-header",
    name: "PageHeader",
    category: "Layout",
    importName: "PageHeader",
    description: "Title, description, breadcrumb and page actions — the top of every screen.",
    intro:
      "PageHeader opens a screen: breadcrumb, title, a sentence of description and the primary action. Actions wrap under the title on phones. Keep one primary action; put the rest in a DropdownMenu.",
    accessibility: ["Renders the page's `h1`; keep one per page."],
    related: ["page-section", "breadcrumb", "app-shell"],
  },
  {
    slug: "resizable-panels",
    name: "ResizablePanels",
    category: "Layout",
    importName: "ResizablePanels",
    description: "Split views with draggable, keyboard-operable dividers.",
    intro:
      "ResizablePanels splits a region into panels people can resize — mail with a reading pane, a file tree beside an editor. Sizes are percentages with per-panel minimums, can persist with `storageKey`, and horizontal splits stack vertically when the container is narrow.",
    accessibility: [
      "Each divider is a focusable `role=\"separator\"` with `aria-valuenow`; arrows resize and Home / End jump to the limits.",
      "Name each divider with `handleLabels` (\"Resize message list\").",
    ],
    related: ["app-shell", "tree-view", "scroll-area"],
    since: "2.4.0",
  },
  {
    slug: "scroll-area",
    name: "ScrollArea",
    category: "Layout",
    importName: "ScrollArea",
    description: "A native scroll container with thin themed scrollbars and contained overscroll.",
    intro:
      "ScrollArea is a real scroll container with scrollbars that match the theme and overscroll that does not drag the page along. It stays native — wheel, touch, keyboard and find-in-page all work. `fade` softens the edges to hint that there is more.",
    accessibility: [
      "Focusable so keyboard users can scroll content without focusable children; name it with `aria-label` to make it a region.",
    ],
    related: ["virtual-list", "resizable-panels", "dialog"],
    since: "2.4.0",
  },
  {
    slug: "aspect-ratio",
    name: "AspectRatio",
    category: "Layout",
    importName: "AspectRatio",
    description: "Reserve space for media so images never shift the layout as they load.",
    intro:
      "AspectRatio holds a box at a fixed shape — 16:9 video, 4:3 photos, square avatars — so the page does not jump when media loads. Images and video inside are cropped to fill it.",
    accessibility: ["Decorative wrapper; give the media inside its own `alt` or caption."],
    related: ["image-list", "card", "showcase-frame"],
    since: "2.4.0",
  },
  {
    slug: "separator",
    name: "Separator",
    category: "Layout",
    importName: "Separator",
    description: "A hairline between groups of content, horizontal or vertical.",
    intro:
      "Separator draws a quiet line between groups — in menus, toolbars and settings lists. Prefer whitespace first; use a separator when groups would otherwise run together.",
    accessibility: ["Decorative by default; pass `decorative={false}` when the split is meaningful to assistive tech."],
    related: ["divider-label", "toolbar", "dropdown-menu"],
  },
  {
    slug: "toolbar",
    name: "Toolbar",
    category: "Layout",
    importName: "Toolbar, ToolbarButton",
    description: "A compact row of related controls — formatting, view options.",
    intro:
      "Toolbar groups a row of related controls, like text formatting or view toggles. ToolbarButton shows an `active` state for toggles; pair it with `aria-pressed`.",
    accessibility: ["Name the toolbar with `aria-label`; icon-only buttons need `aria-label`, toggles `aria-pressed`."],
    related: ["button-group", "toggle-button", "icon-button"],
  },
  // ── Media ─────────────────────────────────────────────────────────────────
  {
    slug: "photo-viewer",
    name: "PhotoViewer",
    category: "Media",
    importName: "PhotoViewer",
    description: "A full-screen image viewer with zoom and previous / next.",
    intro:
      "PhotoViewer opens images full screen with zoom and previous / next — attachments, product photos, galleries. You control which image is shown with `index` or let it manage its own.",
    accessibility: [
      "A modal dialog: focus is trapped inside, Escape closes it, and ArrowLeft / ArrowRight change the photo.",
      "Pass `alt` for each image; captions are shown with the counter.",
    ],
    related: ["image-list", "aspect-ratio", "masonry"],
  },
];

const SOURCES = demoSources as Record<string, string>;

/** Demo source for an app-catalog slug — the exact file rendered on the page. */
export function appDemoSource(slug: string): string | undefined {
  return SOURCES[slug];
}

export function getAppDoc(slug: string): AppDoc | undefined {
  return APP_DOCS.find((doc) => doc.slug === slug);
}
