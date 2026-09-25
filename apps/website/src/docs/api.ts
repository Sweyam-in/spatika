import type { ApiSection, PropDoc } from "./types";
import type { ComponentEntry } from "../data/navigation";
import generatedApi from "../generated/api.json";

/** Prop tables extracted from the package source (`npm run docs:api`). */
type GeneratedProp = {
  name: string;
  type: string;
  optional: boolean;
  description: string;
  default?: string;
  deprecated?: string;
};
type GeneratedComponent = { description?: string; extends?: string[]; props: GeneratedProp[] };
const GENERATED = generatedApi as Record<string, GeneratedComponent>;

function fromGenerated(prop: GeneratedProp): PropDoc {
  const notes = [
    prop.deprecated !== undefined ? `**Deprecated.** ${prop.deprecated}`.trim() : "",
    prop.optional ? "" : "Required.",
    prop.description,
  ].filter(Boolean);
  return {
    name: prop.name,
    type: prop.type,
    ...(prop.default !== undefined ? { default: prop.default } : {}),
    description: notes.join(" ") || "—",
  };
}

/** API section for one export, straight from the source types. */
export function generatedSection(name: string): ApiSection | null {
  const component = GENERATED[name];
  if (!component) return null;
  return {
    name,
    ...(component.extends?.length ? { extends: component.extends.join(", ") } : {}),
    props: component.props.map(fromGenerated),
  };
}

/**
 * Hand-written sections carry the prose; any prop the source has that the prose omits is
 * appended from the generated reference so tables never fall behind the code.
 */
function completeSection(section: ApiSection): ApiSection {
  const names = section.name.split(/\s*\/\s*/).map((name) => name.replace(/\(\)$/, ""));
  const generated = names.map((name) => GENERATED[name]).filter(Boolean);
  if (!generated.length) return section;
  const byName = new Map(generated.flatMap((component) => component.props.map((prop) => [prop.name, prop] as const)));
  // Types come from the source; the hand-written row keeps its description (and default,
  // unless the source states one).
  const props = section.props.map((prop) => {
    const source = byName.get(prop.name);
    if (!source) return prop;
    return { ...prop, type: source.type, default: source.default ?? prop.default };
  });
  section = { ...section, props };
  const documented = new Set(section.props.flatMap((prop) => prop.name.split(/\s*\/\s*/)));
  const missing = generated
    .flatMap((component) => component.props)
    .filter((prop, index, all) => !documented.has(prop.name) && all.findIndex((p) => p.name === prop.name) === index)
    .map(fromGenerated);
  return missing.length ? { ...section, props: [...section.props, ...missing] } : section;
}

function p(name: string, type: string, description: string, def?: string): PropDoc {
  return def === undefined ? { name, type, description } : { name, type, default: def, description };
}

const className = p("className", "string", "Additional CSS classes.");
const children = p("children", "ReactNode", "Component children.");
const asChild = p(
  "asChild",
  "boolean",
  "Merge props onto the child element instead of rendering a native root.",
  "false",
);
const disabled = p("disabled", "boolean", "Disable pointer events and dim the control.", "false");

const cartesian: PropDoc[] = [
  p("series", "NumericSeries[]", "Named series. Each item has `data` values or a `dataKey` into `dataset`."),
  p("dataset", "ChartDataset", "Optional row-oriented data. Series can point at columns via `dataKey`."),
  p("xAxis", "ChartAxisConfig[]", "Category or time axis. `tickAngle` rotates labels. `valueFormatter` / `tickFormatter` format numeric ticks."),
  p("yAxis", "ChartAxisConfig[]", "Value axes. `reversed` flips the domain. `valueFormatter` formats ticks and default tooltip values. A second axis with `id` enables dual-axis plots."),
  p("height", "number", "Plot height in pixels.", "240"),
  p("width", "number", "Plot width. Defaults to the container width."),
  p("colors", "string[]", "Series color override. Falls back to theme chart tokens."),
  p("hideLegend", "boolean", "Hide the series legend.", "false"),
  p("legendPosition", '"top" | "bottom" | "left" | "right"', "Where the series legend sits.", '"top"'),
  p("hideGrid", "boolean", "Hide cartesian grid lines.", "false"),
  p("margin", "ChartMargin", "Plot inset `{ top, right, bottom, left }`."),
  p("zoom", "boolean | ChartZoom", "Enable pan/zoom, or pass a controlled zoom object."),
  p("onZoomChange", "(zoom: ChartZoom) => void", "Fires when the user pans, zooms, or brushes."),
  p("showToolbar", "boolean", "Show zoom, pan, brush, and export controls.", "false"),
  p("highlightScope", "HighlightScope", "How hover highlighting fans out across series and items."),
  p("animated", "boolean", "Animate series on mount and update.", "true"),
  p("locale", "string", "BCP 47 locale for axis and tooltip number formatting."),
  p("fillHeight", "boolean", "Plot height follows the parent instead of the numeric `height`.", "false"),
  p("onItemClick", "(event: ChartItemEvent) => void", "Fires when a bar, point, or mark is activated."),
  p("renderTooltip", "(hover) => ReactNode", "Replace the default hover tooltip."),
  p("renderMark", "(ctx: ChartMarkRenderContext) => ReactNode", "Replace line/area point marks. Kit still wires click and hover."),
  p("referenceLines", "ChartReferenceLine[]", "Horizontal value or vertical category guides."),
  p("showLabels", "boolean", "Draw the numeric value at the end of each bar.", "false"),
  p("syncId", "string", "Share hover with other charts that use the same id (Recharts `syncId`)."),
  p("sharedTooltip", "boolean", "Show every series at the hovered category.", "true"),
  p("tooltipTrigger", '"hover" | "click"', "Open the tooltip on pointer enter or on click.", '"hover"'),
  p("showCursor", "boolean", "Draw a vertical guide at the active category.", "true"),
  p("stackOffset", '"sign" | "expand"', "`expand` is 100% stacked (Recharts `stackOffset`).", '"sign"'),
  p("minPointSize", "number", "Minimum bar thickness in pixels."),
  p("maxBarSize", "number", "Cap bar thickness in pixels."),
  p("showBarBackground", "boolean", "Draw category tracks behind bars.", "false"),
  p("loading", "boolean", "Cover the plot with a loading status.", "false"),
  p("emptyText", "ReactNode", "Message when every visible series is empty.", '"No data"'),
  p("referenceAreas", "ChartReferenceArea[]", "Value or category rectangle overlays."),
  p("referenceDots", "ChartReferenceDot[]", "Point overlays on the plot."),
  className,
];

function cartesianApi(name: string, extras: PropDoc[] = [], description?: string): ApiSection[] {
  const extraNames = new Set(extras.map((prop) => prop.name));
  return [
    {
      name,
      description,
      props: [...extras, ...cartesian.filter((prop) => !extraNames.has(prop.name))],
    },
  ];
}

