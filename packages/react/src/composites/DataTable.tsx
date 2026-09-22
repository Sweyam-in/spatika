import * as React from "react";
import type { ReactNode } from "react";
import { ChevronRight, X } from "lucide-react";
import { cn } from "../lib/cn";
import { Checkbox } from "../primitives/Checkbox";
import { Skeleton } from "../primitives/Skeleton";
import { TableHead, type SortDirection, type TableDensity } from "../primitives/Table";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Breakpoint = "sm" | "md" | "lg" | "xl";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  /** Value for sorting and default rendering. */
  accessor?: (row: T) => string | number | Date | boolean | null | undefined;
  /** Custom cell. Falls back to the accessor value. */
  cell?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  align?: "left" | "center" | "right";
  /** Right-aligned tabular numerals. */
  numeric?: boolean;
  /** Width in px (required for columns after the first pinned one). */
  width?: number;
  minWidth?: number;
  pin?: "left" | "right";
  truncate?: boolean;
  /** Hide the column below a breakpoint (desktop table only). */
  hideBelow?: Breakpoint;
  /** Role in the stacked phone list. Defaults: first column → title, numeric → meta, others hidden. */
  mobile?: "title" | "subtitle" | "meta" | "hidden";
  headerClassName?: string;
  cellClassName?: string;
};

export type DataTableSort = { id: string; direction: "asc" | "desc" } | null;

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T, index: number) => string;
  /** Accessible name for the table. */
  "aria-label"?: string;
  caption?: ReactNode;
  density?: TableDensity;
  stickyHeader?: boolean;
  /** Scroll height for the body (enables sticky header scrolling). */
  maxHeight?: number | string;
  bordered?: boolean;
  /* selection */
  selectable?: boolean;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  /** Rendered in the bar that replaces the toolbar while rows are selected. */
  bulkActions?: (selected: T[], clear: () => void) => ReactNode;
  /* sorting */
  sort?: DataTableSort;
  defaultSort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  /** Sorting happens outside (server). */
  manualSort?: boolean;
  /* rows */
  renderExpanded?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  /** Inline actions revealed on row hover / focus (always visible on touch). */
  rowActions?: (row: T) => ReactNode;
  /* states */
  loading?: boolean;
  loadingRows?: number;
  empty?: ReactNode;
  /* pagination */
  pageSize?: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Total rows when paginating on the server. */
  totalRows?: number;
  /* chrome */
  toolbar?: ReactNode;
  /** `list` (default) stacks rows into a list on phones; `scroll` keeps the table with horizontal scroll. */
  responsive?: "list" | "scroll";
  className?: string;
};

/* ─── Helpers ───────────────────────────────────────────────────────────── */

const hideClass: Record<Breakpoint, string> = {
  sm: "max-sm:hidden",
  md: "max-md:hidden",
  lg: "max-lg:hidden",
  xl: "max-xl:hidden",
};

const SELECT_W = 40;
const EXPAND_W = 36;

function useControlled<V>(prop: V | undefined, initial: V, onChange?: (value: V) => void) {
  const [inner, setInner] = React.useState(initial);
  const value = prop !== undefined ? prop : inner;
  const set = React.useCallback(
    (next: V) => {
      if (prop === undefined) setInner(next);
      onChange?.(next);
    },
    [prop, onChange],
  );
  return [value, set] as const;
}

function compareValues(a: unknown, b: unknown) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

function renderValue(value: unknown): ReactNode {
  if (value == null) return <span className="text-fg-tertiary">—</span>;
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("button, a, input, select, textarea, [role=checkbox], [data-row-action]"));
}

/* ─── DataTable ─────────────────────────────────────────────────────────── */

