import { useState, type ReactNode } from "react";
import { chartColor, formatChartNumber } from "../lib/charts";
import { cn } from "../lib/cn";
import { ChartContainer } from "./chart-composition";
import { SparkLineChart } from "./cartesian-charts";
import { PieChart } from "./radial-charts";

export type ChartGridColumnType = "text" | "number" | "sparkline" | "bar";

export type ChartGridColumn = {
  field: string;
  headerName: string;
  type?: ChartGridColumnType;
  width?: number;
};

export type ChartDataGridRow = { id: string } & Record<string, unknown>;

export type ChartDataGridProps = {
  rows: ChartDataGridRow[];
  columns: ChartGridColumn[];
  chartType?: "bar" | "line" | "pie";
  categoryField: string;
  valueField: string;
  height?: number;
  className?: string;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  hideChart?: boolean;
  hideLegend?: boolean;
};

export function renderChartCell(
  value: unknown,
  options?: {
    variant?: "sparkline" | "bar";
    color?: string;
    height?: number;
    max?: number;
  },
): ReactNode {
  const color = options?.color ?? "var(--chart-1)";
  if (Array.isArray(value) && value.every((item) => typeof item === "number")) {
    return (
      <SparkLineChart
        data={value as number[]}
        plotType={options?.variant === "bar" ? "bar" : "line"}
        color={color}
        height={options?.height ?? 32}
        showHighlight={false}
        area={options?.variant !== "bar"}
      />
    );
  }
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  const max = options?.max && options.max > 0 ? options.max : Math.max(n, 1);
  const pct = Math.max(0, Math.min(100, (n / max) * 100));
  return (
    <div className="spk-chart-cell-bar" title={formatChartNumber(n)}>
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function ChartDataGrid({
  rows,
  columns,
  chartType = "bar",
  categoryField,
  valueField,
  height = 200,
  className,
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  hideChart,
  hideLegend = true,
}: ChartDataGridProps) {
  const [internal, setInternal] = useState<string[]>(defaultSelectedIds ?? []);
  const selected = selectedIds ?? internal;
  const setSelected = (ids: string[]) => {
    if (selectedIds == null) setInternal(ids);
    onSelectionChange?.(ids);
  };
  const selectedIndex = selected.length ? rows.findIndex((row) => row.id === selected[0]) : -1;
  const categories = rows.map((row) => String(row[categoryField] ?? row.id));
  const values = rows.map((row) => Number(row[valueField] ?? 0));
  const maxByField = new Map<string, number>();
  for (const col of columns) {
    if (col.type === "bar" || col.type === "number") {
      const nums = rows.map((row) => Number(row[col.field] ?? 0)).filter((n) => Number.isFinite(n));
      maxByField.set(col.field, nums.length ? Math.max(...nums) : 1);
    }
  }

  const toggleRow = (id: string) => {
    setSelected(selected[0] === id ? [] : [id]);
  };

  return (
    <div data-slot="chart-data-grid" className={cn("spk-chart-data-grid", className)}>
      {hideChart ? null : chartType === "pie" ? (
        <PieChart
          height={height}
          hideLegend={hideLegend}
          series={[
            {
              innerRadius: 36,
              paddingAngle: 2,
              data: rows.map((row, i) => ({
                id: row.id,
                value: values[i] ?? 0,
                label: categories[i],
                color:
                  selected.length && !selected.includes(row.id)
                    ? `color-mix(in srgb, ${chartColor(i)} 28%, transparent)`
                    : undefined,
              })),
            },
          ]}
        />
      ) : (
        <ChartContainer
          height={height}
          hideLegend={hideLegend}
          highlightScope="item"
          selected={
            selectedIndex >= 0 ? { seriesId: "value", dataIndex: selectedIndex } : null
          }
          xAxis={[{ data: categories }]}
          series={[{ type: chartType, id: "value", label: valueField, data: values }]}
          aria-label="Linked chart"
        />
      )}
      <div className="spk-chart-grid-table" data-slot="table-container">
        <table data-slot="table">
          <thead data-slot="table-header">
            <tr data-slot="table-row">
              {columns.map((col) => (
                <th
                  key={col.field}
                  data-slot="table-head"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.headerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody data-slot="table-body">
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                data-slot="table-row"
                data-state={selected.includes(row.id) ? "selected" : undefined}
                onClick={() => toggleRow(row.id)}
                style={{ cursor: "pointer" }}
              >
                {columns.map((col, colIndex) => {
                  const value = row[col.field];
                  const color = chartColor(rowIndex);
                  let content: ReactNode;
                  if (col.type === "sparkline") {
                    content = renderChartCell(value, { variant: "sparkline", color, height: 32 });
                  } else if (col.type === "bar") {
                    content = renderChartCell(value, {
                      variant: "bar",
                      color,
                      max: maxByField.get(col.field),
                    });
                  } else if (col.type === "number" && typeof value === "number") {
                    content = formatChartNumber(value);
                  } else {
                    content = value == null ? "—" : String(value);
                  }
                  return (
                    <td key={col.field} data-slot="table-cell" data-field={col.field}>
                      {colIndex === 0 ? (
                        <span className="spk-chart-grid-name">{content}</span>
                      ) : (
                        content
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
