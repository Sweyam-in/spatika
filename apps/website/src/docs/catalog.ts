import type { ComponentEntry } from "../data/navigation";
import { components } from "../data/navigation";
import { getApi } from "./api";
import { getAppDoc } from "./app-catalog";
import { getClasses } from "./classes";
import { getIntro } from "./intros";
import { getSlots } from "./slots";
import { basicSource } from "./source";
import type { ComponentDoc, ExampleMeta, UsageSection } from "./types";

const relatedBySlug: Record<string, string[]> = {
  button: ["button-group", "icon-button", "fab", "button-base"],
  "button-group": ["button", "toggle-button", "segmented-control"],
  "icon-button": ["button", "header-icon-button", "fab"],
  fab: ["button", "speed-dial", "icon-button"],
  link: ["button", "typography", "breadcrumb"],
  typography: ["gradient-text", "section-heading", "wordmark"],
  badge: ["chip", "tag", "availability-badge"],
  avatar: ["avatar-group", "entity-card"],
  "avatar-group": ["avatar", "entity-card"],
  accordion: ["tabs", "collapse", "dialog"],
  "button-base": ["button", "list-row", "icon-button"],
  rating: ["slider", "chip"],
  box: ["stack", "grid", "paper", "container"],
  chip: ["chip-group", "tag", "badge"],
  tag: ["chip", "badge", "meta-chip"],
  wordmark: ["gradient-text", "site-nav"],
  "gradient-text": ["typography", "wordmark"],
  "availability-badge": ["badge", "chip"],
  tabs: ["segmented-control", "accordion"],
  switch: ["checkbox", "form-control-label"],
  input: ["text-field", "outlined-input", "search-field"],
  "text-field": ["input", "form-control", "textarea-autosize"],
  autocomplete: ["select", "text-field", "chip-group"],
  "outlined-input": ["text-field", "input", "amount-input"],
  "form-control": ["text-field", "form-control-label"],
  select: ["autocomplete", "native-select", "menu"],
  "textarea-autosize": ["text-field", "input"],
  "spatika-editor": ["text-field", "textarea-autosize", "use-spatika-editor"],
  "use-spatika-editor": ["spatika-editor", "dialog"],
  "rich-text-editor": ["spatika-editor", "text-field"],
  "transfer-list": ["list", "checkbox"],
  checkbox: ["form-control-label", "switch"],
  "form-control-label": ["checkbox", "switch"],
  slider: ["rating", "progress"],
  "toggle-button": ["button-group", "segmented-control", "chip-group"],
  "search-field": ["input", "text-field"],
  "chip-group": ["chip", "segmented-control", "filter-sheet"],
  "segmented-control": ["tabs", "toggle-button", "chip-group"],
  paper: ["card", "glass-card", "box"],
  grid: ["stack", "container", "masonry"],
  masonry: ["grid", "image-list"],
  stack: ["grid", "box", "container"],
  container: ["stack", "grid", "box"],
  list: ["list-row", "entity-card", "table"],
  card: ["glass-card", "paper", "stat-card"],
  "glass-card": ["card", "paper", "entity-card"],
  "stat-card": ["card", "glass-card"],
  "section-heading": ["typography", "display-heading"],
  "icon-tile": ["stat-card", "card"],
  "career-card": ["project-card", "timeline"],
  "project-card": ["career-card", "card"],
  "float-chip": ["meta-chip", "chip"],
  "meta-chip": ["tag", "chip"],
  "entity-card": ["list-row", "entity-media-card", "card"],
  "list-row": ["entity-card", "list"],
  stepper: ["mobile-stepper", "tabs"],
  "mobile-stepper": ["stepper", "pagination"],
  "app-bar": ["app-header", "toolbar"],
  "bottom-navigation": ["mobile-tab-bar", "tabs"],
  menu: ["dropdown-menu", "select", "speed-dial"],
  breadcrumb: ["link", "pagination"],
  pagination: ["table-pagination", "mobile-stepper"],
  "speed-dial": ["fab", "menu"],
  "app-header": ["app-bar", "header-icon-button", "floating-page-chrome"],
  "site-nav": ["site-footer", "app-header"],
  "site-footer": ["site-nav", "meta-chip"],
  "contact-link": ["link", "list-row"],
  "floating-page-chrome": ["app-header", "filter-sheet", "page-sticky-header"],
  "page-sticky-header": ["app-header", "floating-page-chrome"],
  "mobile-tab-bar": ["bottom-navigation", "tabs"],
  "filter-sheet": ["chip-group", "dialog", "floating-page-chrome"],
  "header-icon-button": ["icon-button", "app-header"],
  "cover-hero": ["profile-hero", "entity-media-card"],
  "profile-hero": ["cover-hero", "avatar"],
  "entity-media-card": ["entity-card", "image-list"],
  "image-list": ["masonry", "entity-media-card"],
  progress: ["circular-progress", "skeleton", "linear-gauge"],
  "circular-progress": ["progress", "skeleton", "gauge"],
  skeleton: ["progress", "circular-progress"],
  alert: ["snackbar", "toast", "empty-state"],
  "empty-state": ["alert", "card"],
  toast: ["snackbar", "alert"],
  snackbar: ["toast", "alert"],
  dialog: ["modal", "filter-sheet"],
  modal: ["dialog", "snackbar"],
  tooltip: ["menu", "snackbar"],
  table: ["table-pagination", "list"],
  "table-pagination": ["pagination", "table"],
  "event-calendar": ["event-timeline"],
  "event-timeline": ["event-calendar"],
  "chart-container": ["bar-chart", "line-chart"],
  "bar-chart": ["line-chart", "area-chart", "chart-container"],
  "line-chart": ["area-chart", "bar-chart", "sparkline"],
  "area-chart": ["line-chart", "range-area-chart"],
  "pie-chart": ["funnel-chart", "gauge"],
  "scatter-chart": ["bubble-chart", "line-chart"],
  sparkline: ["line-chart", "area-chart"],
  gauge: ["linear-gauge", "circular-progress"],
  "radar-chart": ["polar-line-chart", "radial-line-chart"],
  heatmap: ["treemap", "table"],
  "funnel-chart": ["pyramid-chart", "pie-chart"],
  "pyramid-chart": ["funnel-chart", "treemap"],
  "sankey-chart": ["chord-chart", "funnel-chart"],
  "range-bar-chart": ["bar-chart", "boxplot-chart"],
  "candlestick-chart": ["ohlc-chart", "line-chart"],
  "radial-bar-chart": ["radial-line-chart", "pie-chart"],
  "radial-line-chart": ["radar-chart", "polar-line-chart"],
  "linear-gauge": ["gauge", "progress"],
  "bubble-chart": ["scatter-chart"],
  "range-area-chart": ["area-chart", "range-bar-chart"],
  treemap: ["sunburst-chart", "heatmap"],
  "polar-line-chart": ["radar-chart", "radial-line-chart"],
  "chord-chart": ["sankey-chart"],
  "waterfall-chart": ["bar-chart"],
  "boxplot-chart": ["range-bar-chart", "scatter-chart"],
  "ohlc-chart": ["candlestick-chart"],
  "sunburst-chart": ["treemap", "pie-chart"],
};

