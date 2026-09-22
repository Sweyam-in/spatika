import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "../primitives/Button";
import { appChromeActionClusterClass } from "./FloatingPageChrome";

export type AppHeaderProps = {
  brand?: ReactNode;
  title?: string;
  /** Center / search slot */
  children?: ReactNode;
  /** Right-side actions */
  actions?: ReactNode;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
  sticky?: boolean;
  /**
   * `sticky` — in-flow glass bar.
   * `chrome` — fixed safe-area app chrome (journalD RootLayout).
   */
  variant?: "sticky" | "chrome";
};

/**
 * Top application chrome — glass header with brand, optional hamburger, actions.
 */
export function AppHeader({
  brand,
  title,
  children,
  actions,
  onMenuClick,
  showMenuButton = false,
  className,
  sticky = true,
  variant = "sticky",
}: AppHeaderProps) {
  const isChrome = variant === "chrome";

  return (
    <header
      data-slot="app-header"
      className={cn(
        "glass-header z-40 border-b border-border/50",
        isChrome ? "app-chrome-header" : sticky && "sticky top-0",
        className,
      )}
    >
      <div className={cn("flex items-center gap-3 px-3 sm:px-4", isChrome ? "h-full" : "h-full min-h-14")}>
        {showMenuButton ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="size-5" />
          </Button>
        ) : null}
        <div className="flex min-w-0 items-center gap-2" data-app-wordmark>
          {brand}
          {title ? (
            <span className="truncate text-sm font-semibold tracking-tight sm:text-base">{title}</span>
          ) : null}
        </div>
        <div className="mx-auto hidden min-w-0 flex-1 justify-center md:flex" data-global-search-shell>
          {children}
        </div>
        <div
          className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2"
          data-app-chrome-actions
        >
          {actions}
        </div>
      </div>
      {children ? (
        <div className="border-t border-border/30 px-3 py-2 md:hidden" data-global-search-shell>
          {children}
        </div>
      ) : null}
    </header>
  );
}

export { appChromeActionClusterClass };
