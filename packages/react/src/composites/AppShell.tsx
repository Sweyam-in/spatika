import * as React from "react";
import type { ReactNode } from "react";
import { Check, ChevronsUpDown, PanelLeft, Plus, Search } from "lucide-react";
import { cn } from "../lib/cn";
import { Slot } from "../lib/slot";
import { getInitials } from "../lib/avatar-utils";
import { Sheet, SheetContent } from "../primitives/Sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "../primitives/Tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../primitives/Avatar";
import { Kbd } from "../primitives/Kbd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../primitives/DropdownMenu";

/* ─── Context ───────────────────────────────────────────────────────────── */

type AppShellContextValue = {
  /** Desktop rail collapsed. */
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
  /** Mobile navigation sheet open. */
  mobileOpen: boolean;
  setMobileOpen: (next: boolean) => void;
  /** Collapse on desktop, open the sheet on smaller screens. */
  toggleSidebar: () => void;
  /** True while rendering inside the mobile sheet. */
  inSheet: boolean;
};

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

/** Shell state for custom controls. Returns `null` outside an `AppShell`. */
export function useAppShell() {
  return React.useContext(AppShellContext);
}

const DESKTOP_QUERY = {
  lg: "(min-width: 1024px)",
  md: "(min-width: 768px)",
} as const;

function isDesktopViewport(breakpoint: keyof typeof DESKTOP_QUERY) {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(DESKTOP_QUERY[breakpoint]).matches
  );
}

/* ─── AppShell ──────────────────────────────────────────────────────────── */

export type AppShellProps = {
  /** Usually a `<Sidebar>`. Rendered as a rail from `mobileNavBreakpoint` up, and inside a sheet below. */
  sidebar?: ReactNode;
  /** Usually a `<TopBar>`. */
  topbar?: ReactNode;
  /** Bottom navigation for phones (e.g. `MobileTabBar`). */
  mobileNav?: ReactNode;
  children: ReactNode;
  /**
   * `inset` — content sits on a raised panel beside the sidebar (the Spatika default).
   * `flush` — sidebar and content share the canvas, separated by a hairline.
   */
  layout?: "inset" | "flush";
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
  /** Region density — `compact` suits admin consoles and data tools. */
  density?: "compact" | "comfortable";
  /**
   * Width at which the real sidebar takes over from the bottom bar + drawer.
   * `lg` (default, 1024px) — unchanged, matches existing shells.
   * `md` (768px) — tablets get the persistent sidebar; only phones (<768px) see `mobileNav`.
   */
  mobileNavBreakpoint?: "md" | "lg";
};

/**
 * Application frame: sidebar + top bar + content, with intentional mobile behaviour —
 * the sidebar becomes a sheet, and an optional bottom bar takes over primary navigation.
 */
