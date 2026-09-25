import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ExternalLink, Github, Menu, Package, X } from "lucide-react";
import { SpatikaLogo } from "@/components/SpatikaLogo";
import { DocsSidebar } from "@/components/DocsSidebar";
import { topNav, type NavItem } from "@/data/navigation";
import { SITE } from "@/data/site";
import { ThemeToolbar } from "./ThemeToolbar";
import { DocsSearch } from "./DocsSearch";
import { VersionBanner, VersionSelector } from "./VersionSelector";

type DocsLayoutProps = {
  sidebar?: {
    title: string;
    items?: NavItem[];
    groups?: { title: string; items: NavItem[] }[];
  };
  /** When true, content is full-bleed (home hero). */
  wide?: boolean;
};

export function DocsLayout({ sidebar, wide }: DocsLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <NavLink to="/" className="site-logo" onClick={() => setMobileOpen(false)}>
            <SpatikaLogo size={32} className="site-logo-mark" />
            <span>{SITE.brand}</span>
          </NavLink>

          <nav className="site-nav" aria-label="Primary">
            {topNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header-actions">
            <DocsSearch />
            <VersionSelector />
            <ThemeToolbar />
            <a
              href={SITE.github}
              className="icon-link"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
            >
              <Github size={18} />
            </a>
            <a
              href={SITE.npmOrg}
              className="icon-link"
              target="_blank"
              rel="noreferrer"
              aria-label="npm packages"
            >
              <Package size={18} />
            </a>
            <a
              href={SITE.npmReact}
              className="icon-link"
              target="_blank"
              rel="noreferrer"
              aria-label="View on npm"
            >
              <ExternalLink size={18} />
            </a>
            <button
              type="button"
              className="icon-link mobile-nav-toggle"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav
          className={`mobile-nav-panel${mobileOpen ? " open" : ""}`}
          aria-label="Mobile"
          hidden={!mobileOpen}
        >
          {topNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : undefined)}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <VersionBanner />

      <div className="site-content">
        {sidebar ? (
          <div className="docs-layout">
            <DocsSidebar title={sidebar.title} items={sidebar.items} groups={sidebar.groups} />
            <main className="docs-main">
              <Outlet />
            </main>
          </div>
        ) : wide ? (
          <main>
            <Outlet />
          </main>
        ) : (
          <main className="page-narrow">
            <Outlet />
          </main>
        )}
      </div>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>
            {SITE.brand} · Open-source React design system · {SITE.license}
            {" · from "}
            <a href={SITE.sweyamUrl} target="_blank" rel="noreferrer">
              {SITE.sweyam}
            </a>
            {" · by "}
            <a href={SITE.authorUrl} target="_blank" rel="noreferrer">
              {SITE.author}
            </a>
          </span>
          <span>
            <a href={SITE.github}>GitHub</a>
            {" · "}
            <a href={SITE.sweyamUrl}>sweyam.com</a>
            {" · "}
            <a href={SITE.npmReact}>@spatika/react</a>
            {" · "}
            <a href={SITE.npmTokens}>@spatika/tokens</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
