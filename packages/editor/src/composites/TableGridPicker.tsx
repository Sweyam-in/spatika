import { Columns3, Rows3 } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { cn } from "../lib/cn";

export const TABLE_GRID_SIZE = 10;
export const TABLE_ROWS_MAX = 20;
export const TABLE_COLS_MAX = 12;

type TableGridPickerProps = {
  onInsert: (rows: number, cols: number, withHeaderRow: boolean) => void;
};

function clampDimension(value: number, max: number) {
  return Math.max(1, Math.min(max, value));
}

function pickCell(event: MouseEvent<HTMLElement>) {
  const cell = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-table-row]");
  if (!cell) return null;
  return {
    rows: clampDimension(Number(cell.dataset.tableRow), TABLE_ROWS_MAX),
    cols: clampDimension(Number(cell.dataset.tableCol), TABLE_COLS_MAX),
  };
}

export function TableGridPicker({ onInsert }: TableGridPickerProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeaderRow, setWithHeaderRow] = useState(true);
  const [hover, setHover] = useState<{ rows: number; cols: number } | null>(null);

  const previewRows = hover?.rows ?? rows;
  const previewCols = hover?.cols ?? cols;

  const handleGridMove = (event: MouseEvent<HTMLDivElement>) => {
    const picked = pickCell(event);
    if (picked) setHover(picked);
  };

  const handleGridClick = (event: MouseEvent<HTMLDivElement>) => {
    const picked = pickCell(event);
    if (picked) {
      setRows(picked.rows);
      setCols(picked.cols);
      onInsert(picked.rows, picked.cols, withHeaderRow);
    }
  };

  return (
    <div className="spk-editor-table-picker">
      <div className="spk-editor-table-picker-label" aria-live="polite">
        {previewCols} × {previewRows}
      </div>
      <div
        className="spk-editor-table-picker-grid"
        role="grid"
        aria-label="Choose table size"
        onMouseMove={handleGridMove}
        onMouseLeave={() => setHover(null)}
        onClick={handleGridClick}
      >
        {Array.from({ length: TABLE_GRID_SIZE * TABLE_GRID_SIZE }, (_, index) => {
          const rowIndex = Math.floor(index / TABLE_GRID_SIZE);
          const colIndex = index % TABLE_GRID_SIZE;
          const cellRows = rowIndex + 1;
          const cellCols = colIndex + 1;
          const active = cellRows <= previewRows && cellCols <= previewCols;

          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              type="button"
              role="gridcell"
              data-table-row={cellRows}
              data-table-col={cellCols}
              className={cn(
                "spk-editor-table-picker-cell",
                active && "spk-editor-table-picker-cell--active",
              )}
              aria-label={`${cellCols} by ${cellRows} table`}
              onMouseDown={(event) => event.preventDefault()}
            />
          );
        })}
      </div>
      <div className="spk-editor-table-picker-size">
        <label className="spk-editor-table-picker-size-field">
          <Columns3 className="size-4" aria-hidden="true" />
          <span className="sr-only">Columns</span>
          <input
            type="number"
            min={1}
            max={TABLE_COLS_MAX}
            className="spk-editor-table-picker-size-input"
            value={previewCols}
            onChange={(event) => {
              setHover(null);
              setCols(clampDimension(Number.parseInt(event.target.value, 10) || 1, TABLE_COLS_MAX));
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
          />
        </label>
        <span className="spk-editor-table-picker-size-sep" aria-hidden="true">
          ×
        </span>
        <label className="spk-editor-table-picker-size-field">
          <Rows3 className="size-4" aria-hidden="true" />
          <span className="sr-only">Rows</span>
          <input
            type="number"
            min={1}
            max={TABLE_ROWS_MAX}
            className="spk-editor-table-picker-size-input"
            value={previewRows}
            onChange={(event) => {
              setHover(null);
              setRows(clampDimension(Number.parseInt(event.target.value, 10) || 1, TABLE_ROWS_MAX));
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
          />
        </label>
      </div>
      <label className="spk-editor-toolbar-popover-check">
        <input
          type="checkbox"
          checked={withHeaderRow}
          onChange={(event) => setWithHeaderRow(event.target.checked)}
        />
        <span>Header row</span>
      </label>
      <button
        type="button"
        className="spk-editor-toolbar-popover-btn spk-editor-toolbar-popover-btn--primary spk-editor-table-picker-insert"
        onClick={() => onInsert(previewRows, previewCols, withHeaderRow)}
      >
        Insert {previewCols} × {previewRows} table
      </button>
    </div>
  );
}
