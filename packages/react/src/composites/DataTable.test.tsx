import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

type Row = {
  id: string;
  customer: string;
  status: string;
  amount: number;
};

const rows: Row[] = [{ id: "INV-2045", customer: "Northwind Analytics", status: "Draft", amount: 22000 }];

const columns: DataTableColumn<Row>[] = [
  { id: "customer", header: "Customer", accessor: (row) => row.customer, mobile: "title" },
  { id: "id", header: "Invoice", accessor: (row) => row.id, mobile: "subtitle" },
  { id: "status", header: "Status", accessor: (row) => row.status, mobile: "subtitle" },
  { id: "amount", header: "Amount", accessor: (row) => row.amount, numeric: true },
];

describe("DataTable", () => {
  it("renders a structured phone list layout", () => {
    const { container } = render(
      <DataTable aria-label="Invoices" data={rows} columns={columns} getRowId={(row) => row.id} selectable />,
    );

    const list = screen.getByRole("list", { name: "Invoices" });
    const row = container.querySelector("[data-slot='data-table-list-row']");

    expect(list).toHaveClass("spk-data-list");
    expect(row).toHaveClass("spk-data-list-row");
    expect(row).toHaveAttribute("data-selectable", "true");
    const main = row?.querySelector("[data-slot='data-table-list-main']");
    const meta = row?.querySelector("[data-slot='data-table-list-meta']");

    expect(main).toHaveClass("spk-data-list-main");
    expect(meta).toHaveClass("spk-data-list-meta");
    expect(main?.querySelector(".spk-data-list-title")).toHaveTextContent("Northwind Analytics");
    expect(meta).toHaveTextContent("22000");
  });
});
