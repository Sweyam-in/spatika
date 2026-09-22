import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/cn";

export type TableDensity = "compact" | "comfortable" | "spacious";

type TableProps = React.ComponentProps<"table"> & {
  containerClassName?: string;
  /** Row height / cell padding. Inherits `data-density` from ancestors when unset. */
  density?: TableDensity;
  /** Header sticks while the container scrolls (give the container a max-height). */
  stickyHeader?: boolean;
  /** Border + radius around the scroll container. */
  bordered?: boolean;
  /** Row hover highlight. */
  hover?: boolean;
  striped?: boolean;
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, density, stickyHeader, bordered, hover = true, striped, ...props }, ref) => (
    <div
      data-slot="table-container"
      data-density={density}
      data-bordered={bordered ? "true" : undefined}
      className={cn("spk-table-container", containerClassName)}
    >
      <table
        ref={ref}
        data-slot="table"
        data-sticky-header={stickyHeader ? "true" : undefined}
        data-hover={hover ? "true" : undefined}
        data-striped={striped ? "true" : undefined}
        className={cn("spk-table", className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<"thead">>(
  ({ className, ...props }, ref) => <thead ref={ref} data-slot="table-header" className={className} {...props} />,
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<"tbody">>(
  ({ className, ...props }, ref) => <tbody ref={ref} data-slot="table-body" className={className} {...props} />,
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<"tfoot">>(
  ({ className, ...props }, ref) => <tfoot ref={ref} data-slot="table-footer" className={className} {...props} />,
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.ComponentProps<"tr"> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <tr
    ref={ref}
    data-slot="table-row"
    data-state={selected ? "selected" : (props as { "data-state"?: string })["data-state"]}
    aria-selected={selected || undefined}
    data-clickable={props.onClick ? "true" : undefined}
    className={className}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export type SortDirection = "asc" | "desc" | false;

type TableHeadProps = React.ComponentProps<"th"> & {
  align?: "left" | "center" | "right";
  /** Right-aligns and uses tabular numerals. */
  numeric?: boolean;
  /** Current sort for this column. Pass `onSort` to make the header a sort button. */
  sortDirection?: SortDirection;
  onSort?: () => void;
};

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align, numeric, sortDirection, onSort, children, ...props }, ref) => {
    const sortable = typeof onSort === "function";
    const SortIcon = sortDirection === "asc" ? ArrowUp : sortDirection === "desc" ? ArrowDown : ChevronsUpDown;
    return (
      <th
        ref={ref}
        scope="col"
        data-slot="table-head"
        data-align={align}
        data-numeric={numeric ? "true" : undefined}
        aria-sort={
          sortable ? (sortDirection === "asc" ? "ascending" : sortDirection === "desc" ? "descending" : "none") : undefined
        }
        className={cn("[&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0", className)}
        {...props}
      >
        {sortable ? (
          <button
            type="button"
            className={cn("spk-table-sort", (align === "right" || numeric) && "flex-row-reverse")}
            data-sorted={sortDirection ? "true" : undefined}
            onClick={onSort}
          >
            {children}
            <SortIcon aria-hidden />
          </button>
        ) : (
          children
        )}
      </th>
    );
  },
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentProps<"td"> & { align?: "left" | "center" | "right"; numeric?: boolean; truncate?: boolean }
>(({ className, align, numeric, truncate, ...props }, ref) => (
  <td
    ref={ref}
    data-slot="table-cell"
    data-align={align}
    data-numeric={numeric ? "true" : undefined}
    data-truncate={truncate ? "true" : undefined}
    className={cn("[&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.ComponentProps<"caption">>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} data-slot="table-caption" className={cn("spk-table-caption", className)} {...props} />
  ),
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