export function AppShell({
  sidebar,
  topbar,
  mobileNav,
  children,
  layout = "inset",
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  className,
  density,
  mobileNavBreakpoint = "lg",
}: AppShellProps) {
  const [innerCollapsed, setInnerCollapsed] = React.useState(defaultCollapsed);
  const collapsed = collapsedProp ?? innerCollapsed;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const setCollapsed = React.useCallback(
    (next: boolean) => {
      if (collapsedProp === undefined) setInnerCollapsed(next);
      onCollapsedChange?.(next);
    },
    [collapsedProp, onCollapsedChange],
  );

  const value = React.useMemo<AppShellContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      mobileOpen,
      setMobileOpen,
      toggleSidebar: () =>
        isDesktopViewport(mobileNavBreakpoint) ? setCollapsed(!collapsed) : setMobileOpen(!mobileOpen),
      inSheet: false,
    }),
    [collapsed, setCollapsed, mobileOpen, mobileNavBreakpoint],
  );

  const sheetValue = React.useMemo<AppShellContextValue>(
    () => ({ ...value, collapsed: false, inSheet: true }),
    [value],
  );

  return (
    <AppShellContext.Provider value={value}>
      <div
        data-slot="app-shell"
        data-layout={layout}
        data-collapsed={collapsed ? "true" : "false"}
        data-density={density}
        data-mobile-nav-bp={mobileNavBreakpoint}
        className={cn("spk-app-shell", mobileNav && "spk-app-shell--mobile-nav", className)}
      >
        <a href="#spk-main" className="spk-skip-link">
          Skip to content
        </a>
        {sidebar ? <div className="spk-app-sidebar">{sidebar}</div> : null}
        <div className="spk-app-main">
          {topbar}
          <main id="spk-main" tabIndex={-1} className="spk-app-content">
            {children}
          </main>
        </div>
        {sidebar ? (
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent
              side="left"
              hideClose
              className={cn(
                "w-[min(18rem,calc(100vw-3rem))] gap-0 p-0",
                mobileNavBreakpoint === "md" ? "md:hidden" : "lg:hidden",
              )}
            >
              <AppShellContext.Provider value={sheetValue}>{sidebar}</AppShellContext.Provider>
            </SheetContent>
          </Sheet>
        ) : null}
        {mobileNav ? (
          <div className={mobileNavBreakpoint === "md" ? "md:hidden" : "lg:hidden"}>{mobileNav}</div>
        ) : null}
      </div>
    </AppShellContext.Provider>
  );
}

/* ─── Sidebar ───────────────────────────────────────────────────────────── */

export type SidebarProps = {
  /** Top slot — `WorkspaceSwitcher` or a brand mark. */
  header?: ReactNode;
  /** Bottom slot — `UserMenu`, help, settings. */
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

export function Sidebar({ header, footer, children, className, "aria-label": ariaLabel = "Main" }: SidebarProps) {
  const shell = useAppShell();
  const collapsed = shell?.collapsed ?? false;
  return (
    <div data-slot="sidebar" data-collapsed={collapsed ? "true" : "false"} className={cn("spk-sidebar", className)}>
      {header ? <div className="spk-sidebar-header">{header}</div> : null}
      <nav aria-label={ariaLabel} className="spk-sidebar-body">
        {children}
      </nav>
      {footer ? <div className="spk-sidebar-footer">{footer}</div> : null}
    </div>
  );
}

export type NavSectionProps = {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Trailing action on the section title (add, filter). */
  action?: ReactNode;
};

export function NavSection({ title, children, className, action }: NavSectionProps) {
  const shell = useAppShell();
  const collapsed = shell?.collapsed ?? false;
  const id = React.useId();
  return (
    <div data-slot="nav-section" className={cn("flex flex-col gap-px", className)}>
      {title && !collapsed ? (
        <div className="spk-nav-section-title justify-between">
          <span id={id}>{title}</span>
          {action}
        </div>
      ) : null}
      <ul aria-labelledby={title && !collapsed ? id : undefined} className="flex flex-col gap-px">
        {children}
      </ul>
    </div>
  );
}

export type NavItemProps = Omit<React.ComponentPropsWithoutRef<"button">, "children"> & {
  icon?: ReactNode;
  label: ReactNode;
  active?: boolean;
  /** Count or badge after the label. */
  meta?: ReactNode;
  /** Link target — renders an `<a>`. For router links use `asChild`. */
  href?: string;
  /** Render the child element (e.g. a router `Link`) with nav-item styling. */
  asChild?: boolean;
  children?: React.ReactElement;
};

/** Sidebar navigation row with the prism-rail active state. Collapses to an icon with tooltip. */
export const NavItem = React.forwardRef<HTMLButtonElement, NavItemProps>(function NavItem(
  { icon, label, active, meta, href, asChild, children, className, onClick, ...props },
  ref,
) {
  const shell = useAppShell();
  const collapsed = shell?.collapsed ?? false;
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (shell?.inSheet && !event.defaultPrevented) shell.setMobileOpen(false);
  };

  const content = (
    <>
      {icon}
      {collapsed ? <span className="sr-only">{label}</span> : <span className="spk-nav-item-label">{label}</span>}
      {!collapsed && meta != null ? <span className="spk-nav-item-meta">{meta}</span> : null}
    </>
  );

  const shared = {
    className: cn("spk-nav-item", className),
    "data-active": active ? "true" : undefined,
    "data-collapsed": collapsed ? "true" : undefined,
    "aria-current": active ? ("page" as const) : undefined,
  };

  let element: React.ReactElement;
  if (asChild && children) {
    element = (
      <Slot ref={ref as React.Ref<HTMLElement>} {...shared} onClick={handleClick as unknown as React.MouseEventHandler<HTMLElement>}>
        {React.cloneElement(children, undefined, content)}
      </Slot>
    );
  } else if (href) {
    element = (
      <a href={href} {...shared} onClick={handleClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}>
        {content}
      </a>
    );
  } else {
    element = (
      <button ref={ref} type="button" {...shared} onClick={handleClick} {...props}>
        {content}
      </button>
    );
  }

  return (
    <li className="list-none">
      {collapsed ? (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>{element}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      ) : (
        element
      )}
    </li>
  );
});

