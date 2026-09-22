import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export const SHOWCASE_SCREENS = [
  {
    to: "/showcase/finance",
    title: "Finance dashboard",
    body: "Kasho — net worth, accounts, cash flow, spending, transactions and goals. Consumer density with a bottom bar on phones.",
    art: "finance",
  },
  {
    to: "/showcase/admin",
    title: "SaaS admin",
    body: "Sweyam Cloud — KPIs, MRR movement, an activity feed and a customers table with filters, pinned columns and bulk actions.",
    art: "admin",
  },
  {
    to: "/showcase/landing",
    title: "Marketing landing page",
    body: "Spatika UI — hero, bento, pricing, testimonials, FAQ and a closing CTA. A whole landing page with no bespoke CSS.",
    art: "landing",
  },
  {
    to: "/showcase/workspace",
    title: "Productivity workspace",
    body: "Atlas — sidebar, ⌘K palette, a project doc in the editor, grouped tasks and a week calendar.",
    art: "workspace",
  },
] as const;

/** Tiny schematic of each screen — drawn with tokens so it follows the theme. */
export function ScreenArt({ kind }: { kind: (typeof SHOWCASE_SCREENS)[number]["art"] }) {
  return (
    <div className="home-screen-art" aria-hidden>
      <i />
      <div>
        <svg viewBox="0 0 120 10" preserveAspectRatio="none">
          <rect width="38" height="6" rx="2" fill="var(--spk-text-primary)" opacity="0.8" />
          <rect x="92" width="28" height="6" rx="2" fill="var(--spk-accent)" />
        </svg>
        <svg viewBox="0 0 120 60" preserveAspectRatio="none">
          {kind === "landing" ? (
            <>
              <rect x="18" y="4" width="84" height="9" rx="3" fill="var(--spk-text-primary)" opacity="0.8" />
              <rect x="34" y="18" width="52" height="5" rx="2.5" fill="var(--spk-text-secondary)" opacity="0.45" />
              <rect x="42" y="28" width="16" height="7" rx="3" fill="var(--spk-accent)" />
              <rect x="62" y="28" width="16" height="7" rx="3" fill="none" stroke="var(--spk-border-strong)" />
              {[0, 1, 2].map((i) => (
                <rect key={i} x={i * 40 + 3} y="44" width="34" height="14" rx="3" fill="var(--spk-surface-subtle)" stroke="var(--spk-border-subtle)" />
              ))}
            </>
          ) : kind === "finance" ? (
            <>
              <path d="M0 48 L15 44 L30 46 L45 36 L60 38 L75 28 L90 24 L105 18 L120 10 L120 60 L0 60 Z" fill="var(--spk-accent)" opacity="0.12" />
              <path d="M0 48 L15 44 L30 46 L45 36 L60 38 L75 28 L90 24 L105 18 L120 10" fill="none" stroke="var(--spk-accent)" strokeWidth="1.5" />
            </>
          ) : kind === "admin" ? (
            <>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect key={i} x={i * 20 + 3} y={36 - i * 4} width="12" height={22 + i * 4} rx="1.5" fill={i % 2 ? "var(--spk-viz-2)" : "var(--spk-viz-1)"} opacity="0.85" />
              ))}
            </>
          ) : (
            <>
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <rect x="2" y={i * 12 + 2} width="7" height="7" rx="1.5" fill="none" stroke="var(--spk-border-strong)" />
                  <rect x="14" y={i * 12 + 4} width={40 + ((i * 17) % 50)} height="3.5" rx="1.5" fill="var(--spk-text-secondary)" opacity="0.5" />
                </g>
              ))}
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

export function ShowcaseIndexPage() {
  return (
    <div className="home-wrap showcase-index">
      <p className="home-kicker">Showcase</p>
      <h1 className="page-title">Complete screens, built only with Spatika</h1>
      <p className="page-lead">
        Each screen is a full application frame — <code>AppShell</code>, sidebar, top bar, ⌘K palette,
        tables, metrics and charts — with no custom component styling. Switch themes from the user
        menu or the palette, and resize the window to see the mobile transformations.
      </p>
      <div className="home-screens" style={{ marginTop: "2rem" }}>
        {SHOWCASE_SCREENS.map((screen) => (
          <Link key={screen.to} to={screen.to} className="home-screen">
            <ScreenArt kind={screen.art} />
            <h3>
              {screen.title}
              <ArrowUpRight aria-hidden />
            </h3>
            <p>{screen.body}</p>
          </Link>
        ))}
      </div>
      <p className="screen-muted" style={{ marginTop: "2rem" }}>
        The 1.x CRM demo is still available at <Link to="/showcase/relay">/showcase/relay</Link>.
      </p>
    </div>
  );
}
