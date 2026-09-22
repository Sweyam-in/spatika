import * as React from "react";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "../primitives/Button";

export type PageStickyHeaderProps = React.ComponentProps<"div"> & {
  /** Offset below a fixed app bar (defaults to top-16 → --app-chrome-offset). */
  offsetClassName?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  count?: ReactNode;
  leading?: ReactNode;
  icon?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  /** Full-width row under the main toolbar (mobile search / secondary actions). */
  below?: ReactNode;
  belowClassName?: string;
  showBack?: boolean;
  onBack?: () => void;
  titleClassName?: string;
  subtitleClassName?: string;
  density?: "compact" | "comfortable";
  mobileSearch?: ReactNode;
};

export function PageHeaderBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[var(--spk-radius-sm)] border border-line bg-surface text-fg-secondary [&_svg]:size-4",
        className,
      )}
      aria-hidden
    >
      {children}
    </div>
  );
}

/**
 * Sticky glass page chrome — title, icon badge, search & action slots.
 * Matches journalD PageHeader (density, count, below row, page-header-* type).
 */
const PageStickyHeader = React.forwardRef<HTMLDivElement, PageStickyHeaderProps>(
  (
    {
      className,
      offsetClassName = "top-16",
      title,
      subtitle,
      count,
      leading,
      icon,
      search,
      actions,
      below,
      belowClassName,
      showBack,
      onBack,
      titleClassName,
      subtitleClassName,
      density = "compact",
      mobileSearch,
      children,
      ...props
    },
    ref,
  ) => {
    const shouldShowBack = showBack ?? Boolean(onBack);
    const belowRow = below ?? mobileSearch;

    return (
      <div
        ref={ref}
        data-slot="page-sticky-header"
        className={cn(
          "glass-header sticky z-30 shrink-0 border-b border-line-subtle",
          offsetClassName,
          className,
        )}
        {...props}
      >
        {children ?? (
          <div
            className={cn(
              "app-frame-pad",
              density === "comfortable" ? "py-2.5 sm:py-3" : "py-1.5 sm:py-2",
            )}
          >
            <div
              className={cn(
                "flex w-full min-w-0 items-center",
                density === "comfortable" ? "gap-2.5 sm:gap-3" : "gap-2",
              )}
            >
              {shouldShowBack ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-fg-secondary"
                  onClick={onBack}
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              ) : null}
              {leading}
              {icon ? <PageHeaderBadge>{icon}</PageHeaderBadge> : null}
              {(title || subtitle || count != null) && (
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    {title ? (
                      <h1 className={cn("page-header-title", titleClassName ?? "truncate")}>
                        {title}
                      </h1>
                    ) : null}
                    {count != null && count !== false ? (
                      typeof count === "string" || typeof count === "number" ? (
                        <span className="page-header-count">{count}</span>
                      ) : (
                        count
                      )
                    ) : null}
                  </div>
                  {subtitle ? (
                    <div className={cn("page-header-subtitle mt-0.5 truncate", subtitleClassName)}>
                      {subtitle}
                    </div>
                  ) : null}
                </div>
              )}
              {search ? (
                <div className="hidden min-w-0 flex-1 md:block md:max-w-xs lg:max-w-sm">{search}</div>
              ) : null}
              {actions ? (
                <div className="ml-auto flex shrink-0 items-center gap-1.5">{actions}</div>
              ) : null}
            </div>
            {belowRow ? <div className={cn("mt-2", belowClassName)}>{belowRow}</div> : null}
          </div>
        )}
      </div>
    );
  },
);
PageStickyHeader.displayName = "PageStickyHeader";

export { PageStickyHeader };