/* ─── TopBar ────────────────────────────────────────────────────────────── */

export type TopBarProps = {
  /** Page title or breadcrumb. */
  title?: ReactNode;
  /** Replaces the automatic sidebar toggle. */
  leading?: ReactNode;
  /** Middle slot — usually a `SearchTrigger`. */
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Hide the sidebar toggle (e.g. when the page has no sidebar). */
  hideSidebarToggle?: boolean;
};

export function TopBar({ title, leading, children, actions, className, hideSidebarToggle }: TopBarProps) {
  const shell = useAppShell();
  return (
    <header data-slot="top-bar" className={cn("spk-topbar", className)}>
      {leading ??
        (shell && !hideSidebarToggle ? (
          <button
            type="button"
            className="spk-btn spk-btn--ghost spk-btn--icon-sm -ml-1 text-fg-secondary hover:text-fg"
            aria-label={shell.collapsed ? "Expand sidebar" : "Toggle sidebar"}
            onClick={shell.toggleSidebar}
          >
            <PanelLeft className="size-4" />
          </button>
        ) : null)}
      {title ? <div className="flex min-w-0 items-center gap-2 text-body font-medium text-fg">{title}</div> : null}
      <div className="flex min-w-0 flex-1 items-center justify-center">{children}</div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </header>
  );
}

/* ─── SearchTrigger ─────────────────────────────────────────────────────── */

export type SearchTriggerProps = Omit<React.ComponentPropsWithoutRef<"button">, "children"> & {
  placeholder?: string;
  /** Opens the palette. Also fired by the ⌘K / Ctrl+K hotkey when `hotkey` is on. */
  onOpen: () => void;
  hotkey?: boolean;
};

/** Field-shaped button that opens a command palette. */
export function SearchTrigger({ placeholder = "Search…", onOpen, hotkey = true, className, ...props }: SearchTriggerProps) {
  const [mac, setMac] = React.useState(true);
  React.useEffect(() => {
    setMac(typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);
  React.useEffect(() => {
    if (!hotkey) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hotkey, onOpen]);

  return (
    <button
      type="button"
      data-slot="search-trigger"
      aria-label={placeholder}
      aria-keyshortcuts={hotkey ? (mac ? "Meta+K" : "Control+K") : undefined}
      className={cn(
        "spk-field spk-field--sm w-full max-w-[26rem] cursor-pointer gap-2 bg-surface-subtle text-fg-tertiary shadow-none hover:text-fg-secondary",
        className,
      )}
      onClick={onOpen}
      {...props}
    >
      <Search className="size-3.5 shrink-0" aria-hidden />
      <span className="flex-1 truncate text-left">{placeholder}</span>
      {hotkey ? <Kbd className="max-sm:hidden">{mac ? "⌘K" : "Ctrl K"}</Kbd> : null}
    </button>
  );
}

/* ─── WorkspaceSwitcher ─────────────────────────────────────────────────── */

export type Workspace = { id: string; name: string; description?: string; logo?: ReactNode };

export type WorkspaceSwitcherProps = {
  workspaces: Workspace[];
  value: string;
  onValueChange: (id: string) => void;
  onCreate?: () => void;
  createLabel?: string;
  className?: string;
};

function WorkspaceMark({ workspace, size = "md" }: { workspace?: Workspace; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[var(--spk-radius-sm)] bg-accent-solid font-semibold text-primary-foreground shadow-[var(--spk-facet-strong)]",
        size === "md" ? "size-6 text-caption" : "size-5 text-[0.625rem]",
      )}
    >
      {workspace?.logo ?? getInitials(workspace?.name ?? "").slice(0, 1)}
    </span>
  );
}

