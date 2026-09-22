import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type SidebarNavItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  badge?: ReactNode;
};

export type SidebarNavSection = {
  id: string;
  title?: string;
  items: SidebarNavItem[];
};

export type AppSidebarProps = {
  brand?: ReactNode;
  sections: SidebarNavSection[];
  footer?: ReactNode;
  className?: string;
  /** Collapsed icon rail. */
  collapsed?: boolean;
  widthClassName?: string;
};

/**
 * Data-driven navigation sidebar. For composable shells prefer `AppShell` + `Sidebar` + `NavItem`.
 */
export function AppSidebar({
  brand,
  sections,
  footer,
  className,
  collapsed = false,
  widthClassName = "w-[var(--spk-sidebar-w)]",
}: AppSidebarProps) {
  return (
    <aside
      data-slot="app-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "flex h-full flex-col border-r border-line-subtle bg-canvas",
        collapsed ? "w-[var(--spk-sidebar-w-collapsed)]" : widthClassName,
        className,
      )}
    >
      {brand ? <div className={cn("flex h-[var(--spk-topbar-h)] shrink-0 items-center px-3", collapsed && "justify-center px-2")}>{brand}</div> : null}
      <nav aria-label="Primary" className={cn("flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-2", collapsed && "items-center")}>
        {sections.map((section) => (
          <div key={section.id} className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
            {section.title && !collapsed ? <p className="spk-nav-section-title">{section.title}</p> : null}
            <ul className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    {Icon ? <Icon aria-hidden /> : null}
                    {!collapsed ? <span className="spk-nav-item-label">{item.label}</span> : <span className="sr-only">{item.label}</span>}
                    {!collapsed && item.badge ? <span className="spk-nav-item-meta">{item.badge}</span> : null}
                  </>
                );
                const shared = {
                  className: "spk-nav-item",
                  "data-active": item.active ? "true" : undefined,
                  "data-collapsed": collapsed ? "true" : undefined,
                  "aria-current": item.active ? ("page" as const) : undefined,
                  title: collapsed ? item.label : undefined,
                  onClick: item.onClick,
                };
                return (
                  <li key={item.id} className={collapsed ? undefined : "w-full"}>
                    {item.href ? (
                      <a href={item.href} {...shared}>
                        {content}
                      </a>
                    ) : (
                      <button type="button" {...shared}>
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      {footer ? <div className={cn("shrink-0 border-t border-line-subtle p-2", collapsed && "flex justify-center")}>{footer}</div> : null}
    </aside>
  );
}
