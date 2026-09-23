import { Link } from "react-router-dom";
import { THEME_LABELS, type BuiltinThemeId } from "@spatika/react";
import { CodeBlock } from "@/components/CodeBlock";

const themeSwatches: Record<BuiltinThemeId, { canvas: string; surface: string; accent: string; ink: string; note: string }> = {
  mukta: { canvas: "#f7f7f8", surface: "#ffffff", accent: "#4655d4", ink: "#16171d", note: "Neutral cool light. The default." },
  neelam: { canvas: "#0c0d11", surface: "#191a21", accent: "#5a68e6", ink: "#ececf1", note: "Designed dark — layered, sapphire-tinted." },
  usha: { canvas: "#fbfbfa", surface: "#ffffff", accent: "#c2511d", ink: "#1d1b18", note: "Clear warm light, terracotta accent." },
  sandhya: { canvas: "#100f0e", surface: "#1d1b19", accent: "#c2531f", ink: "#efebe6", note: "Warm dark, flat. Never blurs." },
};

const colorTokens: [string, string][] = [
  ["--spk-canvas", "App background behind everything"],
  ["--spk-surface", "Default container (cards, tables, panels)"],
  ["--spk-surface-raised", "Lifted material with a facet edge"],
  ["--spk-surface-overlay", "Menus, popovers, dialogs"],
  ["--spk-surface-subtle", "Quiet grouping fills"],
  ["--spk-surface-sunken", "Wells: tracks, code, inset areas"],
  ["--spk-text-primary / secondary / tertiary", "Three text levels, all ≥ 4.5:1 on surfaces"],
  ["--spk-border / -subtle / -strong", "Hairlines in three weights"],
  ["--spk-accent / -hover / -muted / -text", "One brand accent and its derived states"],
  ["--spk-success · warning · danger · info", "Status, each with -text and -muted variants"],
  ["--spk-positive / --spk-negative", "Finance semantics for deltas and P&L"],
  ["--spk-viz-1 … 8", "Visualization palette, tuned per theme"],
];

const typeScale: [string, string, string][] = [
  ["text-display", "44–52px / 600", "Marketing and dashboard hero numbers"],
  ["text-title-1", "26–28px / 600", "Page titles"],
  ["text-title-2", "18px / 600", "Section titles, dialog titles"],
  ["text-title-3", "15px / 600", "Card and panel titles"],
  ["text-body", "14px / 400", "Default UI text"],
  ["text-body-sm", "13px / 400", "Secondary copy, table meta"],
  ["text-label", "13px / 500", "Form labels"],
  ["text-caption", "12px / 400", "Hints, timestamps, axis ticks"],
  ["spk-numeric", "tabular · slashed zero", "Any number people compare"],
];