export function WorkspaceSwitcher({
  workspaces,
  value,
  onValueChange,
  onCreate,
  createLabel = "New workspace",
  className,
}: WorkspaceSwitcherProps) {
  const shell = useAppShell();
  const collapsed = shell?.collapsed ?? false;
  const current = workspaces.find((w) => w.id === value) ?? workspaces[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-slot="workspace-switcher"
          aria-label={`Workspace: ${current?.name ?? ""}`}
          className={cn("spk-nav-item text-fg before:hidden", collapsed && "justify-center", className)}
          data-collapsed={collapsed ? "true" : undefined}
        >
          <WorkspaceMark workspace={current} />
          {!collapsed ? (
            <>
              <span className="spk-nav-item-label font-semibold">{current?.name}</span>
              <ChevronsUpDown className="ml-auto size-3.5" aria-hidden />
            </>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem key={workspace.id} onSelect={() => onValueChange(workspace.id)}>
            <WorkspaceMark workspace={workspace} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate">{workspace.name}</span>
              {workspace.description ? <span className="block truncate text-caption text-fg-tertiary">{workspace.description}</span> : null}
            </span>
            {workspace.id === current?.id ? <Check className="size-4 text-accent-text" aria-hidden /> : null}
          </DropdownMenuItem>
        ))}
        {onCreate ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onCreate}>
              <Plus aria-hidden />
              {createLabel}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── UserMenu ──────────────────────────────────────────────────────────── */

export type UserMenuProps = {
  name: string;
  email?: string;
  avatarSrc?: string;
  /** `DropdownMenuItem`s rendered in the menu. */
  children?: ReactNode;
  className?: string;
  /** `row` shows name + email (sidebar footer); `avatar` shows only the avatar (top bar). */
  variant?: "row" | "avatar";
};

export function UserMenu({ name, email, avatarSrc, children, className, variant = "row" }: UserMenuProps) {
  const shell = useAppShell();
  const compact = variant === "avatar" || (shell?.collapsed ?? false);
  const avatar = (
    <Avatar size="sm">
      {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
      <AvatarFallback className="text-[0.625rem]">{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-slot="user-menu"
          aria-label={`Account: ${name}`}
          data-collapsed={compact ? "true" : undefined}
          className={cn(
            variant === "avatar" ? "spk-btn spk-btn--ghost spk-btn--icon rounded-full" : "spk-nav-item before:hidden",
            className,
          )}
        >
          {avatar}
          {!compact ? (
            <span className="min-w-0 flex-1 text-left leading-tight">
              <span className="block truncate text-body font-medium text-fg">{name}</span>
              {email ? <span className="block truncate text-caption text-fg-tertiary">{email}</span> : null}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "avatar" ? "end" : "start"} side={variant === "avatar" ? "bottom" : "top"} className="w-60">
        <div className="px-2 pt-1.5 pb-2">
          <p className="truncate text-body font-medium text-fg">{name}</p>
          {email ? <p className="truncate text-caption text-fg-tertiary">{email}</p> : null}
        </div>
        <DropdownMenuSeparator />
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
