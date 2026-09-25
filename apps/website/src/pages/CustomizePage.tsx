import { Link } from "react-router-dom";
import { CodeBlock } from "@/components/CodeBlock";
import { CustomThemeDemo } from "@/components/CustomThemeDemo";
import {
  RECIPE_BREAKPOINTS,
  RECIPE_CREATE_THEME,
  RECIPE_CSS_OVERRIDE,
  RECIPE_CUSTOMIZE_ONE_OFF,
  RECIPE_RESPONSIVE,
  RECIPE_THEMING,
} from "@/data/agent-docs";

const PALETTE_ROWS: { token: string; css: string; utility: string }[] = [
  { token: "background / foreground", css: "--background, --foreground", utility: "bg-background, text-foreground" },
  { token: "primary / primaryForeground", css: "--primary, --primary-foreground", utility: "bg-primary, text-primary-foreground" },
  { token: "secondary / muted", css: "--secondary, --muted, --muted-foreground", utility: "bg-muted, text-muted-foreground" },
  { token: "accent / ring", css: "--accent, --ring", utility: "bg-accent, ring-ring" },
  { token: "destructive", css: "--destructive, --destructive-foreground", utility: "bg-destructive" },
  { token: "border / input", css: "--border, --input, --input-background", utility: "border-border" },
  { token: "card / popover", css: "--card, --popover", utility: "bg-card, bg-popover" },
  { token: "chart1 … chart5", css: "--chart-1 … --chart-5", utility: "text-chart-1" },
];

const BREAKPOINT_ROWS = [
  { key: "xs", width: "0px", grid: "default span (no prefix)", utility: "base" },
  { key: "sm", width: "640px", grid: "sm={n}", utility: "sm:" },
  { key: "md", width: "768px", grid: "md={n}", utility: "md:" },
  { key: "lg", width: "1024px", grid: "lg={n}", utility: "lg:" },
  { key: "xl", width: "1280px", grid: "xl={n}", utility: "xl:" },
];