const extraExamples: Record<string, ExampleMeta[]> = {
  button: [
    {
      id: "sizes",
      title: "Sizes",
      description:
        "From compact `sm` through `xl`. Use `touch` (or `icon-touch`) for primary mobile actions — 44px minimum.",
      code: `import { Button } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="touch">Touch</Button>
    </>
  );
}`,
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Disabled buttons skip pointer events and drop opacity. Prefer copy that explains why when you can.",
      code: `import { Button } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Button disabled>Primary</Button>
      <Button variant="outline" disabled>Outline</Button>
      <Button variant="glass" disabled>Glass</Button>
    </>
  );
}`,
    },
  ],
  badge: [
    {
      id: "colors",
      title: "Color",
      description: "Tone variants map to Spatika accent tokens so badges stay on-theme in Mukta through Sandhya.",
      code: `import { Badge } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Badge>Default</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="warm">Warm</Badge>
      <Badge variant="highlight">Highlight</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </>
  );
}`,
    },
  ],
  alert: [
    {
      id: "tones",
      title: "Tones",
      description: "Use `info`, `warm`, `highlight`, and `danger` for status. Keep the title short; put detail in `AlertDescription`.",
      code: `import { Alert, AlertDescription, AlertTitle } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Alert variant="info">
        <AlertTitle>Synced</AlertTitle>
        <AlertDescription>Contacts updated a minute ago.</AlertDescription>
      </Alert>
      <Alert variant="danger">
        <AlertTitle>Couldn't save</AlertTitle>
        <AlertDescription>Check your connection and try again.</AlertDescription>
      </Alert>
    </>
  );
}`,
    },
  ],
  "text-field": [
    {
      id: "error",
      title: "Validation",
      description: "Set `error` and pass the reason through `helperText`. The input is marked `aria-invalid`.",
      code: `import { TextField } from "@spatika/react";

export default function Demo() {
  return (
    <TextField
      label="Email"
      defaultValue="not-an-email"
      error
      helperText="Enter a valid address."
      fullWidth
    />
  );
}`,
    },
    {
      id: "multiline",
      title: "Multiline",
      description: "`multiline` swaps the input for a textarea while keeping the same label and helper API.",
      code: `import { TextField } from "@spatika/react";

export default function Demo() {
  return (
    <TextField
      label="Notes"
      multiline
      rows={4}
      placeholder="Add context for the team…"
      fullWidth
    />
  );
}`,
    },
  ],
  typography: [
    {
      id: "scale",
      title: "Type scale",
      description: "Twelve variants from display headings down to overline. Color and alignment are independent of variant.",
      code: `import { Typography } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Typography variant="h3">Display</Typography>
      <Typography variant="subtitle1">Subtitle</Typography>
      <Typography variant="body1">Body copy uses the theme foreground.</Typography>
      <Typography variant="caption" color="muted">Caption</Typography>
    </>
  );
}`,
    },
  ],
  paper: [
    {
      id: "variants",
      title: "Variants",
      description: "Elevation, outline, or the opt-in glass material. Elevation 0–3 is ignored on `outlined`.",
      code: `import { Paper, Typography } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Paper className="p-4" elevation={2}>Elevated</Paper>
      <Paper className="p-4" variant="outlined">Outlined</Paper>
      <Paper className="p-4" variant="glass">Glass</Paper>
    </>
  );
}`,
    },
  ],
  chip: [
    {
      id: "variants",
      title: "Variants",
      description: "`filter` for rails, `preference` for uppercase admin chips, `layout` for denser toggles.",
      code: `import { Chip } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Chip variant="filter" active>Filter</Chip>
      <Chip variant="preference" active>Preference</Chip>
      <Chip variant="layout" active>Layout</Chip>
    </>
  );
}`,
    },
  ],
  tag: [
    {
      id: "colors",
      title: "Color",
      description: "Static labels — not interactive. Use Chip when the user can toggle.",
      code: `import { Tag } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Tag variant="primary">AWS</Tag>
      <Tag variant="green">Healthy</Tag>
      <Tag variant="orange">Kubernetes</Tag>
      <Tag variant="cyan" size="lg">React</Tag>
    </>
  );
}`,
    },
  ],
  "icon-button": [
    {
      id: "sizes",
      title: "Sizes and shape",
      description: "`touch` meets the 44px target. `circular` is the usual treatment for app chrome.",
      code: `import { IconButton } from "@spatika/react";
import { Bell } from "lucide-react";

export default function Demo() {
  return (
    <>
      <IconButton aria-label="Notify" size="sm"><Bell /></IconButton>
      <IconButton aria-label="Notify" size="md" variant="outline"><Bell /></IconButton>
      <IconButton aria-label="Notify" size="touch" variant="glass" shape="circular">
        <Bell />
      </IconButton>
    </>
  );
}`,
    },
  ],
  fab: [
    {
      id: "colors",
      title: "Color",
      description: "Primary for the main action; the glass material when the FAB floats over media.",
      code: `import { Fab } from "@spatika/react";
import { Plus } from "lucide-react";

export default function Demo() {
  return (
    <>
      <Fab aria-label="Add" color="primary"><Plus /></Fab>
      <Fab aria-label="Add" color="glass"><Plus /></Fab>
      <Fab variant="extended" color="default"><Plus />Compose</Fab>
    </>
  );
}`,
    },
  ],
  progress: [
    {
      id: "values",
      title: "Determinate values",
      description: "Pass `value` (and optional `max`) for a fill. Use `indeterminate` when duration is unknown.",
      code: `import { Progress } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Progress value={25} />
      <Progress value={62} />
      <Progress value={100} />
    </>
  );
}`,
    },
  ],
  switch: [
    {
      id: "labeled",
      title: "With a label",
      description: "Pair with `FormControlLabel` so the hit target includes the text.",
      code: `import { FormControlLabel, Switch } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [on, setOn] = useState(true);
  return (
    <FormControlLabel
      control={<Switch checked={on} onCheckedChange={setOn} />}
      label="Push notifications"
    />
  );
}`,
    },
  ],
  skeleton: [
    {
      id: "shapes",
      title: "Shapes",
      description: "Match the skeleton to the content it replaces — text lines, avatars, and cards.",
      code: `import { Skeleton, Stack } from "@spatika/react";

export default function Demo() {
  return (
    <Stack direction="row" spacing={2} align="center">
      <Skeleton className="size-10 rounded-full" />
      <Stack spacing={1} className="flex-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </Stack>
    </Stack>
  );
}`,
    },
  ],
  stack: [
    {
      id: "direction",
      title: "Direction",
      description: "Default is a column. Use `direction=\"row\"` with `align` and `spacing` for toolbars.",
      code: `import { Button, Stack } from "@spatika/react";

export default function Demo() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        <Button size="sm">Save</Button>
        <Button size="sm" variant="ghost">Cancel</Button>
      </Stack>
      <Button variant="outline">Full width action</Button>
    </Stack>
  );
}`,
    },
  ],
  grid: [
    {
      id: "breakpoints",
      title: "Breakpoints",
      description: "Twelve columns. Set `xs` / `md` / `lg` on items; wrap them in a `container` Grid.",
      code: `import { Grid, Paper } from "@spatika/react";

export default function Demo() {
  return (
    <Grid container spacing={2}>
      <Grid xs={12} md={8}><Paper className="p-3">8</Paper></Grid>
      <Grid xs={12} md={4}><Paper className="p-3">4</Paper></Grid>
    </Grid>
  );
}`,
    },
  ],
  card: [
    {
      id: "slots",
      title: "Slots",
      description: "Compose `CardHeader`, `CardTitle`, `CardContent`, and `CardFooter`. Use `padding=\"none\"` when a child manages its own inset.",
      code: `import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@spatika/react";

export default function Demo() {
  return (
    <Card className="max-w-[360px]">
      <CardHeader>
        <CardTitle>Invite teammate</CardTitle>
      </CardHeader>
      <CardContent>They’ll get an email with a join link.</CardContent>
      <CardFooter>
        <Button size="sm">Send invite</Button>
      </CardFooter>
    </Card>
  );
}`,
    },
  ],
  tabs: [
    {
      id: "controlled",
      title: "Controlled",
      description: "Pass `value` and `onValueChange` when the selected tab should drive other UI.",
      code: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [tab, setTab] = useState("overview");
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Selected: {tab}</TabsContent>
      <TabsContent value="notes">Notes panel</TabsContent>
    </Tabs>
  );
}`,
    },
  ],
  slider: [
    {
      id: "bounds",
      title: "Bounds and step",
      description: "`min`, `max`, and `step` clamp the thumb. Value is always a one-item array.",
      code: `import { Slider } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [volume, setVolume] = useState([8]);
  return <Slider min={0} max={20} step={2} value={volume} onValueChange={setVolume} />;
}`,
    },
  ],
  rating: [
    {
      id: "half",
      title: "Half stars",
      description: "`precision={0.5}` lets the user pick half steps. `readOnly` is for display-only scores.",
      code: `import { Rating } from "@spatika/react";

