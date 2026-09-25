import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type MobileTabItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  badge?: ReactNode;
};

/** Main-content padding that clears the floating bar until the desktop sidebar takes over. */
export const APP_TABBAR_CLEARANCE_CLASS = "app-tabbar-clearance lg:pb-6";

export type MobileTabBarProps = {
  items: MobileTabItem[];
  className?: string;
  /** Extra trailing control (e.g. More) */
  trailing?: ReactNode;
  ariaLabel?: string;
  /** Slide the bar away (e.g. while a text field is focused on iOS). */
  hidden?: boolean;
  /**
   * Position inside a parent instead of the viewport, and keep the bar visible
   * on large screens (docs previews, device frames).
   */
  contained?: boolean;
};

/**
 * Floating bottom navigation for phones. One of the places Spatika uses translucent
 * material: it floats over scrolling content. Hidden from `lg` up, where the sidebar takes over.
 */
export function MobileTabBar({
  items,
  className,
  trailing,
  ariaLabel = "Primary",
  hidden = false,
  contained = false,
}: MobileTabBarProps) {
  return (
    <div
      data-slot="mobile-tab-bar"
      aria-hidden={hidden || undefined}
      data-mobile-tabbar-hidden={hidden ? "true" : undefined}
      className={cn(
        "pointer-events-none z-50 flex justify-center",
        contained ? "absolute inset-x-0 bottom-0" : "fixed inset-x-0 bottom-0 lg:hidden",
        "transition-[opacity,transform] duration-[var(--spk-duration-slow)] ease-[var(--spk-ease-standard)] motion-reduce:transition-none",
        hidden && "translate-y-[calc(100%+var(--app-tabbar-inset-y)+env(safe-area-inset-bottom,0px))] opacity-0",
        className,
      )}
    >
      <div
        data-app-tabbar-shell
        className={cn(
          "rounded-[var(--spk-radius-lg)]",
          contained
            ? "mb-2 w-[calc(100%-1rem)] max-w-[26rem]"
            : "mb-[calc(var(--app-tabbar-inset-y)+env(safe-area-inset-bottom,0px))] w-[calc(100%-2*var(--app-tabbar-inset-x))] max-w-[26rem]",
          hidden ? "pointer-events-none" : "pointer-events-auto",
        )}
      >
        <nav
          data-app-tabbar
          aria-label={ariaLabel}
          className="glass-tabbar flex h-[var(--app-tabbar-height)] items-stretch gap-0.5 p-1"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const classNameItem = cn(
              "group/tab relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[var(--spk-radius-md)] px-1",
              "touch-manipulation select-none outline-none transition-colors duration-[var(--spk-duration-fast)]",
              "focus-visible:shadow-[var(--spk-focus-ring)]",
              // Secondary, not tertiary: the bar is translucent, so labels need headroom over content behind it.
              item.active ? "text-fg" : "text-fg-secondary hover:text-fg",
            );
            const body = (
              <>
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 left-1/2 h-0.5 -translate-x-1/2 rounded-b-full bg-accent-solid transition-[width] duration-[var(--spk-duration-base)] ease-[var(--spk-ease-spring)]",
                    item.active ? "w-4" : "w-0",
                  )}
                />
                <span className="relative">
                  <Icon
                    className={cn("size-5 shrink-0", item.active && "text-accent-text")}
                    strokeWidth={item.active ? 2.1 : 1.8}
                    aria-hidden
                  />
                  {item.badge}
                </span>
                <span className={cn("max-w-full truncate text-[0.6875rem] leading-none", item.active ? "font-semibold" : "font-medium")}>
                  {item.label}
                </span>
              </>
            );
            return item.href ? (
              <a
                key={item.id}
                href={item.href}
                className={classNameItem}
                onClick={item.onClick}
                aria-current={item.active ? "page" : undefined}
              >
                {body}
              </a>
            ) : (
              <button
                key={item.id}
                type="button"
                className={classNameItem}
                onClick={item.onClick}
                aria-current={item.active ? "page" : undefined}
              >
                {body}
              </button>
            );
          })}
          {trailing}
        </nav>
      </div>
    </div>
  );
}