export const apiBySlug: Record<string, ApiSection[]> = {
  "lead-form": [
    {
      name: "LeadForm",
      extends: "form",
      props: [
        p("onSubmit", "(value: string, form: HTMLFormElement) => void | Promise<void>", "Return a promise and the button shows a pending state on its own."),
        p("label", "ReactNode", "Field label — always announced, visible when `hideLabel` is false.", '"Email address"'),
        p("hideLabel", "boolean", "Keep the label for screen readers only.", "true"),
        p("placeholder", "string", "Field placeholder.", '"you@company.com"'),
        p("action", "ReactNode", "Submit button copy.", '"Subscribe"'),
        p("note", "ReactNode", "Fine print — consent, frequency."),
        p("layout", '"inline" | "stacked"', "`inline` puts field and button on one row.", '"inline"'),
        p("status", '"idle" | "submitting" | "success" | "error"', "Controlled status. Unset means the form tracks its own."),
        p("message", "ReactNode", "Message under the form, overriding `successMessage`."),
        p("successMessage", "ReactNode", "Announced on success when `message` is unset."),
        p("formAction", "string", "Native form endpoint — Formspree, Mailchimp."),
        p("method", '"get" | "post"', "Method for `formAction`.", '"post"'),
        children,
        className,
      ],
    },
  ],
  "split-feature": [
    {
      name: "SplitFeature",
      props: [
        p("title", "ReactNode", "Section heading. Required."),
        p("description", "ReactNode", "A sentence or two of copy."),
        p("eyebrow", "ReactNode", "Small accent label above the title."),
        p("bullets", "ReactNode[]", "Proof points, each rendered with a check."),
        p("actions", "ReactNode", "Link or button under the copy."),
        p("media", "ReactNode", "Screenshot, `ShowcaseFrame`, chart or illustration."),
        p("reverse", "boolean", "Media first on wide screens. Phone order never changes.", "false"),
        p("mediaWidth", '"equal" | "wide"', "Give the media more of the row.", '"equal"'),
        p("as", '"h2" | "h3"', "Heading level.", '"h2"'),
        children,
        className,
      ],
    },
    {
      name: "SplitFeatureGroup",
      props: [
        p("startReversed", "boolean", "Start with the media on the left.", "false"),
        children,
        className,
      ],
    },
  ],
  "comparison-table": [
    {
      name: "ComparisonTable",
      extends: "table",
      props: [
        p("columns", "ComparisonColumn[]", "`{ id, label, description, badge, featured, action }`. Required."),
        p("rows", "ComparisonRow[]", "Flat feature list — `{ label, hint, values }` keyed by column id."),
        p("groups", "ComparisonGroup[]", "Sectioned features — `{ label, rows }`. Use instead of `rows`."),
        p("caption", "ReactNode", "Visually hidden table description for screen readers."),
        p("stickyHeader", "boolean", "Keep the column headers visible while scrolling.", "false"),
        p("featureLabel", "ReactNode", "Header for the first column.", '"Features"'),
        className,
      ],
    },
  ],
  "article-card": [
    {
      name: "ArticleCard",
      props: [
        p("title", "ReactNode", "Headline. Required."),
        p("href", "string", "Link for the card — carried by the title so the accessible name is right."),
        p("excerpt", "ReactNode", "Standfirst, clamped to three lines."),
        p("media", "ReactNode", "Cover image or illustration."),
        p("date", "ReactNode", "Formatted date, or a `time` element."),
        p("readingTime", "ReactNode", '"6 min read".'),
        p("tags", "ReactNode", "Category or `Tag` elements."),
        p("author", "ReactNode", "Author name."),
        p("authorAvatar", "ReactNode", "An `Avatar` or `InitialsAvatar`."),
        p("variant", '"card" | "plain" | "horizontal"', "Surface treatment and layout.", '"card"'),
        p("featured", "boolean", "Bigger type for the lead story.", "false"),
        p("as", '"article" | "li" | "div"', "Root element.", '"article"'),
        children,
        className,
      ],
    },
  ],
  "marketing-section": [
    {
      name: "MarketingSection",
      extends: "section",
      props: [
        p("tone", '"plain" | "wash" | "sunken" | "inverse" | "accent"', "Background material. `inverse` and `accent` flip the ink for everything inside.", '"plain"'),
        p("width", '"default" | "narrow" | "full"', "Content width. `full` opts out of the max-width container.", '"default"'),
        p("edge", '"none" | "top" | "bottom" | "both"', "Hairline separators between stacked sections.", '"none"'),
        p("backdrop", "SectionBackdropKind | SectionBackdropProps", "Decorative wash behind the content."),
        p("spacing", '"none" | "tight" | "default"', "Vertical rhythm.", '"default"'),
        p("innerClassName", "string", "Classes for the inner max-width container."),
        children,
        className,
      ],
    },
  ],
  "section-backdrop": [
    {
      name: "SectionBackdrop",
      props: [
        p("kind", '"aurora" | "glow" | "grid" | "dots" | "rays"', "Which wash to draw.", '"aurora"'),
        p("strength", "number", "Multiplier on the backdrop opacity.", "1"),
        p("animated", "boolean", "Slow drift on `aurora` and `glow`. Ignored under `prefers-reduced-motion`.", "false"),
        className,
      ],
    },
  ],
  "marketing-hero": [
    {
      name: "MarketingHero",
      props: [
        p("title", "ReactNode", "The headline. Required."),
        p("lede", "ReactNode", "Sub-headline, capped to a readable measure."),
        p("eyebrow", "ReactNode", "Small accent label above the title."),
        p("announcement", "ReactNode", "Usually an `AnnouncementPill`."),
        p("actions", "ReactNode", "Call-to-action buttons."),
        p("note", "ReactNode", "Fine print under the actions."),
        p("media", "ReactNode", "Product shot, `ShowcaseFrame`, illustration or form."),
        p("layout", '"stacked" | "split"', "`split` puts media beside the copy on wide screens.", '"stacked"'),
        p("align", '"start" | "center"', "Copy alignment. Defaults to centred when stacked."),
        p("footer", "ReactNode", "Trust strip under the hero — a `LogoCloud` or stat line."),
        p("as", '"h1" | "h2"', "Heading level for the title.", '"h1"'),
        className,
      ],
    },
  ],
  "announcement-pill": [
    {
      name: "AnnouncementPill",
      props: [
        p("tag", "ReactNode", "Short leading label — \"New\", \"v2.0\"."),
        p("href", "string", "Renders the pill as a link and shows a chevron."),
        p("onClick", "() => void", "Click handler."),
        p("hideChevron", "boolean", "Hide the trailing chevron on a linked pill.", "false"),
        children,
        className,
      ],
    },
  ],
  "feature-grid": [
    {
      name: "FeatureGrid",
      props: [
        p("columns", "2 | 3 | 4", "Columns at the large breakpoint. Always one on phones.", "3"),
        p("as", '"div" | "ul"', "Render as a list when the features are an inventory.", '"div"'),
        children,
        className,
      ],
    },
    {
      name: "FeatureCard",
      props: [
        p("title", "ReactNode", "Feature name. Required."),
        p("description", "ReactNode", "One or two sentences."),
        p("icon", "ReactNode", "Usually a lucide icon or an `IconTile`."),
        p("action", "ReactNode", "Trailing link."),
        p("media", "ReactNode", "Screenshot or illustration above the copy."),
        p("variant", '"plain" | "card" | "outline" | "rail"', "`rail` draws the accent rail on the leading edge.", '"plain"'),
        p("href", "string", "Wraps the card in a link and adds hover lift."),
        p("as", '"div" | "li" | "article"', "Root element when the card is not a link.", '"div"'),
        children,
        className,
      ],
    },
  ],
  "bento-grid": [
    {
      name: "BentoGrid",
      props: [
        p("columns", "2 | 3 | 4", "Track count at the large breakpoint.", "3"),
        children,
        className,
      ],
    },
    {
      name: "BentoCard",
      props: [
        p("title", "ReactNode", "Tile heading."),
        p("description", "ReactNode", "A sentence of copy."),
        p("icon", "ReactNode", "Leading icon."),
        p("media", "ReactNode", "Visual that fills the rest of the tile."),
        p("span", "1 | 2 | 3", "Columns to span at the large breakpoint.", "1"),
        p("rows", "1 | 2", "Rows to span at the large breakpoint.", "1"),
        p("emphasis", "boolean", "Accent tint. Use on one tile per grid.", "false"),
        p("shine", "boolean", "Sweeps a facet highlight across the tile on hover.", "false"),
        p("href", "string", "Wraps the tile in a link."),
        children,
        className,
      ],
    },
  ],
  "pricing-table": [
    {
      name: "PricingTable",
      props: [
        p("columns", "2 | 3 | 4", "Plans per row at the large breakpoint.", "3"),
        p("toolbar", "ReactNode", "Billing switch above the plans — a `SegmentedControl`, usually."),
        children,
        className,
      ],
    },
    {
      name: "PricingCard",
      props: [
        p("name", "ReactNode", "Plan name. Required."),
        p("price", "ReactNode", "The headline number, pre-formatted. Required."),
        p("period", "ReactNode", "What the price is per."),
        p("description", "ReactNode", "One line on who the plan is for."),
        p("features", "(PricingFeature | string)[]", "Plan contents. `{ label, excluded }` strikes a row through."),
        p("action", "ReactNode", "The plan's call to action."),
        p("note", "ReactNode", "Fine print under the action."),
        p("featured", "boolean", "Accent ring, and lifts out of the row on wide screens.", "false"),
        p("badge", "ReactNode", "Ribbon on a featured plan."),
        children,
        className,
      ],
    },
  ],
  "testimonial-card": [
    {
      name: "TestimonialCard",
      props: [
        p("quote", "ReactNode", "The quote, without quotation marks. Required."),
        p("author", "ReactNode", "Who said it. Required."),
        p("role", "ReactNode", "Role and company."),
        p("avatar", "ReactNode", "An `Avatar`, `InitialsAvatar` or image."),
        p("logo", "ReactNode", "Customer logo."),
        p("rating", "ReactNode", "A `Rating`, or any small trailing mark."),
        p("variant", '"card" | "plain" | "featured"', "Surface treatment.", '"card"'),
        p("size", '"md" | "lg"', "`lg` sets the quote at title size.", '"md"'),
        p("showMark", "boolean", "Draw the decorative quotation mark.", "true"),
        className,
      ],
    },
  ],
  "logo-cloud": [
    {
      name: "LogoCloud",
      props: [
        p("label", "ReactNode", "Line above the row."),
        p("variant", '"row" | "marquee"', "`marquee` scrolls continuously.", '"row"'),
        p("height", "string", "Cap on logo height.", '"1.75rem"'),
        p("plain", "boolean", "Keep logos in full colour instead of greyscale-until-hover.", "false"),
        children,
        className,
      ],
    },
  ],
  "stat-band": [
    {
      name: "StatBand",
      props: [
        p("stats", "MarketingStat[]", "`{ value, label, hint }` — values are pre-formatted. Required."),
        p("variant", '"plain" | "divided" | "cards"', "How the row is separated.", '"divided"'),
        p("align", '"start" | "center"', "Alignment within each cell.", '"center"'),
        className,
      ],
    },
  ],
  "step-flow": [
    {
      name: "StepFlow",
      props: [
        p("steps", "FlowStep[]", "`{ title, description, icon, media }`. Required."),
        p("orientation", '"vertical" | "horizontal"', "`horizontal` is the three-beat marketing version.", '"horizontal"'),
        p("connected", "boolean", "Draw the connector between steps.", "true"),
        className,
      ],
    },
  ],
  "cta-band": [
    {
      name: "CtaBand",
      props: [
        p("title", "ReactNode", "The ask. Required."),
        p("description", "ReactNode", "One line of copy."),
        p("actions", "ReactNode", "One primary action, at most one secondary."),
        p("note", "ReactNode", "Fine print under the actions."),
        p("tone", '"surface" | "accent" | "inverse"', "Band material.", '"surface"'),
        p("layout", '"split" | "stacked"', "`split` puts actions beside the copy on wide screens.", '"split"'),
        p("backdrop", "SectionBackdropKind | SectionBackdropProps", "Decorative wash inside the band."),
        p("as", '"h2" | "h3"', "Heading level.", '"h2"'),
        className,
      ],
    },
  ],
  "faq-section": [
    {
      name: "FaqSection",
      props: [
        p("items", "FaqItem[]", "`{ question, answer }`. Required."),
        p("title", "ReactNode", "Heading above the list."),
        p("description", "ReactNode", "A line under the title."),
        p("aside", "ReactNode", "Support links beside the list on wide screens."),
        p("multiple", "boolean", "Let several answers stay open at once.", "false"),
        p("defaultOpen", "string", "Question opened on first render."),
        p("structuredData", "boolean", "Also emit FAQPage JSON-LD. String answers only.", "false"),
        className,
      ],
    },
  ],
  marquee: [
    {
      name: "Marquee",
      props: [
        p("duration", "number", "Seconds for one full pass.", "40"),
        p("direction", '"left" | "right"', "Scroll direction.", '"left"'),
        p("gap", "string", "Gap between items.", '"3rem"'),
        p("pauseOnHover", "boolean", "Pause while the pointer is over the row.", "true"),
        children,
        className,
      ],
    },
  ],
  reveal: [
    {
      name: "Reveal",
      props: [
        p("effect", '"rise" | "fade" | "scale" | "slide-left" | "slide-right"', "How the element arrives.", '"rise"'),
        p("delay", "number", "Delay in ms — stagger a row with `index * 80`.", "0"),
        p("threshold", "number", "Fraction visible before it plays.", "0.15"),
        p("once", "boolean", "Play only the first time.", "true"),
        p("as", '"div" | "section" | "li" | "article" | "span"', "Root element.", '"div"'),
        children,
        className,
      ],
    },
  ],
  "showcase-frame": [
    {
      name: "ShowcaseFrame",
      props: [
        p("chrome", '"browser" | "window" | "phone" | "none"', "Which frame to draw.", '"browser"'),
        p("url", "string", "URL shown in the browser bar."),
        p("title", "ReactNode", "Title shown in the window bar when there is no URL."),
        p("tilt", "boolean", "Perspective tilt that relaxes on hover.", "false"),
        p("shine", "boolean", "Sweep a facet highlight across the frame on hover.", "false"),
        p("bodyClassName", "string", "Classes for the content area inside the chrome."),
        children,
        className,
      ],
    },
  ],
  prose: [
    {
      name: "Prose",
      props: [
        p("html", "string", "Render pre-sanitised HTML from a CMS or MDX."),
        p("size", '"sm" | "md"', "`sm` suits sidebars and changelog entries.", '"md"'),
        p("lead", "boolean", "Set the first paragraph at title size as a standfirst.", "false"),
        p("as", '"div" | "article" | "section"', "Root element.", '"div"'),
        children,
        className,
      ],
    },
  ],
  button: [
    {
      name: "Button",
      extends: "button",
      props: [
        p(
          "variant",
          '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass" | "gradient"',
          "Visual style.",
          '"default"',
        ),
        p(
          "size",
          '"default" | "sm" | "lg" | "xl" | "touch" | "icon" | "icon-touch"',
          "`touch` and `icon-touch` meet the 44px mobile target.",
          '"default"',
        ),
        asChild,
        disabled,
        children,
        className,
      ],
    },
  ],
  "button-group": [
    {
      name: "ButtonGroup",
      extends: "div",
      props: [
        p("orientation", '"horizontal" | "vertical"', "Layout direction.", '"horizontal"'),
        p("fullWidth", "boolean", "Stretch the group across the parent.", "false"),
        p("variant", "Button variant", "Default variant applied to child buttons."),
        p("size", "Button size", "Default size applied to child buttons."),
        disabled,
        children,
        className,
      ],
    },
  ],
  "icon-button": [
    {
      name: "IconButton",
      extends: "button",
      props: [
        p("variant", '"ghost" | "outline" | "glass" | "filled"', "Visual style.", '"ghost"'),
        p("size", '"sm" | "md" | "lg" | "touch"', "Control size. `touch` is 44px.", '"md"'),
        p("shape", '"rounded" | "circular"', "Corner treatment.", '"rounded"'),
        asChild,
        disabled,
        children,
        className,
      ],
    },
  ],
  fab: [
    {
      name: "Fab",
      extends: "button",
      props: [
        p("variant", '"circular" | "extended"', "Circular icon FAB or labeled extended FAB.", '"circular"'),
        p("color", '"primary" | "glass" | "default"', "Fill treatment.", '"primary"'),
        p("size", '"sm" | "md" | "lg"', "Diameter (circular) or height (extended).", '"md"'),
        asChild,
        children,
        className,
      ],
    },
  ],
  link: [
    {
      name: "Link",
      extends: "a",
      props: [
        p("color", '"primary" | "inherit" | "muted"', "Text color.", '"primary"'),
        p("underline", '"always" | "hover" | "none"', "Underline behavior.", '"hover"'),
        p("href", "string", "Destination URL."),
        asChild,
        children,
        className,
      ],
    },
  ],
  typography: [
    {
      name: "Typography",
      extends: "p",
      props: [
        p(
          "variant",
          '"h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2" | "body1" | "body2" | "caption" | "overline"',
          "Type scale. Maps to a semantic element unless `component` is set.",
          '"body1"',
        ),
        p("color", '"default" | "muted" | "primary" | "inherit"', "Foreground token.", '"default"'),
        p("align", '"inherit" | "left" | "center" | "right"', "Text alignment.", '"inherit"'),
        p("gutterBottom", "boolean", "Add spacing below the line.", "false"),
        p("noWrap", "boolean", "Truncate overflowing text.", "false"),
        p("component", "ElementType", "Override the rendered HTML element."),
        children,
        className,
      ],
    },
  ],
  badge: [
    {
      name: "Badge",
      extends: "span",
      props: [
        p(
          "variant",
          '"default" | "secondary" | "destructive" | "outline" | "info" | "warm" | "highlight"',
          "Color treatment.",
          '"default"',
        ),
        asChild,
        children,
        className,
      ],
    },
  ],
  avatar: [
    {
      name: "Avatar",
      extends: "span",
      props: [children, className],
    },
    {
      name: "AvatarImage",
      extends: "img",
      props: [p("src", "string", "Photo URL."), p("alt", "string", "Accessible name.")],
    },
    {
      name: "AvatarFallback",
      extends: "span",
      props: [children, className],
    },
    {
      name: "InitialsAvatar",
      props: [
        p("name", "string", "Full name used for initials and color hashing."),
        className,
      ],
    },
  ],
  "avatar-group": [
    {
      name: "AvatarGroup",
      extends: "div",
      props: [
        p("max", "number", "Maximum avatars before an overflow count is shown."),
        p("total", "number", "Override the overflow total when not all children are rendered."),
        p("spacing", '"medium" | "small" | number', "Overlap spacing."),
        children,
        className,
      ],
    },
  ],
  accordion: [
    {
      name: "Accordion",
      extends: "div",
      props: [
        p("type", '"single" | "multiple"', "One open panel, or several at once.", '"single"'),
        p("value", "string | string[]", "Controlled open item id(s)."),
        p("defaultValue", "string | string[]", "Uncontrolled initial open item id(s)."),
        p("onValueChange", "(value: string | string[]) => void", "Fires when a panel opens or closes."),
        disabled,
        p("disableGutters", "boolean", "Stack items as a single surface without gaps.", "false"),
        children,
        className,
      ],
    },
    {
      name: "AccordionItem",
      extends: "div",
      props: [
        p("value", "string", "Stable id used by the parent Accordion."),
        disabled,
        children,
      ],
    },
    {
      name: "AccordionSummary",
      extends: "button",
      description: "Also exported as AccordionTrigger.",
      props: [children, className],
    },
    {
      name: "AccordionContent",
      extends: "div",
      props: [children, className],
    },
    {
      name: "AccordionActions",
      extends: "div",
      props: [children, className],
    },
  ],
  "button-base": [
    {
      name: "ButtonBase",
      extends: "button",
      props: [asChild, disabled, children, className],
    },
  ],
  rating: [
    {
      name: "Rating",
      extends: "div",
      props: [
        p("value", "number", "Controlled rating."),
        p("defaultValue", "number", "Uncontrolled initial rating.", "0"),
        p("onChange", "(value: number) => void", "Fires when the user picks a value."),
        p("max", "number", "Number of stars.", "5"),
        p("precision", "0.5 | 1", "Whole stars or half-star steps.", "1"),
        p("readOnly", "boolean", "Display only; no pointer interaction.", "false"),
        disabled,
        p("size", '"sm" | "md" | "lg"', "Star size.", '"md"'),
        p("emptyLabelText", "string", "Accessible name when the value is 0."),
        className,
      ],
    },
  ],
  box: [
    {
      name: "Box",
      extends: "div",
      props: [
        p("component", "ElementType", "Rendered element.", '"div"'),
        asChild,
        children,
        className,
      ],
    },
  ],
  chip: [
    {
      name: "Chip",
      extends: "button",
      props: [
        p("variant", '"filter" | "preference" | "layout"', "Density and typography.", '"filter"'),
        p("active", "boolean", "Selected / pressed appearance. Sets `aria-pressed`.", "false"),
        children,
        className,
      ],
    },
  ],
  tag: [
    {
      name: "Tag",
      extends: "span",
      props: [
        p(
          "variant",
          '"default" | "primary" | "outline" | "muted" | "red" | "green" | "orange" | "blue" | "purple" | "cyan"',
          "Color treatment.",
          '"default"',
        ),
        p("size", '"sm" | "md" | "lg"', "Padding and type size.", '"sm"'),
        children,
        className,
      ],
    },
  ],
  wordmark: [
    {
      name: "Wordmark",
      props: [
        p("name", "string", "Primary word."),
        p("accent", "string", "Gradient suffix, e.g. `.me`."),
        p("mark", "string", "Accent character when splitting the suffix."),
        p("rest", "string", "Remainder after `mark`."),
        p("size", '"sm" | "md" | "lg"', "Type scale.", '"md"'),
        className,
      ],
    },
  ],
  "gradient-text": [
    {
      name: "GradientText",
      extends: "span",
      props: [children, className],
    },
  ],
  "availability-badge": [
    {
      name: "AvailabilityBadge",
      props: [
        p("tone", '"default" | "success"', "Pip and fill color.", '"default"'),
        children,
        className,
      ],
    },
  ],
  tabs: [
    {
      name: "Tabs",
      props: [
        p("value", "string", "Controlled tab id."),
        p("defaultValue", "string", "Uncontrolled initial tab id."),
        p("onValueChange", "(value: string) => void", "Fires when the selected tab changes."),
        children,
        className,
      ],
    },
    {
      name: "TabsList",
      extends: "div",
      props: [children, className],
    },
    {
      name: "TabsTrigger",
      extends: "button",
      props: [p("value", "string", "Tab id this trigger selects."), children, className],
    },
    {
      name: "TabsContent",
      extends: "div",
      props: [p("value", "string", "Tab id this panel belongs to."), children, className],
    },
  ],
  switch: [
    {
      name: "Switch",
      extends: "button",
      props: [
        p("checked", "boolean", "Controlled on/off state."),
        p("defaultChecked", "boolean", "Uncontrolled initial state.", "false"),
        p("onCheckedChange", "(checked: boolean) => void", "Fires when the switch toggles."),
        disabled,
        className,
      ],
    },
  ],
  input: [
    {
      name: "Input",
      extends: "input",
      props: [
        p("type", "string", "Native input type.", '"text"'),
        p("placeholder", "string", "Empty-state hint."),
        disabled,
        className,
      ],
    },
  ],
  "text-field": [
    {
      name: "TextField",
      extends: "input",
      props: [
        p("label", "ReactNode", "Visible field label."),
        p("helperText", "ReactNode", "Supporting copy under the field."),
        p("error", "boolean", "Error styling and `aria-invalid`.", "false"),
        p("multiline", "boolean", "Render a textarea instead of an input.", "false"),
        p("rows", "number", "Visible rows when `multiline`.", "3"),
        p("fullWidth", "boolean", "Stretch to the parent width.", "false"),
        p("size", '"sm" | "md"', "Control height.", '"md"'),
        disabled,
        className,
      ],
    },
  ],
  autocomplete: [
    {
      name: "Autocomplete",
      extends: "div",
      props: [
        p("options", "(string | AutocompleteOption)[]", "Available choices."),
        p("value", "string | string[] | null", "Controlled selection."),
        p("defaultValue", "string | string[] | null", "Uncontrolled initial selection."),
        p("onChange", "(value, option) => void", "Fires when the selection changes."),
        p("multiple", "boolean", "Allow several selected values.", "false"),
        p("freeSolo", "boolean", "Allow values not in `options`.", "false"),
        p("label", "ReactNode", "Visible field label."),
        p("placeholder", "string", "Empty-state hint."),
        p("fullWidth", "boolean", "Stretch to the parent width.", "false"),
        p("noOptionsText", "string", "Copy when the filter matches nothing."),
        disabled,
        className,
      ],
    },
  ],
  "outlined-input": [
    {
      name: "OutlinedInput",
      extends: "input",
      props: [
        p("startAdornment", "ReactNode", "Leading slot inside the field."),
        p("endAdornment", "ReactNode", "Trailing slot inside the field."),
        p("placeholder", "string", "Empty-state hint."),
        className,
      ],
    },
    {
      name: "InputAdornment",
      extends: "span",
      props: [
        p("position", '"start" | "end"', "Which side of the input this sits on.", '"start"'),
        children,
      ],
    },
  ],
  "form-control": [
    {
      name: "FormControl",
      extends: "div",
      props: [
        p("required", "boolean", "Marks the group as required.", "false"),
        p("error", "boolean", "Error styling for label and helper.", "false"),
        p("disabled", "boolean", "Disable nested controls.", "false"),
        p("fullWidth", "boolean", "Stretch to the parent width.", "false"),
        children,
        className,
      ],
    },
    {
      name: "FormLabel",
      extends: "label",
      props: [children, className],
    },
    {
      name: "FormHelperText",
      extends: "p",
      props: [children, className],
    },
  ],
  select: [
    {
      name: "Select",
      props: [
        p("value", "string", "Controlled selected value."),
        p("defaultValue", "string", "Uncontrolled initial value."),
        p("onValueChange", "(value: string) => void", "Fires when an item is chosen."),
        p("open", "boolean", "Controlled menu visibility."),
        p("defaultOpen", "boolean", "Uncontrolled initial open state."),
        p("onOpenChange", "(open: boolean) => void", "Fires when the menu opens or closes."),
        disabled,
        children,
      ],
    },
    {
      name: "SelectTrigger",
      extends: "button",
      props: [children, className],
    },
    {
      name: "SelectValue",
      props: [p("placeholder", "string", "Shown when nothing is selected.")],
    },
    {
      name: "SelectContent",
      extends: "div",
      props: [children, className],
    },
    {
      name: "SelectItem",
      extends: "div",
      props: [p("value", "string", "Item value."), p("disabled", "boolean", "Skip this item.", "false"), children],
    },
  ],
  "textarea-autosize": [
    {
      name: "TextareaAutosize",
      extends: "textarea",
      props: [
        p("minRows", "number", "Minimum visible rows.", "1"),
        p("maxRows", "number", "Maximum visible rows before scrolling."),
        p("placeholder", "string", "Empty-state hint."),
        className,
      ],
    },
  ],
  "spatika-editor": [
    {
      name: "SpatikaEditor",
      props: [
        p("value", "string", "Controlled HTML content."),
        p("onChange", "(html: string) => void", "Fires when document HTML changes."),
        p("placeholder", "string | function", "Empty-state hint or per-node placeholder resolver."),
        p("disabled", "boolean", "Read-only surface.", "false"),
        p("toolbar", "SpatikaEditorToolbarConfig", "Toggle toolbar groups and layout."),
        p("toolbarActions", "ReactNode", "Custom actions rendered after built-in groups."),
        p("mentions", "MentionContact[]", "Contacts for @ autocomplete."),
        p("onAiCommand", "(context: AiCommandContext) => Promise<string | null>", "Handle preset AI actions and free-form prompts from the command menu."),
        p("aiCommandMenu", "AiCommandMenuConfig | false", "Customize the AI command menu title, actions, prompt field, and placement (`dock` or `toolbar`). Default on when an AI handler is provided.", "dock"),
        p("onAiSelectionAction", "(action, text) => Promise<string | null>", "Legacy selection rewrite hook. Prefer `onAiCommand`."),
        p("aiActions", "AiActionDefinition[]", "Preset actions for legacy toolbar/bubble buttons when `aiCommandMenu` is false."),
        p("isAiProcessing", "boolean", "Shows the AI overlay sparkles.", "false"),
        p("onInsertImage", "() => void", "Host-owned image picker; defaults to upload drop zone popover."),
        p("imageInsert", "ImageInsertConfig", "Upload limits and optional `onUpload` handler for image inserts."),
        p("resizableImages", "boolean", "Enable image align and width controls.", "true"),
        p("mobileFullscreen", "boolean", "Expand editor on mobile focus.", "false"),
        className,
      ],
    },
  ],
  "use-spatika-editor": [
    {
      name: "useSpatikaEditor",
      props: [
        p("value", "string", "Controlled HTML content."),
        p("onChange", "(html: string) => void", "Fires when document HTML changes."),
        p("placeholder", "string | function", "Empty-state hint."),
        p("disabled", "boolean", "Read-only surface.", "false"),
        p("extensions", "Extensions", "Additional Tiptap extensions."),
        p("starterKit", "Partial<StarterKitOptions>", "StarterKit overrides."),
        p("mentions", "MentionContact[]", "Contacts for @ autocomplete."),
        p("onAiCommand", "(context: AiCommandContext) => Promise<string | null>", "Preset actions and prompt handler."),
        p("onAiSelectionAction", "(action, text) => Promise<string | null>", "Legacy selection rewrite hook."),
        p("resizableImages", "boolean", "Use resizable image node.", "true"),
      ],
    },
  ],
  "rich-text-editor": [
    {
      name: "RichTextEditor",
      props: [
        p("value", "string", "Controlled HTML.", '""'),
        p("onChange", "(html: string) => void", "Fires when content changes."),
        p("placeholder", "string", "Empty-state hint.", '"Write something…"'),
        p("minHeightClassName", "string", "Editor min-height class.", '"min-h-40"'),
        className,
      ],
    },
  ],
  "transfer-list": [
    {
      name: "TransferList",
      props: [
        p("left", "string[]", "Items in the source list."),
        p("right", "string[]", "Items in the destination list."),
        p("onChange", "(next: { left: string[]; right: string[] }) => void", "Fires after a transfer."),
        p("leftTitle", "string", "Heading for the source list.", '"Choices"'),
        p("rightTitle", "string", "Heading for the destination list.", '"Chosen"'),
        className,
      ],
    },
  ],
  checkbox: [
    {
      name: "Checkbox",
      extends: "button",
      props: [
        p("checked", "boolean | \"indeterminate\"", "Controlled state. Pass `\"indeterminate\"` for a mixed mark."),
        p("defaultChecked", "boolean", "Uncontrolled initial state."),
        p("onCheckedChange", "(checked: boolean | \"indeterminate\") => void", "Fires when the box toggles."),
        disabled,
        className,
      ],
    },
  ],
  "form-control-label": [
    {
      name: "FormControlLabel",
      extends: "label",
      props: [
        p("control", "ReactElement", "The Switch, Checkbox, or Radio to pair with the label."),
        p("label", "ReactNode", "Visible label copy."),
        p("labelPlacement", '"end" | "start" | "top" | "bottom"', "Where the label sits relative to the control.", '"end"'),
        disabled,
        className,
      ],
    },
  ],
  slider: [
    {
      name: "Slider",
      extends: "div",
      props: [
        p("value", "number[]", "Controlled thumb values. One number for a single thumb."),
        p("defaultValue", "number[]", "Uncontrolled initial values."),
        p("onValueChange", "(value: number[]) => void", "Fires as the thumb moves."),
        p("min", "number", "Minimum value.", "0"),
        p("max", "number", "Maximum value.", "100"),
        p("step", "number", "Increment between values.", "1"),
        disabled,
        className,
      ],
    },
  ],
  "toggle-button": [
    {
      name: "ToggleButtonGroup",
      extends: "div",
      props: [
        p("exclusive", "boolean", "Allow only one selected value.", "false"),
        p("value", "string | string[] | null", "Controlled selection."),
        p("onValueChange", "(value: string | string[] | null) => void", "Fires when selection changes."),
        children,
        className,
      ],
    },
    {
      name: "ToggleButton",
      extends: "button",
      props: [
        p("value", "string", "Value contributed to the group."),
        disabled,
        children,
        className,
      ],
    },
  ],
  "search-field": [
    {
      name: "SearchField",
      extends: "input",
      props: [
        p("placeholder", "string", "Empty-state hint."),
        p("leading", "ReactNode", "Override the search icon."),
        p("containerClassName", "string", "Classes on the wrapping relative container."),
        className,
      ],
    },
  ],
  "chip-group": [
    {
      name: "ChipGroup",
      props: [
        p("title", "string", "Optional eyebrow above the rail."),
        p("options", "ChipOption[]", "`{ value, label }` items."),
        p("selected", "string[]", "Currently selected values."),
        p("onToggle", "(value: string) => void", "Called with the toggled option value. Pair with `toggleOptionValue`."),
        p("variant", '"filter" | "preference"', "Chip density.", '"filter"'),
        p("showCount", "boolean", "Show the selected count next to the title.", "false"),
        className,
      ],
    },
  ],
  "segmented-control": [
    {
      name: "SegmentedControl",
      props: [
        p("options", "SegmentedControlOption[]", "`{ value, label, disabled? }` segments."),
        p("value", "string", "Selected segment value."),
        p("onChange", "(value: string) => void", "Fires when a segment is chosen."),
        p("size", '"sm" | "md"', "Control height.", '"md"'),
        p("aria-label", "string", "Accessible name for the radiogroup."),
        className,
      ],
    },
  ],
  paper: [
    {
      name: "Paper",
      extends: "div",
      props: [
        p("variant", '"elevation" | "outlined" | "glass"', "Surface treatment.", '"elevation"'),
        p("elevation", "0 | 1 | 2 | 3", "Shadow depth. Ignored when `variant` is `outlined`.", "1"),
        p("square", "boolean", "Remove border radius.", "false"),
        children,
        className,
      ],
    },
  ],
  grid: [
    {
      name: "Grid",
      extends: "div",
      props: [
        p("container", "boolean", "Make this a 12-column flex/grid container.", "false"),
        p("spacing", "number", "Gap between items, in spacing units.", "0"),
        p("xs", "number | \"auto\"", "Columns at the extra-small breakpoint."),
        p("sm", "number | \"auto\"", "Columns from the small breakpoint up."),
        p("md", "number | \"auto\"", "Columns from the medium breakpoint up."),
        p("lg", "number | \"auto\"", "Columns from the large breakpoint up."),
        p("xl", "number | \"auto\"", "Columns from the extra-large breakpoint up."),
        children,
        className,
      ],
    },
  ],
  masonry: [
    {
      name: "Masonry",
      extends: "div",
      props: [
        p("columns", "number", "Number of packed columns.", "2"),
        p("spacing", "number", "Gap in pixels.", "8"),
        children,
        className,
      ],
    },
  ],
  stack: [
    {
      name: "Stack",
      extends: "div",
      props: [
        p("direction", '"row" | "column" | "row-reverse" | "column-reverse"', "Flex direction.", '"column"'),
        p("spacing", "number", "Gap between children (theme spacing steps).", "0"),
        p("align", '"start" | "center" | "end" | "stretch" | "baseline"', "Cross-axis alignment."),
        p("justify", '"start" | "center" | "end" | "between" | "around" | "evenly"', "Main-axis alignment."),
        p("wrap", "boolean", "Allow items to wrap.", "false"),
        p("divider", "ReactNode", "Rendered between each child."),
        children,
        className,
      ],
    },
  ],
  container: [
    {
      name: "Container",
      extends: "div",
      props: [
        p("maxWidth", '"xs" | "sm" | "md" | "lg" | "xl" | false', "Centered max-width token.", '"lg"'),
        p("disableGutters", "boolean", "Remove horizontal padding.", "false"),
        children,
        className,
      ],
    },
  ],
  list: [
    {
      name: "List",
      extends: "ul",
      props: [
        p("disablePadding", "boolean", "Remove default vertical padding.", "false"),
        p("dense", "boolean", "Tighter row spacing.", "false"),
        children,
        className,
      ],
    },
    {
      name: "ListItem",
      extends: "li",
      props: [p("disablePadding", "boolean", "Let the child button fill the row.", "false"), children, className],
    },
    {
      name: "ListItemButton",
      extends: "button",
      props: [
        p("selected", "boolean", "Highlighted selected state.", "false"),
        p("onClick", "() => void", "Row activation handler."),
        children,
        className,
      ],
    },
    {
      name: "ListItemText",
      extends: "div",
      props: [
        p("primary", "ReactNode", "Main line."),
        p("secondary", "ReactNode", "Supporting line."),
      ],
    },
  ],
  card: [
    {
      name: "Card",
      props: [
        p("variant", '"default" | "panel" | "subtle" | "elevated"', "Glass elevation.", '"panel"'),
        p("padding", '"none" | "sm" | "md" | "lg"', "Inner spacing.", '"md"'),
        children,
        className,
      ],
    },
    {
      name: "CardHeader / CardTitle / CardContent / CardFooter",
      description: "Layout slots. Compose them inside Card.",
      props: [children, className],
    },
  ],
  "glass-card": [
    {
      name: "GlassCard",
      extends: "div",
      props: [
        p("variant", '"default" | "panel" | "subtle" | "header" | "menu" | "app"', "Glass utility mapping.", '"default"'),
        p("padding", '"none" | "sm" | "md" | "lg"', "Inner spacing.", '"md"'),
        children,
        className,
      ],
    },
  ],
  metric: [
    {
      name: "Metric",
      description: "Typography-led KPI. No container of its own.",
      props: [
        p("label", "ReactNode", "What is being measured."),
        p("value", "ReactNode | number", "Numbers are formatted with `format`."),
        p("format", '"number" | "currency" | "percent" | "compact" | "compact-currency"', "Number formatting.", '"number"'),
        p("currency", "string", "ISO currency for `currency` formats.", '"USD"'),
        p("precision", "number", "Fraction digits."),
        p("unit", "ReactNode", "Quiet suffix (ms, GB, /mo)."),
        p("size", '"sm" | "md" | "lg" | "xl"', "Value size.", '"md"'),
        p("delta", "number | ReactNode", "Change vs. comparison period. A number renders `<Delta>`."),
        p("deltaFormat", "NumberFormatKind", "Format for a numeric delta.", '"percent"'),
        p("deltaIntent", '"normal" | "inverse" | "neutral"', "`inverse` when up is bad (costs, churn).", '"normal"'),
        p("caption", "ReactNode", "Comparison caption, e.g. “vs last month”."),
        p("chart", "ReactNode", "Sparkline or progress under the value."),
        p("icon", "ReactNode", "Leading icon in the label row."),
        p("loading", "boolean", "Skeleton in place of the value.", "false"),
        className,
      ],
    },
    {
      name: "MetricGroup",
      props: [
        p("columns", "number", "Columns at desktop width; two on phones.", "4"),
        p("divided", "boolean", "Hairline dividers — reads as one strip.", "true"),
        className,
      ],
    },
    {
      name: "Delta",
      props: [
        p("value", "number", "Signed change."),
        p("format", "NumberFormatKind", "Formatting.", '"percent"'),
        p("intent", '"normal" | "inverse" | "neutral"', "Colour follows intent; the arrow follows the number.", '"normal"'),
        p("variant", '"soft" | "plain"', "Tinted pill or plain text.", '"soft"'),
        className,
      ],
    },
  ],
  "data-table": [
    {
      name: "DataTable",
      description: "Generic over the row type `T`.",
      props: [
        p("data", "T[]", "Rows."),
        p("columns", "DataTableColumn<T>[]", "`id`, `header`, `accessor`, `cell`, `sortable`, `numeric`, `pin`, `width`, `hideBelow`, `mobile`."),
        p("getRowId", "(row: T, index: number) => string", "Stable row id."),
        p("density", '"compact" | "comfortable" | "spacious"', "Row height and cell padding. Inherits `data-density` when unset."),
        p("selectable", "boolean", "Checkbox column with select-all.", "false"),
        p("selectedIds / onSelectedIdsChange", "string[] / (ids) => void", "Controlled selection."),
        p("bulkActions", "(selected: T[], clear: () => void) => ReactNode", "Bar that replaces the toolbar while rows are selected."),
        p("sort / defaultSort / onSortChange", "DataTableSort", "Sorting state. `manualSort` for server sorting."),
        p("renderExpanded", "(row: T) => ReactNode", "Expandable detail row."),
        p("rowActions", "(row: T) => ReactNode", "Inline actions revealed on hover and focus (always visible on touch)."),
        p("onRowClick", "(row: T) => void", "Row activation (click or Enter)."),
        p("stickyHeader", "boolean", "Header sticks while scrolling.", "true"),
        p("maxHeight", "number | string", "Scroll height for the table body."),
        p("pageSize / page / onPageChange / totalRows", "number", "Client or server pagination."),
        p("loading / loadingRows", "boolean / number", "Skeleton rows.", "false / 5"),
        p("empty", "ReactNode", "Empty state content."),
        p("toolbar", "ReactNode", "Filters and search above the table."),
        p("responsive", '"list" | "scroll"', "`list` stacks rows on phones.", '"list"'),
        className,
      ],
    },
  ],
  "app-shell": [
    {
      name: "AppShell",
      props: [
        p("sidebar", "ReactNode", "Usually `<Sidebar>` — a rail on ≥1024px, a sheet below."),
        p("topbar", "ReactNode", "Usually `<TopBar>`."),
        p("mobileNav", "ReactNode", "Bottom navigation for phones, e.g. `MobileTabBar`."),
        p("layout", '"inset" | "flush"', "`inset` frames content as a panel.", '"inset"'),
        p("collapsed / defaultCollapsed / onCollapsedChange", "boolean", "Desktop rail state."),
        p("density", '"compact" | "comfortable"', "Region density."),
        children,
        className,
      ],
    },
    { name: "Sidebar", props: [p("header", "ReactNode", "Workspace switcher or brand."), p("footer", "ReactNode", "User menu, help."), children] },
    { name: "NavSection", props: [p("title", "ReactNode", "Optional group title."), p("action", "ReactNode", "Trailing title action."), children] },
    {
      name: "NavItem",
      props: [
        p("icon", "ReactNode", "Leading icon."),
        p("label", "ReactNode", "Visible label; becomes a tooltip on the rail."),
        p("active", "boolean", "Current page — prism rail + `aria-current`."),
        p("meta", "ReactNode", "Trailing count."),
        p("href", "string", "Render a link."),
        asChild,
      ],
    },
    { name: "TopBar", props: [p("title", "ReactNode", "Title or breadcrumb."), p("actions", "ReactNode", "Trailing controls."), p("leading", "ReactNode", "Replaces the sidebar toggle."), children] },
    { name: "SearchTrigger", props: [p("onOpen", "() => void", "Open the palette."), p("hotkey", "boolean", "Bind ⌘K / Ctrl+K.", "true"), p("placeholder", "string", "Label.")] },
    { name: "WorkspaceSwitcher", props: [p("workspaces", "Workspace[]", "`{ id, name, description?, logo? }`."), p("value / onValueChange", "string", "Selected workspace."), p("onCreate", "() => void", "Adds a create item.")] },
    { name: "UserMenu", props: [p("name / email / avatarSrc", "string", "Identity."), p("variant", '"row" | "avatar"', "Sidebar row or top-bar avatar.", '"row"'), children] },
  ],
  "command-palette": [
    {
      name: "CommandPalette",
      props: [
        p("open / onOpenChange", "boolean", "Visibility."),
        p("groups", "CommandPaletteGroup[]", "`{ heading, items: { id, label, icon?, description?, shortcut?, keywords?, onSelect } }`."),
        p("placeholder", "string", "Input placeholder."),
        p("emptyMessage", "ReactNode", "No results copy."),
        p("footer", "boolean", "Keyboard legend.", "true"),
      ],
    },
  ],
  "page-section": [
    {
      name: "PageSection",
      props: [
        p("title", "ReactNode", "Section heading (h2 by default)."),
        p("description", "ReactNode", "Supporting copy."),
        p("actions", "ReactNode", "Controls aligned with the title."),
        p("divider", "boolean", "Hairline above the section.", "false"),
        p("as", '"h2" | "h3"', "Heading level.", '"h2"'),
        children,
        className,
      ],
    },
  ],
  panel: [
    {
      name: "Panel",
      props: [
        p("title", "ReactNode", "Header title."),
        p("description", "ReactNode", "Header subtitle."),
        p("actions", "ReactNode", "Header controls."),
        p("footer", "ReactNode", "Footer bar."),
        p("surface", "SurfaceVariant", "Material.", '"default"'),
        p("flush", "boolean", "Remove body padding for edge-to-edge tables and lists.", "false"),
        children,
        className,
      ],
    },
  ],
  "stat-card": [
    {
      name: "StatCard",
      props: [
        p("label", "string", "Metric name."),
        p("value", "string | number", "Primary figure."),
        p("hint", "string", "Secondary trend or context."),
        p("icon", "ReactNode", "Optional leading icon."),
        p("chart", "ReactNode", "Optional sparkline or mini chart under the value."),
        p("variant", '"app" | "metric"', "`app` is label-first; `metric` is value-first for marketing.", '"app"'),
        className,
      ],
    },
  ],
  "section-heading": [
    {
      name: "SectionHeading",
      props: [
        p("eyebrow", "string", "Small caps label above the title."),
        p("title", "ReactNode", "Section title."),
        p("subtitle", "ReactNode", "Supporting copy."),
        className,
      ],
    },
  ],
  "icon-tile": [
    {
      name: "IconTile",
      props: [
        p("icon", "ReactNode", "Leading emoji or icon."),
        p("title", "string", "Italic domain title."),
        p("description", "string", "Caption under the title."),
        className,
      ],
    },
  ],
  "career-card": [
    {
      name: "CareerCard",
      props: [
        p("role", "string", "Job title."),
        p("company", "string", "Employer."),
        p("location", "string", "City or remote."),
        p("period", "string", "Date range label."),
        p("current", "boolean", "Highlight as the current role.", "false"),
        p("bullets", "string[]", "Achievement lines."),
        p("tags", "string[]", "Tech or domain tags."),
        className,
      ],
    },
    {
      name: "CareerTimeline",
      props: [children, className],
    },
  ],
  "project-card": [
    {
      name: "ProjectCard",
      props: [
        p("title", "string", "Project name."),
        p("company", "string", "Where it shipped."),
        p("outcome", "string", "Result pill, e.g. cost saved."),
        p("description", "string", "Short summary."),
        p("tags", "string[]", "Stack tags."),
        className,
      ],
    },
  ],
  "float-chip": [
    {
      name: "FloatChip",
      props: [
        p("icon", "ReactNode", "Leading mark."),
        p("title", "string", "Primary label."),
        p("subtitle", "string", "Secondary label."),
        p("live", "boolean", "Show a live pip. Children become the label.", "false"),
        children,
        className,
      ],
    },
  ],
  "meta-chip": [
    {
      name: "MetaChip",
      props: [p("icon", "ReactNode", "Optional leading icon."), children, className],
    },
  ],
  "entity-card": [
    {
      name: "EntityCard",
      extends: "div",
      props: [
        p("as", '"div" | "li" | "article" | "section" | "button" | "a"', "Rendered element.", '"div"'),
        p("density", '"default" | "compact"', "Padding density.", '"default"'),
        p("interactive", "boolean", "Hover lift for navigation rows.", "false"),
        p("href", "string", "When set, renders an `a`."),
        children,
        className,
      ],
    },
    {
      name: "EntityCardTitle / EntityCardMeta / EntityCardChip",
      description: "Typography slots for the row.",
      props: [children, className],
    },
  ],
  "list-row": [
    {
      name: "ListRow",
      extends: "button",
      props: [
        p("active", "boolean", "Selected appearance.", "false"),
        p("trailing", "ReactNode", "Right-side slot (badge, chevron)."),
        p("onClick", "() => void", "Row activation handler."),
        children,
        className,
      ],
    },
  ],
  stepper: [
    {
      name: "Stepper",
      extends: "div",
      props: [
        p("activeStep", "number", "Zero-based index of the current step.", "0"),
        p("orientation", '"horizontal" | "vertical"', "Layout.", '"horizontal"'),
        p("alternativeLabel", "boolean", "Place labels under the connectors.", "false"),
        children,
        className,
      ],
    },
    {
      name: "Step / StepLabel / StepContent",
      props: [children, className],
    },
  ],
  "mobile-stepper": [
    {
      name: "MobileStepper",
      extends: "div",
      props: [
        p("steps", "number", "Total step count."),
        p("activeStep", "number", "Zero-based current step."),
        p("variant", '"dots" | "text" | "progress"', "Indicator style.", '"dots"'),
        p("backButton", "ReactNode", "Leading control."),
        p("nextButton", "ReactNode", "Trailing control."),
        className,
      ],
    },
  ],
  "app-bar": [
    {
      name: "AppBar",
      extends: "header",
      props: [
        p("position", '"static" | "sticky" | "fixed"', "Scroll behavior.", '"sticky"'),
        p("color", '"default" | "primary" | "transparent"', "Background treatment.", '"default"'),
        children,
        className,
      ],
    },
    {
      name: "Toolbar",
      extends: "div",
      props: [children, className],
    },
  ],
  "bottom-navigation": [
    {
      name: "BottomNavigation",
      extends: "div",
      props: [
        p("value", "string", "Selected action value."),
        p("onChange", "(event, value: string) => void", "Fires when an action is selected."),
        p("showLabels", "boolean", "Always show labels.", "true"),
        children,
        className,
      ],
    },
    {
      name: "BottomNavigationAction",
      extends: "button",
      props: [
        p("value", "string", "Action id."),
        p("label", "ReactNode", "Visible label."),
        p("icon", "ReactNode", "Leading icon."),
      ],
    },
  ],
  menu: [
    {
      name: "Menu",
      props: [
        p("anchorEl", "HTMLElement | null", "Element the menu positions against."),
        p("open", "boolean", "Visibility."),
        p("onOpenChange", "(open: boolean) => void", "Fires on dismiss or outside click."),
        children,
      ],
    },
    {
      name: "MenuItem",
      extends: "button",
      props: [p("onClick", "() => void", "Item handler. Close the menu from here."), children, className],
    },
  ],
  breadcrumb: [
    {
      name: "Breadcrumb",
      props: [
        p("items", "BreadcrumbItem[]", "`{ label, href?, onClick? }`. The last item is the current page."),
        className,
      ],
    },
  ],
  pagination: [
    {
      name: "Pagination",
      props: [
        p("page", "number", "Current 1-based page."),
        p("pageCount", "number", "Total pages."),
        p("onPageChange", "(page: number) => void", "Fires when prev/next is pressed."),
        className,
      ],
    },
  ],
  "speed-dial": [
    {
      name: "SpeedDial",
      extends: "div",
      props: [
        p("ariaLabel", "string", "Accessible name for the FAB."),
        p("hidden", "boolean", "Hide the dial.", "false"),
        p("hideBackdrop", "boolean", "Skip the click-away backdrop.", "false"),
        p("direction", '"up" | "down" | "left" | "right"', "Where actions fan out.", '"up"'),
        children,
        className,
      ],
    },
    {
      name: "SpeedDialAction",
      extends: "button",
      props: [
        p("icon", "ReactNode", "Action icon."),
        p("tooltipTitle", "string", "Hover label."),
      ],
    },
  ],
  "app-header": [
    {
      name: "AppHeader",
      props: [
        p("brand", "ReactNode", "Logo or mark."),
        p("title", "string", "Product name next to the brand."),
        p("actions", "ReactNode", "Right-side cluster. Prefer `HeaderIconButton`."),
        p("children", "ReactNode", "Center / search slot."),
        p("variant", '"sticky" | "chrome"', "`chrome` is fixed safe-area app chrome.", '"sticky"'),
        p("showMenuButton", "boolean", "Show the hamburger.", "false"),
        p("onMenuClick", "() => void", "Hamburger handler."),
        p("sticky", "boolean", "Stick the in-flow bar.", "true"),
        className,
      ],
    },
  ],
  "site-nav": [
    {
      name: "SiteNav",
      props: [
        p("brand", "ReactNode", "Wordmark or logo."),
        p("links", "{ href, label }[]", "Primary destinations."),
        p("contained", "boolean", "Position inside a parent instead of the viewport.", "false"),
        className,
      ],
    },
  ],
  "site-footer": [
    {
      name: "SiteFooter",
      props: [
        p("brand", "ReactNode", "Wordmark."),
        p("copyright", "string", "Legal line."),
        p("links", "{ href, label }[]", "Footer destinations. In the tall layout these sit in the bottom row."),
        p("meta", "ReactNode", "Trailing slot for powered-by chips."),
        p("columns", "SiteFooterColumn[]", "`{ title, links }` sitemap columns. Passing these switches to the tall marketing footer."),
        p("description", "ReactNode", "A line about the product, under the brand in the tall layout."),
        p("action", "ReactNode", "Slot beside the brand — a `LeadForm`, usually."),
        p("social", "ReactNode", "Social icon links under the description."),
        p("legal", "ReactNode", "Bottom row beside the copyright — privacy, terms, locale."),
        className,
      ],
    },
  ],
  "contact-link": [
    {
      name: "ContactLink",
      props: [
        p("href", "string", "Destination."),
        p("name", "string", "Channel name."),
        p("label", "string", "Handle or address."),
        p("icon", "ReactNode", "Mark inside the tinted tile."),
        p("iconBg", "string", "Tile background."),
        p("iconColor", "string", "Mark color."),
        className,
      ],
    },
  ],
  "floating-page-chrome": [
    {
      name: "FloatingPageChromeBar",
      props: [
        p("identity", "ReactNode", "Back + title cluster. Use `FloatingPageChromeIdentity`."),
        p("search", "ReactNode", "Search field slot."),
        p("actions", "ReactNode", "Filters and primary CTA."),
        p("children", "ReactNode", "Scrollable page body pinned below the tray."),
        className,
      ],
    },
    {
      name: "FloatingPageChromeIdentity",
      props: [
        p("title", "string", "Page name."),
        p("count", "number", "Entity count."),
        p("countLabel", "string", "Accessible count label."),
        p("onBack", "() => void", "Optional back handler."),
      ],
    },
  ],
  "page-sticky-header": [
    {
      name: "PageStickyHeader",
      props: [
        p("title", "string", "Page title."),
        p("subtitle", "string", "Supporting line."),
        p("actions", "ReactNode", "Trailing controls."),
        className,
      ],
    },
  ],
  "mobile-tab-bar": [
    {
      name: "MobileTabBar",
      props: [
        p("items", "MobileTabItem[]", "`{ id, label, icon, active, onClick, href, badge }`."),
        p("contained", "boolean", "Position inside a parent (docs / device frames).", "false"),
        p("hidden", "boolean", "Slide the bar away, e.g. when a keyboard is open.", "false"),
        p("trailing", "ReactNode", "Extra control such as More."),
        p("ariaLabel", "string", "Accessible name for the nav."),
        className,
      ],
    },
  ],
  "filter-sheet": [
    {
      name: "FilterSheet",
      props: [
        p("open", "boolean", "Visibility."),
        p("onOpenChange", "(open: boolean) => void", "Fires on open, close, or Done."),
        p("title", "string", "Sheet heading."),
        p("description", "string", "Supporting copy."),
        p("trigger", "ReactNode", "Desktop / tablet control that opens the sheet."),
        p("onClear", "() => void", "Optional clear-all handler."),
        children,
      ],
    },
  ],
  "header-icon-button": [
    {
      name: "HeaderIconButton",
      extends: "button",
      props: [
        p("active", "boolean", "Selected / pressed appearance.", "false"),
        p("badge", "number | string | boolean", "Unread pill. `true` shows a dot."),
        p("size", '"sm" | "md"', "Control size.", '"md"'),
        children,
        className,
      ],
    },
  ],
  "cover-hero": [
    {
      name: "CoverHero",
      props: [
        p("title", "string", "Hero heading."),
        p("kicker", "ReactNode", "Eyebrow above the title."),
        p("facts", "CoverHeroFact[]", "Stat chips along the identity notch."),
        p("avatars", "CoverHeroAvatar[]", "Contributor stack."),
        p("coverSeed", "string", "Seed for the generated cover pattern."),
        p("coverKind", "CoverPatternKind", "Force a pattern family."),
        p("coverUrl", "string", "Photo URL instead of a generated pattern."),
        p("bleed", "boolean", "Bleed under app chrome.", "true"),
        className,
      ],
    },
  ],
  "profile-hero": [
    {
      name: "ProfileHero",
      props: [
        p("name", "string", "Display name."),
        p("alias", "string", "Handle or role."),
        p("coverSeed", "string", "Seed for the generated cover."),
        p("avatarUrl", "string", "Portrait URL."),
        p("bleed", "boolean", "Bleed under app chrome.", "true"),
        className,
      ],
    },
  ],
  "entity-media-card": [
    {
      name: "EntityMediaCard",
      props: [
        p("title", "string", "Name."),
        p("subtitle", "string", "Role or caption."),
        p("statusLine", "string", "Presence or meta line."),
        p("size", '"large" | "small" | "compact"', "Card density.", '"large"'),
        p("orientation", '"stack" | "row"', "Photo above copy, or beside it.", '"stack"'),
        p("imageUrl", "string", "Photo URL. Falls back to a seeded cover + initials."),
        className,
      ],
    },
  ],
  "image-list": [
    {
      name: "ImageList",
      extends: "ul",
      props: [
        p("cols", "number", "Column count.", "2"),
        p("rowHeight", "number", "Row height in pixels."),
        p("gap", "number", "Gap in pixels.", "4"),
        p("variant", '"standard" | "quilted" | "masonry" | "woven"', "Layout algorithm.", '"standard"'),
        children,
        className,
      ],
    },
    {
      name: "ImageListItem / ImageListItemBar",
      props: [
        p("cols", "number", "Column span for quilted layouts.", "1"),
        p("rows", "number", "Row span for quilted layouts.", "1"),
        p("title", "string", "Overlay title (ItemBar)."),
        p("subtitle", "string", "Overlay subtitle (ItemBar)."),
      ],
    },
  ],
  progress: [
    {
      name: "Progress",
      extends: "div",
      description: "Also exported as LinearProgress.",
      props: [
        p("value", "number | null", "Current value. Ignored when indeterminate."),
        p("max", "number", "Maximum value.", "100"),
        p("variant", '"determinate" | "indeterminate"', "Fill vs. looping bar.", '"determinate"'),
        className,
      ],
    },
  ],
  "circular-progress": [
    {
      name: "CircularProgress",
      extends: "span",
      props: [
        p("variant", '"indeterminate" | "determinate"', "Spin vs. arc fill.", '"indeterminate"'),
        p("value", "number", "0–100 when determinate.", "0"),
        p("size", "number", "Diameter in pixels.", "40"),
        p("thickness", "number", "Stroke width.", "4"),
        className,
      ],
    },
  ],
  skeleton: [
    {
      name: "Skeleton",
      extends: "div",
      props: [
        p("shape", '"text" | "circle" | "block"', "`text` renders a line at body height; `circle` for avatars; `block` for media and cards.", '"text"'),
        className,
      ],
    },
  ],
  alert: [
    {
      name: "Alert",
      extends: "div",
      props: [
        p("variant", '"default" | "info" | "warm" | "highlight" | "danger"', "Tone.", '"default"'),
        children,
        className,
      ],
    },
    {
      name: "AlertTitle / AlertDescription",
      props: [children, className],
    },
  ],
  "empty-state": [
    {
      name: "EmptyState",
      props: [
        p("icon", "LucideIcon", "Optional leading icon component."),
        p("title", "string", "Headline."),
        p("description", "string", "Supporting copy."),
        p("actionLabel", "string", "CTA label."),
        p("onAction", "() => void", "CTA handler."),
        children,
        className,
      ],
    },
  ],
  toast: [
    {
      name: "Toaster",
      props: [
        p("children", "ReactNode", "App tree that can call `useToast()`."),
        className,
      ],
    },
    {
      name: "useToast()",
      description: "Hook. Call `toast({ title, description, tone })` to push a notification.",
      props: [
        p("title", "string", "Headline."),
        p("description", "string", "Supporting copy."),
        p("tone", '"default" | "success" | "danger"', "Color treatment."),
      ],
    },
  ],
  snackbar: [
    {
      name: "Snackbar",
      extends: "div",
      props: [
        p("open", "boolean", "Visibility.", "false"),
        p("onClose", "() => void", "Fires on timeout, escape, or dismiss."),
        p("autoHideDuration", "number | null", "Milliseconds before auto-hide. `null` stays open.", "4000"),
        p("message", "ReactNode", "Body copy."),
        p("action", "ReactNode", "Trailing action, typically Undo."),
        p(
          "anchorOrigin",
          "{ vertical?: \"top\" | \"bottom\"; horizontal?: \"left\" | \"center\" | \"right\" }",
          "Viewport corner.",
          "{ vertical: \"bottom\", horizontal: \"left\" }",
        ),
        className,
      ],
    },
  ],
  dialog: [
    {
      name: "Dialog",
      props: [
        p("open", "boolean", "Controlled visibility."),
        p("defaultOpen", "boolean", "Uncontrolled initial visibility.", "false"),
        p("onOpenChange", "(open: boolean) => void", "Fires when the dialog opens or closes."),
        children,
      ],
    },
    {
      name: "DialogTrigger",
      extends: "button",
      props: [asChild, children],
    },
    {
      name: "DialogContent",
      extends: "div",
      props: [children, className],
    },
    {
      name: "DialogHeader / DialogTitle / DialogDescription",
      props: [children, className],
    },
  ],
  modal: [
    {
      name: "Modal",
      extends: "div",
      props: [
        p("open", "boolean", "Visibility.", "false"),
        p("onClose", "() => void", "Fires on backdrop click or Escape."),
        p("keepMounted", "boolean", "Keep children in the DOM when closed.", "false"),
        p("disableEscapeKeyDown", "boolean", "Ignore the Escape key.", "false"),
        p("hideBackdrop", "boolean", "Skip the dimmed overlay.", "false"),
        children,
        className,
      ],
    },
  ],
  tooltip: [
    {
      name: "TooltipProvider",
      props: [
        p("delayDuration", "number", "Hover delay in milliseconds.", "200"),
        children,
      ],
    },
    {
      name: "Tooltip",
      props: [children],
    },
    {
      name: "TooltipTrigger",
      extends: "button",
      props: [asChild, children],
    },
    {
      name: "TooltipContent",
      extends: "div",
      props: [
        p("side", '"top" | "right" | "bottom" | "left"', "Preferred placement.", '"top"'),
        children,
        className,
      ],
    },
  ],
  table: [
    {
      name: "Table",
      extends: "table",
      props: [children, className],
    },
    {
      name: "TableHeader / TableBody / TableFooter / TableRow / TableHead / TableCell",
      description: "Semantic table slots.",
      props: [children, className],
    },
  ],
  "table-pagination": [
    {
      name: "TablePagination",
      props: [
        p("count", "number", "Total row count."),
        p("page", "number", "Zero-based page index."),
        p("onPageChange", "(page: number) => void", "Fires when the page changes."),
        p("rowsPerPage", "number", "Rows on this page.", "10"),
        p("onRowsPerPageChange", "(rows: number) => void", "Fires when the page size changes."),
        p("rowsPerPageOptions", "number[]", "Choices in the size select.", "[5, 10, 25]"),
        className,
      ],
    },
  ],
  "event-calendar": [
    {
      name: "EventCalendar",
      props: [
        p("events", "SchedulerEvent[]", "Timed and all-day events."),
        p("resources", "SchedulerResource[]", "Calendars / categories with colors."),
        p("view", "CalendarView", "Controlled view: month, week, day, or agenda."),
        p("defaultView", "CalendarView", "Uncontrolled initial view."),
        p("onViewChange", "(view: CalendarView) => void", "Fires when the view changes."),
        p("date", "Date", "Controlled anchor date."),
        p("onEventChange", "(event, next) => void", "Fires after drag, resize, or edit."),
        p("onEventCreate", "(event) => void", "Fires when a new event is committed."),
        p("onEventDelete", "(event) => void", "Fires when an event is removed."),
        p("readOnly", "boolean", "Disable create, edit, drag, and resize.", "false"),
        p("areEventsDraggable", "boolean", "Allow drag to move.", "true"),
        p("areEventsResizable", "boolean", "Allow resize handles.", "true"),
        p("showEventEditor", "boolean", "Open the kit EventEditor on click and create. Set false to own the modal.", "true"),
        p("showPreferences", "boolean", "Show the preferences gear on the default toolbar.", "true"),
        p("toolbarTrailing", "ReactNode", "Extra controls after the view menu. Ignored when renderToolbar is set."),
        p("toolbarDensity", '"default" | "compact"', "Compact is a single desktop row. Ignored when renderToolbar is set.", '"default"'),
        p("showDateJump", "boolean", "Month and year native selects on the default toolbar.", "false"),
        p("yearOptions", "number[]", "Years in the date-jump select. Defaults to a window around the current year."),
        p("onVisibleRangeChange", "(range) => void", "Fires when the painted window changes. range.end is exclusive."),
        p("renderEvent", "(event, context) => ReactNode", "Replace event chip contents. The kit still wraps click and drag."),
        p("renderToolbar", "(context) => ReactNode", "Replace the toolbar. Omit to keep prev/next/today, view menu, and preferences."),
        p("onEventClick", "(event) => void", "Fires when an event is clicked, including when the kit editor is hidden."),
        p("onSlotClick", "(slot) => void", "Fires when a day or time slot is clicked."),
        className,
      ],
    },
  ],
  "event-timeline": [
    {
      name: "EventTimeline",
      props: [
        p("events", "SchedulerEvent[]", "Events placed on resource rows."),
        p("resources", "SchedulerResource[]", "Row definitions."),
        p("onEventChange", "(event, next) => void", "Fires after drag or resize."),
        p("onEventCreate", "(event) => void", "Fires when a new event is committed."),
        p("onEventDelete", "(event) => void", "Fires when an event is removed."),
        p("readOnly", "boolean", "Disable editing.", "false"),
        p("showEventEditor", "boolean", "Open the kit EventEditor on click. Set false to own the modal.", "true"),
        className,
      ],
    },
  ],
  "chart-container": [
    {
      name: "ChartContainer",
      description: "Compose plots with `BarPlot`, `LinePlot`, axes, brush, and toolbar children.",
      props: [
        p("series", "ComposedSeries[]", "Bar, line, area, or scatter series."),
        p("dataset", "ChartDataset", "Row-oriented data."),
        p("height", "number", "Plot height in pixels."),
        p("zoom", "boolean | ChartZoom", "Enable pan/zoom."),
        p("showToolbar", "boolean", "Zoom, pan, brush, and export.", "false"),
        p("stacked", "boolean", "Stack bar/area series.", "false"),
        p("fillHeight", "boolean", "Plot height follows the parent.", "false"),
        p("onItemClick", "(event: ChartItemEvent) => void", "Fires when a mark is activated."),
        p("renderTooltip", "(hover) => ReactNode", "Replace the default hover tooltip."),
        p("renderMark", "(ctx: ChartMarkRenderContext) => ReactNode", "Replace line/area point marks."),
        p("referenceLines", "ChartReferenceLine[]", "Value or category guide overlays."),
        p("referenceAreas", "ChartReferenceArea[]", "Value or category rectangle overlays."),
        p("showLabels", "boolean", "Draw values at the end of each bar.", "false"),
        p("syncId", "string", "Share hover with other charts that use the same id."),
        p("sharedTooltip", "boolean", "Show every series at the hovered category.", "true"),
        p("stackOffset", '"sign" | "expand"', "`expand` is 100% stacked.", '"sign"'),
        p("legendPosition", '"top" | "bottom" | "left" | "right"', "Where the series legend sits.", '"top"'),
        p("loading", "boolean", "Cover the plot with a loading status.", "false"),
        p("emptyText", "ReactNode", "Message when every visible series is empty.", '"No data"'),
        p("showBarBackground", "boolean", "Draw category tracks behind bars.", "false"),
        children,
        className,
      ],
    },
  ],
  "bar-chart": cartesianApi("BarChart", [
    p("layout", '"vertical" | "horizontal"', "Bar direction. Horizontal charts size the left gutter from category labels.", '"vertical"'),
    p("stacked", "boolean", "Stack series in each category.", "false"),
    p("borderRadius", "number", "Bar corner radius."),
  ]),
  "line-chart": cartesianApi("LineChart", [
    p("curve", '"monotone" | "linear" | "step"', "Interpolation.", '"monotone"'),
    p("showMark", "boolean", "Draw points on the line.", "true"),
    p("area", "boolean", "Fill under the line.", "false"),
    p("connectNulls", "boolean", "Join the stroke across nulls. Set false to gap missing points.", "true"),
  ]),
  "area-chart": cartesianApi("AreaChart", [
    p("curve", '"monotone" | "linear" | "step"', "Interpolation.", '"monotone"'),
    p("stacked", "boolean", "Stack filled series.", "false"),
    p("showMark", "boolean", "Draw points on the line.", "true"),
    p("connectNulls", "boolean", "Join the stroke across nulls. Set false to gap missing points.", "true"),
  ]),
  "pie-chart": [
    {
      name: "PieChart",
      props: [
        p("series", "PieSeries[]", "Slices as `{ data, innerRadius?, outerRadius?, paddingAngle? }`. Radii are pixels, 0–1 fractions, or percent strings — set `innerRadius: \"42%\"` on a series for a donut that stays inside the plot."),
        p("height", "number", "Plot height."),
        p("hideLegend", "boolean", "Hide the slice legend.", "false"),
        p("fillHeight", "boolean", "Plot height follows the parent.", "false"),
        p("onItemClick", "(event: ChartItemEvent) => void", "Fires when a slice is activated."),
        p("renderTooltip", "(hover) => ReactNode", "Replace the default hover tooltip."),
        p("labelFormatter", "(item) => string | null", "Slice label text. Return null to hide."),
        p("labelLine", "boolean", "Draw leader lines to labels outside the ring.", "false"),
        p("legendPosition", '"top" | "bottom" | "left" | "right"', "Where the slice legend sits.", '"top"'),
        p("loading", "boolean", "Cover the plot with a loading status.", "false"),
        p("emptyText", "ReactNode", "Message when every visible slice is empty.", '"No data"'),
        className,
      ],
    },
  ],
  "scatter-chart": [
    {
      name: "ScatterChart",
      props: [
        p("series", "ScatterSeries[]", "Point clouds with `data: { x, y }[]`."),
        p("height", "number", "Plot height."),
        p("renderer", "\"svg\" | \"webgl\" | \"auto\"", "`webgl` draws tens of thousands of points; `svg` keeps every point focusable; `auto` switches on size."),
        className,
      ],
    },
  ],
  sparkline: [
    {
      name: "SparkLineChart",
      props: [
        p("data", "number[]", "Values along the sparkline."),
        p("labels", "(string | number | Date)[]", "Hover labels for each point."),
        p("height", "number", "Plot height.", "40"),
        p("color", "string", "Stroke color."),
        p("area", "boolean", "Fill under the line.", "false"),
        p("renderTooltip", "(hover) => ReactNode", "Replace the default hover tooltip."),
        className,
      ],
    },
  ],
  gauge: [
    {
      name: "Gauge",
      props: [
        p("value", "number", "Current value for a single-arc gauge."),
        p("valueMin", "number", "Scale minimum.", "0"),
        p("valueMax", "number", "Scale maximum.", "100"),
        p("startAngle", "number", "Arc start in degrees.", "-110"),
        p("endAngle", "number", "Arc end in degrees.", "110"),
        p("sections", "{ value, label, color? }[]", "Segmented semi-donut instead of a single fill."),
        p("text", "string | ((value) => string) | null", "Center label. Hidden by default when `sections` is set."),
        p("hideLegend", "boolean", "Hide the section legend.", "false"),
        className,
      ],
    },
  ],
  "radar-chart": [
    {
      name: "RadarChart",
      props: [
        p("series", "{ label, data: number[] }[]", "Polygons on a shared metric set."),
        p("radar", "{ metrics: { name }[] }", "Axis labels around the radar."),
        p("height", "number", "Plot height."),
        className,
      ],
    },
  ],
  heatmap: [
    {
      name: "Heatmap",
      props: [
        p("series", "{ data: { x, y, value }[] }[]", "Cell intensities."),
        p("xAxis", "ChartAxisConfig[]", "Column labels."),
        p("yAxis", "ChartAxisConfig[]", "Row labels."),
        p("showColorScale", "boolean", "Gradient legend for the value domain.", "true"),
        p("hideLegend", "boolean", "Hide the color scale.", "false"),
        p("height", "number", "Plot height."),
        p("fillHeight", "boolean", "Plot height follows the parent.", "false"),
        p("onItemClick", "(event: ChartItemEvent) => void", "Fires when a cell is activated."),
        p("showCellLabels", "boolean | ((cell) => string)", "Draw values inside cells.", "false"),
        className,
      ],
    },
  ],
  "funnel-chart": [
    {
      name: "FunnelChart",
      props: [
        p("series", "{ label?, data: { label, value }[] }[]", "One series for a funnel; a second series draws a comparison overlay."),
        p("labelPosition", '"inside" | "outside" | "both"', "Value labels. Defaults to `both` when comparing series."),
        p("valueFormatter", "(value, percent) => string", "Inside/outside label text."),
        p("gap", "number", "Pixels between stages.", "6"),
        p("height", "number", "Plot height."),
        className,
      ],
    },
  ],
  "pyramid-chart": [
    {
      name: "PyramidChart",
      props: [
        p("series", "FunnelSeries[]", "Bands as `{ data: { label, value }[] }` — widest first."),
        p("height", "number", "Plot height."),
        className,
      ],
    },
  ],
  "sankey-chart": [
    {
      name: "SankeyChart",
      props: [
        p("series", "{ data: SankeyNode[]; links: SankeyLink[] }", "Nodes (`{ id, label }`) and weighted links (`{ source, target, value }`)."),
        p("height", "number", "Plot height."),
        className,
      ],
    },
  ],
  "range-bar-chart": cartesianApi("RangeBarChart", [
    p("series", "{ label, data: { low, high }[] }[]", "Interval bars per category."),
  ], "Bars that span a low–high interval instead of a single value."),
  "candlestick-chart": cartesianApi("CandlestickChart", [
    p("series", "{ data: { open, high, low, close }[] }[]", "OHLC candles."),
  ]),
  "radial-bar-chart": [
    {
      name: "RadialBarChart",
      props: [
        p("series", "{ data: number[] }[]", "Values on a shared radial axis."),
        p("height", "number", "Plot height."),
        className,
      ],
    },
  ],
  "radial-line-chart": [
    {
      name: "RadialLineChart",
      props: [
        p("series", "{ data: number[] }[]", "Polar line values."),
        p("height", "number", "Plot height."),
        className,
      ],
    },
  ],
  "linear-gauge": [
    {
      name: "LinearGauge",
      props: [
        p("value", "number", "Current value."),
        p("valueMin", "number", "Scale minimum.", "0"),
        p("valueMax", "number", "Scale maximum.", "100"),
        className,
      ],
    },
  ],
  "bubble-chart": [
    {
      name: "BubbleChart",
      props: [
        p("series", "ScatterSeries[]", "Points with a `z` size dimension."),
        p("height", "number", "Plot height."),
        className,
      ],
    },
  ],
  "range-area-chart": cartesianApi("RangeAreaChart", [
    p("series", "{ data: { low, high }[] }[]", "Banded area between low and high."),
  ]),
  treemap: [
    {
      name: "Treemap",
      props: [
        p("series", "{ data: TreeNode[] }[]", "Nested `{ name, value, children }` trees."),
        p("height", "number", "Plot height."),
        className,
      ],
    },
  ],
  "polar-line-chart": [
    {
      name: "PolarLineChart",
      props: [
        p("series", "{ data: number[] }[]", "Line on polar axes."),
        p("height", "number", "Plot height."),
        className,
      ],
    },
  ],
  "chord-chart": [
    {
      name: "ChordChart",
      props: [
        p("series", "{ data: string[]; matrix: number[][] }", "Node names around the circle (`data`) and the directed flow `matrix`."),
        p("height", "number", "Plot height."),
        className,
      ],
    },
  ],
  "waterfall-chart": cartesianApi("WaterfallChart"),
  "boxplot-chart": cartesianApi("BoxPlotChart", [
    p("series", "{ data: { min, q1, median, q3, max, outliers? }[] }[]", "Quartiles per category."),
  ]),
  "ohlc-chart": cartesianApi("OhlcChart", [
    p("series", "{ data: { open, high, low, close }[] }[]", "OHLC ticks without candle bodies."),
  ]),
  "sunburst-chart": [
    {
      name: "SunburstChart",
      props: [
        p("series", "{ data: TreeNode[] }[]", "Nested `{ name, value, children }` trees; rings go outward by depth."),
        p("height", "number", "Plot height."),
        className,
      ],
    },
  ],
};

export function getApi(entry: ComponentEntry): ApiSection[] {
  const handWritten = apiBySlug[entry.slug];
  if (handWritten) return handWritten.map(completeSection);
  const sections = entry.importName
    .split(/\s*,\s*/)
    .map(generatedSection)
    .filter((section): section is ApiSection => section != null && section.props.length > 0);
  return sections.length
    ? sections
    : [{ name: entry.importName, extends: "HTML attributes", props: [className, children] }];
}