export function DesignPage() {
  return (
    <article className="prose">
      <h1 className="page-title">Design language</h1>
      <p className="page-lead">
        Spatika means crystal. In 2.0 that reads as clarity rather than frost: solid, calm surfaces;
        hierarchy carried by type and space; one accent used sparingly; and detail in the edges —
        a facet highlight, a prism rail on active items, a crisp focus ring.
      </p>

      <h2 className="section-title" id="principles">
        Principles
      </h2>
      <ul>
        <li>
          <strong>Content first.</strong> Surfaces are quiet so information can carry the colour. Most
          page structure is a <code>PageSection</code> — a heading and spacing — not another card.
        </li>
        <li>
          <strong>Calm surfaces.</strong> Solid material by default. Translucency is opt-in
          (<code>surface="glass"</code>) for chrome that floats over content or media.
        </li>
        <li>
          <strong>Strong hierarchy.</strong> Size and weight do the work; uppercase micro-labels and
          900-weight headings are gone.
        </li>
        <li>
          <strong>Professional density.</strong> Controls read their height from density tokens. Put{" "}
          <code>data-density="compact"</code> on any region to tighten everything inside it.
        </li>
        <li>
          <strong>Quiet personality.</strong> The Spatika signature lives in details, never decoration.
        </li>
      </ul>

      <h2 className="section-title" id="signature">
        The Spatika signature
      </h2>
      <div className="token-table-wrap">
        <table className="token-table">
          <thead>
            <tr>
              <th>Motif</th>
              <th>What it is</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Facet edge</td>
              <td>
                A 1px inner highlight on raised material (<code>--spk-facet</code>) — light catching a crystal edge.
              </td>
            </tr>
            <tr>
              <td>Prism rail</td>
              <td>A 2px accent indicator that settles with a small spring on the active nav item, tab, and selected row.</td>
            </tr>
            <tr>
              <td>Crystal focus</td>
              <td>A 2px ring offset by the surface colour — visible on every surface, never removed.</td>
            </tr>
            <tr>
              <td>Measured radii</td>
              <td>4 · 6 · 10 · 14px. Full rounding is reserved for tags, avatars and switches.</td>
            </tr>
            <tr>
              <td>Inset shell</td>
              <td>
                <code>AppShell layout="inset"</code> frames content as a panel beside the sidebar.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="section-title" id="themes">
        Themes
      </h2>
      <p>
        Each theme declares its own base colours — dark themes are designed, not inverted. Derived
        states (hover, muted, focus) are computed from those bases, so a brand override in{" "}
        <Link to="/customize">customize</Link> flows everywhere.
      </p>
      <div className="theme-grid">
        {(Object.keys(THEME_LABELS) as BuiltinThemeId[]).map((id) => {
          const t = themeSwatches[id];
          return (
            <div key={id} className="theme-swatch">
              <span style={{ background: t.canvas, borderColor: t.surface }}>
                <i style={{ background: t.surface }} />
                <b style={{ background: t.accent }} />
                <em style={{ background: t.ink }} />
              </span>
              <strong>{THEME_LABELS[id]}</strong>
              <code>{id}</code>
              <small>{t.note}</small>
            </div>
          );
        })}
      </div>

      <h3 id="color">Colour tokens</h3>
      <div className="token-table-wrap">
        <table className="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {colorTokens.map(([token, role]) => (
              <tr key={token}>
                <td>
                  <code>{token}</code>
                </td>
                <td>{role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title" id="glass">
        Glass &amp; surfaces
      </h2>
      <p>
        One surface model replaces six card flavours. Pick the material with a prop; glass is a
        deliberate choice for floating navigation, media controls and overlays on imagery — not
        forms, tables, settings or dashboards.
      </p>
      <CodeBlock
        language="tsx"
        code={`<Card surface="default">…</Card>   // solid + hairline — everyday
<Card surface="raised">…</Card>    // focal object, subtle shadow + facet
<Card surface="subtle">…</Card>    // quiet grouping
<Card surface="sunken">…</Card>    // wells
<Card surface="glass">…</Card>     // translucent — over media only
<PageSection title="Accounts">…</PageSection>  // most sections need no card at all`}
      />

      <h2 className="section-title" id="typography">
        Typography
      </h2>
      <p>
        Inter for UI and data, JetBrains Mono for code (<code>@spatika/tokens/fonts.css</code>). Numbers
        people compare always use tabular figures.
      </p>
      <div className="token-table-wrap">
        <table className="token-table">
          <thead>
            <tr>
              <th>Utility</th>
              <th>Size / weight</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            {typeScale.map(([name, size, use]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>{size}</td>
                <td>{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title" id="density">
        Spacing &amp; density
      </h2>
      <p>
        Spacing follows a 4px scale. Control height, row height, cell padding and card padding are
        density tokens, so the same components work in a consumer app and an admin console.
      </p>
      <CodeBlock
        language="tsx"
        code={`<AppShell density="compact">…</AppShell>
<section data-density="compact">
  <DataTable … />   {/* 36px rows, tighter cells */}
</section>`}
      />

      <h2 className="section-title" id="motion">
        Motion
      </h2>
      <p>
        Quick and physical: 120ms for hover, 180ms for selection with a small spring, 260ms for
        entrances with a decelerating curve. Cards never levitate on hover. Under{" "}
        <code>prefers-reduced-motion</code> every movement collapses to a fade, and under{" "}
        <code>prefers-reduced-transparency</code> glass turns solid.
      </p>
    </article>
  );
}
