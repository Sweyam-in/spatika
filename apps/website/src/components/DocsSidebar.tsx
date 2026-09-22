import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Search, X } from "lucide-react";
import type { NavItem } from "@/data/navigation";

type NavGroup = { title: string; items: NavItem[] };

type DocsSidebarProps = {
  title: string;
  items?: NavItem[];
  groups?: NavGroup[];
};

function SidebarLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  if (item.to.includes("#")) {
    return <a href={item.to}>{item.label}</a>;
  }
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => (isActive ? "active" : undefined)}
      onClick={onNavigate}
    >
      {item.label}
    </NavLink>
  );
}

export function DocsSidebar({ title, items, groups }: DocsSidebarProps) {
  if (groups?.length) {
    return <GroupedSidebar title={title} groups={groups} />;
  }

  return (
    <aside className="docs-sidebar">
      <h4>{title}</h4>
      {items?.map((item) => (
        <SidebarLink key={item.to} item={item} />
      ))}
    </aside>
  );
}

function GroupedSidebar({ title, groups }: { title: string; groups: NavGroup[] }) {
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, "open" | "closed">>({});
  const [collapsedForPath, setCollapsedForPath] = useState(pathname);
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (collapsedForPath !== pathname) {
    setCollapsedForPath(pathname);
    setCollapsed({});
  }

  const normalized = query.trim().toLowerCase();
  const searching = normalized.length > 0;

  const visibleGroups = useMemo(() => {
    if (!searching) return groups;
    return groups
      .map((group) => {
        const titleMatch = group.title.toLowerCase().includes(normalized);
        return {
          ...group,
          items: titleMatch
            ? group.items
            : group.items.filter(
                (item) =>
                  item.label.toLowerCase().includes(normalized) ||
                  item.to.toLowerCase().includes(normalized),
              ),
        };
      })
      .filter((group) => group.items.length > 0);
  }, [groups, normalized, searching]);

  const matchCount = visibleGroups.reduce((sum, group) => sum + group.items.length, 0);
  const totalCount = groups.reduce((sum, group) => sum + group.items.length, 0);

  function isOpen(group: NavGroup) {
    if (searching) return true;
    const override = collapsed[group.title];
    if (override === "open") return true;
    if (override === "closed") return false;
    return group.items.some((item) => item.to === pathname);
  }

  function toggle(group: NavGroup) {
    const open = isOpen(group);
    setCollapsed((current) => ({
      ...current,
      [group.title]: open ? "closed" : "open",
    }));
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (target instanceof HTMLElement && target.isContentEditable) return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const active = scroller?.querySelector<HTMLElement>("a.active");
    if (!scroller || !active) return;
    const scrollerBox = scroller.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    if (activeBox.top < scrollerBox.top || activeBox.bottom > scrollerBox.bottom) {
      active.scrollIntoView({ block: "nearest" });
    }
  }, [pathname, searching, visibleGroups]);

  return (
    <aside className="docs-sidebar docs-sidebar--grouped">
      <div className="docs-sidebar-tools">
        <p className="docs-sidebar-kicker">
          {title}
          <span>{searching ? `${matchCount} of ${totalCount}` : totalCount}</span>
        </p>
        <label className="docs-sidebar-search">
          <Search size={14} aria-hidden />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("");
                searchRef.current?.blur();
              }
            }}
            placeholder="Find a component…"
            aria-label="Find a component"
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              className="docs-sidebar-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
            >
              <X size={14} />
            </button>
          ) : (
            <kbd>/</kbd>
          )}
        </label>
        <NavLink
          to="/components"
          end
          className={({ isActive }) => (isActive ? "docs-sidebar-all active" : "docs-sidebar-all")}
          onClick={() => setQuery("")}
        >
          All components
        </NavLink>
      </div>

      <div className="docs-sidebar-scroller" ref={scrollerRef}>
        {visibleGroups.length === 0 ? (
          <p className="docs-sidebar-empty">No components match “{query.trim()}”.</p>
        ) : (
          visibleGroups.map((group) => {
            const open = isOpen(group);
            const panelId = `docs-nav-${group.title.toLowerCase().replace(/\s+/g, "-")}`;
            const activeInGroup = group.items.some((item) => item.to === pathname);
            return (
              <div
                key={group.title}
                className="docs-nav-group"
                data-open={open ? "" : undefined}
                data-current={activeInGroup ? "" : undefined}
              >
                <button
                  type="button"
                  className="docs-nav-group-toggle"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggle(group)}
                >
                  <span>{group.title}</span>
                  <span className="docs-nav-group-count">{group.items.length}</span>
                  <ChevronDown size={14} aria-hidden />
                </button>
                {open ? (
                  <div id={panelId} role="group" aria-label={group.title}>
                    {group.items.map((item) => (
                      <SidebarLink key={item.to} item={item} onNavigate={() => setQuery("")} />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
