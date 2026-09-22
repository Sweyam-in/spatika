import { Link } from "react-router-dom";
import { CodeBlock } from "@/components/CodeBlock";
import {
  RECIPE_APP_SHELL,
  RECIPE_BOOTSTRAP,
  RECIPE_CHART,
  RECIPE_COVER,
  RECIPE_EDITOR,
  RECIPE_SCHEDULER,
  RECIPE_THEMING,
} from "@/data/agent-docs";
import { INSTALL, SITE } from "@/data/site";

export function GuidesPage() {
  return (
    <article className="prose">
      <h1 className="page-title">Guides</h1>
      <p className="page-lead">
        Everything you need to get Spatika running — install from npm, wire up themes, and compose
        the application shell patterns the system is built around.
      </p>

      <h2 className="section-title" id="installation">
        Installation
      </h2>
      <p>Start by adding the tokens and React packages to your app:</p>
      <CodeBlock code={INSTALL.both} />
      <p>
        In your entry file, import the token styles before any components — that order matters:
      </p>
      <CodeBlock language="tsx" code={RECIPE_BOOTSTRAP} />
      <p>
        Packages:{" "}
        <a href={SITE.npmTokens} target="_blank" rel="noreferrer">
          @spatika/tokens
        </a>
        {" · "}
        <a href={SITE.npmReact} target="_blank" rel="noreferrer">
          @spatika/react
        </a>
      </p>

      <h2 className="section-title" id="theming">
        Theming
      </h2>
      <p>
        Four built-in themes ship ready to use, and <code>storageKey</code> keeps the user&apos;s
        pick across visits. For custom palettes, breakpoints, and <code>createTheme</code>, head to
        the <Link to="/customize">customize</Link> guide.
      </p>
      <CodeBlock language="tsx" code={RECIPE_THEMING} />

      <h2 className="section-title" id="app-shell">
        App shell
      </h2>
      <p>
        On mobile, a Spatika product usually stacks three things: AppHeader at the top,
        FloatingPageChromeBar for the page you&apos;re on, and MobileTabBar to jump between
        sections. It&apos;s the layout we use in the{" "}
        <Link to="/showcase">showcase</Link> — a four-page workspace you can open and poke around.
      </p>
      <CodeBlock language="tsx" code={RECIPE_APP_SHELL} />

      <h2 className="section-title" id="cover-pages">
        Cover pages
      </h2>
      <p>
        Profile and story pages get their personality from cover art. CoverHero and ProfileHero can
        use a real photo or a generated pattern from a seed. When the header floats over the cover,
        call <code>useCoverChromeBleed</code> on that route so the app bar picks up the cover ink
        instead of sitting on plain white.
      </p>
      <CodeBlock language="tsx" code={RECIPE_COVER} />

      <h2 className="section-title" id="scheduler">
        Scheduler
      </h2>
      <p>
        <Link to="/components/event-calendar">EventCalendar</Link> covers month, week, day, and agenda
        views — create, edit, drag, resize, and recurrence are all built in.{" "}
        <Link to="/components/event-timeline">EventTimeline</Link> lays the same{" "}
        <code>SchedulerEvent</code> types on resource rows, from hours to years. Both ship in{" "}
        <code>@spatika/react</code>.
      </p>
      <CodeBlock language="tsx" code={RECIPE_SCHEDULER} />

      <h2 className="section-title" id="charts">
        Charts
      </h2>
      <p>
        Install <code>@spatika/charts</code> for thirty-plus SVG chart types with zoom, brush,
        syncId, tooltips, and export. It&apos;s re-exported from <code>@spatika/react</code> for
        convenience — browse the <Link to="/components#charts">chart catalog</Link> or start with{" "}
        <Link to="/components/chart-container">ChartContainer</Link>.
      </p>
      <CodeBlock code={INSTALL.charts} />
      <CodeBlock language="tsx" code={RECIPE_CHART} />
      <p>
        Package:{" "}
        <a href={SITE.npmCharts} target="_blank" rel="noreferrer">
          @spatika/charts
        </a>
      </p>

      <h2 className="section-title" id="editor">
        Editor
      </h2>
      <p>
        <code>SpatikaEditor</code> is for the places in your product where people actually write —
        notes, articles, captions, anything that needs more than plain text. You get a
        toolbar, slash commands, @mentions, tables, resizable images, and a friendly AI dock that
        connects to your backend (we don&apos;t call a model for you). Import{" "}
        <code>@spatika/editor/styles.css</code> alongside your token styles, then try the{" "}
        <Link to="/demos/editor">live playground</Link> when you want to see it at full width, or
        read the <Link to="/components/spatika-editor">SpatikaEditor</Link> docs for props and
        examples.
      </p>
      <CodeBlock code={INSTALL.editor} />
      <CodeBlock language="tsx" code={RECIPE_EDITOR} />
      <p>
        Package:{" "}
        <a href={SITE.npmEditor} target="_blank" rel="noreferrer">
          @spatika/editor
        </a>
      </p>

      <h2 className="section-title" id="ai-agents">
        For AI coding agents
      </h2>
      <p>
        Spatika publishes machine-readable docs so Cursor, Claude Code, and similar agents can fetch
        canonical snippets instead of guessing APIs. Start at{" "}
        <a href="/llms.txt">/llms.txt</a> (the index) or <a href="/llms-full.txt">/llms-full.txt</a>{" "}
        (install, recipes, and the full catalog in one file). Rules live in{" "}
        <a href="/AGENTS.md">/AGENTS.md</a>.
      </p>
      <p>Each component also has a markdown page you can copy-paste from:</p>
      <CodeBlock code={`${SITE.url}/docs/button.md`} />
      <p>
        In your app, copy the Cursor skill from the installed package into your project:
      </p>
      <CodeBlock
        code={`cp -R node_modules/@spatika/react/skills/spatika-ui .cursor/skills/spatika-ui`}
      />
      <p>
        The skill auto-invokes when you&apos;re building UI. Registry JSON is at{" "}
        <a href="/docs/components.json">/docs/components.json</a>.
      </p>

      <h2 className="section-title" id="publishing">
        Publishing
      </h2>
      <p>
        Spatika packages are published to the public npm registry under the{" "}
        <a href={SITE.npmOrg} target="_blank" rel="noreferrer">
          spatika
        </a>{" "}
        scope. Pin versions in production apps and follow semver releases — that way upgrades stay
        predictable.
      </p>
      <CodeBlock code="npm install @spatika/react@latest @spatika/tokens@latest" />
      <p>
        This documentation site is at{" "}
        <a href={SITE.url} target="_blank" rel="noreferrer">
          {SITE.url.replace("https://", "")}
        </a>
        . Spatika UI is a project from{" "}
        <a href={SITE.sweyamUrl} target="_blank" rel="noreferrer">
          {SITE.sweyam}
        </a>
        , by{" "}
        <a href={SITE.authorUrl} target="_blank" rel="noreferrer">
          {SITE.author}
        </a>
        .
      </p>

      <h2 className="section-title" id="contribute">
        Contribute on GitHub
      </h2>
      <p>
        The project is open source on{" "}
        <a href={SITE.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        . Fork the repo, make changes in <code>packages/react</code> or <code>apps/website</code>, run{" "}
        <code>npm test</code>, and open a pull request. When you add a component, also add a catalog row
        in <code>navigation.ts</code> and a snippet in <code>agent-snippets.ts</code>. Bug reports and
        feature ideas are always welcome via{" "}
        <a href={SITE.githubIssues} target="_blank" rel="noreferrer">
          issues
        </a>
        .
      </p>
      <CodeBlock
        code={`git clone https://github.com/Sweyam-in/spatika.git
cd spatika
npm install
npm run dev`}
      />
    </article>
  );
}
