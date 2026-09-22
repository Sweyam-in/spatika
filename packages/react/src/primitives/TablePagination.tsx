import * as React from "react";
import { cn } from "../lib/cn";
import { NativeSelect } from "./NativeSelect";
import { Pagination } from "../composites/Pagination";

export type TablePaginationProps = {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (rows: number) => void;
  rowsPerPageOptions?: number[];
  className?: string;
};

function TablePagination({
  count,
  page,
  onPageChange,
  rowsPerPage = 10,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25],
  className,
}: TablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(count / rowsPerPage));
  const from = count === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min(count, (page + 1) * rowsPerPage);

  return (
    <div
      data-slot="table-pagination"
      className={cn("flex flex-wrap items-center justify-end gap-4 px-2 py-2 text-body-sm text-fg-secondary", className)}
    >
      {onRowsPerPageChange ? (
        <label className="flex items-center gap-2 text-body-sm text-fg-secondary">
          Rows
          <NativeSelect
            value={String(rowsPerPage)}
            onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
          >
            {rowsPerPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </NativeSelect>
        </label>
      ) : null}
      <span className="spk-numeric text-body-sm text-fg-secondary">
        {from}–{to} of {count}
      </span>
      <Pagination page={page + 1} pageCount={pageCount} onPageChange={(next) => onPageChange(next - 1)} />
    </div>
  );
}
TablePagination.displayName = "TablePagination";

export { TablePagination };