export default function Demo() {
  return <Rating defaultValue={3.5} precision={0.5} />;
}`,
    },
  ],
  accordion: [
    {
      id: "multiple",
      title: "Multiple",
      description: "`type=\"multiple\"` keeps several panels open. `value` is then a string array.",
      code: `import { Accordion, AccordionContent, AccordionItem, AccordionSummary } from "@spatika/react";

export default function Demo() {
  return (
    <Accordion type="multiple" defaultValue={["a", "b"]}>
      <AccordionItem value="a">
        <AccordionSummary>Tokens</AccordionSummary>
        <AccordionContent>Import @spatika/tokens/styles.css first.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionSummary>Themes</AccordionSummary>
        <AccordionContent>Mukta, Neelam, Usha, and Sandhya.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}`,
    },
  ],
  "event-calendar": [
    {
      id: "custom",
      title: "Host-owned editor and chips",
      description:
        "Keep our grid and wire your own flows — turn off the built-in editor and paint events and the toolbar with `renderEvent` and `renderToolbar`.",
      code: `import { Button, EventCalendar } from "@spatika/react";

export default function Demo() {
  return (
    <EventCalendar
      defaultDate={new Date(2026, 7, 15)}
      showEventEditor={false}
      showPreferences={false}
      events={[
        {
          id: "run",
          title: "Morning Run",
          start: "2026-08-03T07:00:00",
          end: "2026-08-03T07:45:00",
          color: "teal",
          data: { kind: "run" },
        },
      ]}
      onEventClick={(event) => console.log(event.id)}
      renderEvent={(event) => <span>★ {event.title}</span>}
      renderToolbar={({ title, onPrev, onNext, onToday }) => (
        <div className="flex flex-wrap items-center gap-2 px-3 py-3">
          <Button size="sm" variant="outline" onClick={onToday}>Today</Button>
          <Button size="sm" variant="ghost" onClick={onPrev}>Prev</Button>
          <p className="text-sm font-black">{title}</p>
          <Button size="sm" variant="ghost" onClick={onNext}>Next</Button>
        </div>
      )}
    />
  );
}`,
    },
    {
      id: "compact",
      title: "Compact toolbar and date jump",
      description:
        "Stay on the kit toolbar but tighten the layout — compact density for one desktop row, month/year jump selectors, and `onVisibleRangeChange` for fetching the visible window.",
      code: `import { EventCalendar } from "@spatika/react";

export default function Demo() {
  return (
    <EventCalendar
      defaultDate={new Date(2026, 7, 15)}
      toolbarDensity="compact"
      showDateJump
      showPreferences={false}
      onVisibleRangeChange={(range) => console.log(range.view, range.start, range.end)}
    />
  );
}`,
    },
  ],
};

