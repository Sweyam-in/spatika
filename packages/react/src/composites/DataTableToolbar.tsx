import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { SearchField } from "./SearchField";

export type DataTableToolbarProps = {
  query?: string;
  onQueryChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
  hideSearch?: boolean;
};

/** Search + filter slot + actions row above data tables. */
export function DataTableToolbar({
  query = "",
  onQueryChange,
  searchPlaceholder = "Search…",
  filters,
  actions,
  className,
  hideSearch,
}: DataTableToolbarProps) {
  return (
    <div
      data-slot="data-table-toolbar"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {!hideSearch && onQueryChange ? (
          <SearchField
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            containerClassName="w-full sm:max-w-xs"
          />
        ) : null}
        {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
