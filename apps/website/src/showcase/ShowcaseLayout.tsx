import { useMemo, useState, type FormEvent } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppHeader,
  AppSidebar,
  Button,
  HeaderIconButton,
  MobileTabBar,
  NotificationBell,
  PageShell,
  QuickSettings,
  QuickSettingsGroup,
  SearchField,
  THEME_IDS,
  THEME_LABELS,
  Toaster,
  useSpatikaTheme,
} from "@spatika/react";
import {
  ArrowLeft,
  LayoutDashboard,
  Megaphone,
  SlidersHorizontal,
  TrendingUp,
  Users,
} from "lucide-react";
import { NOTIFICATIONS } from "./data";

const NAV = [
  { id: "home", label: "Home", to: "/showcase/relay", icon: LayoutDashboard },
  { id: "leads", label: "Leads", to: "/showcase/relay/leads", icon: Users },
  { id: "campaigns", label: "Campaigns", to: "/showcase/relay/campaigns", icon: Megaphone },
  { id: "insights", label: "Insights", to: "/showcase/relay/insights", icon: TrendingUp },
] as const;

function pathActive(pathname: string, to: string) {
  if (to === "/showcase/relay") return pathname === "/showcase/relay" || pathname === "/showcase/relay/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function ShowcaseLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useSpatikaTheme();
  const [query, setQuery] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const notifications = useMemo(
    () =>
      NOTIFICATIONS.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        createdAtLabel: item.createdAtLabel,
        isRead: false,
        onOpen: () => {
          setBellOpen(false);
          if (item.leadId) navigate(`/showcase/relay/leads/${item.leadId}`);
          else navigate("/showcase/relay/campaigns");
        },
      })),
    [navigate],
  );

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    navigate(next ? `/showcase/relay/leads?q=${encodeURIComponent(next)}` : "/showcase/relay/leads");
  }

  return (
    <Toaster position="top-right">
      <div className="relay-root">
        <AppHeader
          variant="chrome"
          brand={
            <Link to="/showcase/relay" className="relay-brand">
              <span className="relay-brand-mark" aria-hidden>
                R
              </span>
              <span className="relay-brand-copy">
                <strong>Relay</strong>
                <span>Leads</span>
              </span>
            </Link>
          }
          actions={
            <div className="relay-header-cluster">
              <HeaderIconButton
                aria-label="Quick settings"
                active={settingsOpen}
                onClick={() => setSettingsOpen(true)}
              >
                <SlidersHorizontal />
              </HeaderIconButton>
              <NotificationBell
                unreadCount={notifications.length}
                items={notifications}
                open={bellOpen}
                onOpenChange={setBellOpen}
              />
            </div>
          }
        >
          <form className="relay-search" onSubmit={submitSearch}>
            <SearchField
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search leads, companies…"
              aria-label="Search leads"
              containerClassName="relay-search"
            />
          </form>
        </AppHeader>

        <div className="relay-sidebar">
          <AppSidebar
            widthClassName="relay-sidebar-width"
            sections={[
              {
                id: "workspace",
                items: NAV.map((item) => ({
                  id: item.id,
                  label: item.label,
                  icon: item.icon,
                  active: pathActive(location.pathname, item.to),
                  onClick: () => navigate(item.to),
                })),
              },
            ]}
            footer={
              <Link to="/" className="relay-docs-link">
                <ArrowLeft size={14} />
                Spatika docs
              </Link>
            }
          />
        </div>

        <div className="app-chrome-main relay-main">
          <PageShell padded={false}>
            <Outlet />
          </PageShell>
        </div>

        <MobileTabBar
          items={NAV.map((item) => ({
            id: item.id,
            label: item.label,
            icon: item.icon,
            active: pathActive(location.pathname, item.to),
            onClick: () => navigate(item.to),
          }))}
        />

        <QuickSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          title="Quick settings"
          description="This is a demo workspace built with Spatika."
        >
          <p className="relay-settings-copy">
            Switch themes the same way a product app would — tokens update chrome, glass, and
            surfaces together.
          </p>
          <QuickSettingsGroup title="Appearance">
            <div className="relay-theme-picker" role="group" aria-label="Theme">
              {THEME_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={theme === id ? "active" : undefined}
                  onClick={() => setTheme(id)}
                >
                  {THEME_LABELS[id]}
                </button>
              ))}
            </div>
          </QuickSettingsGroup>
          <Button asChild variant="outline">
            <Link to="/" onClick={() => setSettingsOpen(false)}>
              <ArrowLeft size={14} />
              Back to docs
            </Link>
          </Button>
        </QuickSettings>
      </div>
    </Toaster>
  );
}