const usageBySlug: Record<string, UsageSection[]> = {
  button: [
    {
      id: "when",
      title: "When to use",
      paragraphs: [
        "Reach for Button when someone needs to do something on this screen — save, confirm, open a flow. `primary` for the one action that matters, `secondary` beside it, `ghost` for quiet actions in toolbars, and `destructive` (or `destructive-soft`) when the result is hard to undo. `variant=\"glass\"` is for controls floating over imagery.",
        "Icon-only actions belong on IconButton or HeaderIconButton. When the primary action should float above the content, Fab is the better fit.",
      ],
    },
    {
      id: "as-child",
      title: "Links",
      paragraphs: [
        "Need a link that looks like a button? Pass `asChild` and wrap a React Router `Link` or a native anchor — you keep real navigation semantics with button styling on top.",
      ],
    },
  ],
  "text-field": [
    {
      id: "when",
      title: "When to use",
      paragraphs: [
        "TextField is the everyday labeled field — email, name, notes, anything where the label and helper should travel together. Use Input when you already render the label yourself; OutlinedInput when you need adornments without the full TextField chrome.",
      ],
    },
    {
      id: "errors",
      title: "Errors",
      paragraphs: [
        "When something's wrong, set `error` and put the reason in `helperText`. That helper is wired to `aria-describedby`, so don't rely on red borders alone — say what needs fixing in words.",
      ],
    },
  ],
  "spatika-editor": [
    {
      id: "when",
      title: "When to use",
      paragraphs: [
        "SpatikaEditor shines anywhere people write inside your product — release notes, CRM logs, help articles, social captions, you name it. We handle the typing, formatting, and toolbar so you can focus on saving the content and showing it elsewhere.",
        "Getting started is straightforward: install `@spatika/editor`, import `@spatika/editor/styles.css` after your token styles, and wire up `value` with `onChange` if you want controlled HTML. The component page has a small inline preview; when you're ready to explore tables, image upload, and the AI dock properly, hop over to the full playground — it runs wide so popovers never get clipped.",
      ],
    },
    {
      id: "ai",
      title: "AI hooks",
      paragraphs: [
        "We don't call an LLM on your behalf — that's your call. SpatikaEditor gives you the UI and hooks; you connect them to whatever model or service you trust. Pass `onAiCommand` to respond to preset actions like proofread or shorten, or to free-form prompts from the dock.",
        "Tweak the menu with `aiCommandMenu.actions`, `aiCommandMenu.title`, and `aiCommandMenu.prompt`. Prefer the older toolbar buttons? Set `aiCommandMenu={false}` and use `aiActions` instead. Anything very specific to your product — tone pickers, image libraries, approval flows — belongs in `toolbarActions`.",
      ],
    },
  ],
  "use-spatika-editor": [
    {
      id: "when",
      title: "When to use",
      paragraphs: [
        "When SpatikaEditor's ribbon, fullscreen mobile mode, or AI dock doesn't quite fit your layout, this hook is your friend. You still get mentions, tables, and slash commands — just without our chrome wrapped around them.",
        "Render `EditorContent` once `isReady` is true, and pair it with `EditorToolbar` or something fully custom. Waiting for `isReady` avoids a flash before extensions finish loading.",
      ],
    },
  ],
  "rich-text-editor": [
    {
      id: "when",
      title: "When to use",
      paragraphs: [
        "If you're still on RichTextEditor, no rush — existing imports keep working through a SpatikaEditor shim underneath.",
        "When you have a moment, migrating to SpatikaEditor is worth it. The API is close, and that's where new features land.",
      ],
    },
  ],
  dialog: [
    {
      id: "when",
      title: "When to use",
      paragraphs: [
        "Dialog is our titled modal — confirmations, short forms, anything that deserves the user's full attention for a moment. FilterSheet is the right overlay for page filters; Modal is there when you want a blank slate without dialog chrome.",
      ],
    },
    {
      id: "focus",
      title: "Focus",
      paragraphs: [
        "While a dialog is open, focus stays inside until it closes, then returns to whatever opened it. Keep one clear primary action in the footer so people know how to finish the task.",
      ],
    },
  ],
  "chart-container": [
    {
      id: "compose",
      title: "Composition",
      paragraphs: [
        "ChartContainer is the low-level composer from `@spatika/charts` — mix bars, lines, and areas, share tooltips with `syncId`, add reference lines, or bolt on a custom toolbar. For a standard plot, BarChart and friends are faster; drop here when the preset almost fits.",
      ],
    },
    {
      id: "data",
      title: "Data",
      paragraphs: [
        "Feed it `dataset` rows with series pointing at `dataKey`, or pass parallel `series[].data` arrays beside `xAxis[].data`. Either shape works; pick the one that matches how your API already returns numbers.",
      ],
    },
  ],
  "event-calendar": [
    {
      id: "when",
      title: "When to use",
      paragraphs: [
        "EventCalendar is the all-in-one scheduler — month, week, day, and agenda views with create, edit, drag, resize, and recurrence. When work lines up on resources instead of a classic grid, EventTimeline is the sibling built for that layout.",
      ],
    },
    {
      id: "customize",
      title: "Host-owned create and chips",
      paragraphs: [
        "Out of the box you get our EventEditor, event chips, and toolbar. If your app already owns create and edit, set `showEventEditor={false}` and handle `onEventClick` and `onSlotClick` yourself. `renderEvent` is the hook for avatars and custom pills; `toolbarDensity=\"compact\"` and `showDateJump` cover most toolbar tweaks without a full `renderToolbar`. Put host metadata on `SchedulerEvent.data`, and listen to `onVisibleRangeChange` to fetch only the painted window.",
      ],
    },
  ],
  "floating-page-chrome": [
    {
      id: "when",
      title: "When to use",
      paragraphs: [
        "FloatingPageChromeBar is the page-level control panel — the tray where users see where they are, search, filter, and tap the primary action. It lives under AppHeader and keeps your scrolling lists and dashboards from sliding underneath.",
        "Compose it with FloatingPageChromeIdentity for the title and count, FloatingPageChromeSearchField for search, FilterSheet for filters, and a Button for the main CTA. Pass the page body as children and let the tray stay fixed above the scroll.",
      ],
    },
  ],
  "app-header": [
    {
      id: "chrome-variant",
      title: "Chrome variant",
      paragraphs: [
        "For product apps, start with `variant=\"chrome\"` — it's the fixed safe-area bar Spatika shells are built around. Pair it with FloatingPageChromeBar for page tools and MobileTabBar on phones so navigation always feels within reach.",
        "Marketing pages and docs can use `sticky` instead: the bar scrolls with the page until it pins, which reads better on long landing pages. HeaderIconButton is the right control for icons in either variant.",
      ],
    },
  ],
  "mobile-tab-bar": [
    {
      id: "when",
      title: "When to use",
      paragraphs: [
        "MobileTabBar is for the three to five destinations people jump between most — Home, Search, Create, Profile, that kind of rhythm. It floats above the content in a capsule so it feels native on iOS.",
        "Give the bar a descriptive `ariaLabel` and set `active` on the tab that matches the current route. BottomNavigation is the older pattern; we'd reach for MobileTabBar first in new Spatika apps.",
      ],
    },
  ],
  "cover-hero": [
    {
      id: "when",
      title: "When to use",
      paragraphs: [
        "CoverHero gives story and profile pages a wide header with a notch for an avatar or logo. Pass a real photo URL when you have one, or a `coverSeed` and we'll pick a token-aware pattern that matches your theme.",
        "Inside docs previews and device frames, set `bleed={false}` so the cover stays contained instead of painting under AppHeader.",
      ],
    },
  ],
  "profile-hero": [
    {
      id: "when",
      title: "When to use",
      paragraphs: [
        "ProfileHero is the full package — cover, avatar, name, and metadata for a person or entity. It's what you'd use on a teammate profile, a customer record, or a public portfolio page.",
        "On the live route, call `useCoverChromeBleed` so AppHeader frosts over the cover ink instead of sitting on a flat background. That small detail is what makes profile pages feel finished.",
      ],
    },
  ],
};

