import { Link } from "react-router-dom";
import { Badge } from "@spatika/react";
import { Markdown } from "@/components/Markdown";
import { useVersionManifest } from "@/components/VersionSelector";
import { DOCS_CHANNEL, DOCS_VERSION, channelLabel, versionHref } from "@/data/version";
import changelog from "../../../../packages/react/CHANGELOG.md?raw";
import migration20 from "../../../../docs/redesign/MIGRATION.md?raw";
import migration24 from "../../../../docs/migrations/2.4.md?raw";

/** Release notes, from the package changelog — written once, shown here per version. */
export function ChangelogPage() {
  const body = changelog.replace(/^# @spatika\/react\s*/, "");
  return (
    <article className="resource-page">
      <p className="component-kicker">Resources</p>
      <h1 className="page-title">Release notes</h1>
      <p className="page-lead">
        Every release of <code>@spatika/tokens</code>, <code>@spatika/react</code>, <code>@spatika/charts</code> and{" "}
        <code>@spatika/editor</code>. The four packages share one version number. Changes are classified by{" "}
        <a href="https://semver.org" target="_blank" rel="noreferrer">
          semantic versioning
        </a>
        : patch for fixes, minor for new backwards-compatible features, major for breaking changes.
      </p>
      {DOCS_CHANNEL === "development" ? (
        <p className="docs-agent">
          These are development docs: the newest section can describe changes that are not published yet.
        </p>
      ) : null}
      <Markdown source={body} headingOffset={0} />
    </article>
  );
}

export function MigrationPage() {
  return (
    <article className="resource-page">
      <p className="component-kicker">Resources</p>
      <h1 className="page-title">Migration guides</h1>
      <p className="page-lead">
        What to check when upgrading. Minor releases never remove exports or rename props; when a fix changes
        observable behaviour it is listed here with the one-line change that restores the old behaviour.
      </p>
      <nav className="docs-toolbar" aria-label="Migration guides">
        <a href="#spatika-2-3-2-4-migration">2.3 → 2.4</a>
        <a href="#spatika-1-x-2-0-migration">1.x → 2.0</a>
      </nav>
      <Markdown source={migration24} headingOffset={1} />
      <Markdown source={migration20} headingOffset={1} />
    </article>
  );
}

const SUPPORT_POLICY = [
  {
    term: "Current",
    details:
      "The latest stable release. Documented at the site root and at its own /docs/vX.Y.Z/ URL. Receives fixes, features and security updates.",
  },
  {
    term: "Supported",
    details:
      "The latest minor of the previous major, and earlier minors of the current major for six months after the next minor ships. Receives security and critical fixes as patch releases.",
  },
  {
    term: "Archived",
    details:
      "Everything else. Docs stay online at their stable URL and are never overwritten, but receive no updates. Versions published before per-release docs existed (1.0.0 – 2.3.0) are reconstructed from the published npm packages: API reference and release notes, without live examples.",
  },
  {
    term: "Pre-release",
    details: "Release candidates (`2.5.0-rc.1`) documented at their own version URL and never marked Latest.",
  },
  {
    term: "Development",
    details:
      "The main branch at /next/. Describes unreleased work and is labelled on every page so it is never mistaken for a published release.",
  },
];

export function VersionsPage() {
  const manifest = useVersionManifest();
  return (
    <article className="resource-page">
      <p className="component-kicker">Resources</p>
      <h1 className="page-title">Versions &amp; support</h1>
      <p className="page-lead">
        Every published release keeps its own documentation at <code>/docs/vX.Y.Z/</code> — a stable URL that is
        never overwritten. The version menu in the header switches between them and keeps you on the same page when
        it exists in that release. You are reading{" "}
        <strong>{DOCS_CHANNEL === "development" ? "development docs" : `v${DOCS_VERSION}`}</strong>.
      </p>

      <h2 className="section-title" id="versions">
        Published versions
      </h2>
      <div className="api-table-wrap" tabIndex={0}>
        <table className="api-table version-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Status</th>
              <th>Docs</th>
              <th>Released</th>
            </tr>
          </thead>
          <tbody>
            {manifest.versions.map((entry) => (
              <tr key={`${entry.version}-${entry.status}`}>
                <td data-label="Name">
                  <a href={versionHref(entry, "/")}>
                    <code>{entry.status === "development" ? "next" : `v${entry.version}`}</code>
                  </a>
                </td>
                <td data-label="Status">
                  <Badge variant={entry.status === "current" ? "success" : entry.status === "archived" ? "outline" : "secondary"}>
                    {channelLabel(entry)}
                  </Badge>
                </td>
                <td data-label="Docs">{entry.docs === "full" ? "Full site with live examples" : "API reference and release notes"}</td>
                <td data-label="Released">{entry.released ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title" id="support-policy">
        Support policy
      </h2>
      <dl className="resource-policy">
        {SUPPORT_POLICY.map((item) => (
          <div key={item.term}>
            <dt>{item.term}</dt>
            <dd>{item.details}</dd>
          </div>
        ))}
      </dl>

      <h2 className="section-title" id="deprecations">
        Deprecations and removals
      </h2>
      <p>
        A deprecated component or prop keeps working for the rest of its major version. It is marked{" "}
        <code>@deprecated</code> in the type definitions (editors strike it through), flagged as deprecated in the API
        tables, and listed in the <Link to="/migration">migration guide</Link> with its replacement. Removal only happens
        in a major release, and every removal is listed in that release&apos;s migration guide.
      </p>

      <h2 className="section-title" id="release-process">
        How docs are released
      </h2>
      <p>
        <code>npm run release:docs</code> checks that the four packages share one version, that the changelog has a
        section for it, and that the generated API, demos and tests are current. It then builds the site twice from the
        same commit: once for the root (latest) and once for <code>/docs/vX.Y.Z/</code>. It adds the version to{" "}
        <code>versions.json</code> and verifies that every previously published version URL still resolves. Nothing is
        deployed or published by the script.
      </p>
    </article>
  );
}

export function AccessibilityPage() {
  return (
    <article className="resource-page">
      <p className="component-kicker">Resources</p>
      <h1 className="page-title">Accessibility</h1>
      <p className="page-lead">
        Spatika targets WCAG 2.2 level AA for component behaviour and for this site. This page says what that means in
        practice, how it is checked, and where the known gaps are. Automated checks do not make a product accessible on
        their own — test your composed screens with a keyboard and a screen reader too.
      </p>

      <h2 className="section-title" id="built-in">
        What components do for you
      </h2>
      <ul className="docs-guidelines">
        <li>Native elements first: buttons are buttons, fields are inputs, tables are tables.</li>
        <li>
          Composite widgets follow the WAI-ARIA Authoring Practices: menus, listboxes, tabs, radio groups, trees, date
          grids, window splitters and spinbuttons have their documented keyboard models.
        </li>
        <li>
          Overlays share one layer stack: focus moves in on open and back on close, modal overlays trap Tab, and Escape
          closes only the topmost layer.
        </li>
        <li>
          Every theme meets 4.5:1 for text, 3:1 for control boundaries and 3:1 for the focus ring — checked by the test suite for
          Mukta, Neelam, Usha and Sandhya, including the derived hover and muted tokens.
        </li>
        <li>Touch targets reach 44px on coarse pointers; hover is never the only way to reach content.</li>
        <li>
          Motion respects <code>prefers-reduced-motion</code>; translucency respects{" "}
          <code>prefers-reduced-transparency</code>.
        </li>
        <li>Status is never colour alone: deltas carry a sign, results and alerts carry an icon and a stated outcome.</li>
      </ul>

      <h2 className="section-title" id="your-part">
        What you still own
      </h2>
      <ul className="docs-guidelines">
        <li>Accessible names for icon-only buttons (`aria-label`) and meaningful `alt` text for images.</li>
        <li>A label for every field — `FormField` wires it for you.</li>
        <li>Heading order across the page, and one `h1` per screen (`PageHeader` renders it).</li>
        <li>Alternatives to right-click, drag and long-press actions.</li>
        <li>Text alternatives for charts that carry information not stated elsewhere.</li>
      </ul>

      <h2 className="section-title" id="testing">
        How it is tested
      </h2>
      <ul className="docs-guidelines">
        <li>Component tests assert roles, names, descriptions, keyboard models and focus movement (Testing Library).</li>
        <li>Theme contrast is computed from the token source for every theme on every run.</li>
        <li>Browser checks run axe-core rules on documentation pages at phone, tablet and desktop widths.</li>
        <li>
          Screen-reader output is checked automatically with a virtual screen reader that follows the ARIA specs: names,
          roles, states and live-region announcements for forms, dates, dialogs, tabs, trees, toasts and charts.
        </li>
        <li>
          Browser checks run in Chromium, Firefox and WebKit (desktop and phone sizes) on every change.
        </li>
        <li>
          Testing with real screen readers (NVDA, JAWS, VoiceOver, TalkBack) and physical devices is manual and follows a
          written protocol in the repository (<code>docs/testing/screen-readers.md</code>). No manual pass has been
          recorded yet; emulated viewports and automated rules do not guarantee identical behaviour on real devices.
        </li>
      </ul>

      <h2 className="section-title" id="known-limitations">
        Known limitations
      </h2>
      <ul className="docs-guidelines">
        <li>VirtualList only renders the rows in view, so browser find-in-page cannot see off-screen rows.</li>
        <li>
          Charts are keyboard-navigable point by point and carry a data table, but a chart's message (the trend, the
          outlier) still needs a written summary from you. The WebGL scatter renderer has no per-point navigation — pair it
          with a table.
        </li>
        <li>Right-to-left layouts are not verified across all components.</li>
      </ul>
      <p>
        Found a barrier? <a href="https://github.com/Sweyam-in/spatika/issues">Open an issue</a> with the component,
        browser and assistive technology.
      </p>
    </article>
  );
}