/**
 * Professional data table: density, sorting, selection with bulk actions, pinned columns,
 * sticky header, expandable rows, inline actions, pagination, loading / empty states,
 * and a stacked list layout on phones. Rows stay rows — never cards.
 */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  "aria-label": ariaLabel,
  caption,
  density,
  stickyHeader = true,
  maxHeight,
  bordered = true,
  selectable = false,
  selectedIds: selectedProp,
  defaultSelectedIds = [],
  onSelectedIdsChange,
  bulkActions,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  manualSort = false,
  renderExpanded,
  onRowClick,
  rowActions,
  loading = false,
  loadingRows = 5,
  empty,
  pageSize,
  page: pageProp,
  defaultPage = 0,
  onPageChange,
  totalRows,
  toolbar,
  responsive = "list",
  className,
}: DataTableProps<T>) {
  const [selected, setSelected] = useControlled(selectedProp, defaultSelectedIds, onSelectedIdsChange);
  const [sort, setSort] = useControlled<DataTableSort>(sortProp, defaultSort, onSortChange);
  const [page, setPage] = useControlled(pageProp, defaultPage, onPageChange);
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());
  const [scroll, setScroll] = React.useState({ x: false, end: true });
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const sorted = React.useMemo(() => {
    if (manualSort || !sort) return data;
    const column = columns.find((c) => c.id === sort.id);
    if (!column) return data;
    const dir = sort.direction === "asc" ? 1 : -1;
    const cmp = column.sortFn ?? ((a: T, b: T) => compareValues(column.accessor?.(a), column.accessor?.(b)));
    return [...data].sort((a, b) => cmp(a, b) * dir);
  }, [data, columns, sort, manualSort]);

  const serverPaged = totalRows != null;
  const total = totalRows ?? sorted.length;
  const pageCount = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const rows = pageSize && !serverPaged ? sorted.slice(page * pageSize, page * pageSize + pageSize) : sorted;

  const selectedSet = React.useMemo(() => new Set(selected), [selected]);
  const rowIds = rows.map((row, index) => getRowId(row, index));
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedSet.has(id));
  const someSelected = rowIds.some((id) => selectedSet.has(id));
  const selectedRows = data.filter((row, index) => selectedSet.has(getRowId(row, index)));
  const clearSelection = () => setSelected([]);

  const toggleRow = (id: string) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected([...next]);
  };
  const toggleAll = () => {
    const next = new Set(selectedSet);
    if (allSelected) rowIds.forEach((id) => next.delete(id));
    else rowIds.forEach((id) => next.add(id));
    setSelected([...next]);
  };
  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const cycleSort = (id: string) => {
    if (!sort || sort.id !== id) setSort({ id, direction: "asc" });
    else if (sort.direction === "asc") setSort({ id, direction: "desc" });
    else setSort(null);
  };

  /* Pinned offsets */
  const hasLeftPin = columns.some((c) => c.pin === "left");
  const leftOffsets = new Map<string, number>();
  let leftCursor = (hasLeftPin && selectable ? SELECT_W : 0) + (hasLeftPin && renderExpanded ? EXPAND_W : 0);
  const leftPinned = columns.filter((c) => c.pin === "left");
  leftPinned.forEach((c) => {
    leftOffsets.set(c.id, leftCursor);
    leftCursor += c.width ?? 160;
  });
  const rightOffsets = new Map<string, number>();
  let rightCursor = rowActions ? 0 : 0;
  const rightPinned = columns.filter((c) => c.pin === "right").reverse();
  rightPinned.forEach((c) => {
    rightOffsets.set(c.id, rightCursor);
    rightCursor += c.width ?? 120;
  });
  const lastLeft = leftPinned[leftPinned.length - 1]?.id;
  const firstRight = rightPinned[rightPinned.length - 1]?.id;

  const pinAttrs = (column: DataTableColumn<T>) => {
    if (column.pin === "left")
      return {
        "data-pinned": "left",
        "data-pin-edge": column.id === lastLeft ? "true" : undefined,
        style: { ["--spk-pin-offset" as string]: `${leftOffsets.get(column.id)}px` },
      };
    if (column.pin === "right")
      return {
        "data-pinned": "right",
        "data-pin-edge": column.id === firstRight ? "true" : undefined,
        style: { ["--spk-pin-offset" as string]: `${rightOffsets.get(column.id)}px` },
      };
    return {};
  };
  const utilityPin = (offset: number) =>
    hasLeftPin ? { "data-pinned": "left", style: { ["--spk-pin-offset" as string]: `${offset}px` } } : {};

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const x = el.scrollLeft > 0;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    if (x !== scroll.x || end !== scroll.end) setScroll({ x, end });
  };
  React.useEffect(onScroll);

  const colCount = columns.length + (selectable ? 1 : 0) + (renderExpanded ? 1 : 0) + (rowActions ? 1 : 0);

  const cellContent = (column: DataTableColumn<T>, row: T, index: number) =>
    column.cell ? column.cell(row, index) : renderValue(column.accessor?.(row));

  const mobileRole = (column: DataTableColumn<T>, index: number) =>
    column.mobile ?? (index === 0 ? "title" : column.numeric ? "meta" : "hidden");

  const showBulk = selectable && selected.length > 0 && bulkActions;

  const header = showBulk ? (
    <div
      data-slot="data-table-bulk-bar"
      className="flex min-h-12 flex-wrap items-center gap-2 border-b border-line-subtle bg-accent-subtle px-3 py-2"
    >
      <span className="spk-numeric text-body font-medium text-fg">{selected.length} selected</span>
      <button type="button" className="spk-btn spk-btn--ghost spk-btn--xs text-fg-secondary" onClick={clearSelection}>
        <X aria-hidden />
        Clear
      </button>
      <div className="ml-auto flex flex-wrap items-center gap-1.5">{bulkActions(selectedRows, clearSelection)}</div>
    </div>
  ) : toolbar ? (
    <div data-slot="data-table-toolbar" className="flex min-h-12 flex-wrap items-center gap-2 border-b border-line-subtle px-3 py-2">
      {toolbar}
    </div>
  ) : null;

  const emptyNode = empty ?? <EmptyState variant="plain" size="sm" title="No results" description="Try adjusting your filters." />;

  const from = total === 0 ? 0 : page * (pageSize ?? total) + 1;
  const to = pageSize ? Math.min(total, (page + 1) * pageSize) : total;

  return (
    <div
      data-slot="data-table"
      data-density={density}
      className={cn(
        "flex min-w-0 flex-col overflow-hidden",
        bordered && "rounded-[var(--spk-radius-md)] border border-line bg-surface",
        className,
      )}
    >
      {header}

      {/* Desktop / tablet table */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        data-slot="table-container"
        data-scrolled-x={scroll.x ? "true" : "false"}
        data-scrolled-end={scroll.end ? "true" : "false"}
        className={cn("spk-table-container", responsive === "list" && "max-md:hidden")}
        style={{ maxHeight }}
      >
        <table
          className="spk-table"
          aria-label={ariaLabel}
          aria-busy={loading || undefined}
          data-sticky-header={stickyHeader ? "true" : undefined}
          data-hover="true"
        >
          {caption ? <caption className="spk-table-caption">{caption}</caption> : null}
          <thead>
            <tr>
              {selectable ? (
                <th className="w-10 pr-0" {...utilityPin(0)}>
                  <Checkbox
                    aria-label="Select all rows"
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                  />
                </th>
              ) : null}
              {renderExpanded ? <th className="w-9 px-0" aria-label="Expand" {...utilityPin(selectable ? SELECT_W : 0)} /> : null}
              {columns.map((column) => {
                const direction: SortDirection = sort?.id === column.id ? sort.direction : false;
                const { style, ...pin } = pinAttrs(column) as { style?: React.CSSProperties };
                return (
                  <TableHead
                    key={column.id}
                    align={column.align}
                    numeric={column.numeric}
                    sortDirection={column.sortable ? direction : undefined}
                    onSort={column.sortable ? () => cycleSort(column.id) : undefined}
                    className={cn(column.hideBelow && hideClass[column.hideBelow], column.headerClassName)}
                    style={{ width: column.width, minWidth: column.minWidth ?? column.width, ...style }}
                    {...pin}
                  >
                    {column.header}
                  </TableHead>
                );
              })}
              {rowActions ? (
                <th className="w-px" aria-label="Actions" />
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: loadingRows }, (_, r) => (
                <tr key={`loading-${r}`}>
                  {Array.from({ length: colCount }, (_, c) => (
                    <td key={c}>
                      <Skeleton shape="text" className={cn(c === 0 && selectable ? "size-4" : r % 2 ? "w-3/5" : "w-4/5")} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="h-auto! py-6">
                  {emptyNode}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const id = rowIds[index]!;
                const isSelected = selectedSet.has(id);
                const isExpanded = expanded.has(id);
                return (
                  <React.Fragment key={id}>
                    <tr
                      data-state={isSelected ? "selected" : undefined}
                      aria-selected={selectable ? isSelected : undefined}
                      data-clickable={onRowClick ? "true" : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      className="group/row outline-none focus-visible:[&>td]:bg-hover"
                      onClick={(event) => {
                        if (!onRowClick || isInteractiveTarget(event.target)) return;
                        onRowClick(row);
                      }}
                      onKeyDown={(event) => {
                        if (onRowClick && event.key === "Enter" && event.target === event.currentTarget) onRowClick(row);
                      }}
                    >
                      {selectable ? (
                        <td className="w-10 pr-0" {...utilityPin(0)}>
                          <Checkbox aria-label="Select row" checked={isSelected} onCheckedChange={() => toggleRow(id)} />
                        </td>
                      ) : null}
                      {renderExpanded ? (
                        <td className="w-9 px-0 text-center" {...utilityPin(selectable ? SELECT_W : 0)}>
                          <button
                            type="button"
                            className="spk-btn spk-btn--ghost spk-btn--icon-xs text-fg-tertiary"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? "Collapse row" : "Expand row"}
                            onClick={() => toggleExpanded(id)}
                          >
                            <ChevronRight
                              className={cn(
                                "transition-transform duration-[var(--spk-duration-base)] ease-[var(--spk-ease-standard)]",
                                isExpanded && "rotate-90",
                              )}
                            />
                          </button>
                        </td>
                      ) : null}
                      {columns.map((column) => {
                        const { style, ...pin } = pinAttrs(column) as { style?: React.CSSProperties };
                        return (
                          <td
                            key={column.id}
                            data-align={column.align}
                            data-numeric={column.numeric ? "true" : undefined}
                            data-truncate={column.truncate ? "true" : undefined}
                            className={cn(column.hideBelow && hideClass[column.hideBelow], column.cellClassName)}
                            style={style}
                            {...pin}
                          >
                            {cellContent(column, row, index)}
                          </td>
                        );
                      })}
                      {rowActions ? (
                        <td className="w-px py-0 pr-2 whitespace-nowrap" data-align="right" data-row-action>
                          <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity duration-[var(--spk-duration-fast)] group-hover/row:opacity-100 group-focus-within/row:opacity-100 [@media(pointer:coarse)]:opacity-100">
                            {rowActions(row)}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                    {renderExpanded && isExpanded ? (
                      <tr data-slot="data-table-expanded">
                        <td colSpan={colCount} className="h-auto! bg-surface-subtle px-4 py-3">
                          {renderExpanded(row)}
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Phone list */}
      {responsive === "list" ? (
        <ul data-slot="data-table-list" aria-label={ariaLabel} className="divide-y divide-line-subtle md:hidden">
          {loading
            ? Array.from({ length: Math.min(loadingRows, 4) }, (_, r) => (
                <li key={r} className="flex flex-col gap-2 px-3 py-3">
                  <Skeleton shape="text" className="w-1/2" />
                  <Skeleton shape="text" className="w-1/3" />
                </li>
              ))
            : rows.length === 0
              ? <li className="px-3 py-4">{emptyNode}</li>
              : rows.map((row, index) => {
                  const id = rowIds[index]!;
                  const title = columns.find((c, i) => mobileRole(c, i) === "title");
                  const subtitles = columns.filter((c, i) => mobileRole(c, i) === "subtitle");
                  const metas = columns.filter((c, i) => mobileRole(c, i) === "meta");
                  const isSelected = selectedSet.has(id);
                  return (
                    <li
                      key={id}
                      data-state={isSelected ? "selected" : undefined}
                      className={cn(
                        "flex min-h-[var(--spk-row-h)] items-center gap-3 px-3 py-2.5",
                        isSelected && "bg-accent-subtle shadow-[inset_2px_0_0_var(--spk-accent)]",
                        onRowClick && "cursor-pointer active:bg-hover",
                      )}
                      onClick={(event) => {
                        if (!onRowClick || isInteractiveTarget(event.target)) return;
                        onRowClick(row);
                      }}
                    >
                      {selectable ? (
                        <Checkbox aria-label="Select row" checked={isSelected} onCheckedChange={() => toggleRow(id)} />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        {title ? <div className="truncate text-body font-medium text-fg">{cellContent(title, row, index)}</div> : null}
                        {subtitles.length ? (
                          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-body-sm text-fg-secondary">
                            {subtitles.map((c) => (
                              <span key={c.id} className="min-w-0 truncate">
                                {cellContent(c, row, index)}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      {metas.length ? (
                        <div className="flex shrink-0 flex-col items-end gap-0.5 text-right text-body spk-numeric">
                          {metas.map((c) => (
                            <span key={c.id}>{cellContent(c, row, index)}</span>
                          ))}
                        </div>
                      ) : null}
                      {onRowClick ? <ChevronRight className="size-4 shrink-0 text-fg-tertiary" aria-hidden /> : null}
                    </li>
                  );
                })}
        </ul>
      ) : null}

      {pageSize && total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle px-3 py-2">
          <p className="spk-numeric text-body-sm text-fg-secondary">
            {from}–{to} of {total}
          </p>
          <Pagination page={page + 1} pageCount={pageCount} onPageChange={(next) => setPage(next - 1)} variant="compact" />
        </div>
      ) : null}
    </div>
  );
}