const a11yBySlug: Record<string, string[]> = {
  button: [
    "Icon-only buttons need `aria-label`.",
    "`size=\"touch\"` meets the 44px target on mobile.",
  ],
  "icon-button": ["Always pass `aria-label` — there is no visible text."],
  fab: ["Circular FABs need `aria-label`. Extended FABs use the visible label."],
  switch: ["Exposes `role=\"switch\"` and `aria-checked`. Pair with FormControlLabel or `aria-label`."],
  checkbox: ["Supports an indeterminate state for mixed selection."],
  slider: ["Thumbs are keyboard-operable. Provide a visible label or `aria-label`."],
  dialog: ["Focus is trapped. Escape and backdrop click dismiss unless you control `open`."],
  modal: ["Prefer Dialog for titled content so the title is exposed to assistive tech."],
  tooltip: ["Don't put essential information only in a tooltip — it is hover and focus only."],
  tabs: ["TabsList is a `tablist`. Triggers are `tab`; panels are `tabpanel`."],
  "segmented-control": ["Rendered as a `radiogroup`. Pass `aria-label` when there is no visible legend."],
  alert: ["Root has `role=\"alert\"`. Keep the title short."],
  progress: ["Determinate bars expose `aria-valuenow`. Indeterminate bars use `aria-label=\"Loading\"`."],
  "circular-progress": ["Same progressbar semantics as Progress."],
  snackbar: ["Auto-hides after `autoHideDuration`. Keep the message short; put Undo in `action`."],
  rating: ["Keyboard-operable. `emptyLabelText` names the empty state."],
  accordion: ["Summary is a button that controls the collapse region via `aria-expanded`."],
  menu: ["Dismiss on outside click and Escape. Return focus to the trigger."],
  "mobile-tab-bar": ["Pass `ariaLabel`. Mark the current destination with `active`."],
  breadcrumb: ["Root is a `nav` with `aria-label=\"Breadcrumb\"`. The last item is the current page."],
};

