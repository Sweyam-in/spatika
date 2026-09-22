import { Link } from "react-router-dom";
import { Button } from "@spatika/react";
import { BarChart3, CalendarRange, PenLine } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { INSTALL, SITE } from "@/data/site";

const extensions = [
  {
    icon: CalendarRange,
    title: "Scheduler",
    package: "@spatika/react",
    packageUrl: SITE.npmReact,
    body: (
      <>
        <code>EventCalendar</code> handles month, week, day, and agenda views — create, edit, resize,
        and recurrence are all built in. <code>EventTimeline</code> lays the same events on resource
        rows, from hours to years.
      </>
    ),
    install: null,
    links: [
      { label: "EventCalendar", to: "/components/event-calendar" },
      { label: "EventTimeline", to: "/components/event-timeline" },
      { label: "Scheduler guide", to: "/guides#scheduler" },
    ],
  },
  {
    icon: BarChart3,
    title: "Charts",
    package: "@spatika/charts",
    packageUrl: SITE.npmCharts,
    body: (
      <>
        Thirty-plus SVG chart types — bar, line, area, pie, scatter, sankey, maps, and 3D variants —
        with zoom, brush, syncId, shared tooltips, reference lines, and export when you need to share
        a snapshot.
      </>
    ),
    install: INSTALL.charts,
    links: [
      { label: "ChartContainer", to: "/components/chart-container" },
      { label: "All charts", to: "/components#charts" },
      { label: "Charts guide", to: "/guides#charts" },
    ],
  },
  {
    icon: PenLine,
    title: "Editor",
    package: "@spatika/editor",
    packageUrl: SITE.npmEditor,
    body: (
      <>
        Tiptap-powered <code>SpatikaEditor</code> with a quiet toolbar, slash commands, @mentions,
        tables, resizable images, and generic AI hooks. Use <code>useSpatikaEditor</code> when you
        want to bring your own chrome.
      </>
    ),
    install: INSTALL.editor,
    links: [
      { label: "SpatikaEditor", to: "/components/spatika-editor" },
      { label: "Playground", to: "/demos/editor" },
      { label: "Editor guide", to: "/guides#editor" },
    ],
  },
] as const;

export function ExtensionsSection() {
  return (
    <section className="extensions-section" id="extensions" aria-labelledby="extensions-heading">
      <div className="extensions-header">
        <div>
          <p className="extensions-eyebrow">Beyond the shell</p>
          <h2 className="extensions-title" id="extensions-heading">
            Scheduler, charts, and editor
          </h2>
          <p className="extensions-lead">
            Beyond the core shell, Spatika ships dedicated npm packages for charts and rich text, plus
            calendar and timeline scheduling in the main React kit.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/components">Full catalog</Link>
        </Button>
      </div>

      <div className="extensions-grid">
        {extensions.map(({ icon: Icon, title, package: pkg, packageUrl, body, install, links }) => (
          <article key={title} className="extensions-card">
            <span className="extensions-icon" aria-hidden>
              <Icon size={18} />
            </span>
            <h3>{title}</h3>
            <p className="extensions-package">
              <a href={packageUrl} target="_blank" rel="noreferrer">{pkg}</a>
            </p>
            <p className="extensions-body">{body}</p>
            {install ? (
              <div className="extensions-install">
                <CodeBlock code={install} />
              </div>
            ) : (
              <p className="extensions-included">Included in @spatika/react</p>
            )}
            <div className="extensions-links">
              {links.map((link) => (
                <Button key={link.to} variant="ghost" size="sm" asChild>
                  <Link to={link.to}>{link.label}</Link>
                </Button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