export function CustomizePage() {
  return (
    <article className="prose">
      <h1 className="page-title">Customize</h1>
      <p className="page-lead">
        If you&apos;ve customized Material UI before, the mental model will feel familiar — start with
        a one-off tweak, wrap a reusable component, define a theme, or override CSS globally. The
        difference is that Spatika&apos;s source of truth is CSS variables, not an <code>sx</code> prop.
      </p>

      <h2 className="section-title" id="how-to-customize">
        How to customize
      </h2>
      <p>Work from the narrowest scope to the broadest:</p>
      <ol>
        <li>
          <strong>One-off</strong> — <code>className</code> with token utilities on a single
          component.
        </li>
        <li>
          <strong>Reusable component</strong> — wrap a Spatika primitive and reuse the wrapper.
        </li>
        <li>
          <strong>Custom theme</strong> — <code>createTheme</code> overlays a palette on Mukta,
          Neelam, Usha, or Sandhya.
        </li>
        <li>
          <strong>Global CSS</strong> — set CSS variables on <code>:root</code> or a theme class.
        </li>
      </ol>

      <h3 className="section-title" id="one-off">
        1. One-off customization
      </h3>
      <p>
        Every component forwards <code>className</code>. Stick to token utilities (
        <code>bg-primary</code>, <code>text-muted-foreground</code>, <code>border-border</code>) so
        your override still tracks the active theme — no hardcoded hex.
      </p>
      <CodeBlock language="tsx" code={RECIPE_CUSTOMIZE_ONE_OFF} />
      <p>
        Nested parts expose stable <code>data-slot</code> attributes (for example{" "}
        <code>[data-slot=&quot;button&quot;]</code>). Target those selectors instead of hashed
        class names.
      </p>

      <h3 className="section-title" id="reusable">
        2. Reusable component
      </h3>
      <p>
        When the same override shows up in more than one place, wrap the primitive. Keep importing
        from <code>@spatika/react</code> inside the wrapper — don&apos;t copy the source.
      </p>
      <CodeBlock
        language="tsx"
        code={`import { Button, type ButtonProps } from "@spatika/react";

export function BrandButton(props: ButtonProps) {
  return <Button className="rounded-full px-5" {...props} />;
}`}
      />

      <h3 className="section-title" id="theme-overrides">
        3. Custom theme
      </h3>
      <p>
        <code>createTheme</code> is Spatika&apos;s answer to Material UI&apos;s theme overlay. It
        doesn&apos;t replace the four built-in themes — it inherits one of them and writes CSS
        variables onto <code>[data-spk-theme=&quot;your-id&quot;]</code>.
      </p>
      <CodeBlock language="tsx" code={RECIPE_CREATE_THEME} />
      <p>Try two overlays right here without leaving the page. The site toolbar theme stays as you left it.</p>
      <CustomThemeDemo />

      <h3 className="section-title" id="global-css">
        4. Global CSS override
      </h3>
      <p>
        To retint Mukta or Neelam for the whole app, set variables after importing{" "}
        <code>@spatika/tokens/styles.css</code>. Same specificity as the kit — later rules win.
      </p>
      <CodeBlock language="css" code={RECIPE_CSS_OVERRIDE} />

      <h2 className="section-title" id="creating-a-theme">
        Creating a theme
      </h2>
      <p>
        Pass <code>customThemes</code> to <code>SpatikaThemeProvider</code> and switch with{" "}
        <code>setTheme(&quot;brand&quot;)</code>. Built-in ids stay{" "}
        <code>mukta | neelam | usha | sandhya</code>; custom ids must not collide with those.
      </p>
      <ul>
        <li>
          <code>extends</code> — which built-in variable set to inherit. Default{" "}
          <code>&quot;mukta&quot;</code>.
        </li>
        <li>
          <code>colorScheme</code> — <code>&quot;light&quot;</code> or <code>&quot;dark&quot;</code>.
          Default follows the base (Neelam and Sandhya are dark).
        </li>
        <li>
          <code>palette</code>, <code>glass</code>, <code>shape</code>, <code>typography.fontFamily</code>
        </li>
        <li>
          <code>vars</code> — raw CSS properties for anything not in those maps, e.g.{" "}
          <code>--shadow-soft</code>
        </li>
      </ul>
      <p>
        <code>themeToCss(theme)</code> returns the stylesheet string if you&apos;d rather commit CSS
        than inject it at runtime. Switching built-in themes still uses{" "}
        <code>storageKey</code>:
      </p>
      <CodeBlock language="tsx" code={RECIPE_THEMING} />
      <p>
        The four built-in looks are documented on the <Link to="/design#themes">design language</Link>{" "}
        page: Mukta (pearl), Neelam (sapphire dark), Usha (dawn), Sandhya (dusk, no blur).
      </p>

      <h2 className="section-title" id="color-palette">
        Color palette
      </h2>
      <p>
        Palette keys are camelCase. They map onto the same CSS variables Spatika utilities read, so{" "}
        <code>bg-primary</code> updates when <code>palette.primary</code> changes.
      </p>
      <div className="token-table-wrap">
        <table className="token-table">
          <thead>
            <tr>
              <th>createTheme palette</th>
              <th>CSS variable</th>
              <th>Utility</th>
            </tr>
          </thead>
          <tbody>
            {PALETTE_ROWS.map((row) => (
              <tr key={row.token}>
                <td>
                  <code>{row.token}</code>
                </td>
                <td>
                  <code>{row.css}</code>
                </td>
                <td>
                  <code>{row.utility}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        We also map sidebar tokens, <code>accentInfo</code> / <code>accentHighlight</code> /{" "}
        <code>accentWarm</code>, and chart series <code>chart1</code>…<code>chart5</code>. Glass material
        frost lives under <code>glass.blur</code>, <code>glass.bg</code>, and friends — not the
        palette.
      </p>

      <h2 className="section-title" id="css-variables">
        CSS variables
      </h2>
      <p>
        Importing <code>@spatika/tokens/styles.css</code> defines the variables on{" "}
        <code>:root</code> (Mukta) and on <code>.neelam</code>, <code>.usha</code>,{" "}
        <code>.sandhya</code>. Components never store hex — they read{" "}
        <code>var(--primary)</code>. That&apos;s why a custom theme is a variable overlay, not a second
        component tree.
      </p>
      <CodeBlock
        language="css"
        code={`[data-spk-theme="brand"] {
  --primary: #7c3aed;
  --primary-foreground: #ffffff;
  --ring: #7c3aed;
}`}
      />

      <h2 className="section-title" id="breakpoints">
        Breakpoints
      </h2>
      <p>
        Spatika uses its own viewport scale. <Link to="/components/grid">Grid</Link> item props
        and <code>BREAKPOINTS</code> share these widths:
      </p>
      <div className="token-table-wrap">
        <table className="token-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Min width</th>
              <th>Grid prop</th>
              <th>Utility prefix</th>
            </tr>
          </thead>
          <tbody>
            {BREAKPOINT_ROWS.map((row) => (
              <tr key={row.key}>
                <td>
                  <code>{row.key}</code>
                </td>
                <td>{row.width}</td>
                <td>
                  <code>{row.grid}</code>
                </td>
                <td>
                  <code>{row.utility}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock language="tsx" code={RECIPE_BREAKPOINTS} />
      <p>
        Helpers: <code>breakpointUp(&quot;md&quot;)</code> →{" "}
        <code>(min-width: 768px)</code>, <code>breakpointDown(&quot;md&quot;)</code> →{" "}
        <code>(max-width: 767px)</code>, <code>breakpointBetween(&quot;sm&quot;, &quot;lg&quot;)</code>.
        <Link to="/components/container"> Container</Link> <code>maxWidth</code> uses the same
        named widths.
      </p>

      <h2 className="section-title" id="responsive-design">
        Responsive design
      </h2>
      <p>Three layers, from layout to behavior:</p>
      <ol>
        <li>
          <strong>Grid / Stack / Container</strong> — 12 columns with <code>xs</code>…<code>xl</code>
          ; Stack <code>direction</code> and spacing for toolbars.
        </li>
        <li>
          <strong>Token utilities</strong> — <code>hidden md:flex</code>, <code>text-2xl sm:text-3xl</code>
          . Same breakpoints as Grid.
        </li>
        <li>
          <strong>Hooks</strong> — <code>useIsMobile()</code> (below 768px),{" "}
          <code>useBreakpoint()</code>, <code>useBreakpointUp</code> / <code>useBreakpointDown</code>,
          or a raw <code>useMediaQuery</code>.
        </li>
      </ol>
      <CodeBlock language="tsx" code={RECIPE_RESPONSIVE} />
      <p>
        Primary actions on small screens should use <code>size=&quot;touch&quot;</code> or{" "}
        <code>size=&quot;icon-touch&quot;</code> so the hit target is at least 44px.{" "}
        <Link to="/components/filter-sheet">FilterSheet</Link> already switches popover → drawer
        with <code>useIsMobile</code>.
      </p>

      <h2 className="section-title" id="typography">
        Typography
      </h2>
      <p>
        <Link to="/components/typography">Typography</Link> maps twelve variants onto semantic HTML:
        <code> h1</code>…<code>h6</code>, <code>subtitle1</code>, <code>subtitle2</code>,{" "}
        <code>body1</code>, <code>body2</code>, <code>caption</code>, <code>overline</code>. Color
        is independent (<code>muted</code>, <code>primary</code>).
      </p>
      <p>
        Page chrome helpers live next to the scale: <code>typographyPageTitle</code>,{" "}
        <code>typographyPageSubtitle</code>, <code>typographySectionLabel</code>. Override the font
        with <code>createTheme(&#123; typography: &#123; fontFamily &#125; &#125;)</code> or{" "}
        <code>--font-sans</code>.
      </p>

      <h2 className="section-title" id="spacing-shape">
        Spacing and shape
      </h2>
      <p>
        <Link to="/components/stack">Stack</Link> <code>spacing</code> is a Spatika spacing step (
        <code>0</code>, <code>1</code>, <code>2</code>…<code>12</code>). Shape tokens:
      </p>
      <ul>
        <li>
          <code>--radius</code> / <code>shape.radius</code> — controls
        </li>
        <li>
          <code>--radius-card</code> / <code>shape.radiusCard</code> — cards
        </li>
        <li>
          <code>--radius-pill</code> / <code>shape.radiusPill</code> — chips, tab bars
        </li>
      </ul>

      <h2 className="section-title" id="dark-mode">
        Dark mode
      </h2>
      <p>
        Dark is a theme, not a separate <code>mode</code> flag. <code>isDarkTheme(&quot;neelam&quot;)</code>{" "}
        and <code>isDarkTheme(&quot;sandhya&quot;)</code> are true; Mukta and Usha are light. A custom
        theme sets <code>colorScheme</code> and inherits the base (extend Neelam for a dark brand).
        The provider writes <code>color-scheme</code> on the themed root so native controls match.
      </p>

      <h2 className="section-title" id="glass-motion">
        Surfaces, density and motion
      </h2>
      <p>
        Surfaces come from <code>--spk-surface</code>, <code>--spk-surface-raised</code>,{" "}
        <code>--spk-surface-overlay</code>, <code>--spk-surface-subtle</code> and{" "}
        <code>--spk-surface-sunken</code>; pick one per component with{" "}
        <code>surface=&quot;…&quot;</code>. Translucency is opt-in: <code>surface=&quot;glass&quot;</code>{" "}
        (or <code>.spk-glass</code>) reads <code>--spk-glass-tint</code>,{" "}
        <code>--spk-glass-blur</code> and <code>--spk-glass-border</code>. Sandhya keeps blur at{" "}
        <code>0</code>, and <code>prefers-reduced-transparency</code> turns glass solid everywhere.
      </p>
      <p>
        Density is tokenised: <code>--spk-control-h</code>, <code>--spk-row-h</code>,{" "}
        <code>--spk-cell-px</code> / <code>--spk-cell-py</code>, <code>--spk-item-h</code> and{" "}
        <code>--spk-card-p</code>. Set <code>data-density=&quot;compact&quot;</code> on any region (or{" "}
        <code>&lt;AppShell density=&quot;compact&quot;&gt;</code>) and everything inside retunes.
      </p>
      <p>
        Motion tokens: <code>--spk-duration-fast|base|slow</code> with{" "}
        <code>--spk-ease-standard|enter|exit|spring</code>, composed as{" "}
        <code>--spk-motion-hover</code>, <code>--spk-motion-select</code>,{" "}
        <code>--spk-motion-enter</code>. Animate colour, shadow and transform only, and honour{" "}
        <code>prefers-reduced-motion</code>; kit utilities already do.
      </p>

      <h2 className="section-title" id="z-index">
        z-index
      </h2>
      <p>
        Overlays use <code>OVERLAY_Z_INDEX</code>: popover <code>90</code>, select <code>200</code>,
        menu <code>10000</code>, modal <code>11000</code>, toast <code>12000</code>, tooltip{" "}
        <code>13000</code>. The same scale is exposed to CSS as <code>--spk-z-sticky</code>,{" "}
        <code>--spk-z-chrome</code>, <code>--spk-z-popover</code>, <code>--spk-z-select</code>,{" "}
        <code>--spk-z-menu</code>, <code>--spk-z-modal</code>, <code>--spk-z-toast</code> and{" "}
        <code>--spk-z-tooltip</code>. Import the map (or read the variables) instead of inventing
        stacking values — menus need to sit above fullscreen product chrome, and popovers, selects
        and menus opened inside a Dialog, Sheet or BottomSheet escalate above it automatically.
      </p>
    </article>
  );
}