const categoryUsage: Record<ComponentEntry["category"], UsageSection[]> = {
  Primitives: [
    {
      id: "tokens",
      title: "Theming",
      paragraphs: [
        "Primitives are where your UI starts — buttons, type, chips, and badges that inherit color, radius, and motion from `@spatika/tokens`. Wrap the app in `SpatikaThemeProvider` so Mukta, Neelam, Usha, and Sandhya all feel intentional, not bolted on.",
      ],
    },
  ],
  Forms: [
    {
      id: "labels",
      title: "Labels",
      paragraphs: [
        "Every input needs a name people can see or hear. Reach for TextField when you want label and helper in one place; use FormControl when you're composing something custom. FormControlLabel is the friendliest way to pair switches and checkboxes with readable text.",
      ],
    },
  ],
  Layout: [
    {
      id: "surfaces",
      title: "Surfaces",
      paragraphs: [
        "Layout components give your content a frame — Card, Panel, and PageSection instead of hand-rolled containers, Stack and Grid instead of scattering gap utilities. Start with a Container, stack sections with consistent spacing, and let the surfaces do the visual lifting.",
      ],
    },
  ],
  Navigation: [
    {
      id: "chrome",
      title: "App chrome",
      paragraphs: [
        "Navigation is how people move without getting lost. Product apps usually stack AppHeader, FloatingPageChromeBar, and MobileTabBar; marketing sites swap in SiteNav and SiteFooter for the same tokens in a different frame.",
      ],
    },
  ],
  Feedback: [
    {
      id: "choose",
      title: "Which overlay",
      paragraphs: [
        "Pick the lightest pattern that still gets the message across. Alert stays inline on the page; Snackbar anchors one short message; Toaster stacks transient notes; Dialog handles titled tasks that need focus. Modal is the escape hatch when you need a fully custom overlay.",
      ],
    },
  ],
  Overlays: [
    {
      id: "choose-overlay",
      title: "Which overlay",
      paragraphs: [
        "Use the lightest layer that does the job. Tooltip for a hint; Popover for a small non-modal panel; DropdownMenu or ContextMenu for actions; Sheet for editing a record beside the page; Dialog for a focused task; AlertDialog only to confirm something irreversible. BottomSheet is the phone-native sheet.",
        "Overlays share one layer stack: Escape closes only the topmost, an outside press closes only the layers above the one you pressed, and anything opened inside a modal stacks above it. You never need to set z-index by hand.",
      ],
    },
  ],
  Media: [
    {
      id: "covers",
      title: "Generated covers",
      paragraphs: [
        "CoverHero and ProfileHero dress up story and profile routes — pass a photo or a `coverSeed` and we'll generate a pattern from your theme. In docs previews and device frames, set `bleed={false}` so the cover stays contained instead of painting under app chrome.",
      ],
    },
  ],
  Data: [
    {
      id: "compose",
      title: "Composition",
      paragraphs: [
        "Data components are for dense information — semantic Table with TablePagination, calendars and timelines that share `SchedulerEvent` types, and grids that talk to charts. Compose them when lists turn into something people need to compare, schedule, or drill into.",
      ],
    },
  ],
  Marketing: [
    {
      id: "page-shape",
      title: "Shape of a landing page",
      paragraphs: [
        "Marketing pages are bands, not cards. Stack `MarketingSection`s — hero, proof, features, pricing, questions, closing ask — and let each one own its background tone and vertical rhythm. Inside a band you are back to the same components you use in product screens.",
        "Decoration is opt-in and token-derived: `SectionBackdrop` washes, the facet sheen on featured tiles, and `Reveal` entrances all follow the active theme and stand down under `prefers-reduced-motion` and `prefers-reduced-transparency`. Use at most one loud thing per screenful.",
      ],
    },
  ],
  Charts: [
    {
      id: "toolbar",
      title: "Toolbar and export",
      paragraphs: [
        "Charts ship from `@spatika/charts` with theme-aware colors out of the box. Turn on `showToolbar` when people need zoom, pan, brush, or SVG/PNG export; drop to ChartContainer when a preset chart isn't quite enough.",
      ],
    },
  ],
  Editor: [
    {
      id: "bootstrap",
      title: "Bootstrap",
      paragraphs: [
        "Import `@spatika/editor/styles.css` with `@spatika/tokens/styles.css`. Editor chrome uses the same semantic tokens as the rest of the kit and follows the active theme automatically.",
      ],
    },
  ],
};

function defaultA11y(entry: ComponentEntry): string[] {
  if (entry.category === "Forms") {
    return ["Associate a visible label or `aria-label` with the control."];
  }
  if (entry.category === "Editor") {
    return ["The editor surface exposes `role=\"textbox\"` and `aria-multiline`. Toolbar buttons need `aria-label`s."];
  }
  if (entry.category === "Feedback") {
    return ["Keep copy short. Don't rely on color alone to convey status."];
  }
  if (entry.category === "Charts") {
    return [
      "The plot is one tab stop: ← → move through the points of a series (or the slices of a pie), ↑ ↓ switch series, Home / End jump to the ends, Enter activates `onItemClick`, Escape clears. The focused point shows its tooltip and its value is announced.",
      "The chart is a group named by `aria-label`; say what it shows (\"Revenue by month, 2026\") and state the takeaway in the surrounding text — navigation reads values, not conclusions.",
      "Series are distinguished by more than colour where it matters: keep the legend, use labels, or vary `strokeDasharray`.",
    ];
  }
  return [];
}

function relatedOf(entry: ComponentEntry): string[] {
  const explicit = relatedBySlug[entry.slug] ?? getAppDoc(entry.slug)?.related ?? [];
  const neighbors = components
    .filter((item) => item.category === entry.category && item.slug !== entry.slug)
    .slice(0, 4)
    .map((item) => item.slug);
  const seen = new Set<string>();
  return [...explicit, ...neighbors].filter((slug) => {
    if (seen.has(slug) || !components.some((item) => item.slug === slug)) return false;
    seen.add(slug);
    return true;
  }).slice(0, 6);
}

export function getComponentDoc(entry: ComponentEntry): ComponentDoc {
  const extras = extraExamples[entry.slug] ?? [];
  const slugUsage = usageBySlug[entry.slug] ?? [];
  const usedUsageIds = new Set(slugUsage.map((section) => section.id));
  const usage = [
    ...slugUsage,
    ...categoryUsage[entry.category].filter((section) => !usedUsageIds.has(section.id)),
  ];
  const accessibility = a11yBySlug[entry.slug] ?? getAppDoc(entry.slug)?.accessibility ?? defaultA11y(entry);

  const examples: ExampleMeta[] = [
    {
      id: "basic",
      title: "Basic",
      description: entry.description,
      code: basicSource(entry),
    },
    ...extras,
  ];

  return {
    intro: getIntro(entry),
    examples,
    usage,
    accessibility,
    api: getApi(entry),
    slots: getSlots(entry),
    classes: getClasses(entry),
    related: relatedOf(entry),
  };
}

