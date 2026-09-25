import * as React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NumberInput, parseLocaleNumber } from "../primitives/NumberInput";
import { TagInput } from "../primitives/TagInput";
import { OtpInput } from "../primitives/OtpInput";
import { ScrollArea } from "../primitives/ScrollArea";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger, DropdownMenuItem } from "../primitives/DropdownMenu";
import { Calendar } from "./Calendar";
import { DataTable, DataTableColumnsMenu } from "./DataTable";
import { DateInput, TimeInput } from "./DateInput";
import { DatePicker, DateRangePicker, toISODate } from "./DatePicker";
import { DescriptionList } from "./DescriptionList";
import { ResultState } from "./EmptyState";
import { FileUpload, fileKey } from "./FileUpload";
import { FormErrorSummary } from "./FormErrorSummary";
import { ResizablePanels } from "./ResizablePanels";
import { TreeView } from "./TreeView";
import { VirtualList } from "./VirtualList";

describe("NumberInput", () => {
  it("steps with the spinbutton keys and clamps to min / max", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberInput aria-label="Seats" defaultValue={5} min={1} max={20} onValueChange={onValueChange} />);
    const input = screen.getByRole("spinbutton", { name: "Seats" });
    expect(input).toHaveAttribute("aria-valuenow", "5");

    await user.click(input);
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(input).toHaveAttribute("aria-valuenow", "7");
    await user.keyboard("{PageUp}");
    expect(input).toHaveAttribute("aria-valuenow", "17");
    await user.keyboard("{PageUp}");
    expect(input).toHaveAttribute("aria-valuenow", "20");
    await user.keyboard("{Home}");
    expect(input).toHaveAttribute("aria-valuenow", "1");
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });

  it("parses typed text on blur, clamps it and shows the formatted value", async () => {
    const user = userEvent.setup();
    render(
      <NumberInput
        aria-label="Budget"
        max={50000}
        locale="en-US"
        formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Budget" });
    await user.click(input);
    await user.type(input, "72,500");
    await user.tab();
    expect(input).toHaveValue("$50,000");
    expect(input).toHaveAttribute("aria-valuenow", "50000");
    expect(input).toHaveAttribute("aria-valuetext", "$50,000");
  });

  it("parses locale formats", () => {
    expect(parseLocaleNumber("1.234,5", "de-DE")).toBe(1234.5);
    expect(parseLocaleNumber("−12", "en-US")).toBe(-12);
    expect(parseLocaleNumber("", "en-US")).toBeNull();
  });
});

describe("TagInput", () => {
  it("adds with Enter and comma, splits pastes, rejects duplicates and removes with Backspace", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TagInput aria-label="Labels" onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox", { name: "Labels" });
    await user.type(input, "urgent{Enter}billing,");
    expect(onValueChange).toHaveBeenLastCalledWith(["urgent", "billing"]);

    await user.click(input);
    await user.paste("ops, Urgent, finance");
    expect(onValueChange).toHaveBeenLastCalledWith(["urgent", "billing", "ops", "finance"]);

    await user.keyboard("{Backspace}");
    expect(onValueChange).toHaveBeenLastCalledWith(["urgent", "billing", "ops"]);
    await user.click(screen.getByRole("button", { name: "Remove billing" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["urgent", "ops"]);
  });

  it("keeps rejected text in the field and announces why", async () => {
    const user = userEvent.setup();
    render(
      <TagInput
        aria-label="Emails"
        validate={(tag) => (tag.includes("@") ? true : `${tag} is not an email address`)}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Emails" });
    await user.type(input, "maya{Enter}");
    expect(input).toHaveValue("maya");
    expect(screen.getByText("maya is not an email address")).toBeInTheDocument();
  });
});

describe("OtpInput", () => {
  it("fills cells from a paste and reports completion once", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OtpInput length={6} onComplete={onComplete} />);
    const group = screen.getByRole("group", { name: "Verification code" });
    const cells = within(group).getAllByRole("textbox");
    expect(cells[0]).toHaveAttribute("autocomplete", "one-time-code");

    await user.click(cells[0]);
    await user.paste("12a3456");
    expect(cells.map((cell) => (cell as HTMLInputElement).value).join("")).toBe("123456");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("advances on typing and steps back on Backspace", async () => {
    const user = userEvent.setup();
    render(<OtpInput length={4} />);
    const cells = screen.getAllByRole("textbox");
    await user.click(cells[0]);
    await user.keyboard("98");
    expect(cells[2]).toHaveFocus();
    await user.keyboard("{Backspace}");
    expect(cells[1]).toHaveFocus();
    expect(cells[1]).toHaveValue("");
  });
});

describe("FileUpload", () => {
  const file = (name: string, type: string, size = 10) =>
    new File([new Uint8Array(size)], name, { type, lastModified: 1 });

  it("accepts matching files, rejects others with a reason, and removes files", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onValueChange = vi.fn();
    const onReject = vi.fn();
    const { container } = render(
      <FileUpload accept="image/*,.pdf" maxSize={100} onValueChange={onValueChange} onReject={onReject} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [file("scan.pdf", "application/pdf"), file("notes.txt", "text/plain"), file("big.png", "image/png", 500)]);

    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "scan.pdf" })]);
    expect(onReject.mock.calls[0][0].map((r: { reason: string }) => r.reason)).toEqual(["type", "size"]);
    expect(screen.getByText(/notes.txt is not an accepted file type/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove scan.pdf" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("accepts dropped files and shows upload progress", () => {
    const pdf = file("deck.pdf", "application/pdf");
    const { container } = render(<FileUpload progress={{ [fileKey(pdf)]: 40 }} />);
    const zone = container.querySelector(".spk-dropzone") as HTMLElement;
    fireEvent.dragEnter(zone, { dataTransfer: { files: [pdf] } });
    expect(zone).toHaveAttribute("data-dragging", "true");
    fireEvent.drop(zone, { dataTransfer: { files: [pdf] } });
    expect(zone).not.toHaveAttribute("data-dragging");
    expect(screen.getByRole("progressbar", { name: "Uploading deck.pdf" })).toHaveAttribute("aria-valuenow", "40");
  });
});

describe("Calendar and DatePicker", () => {
  it("moves the roving day with the grid keys and selects with Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar defaultMonth={new Date(2026, 2, 1)} defaultSelected={new Date(2026, 2, 10)} onSelect={onSelect} locale="en-US" />);
    const day = screen.getByRole("button", { name: "Tuesday, March 10, 2026" });
    expect(day).toHaveAttribute("tabindex", "0");
    day.focus();

    await user.keyboard("{ArrowRight}{ArrowDown}");
    expect(screen.getByRole("button", { name: "Wednesday, March 18, 2026" })).toHaveFocus();
    await user.keyboard("{PageDown}");
    expect(screen.getByRole("button", { name: "Saturday, April 18, 2026" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith(new Date(2026, 3, 18));
  });

  it("does not select disabled days", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar
        defaultMonth={new Date(2026, 2, 1)}
        min={new Date(2026, 2, 5)}
        onSelect={onSelect}
        locale="en-US"
      />,
    );
    const early = screen.getByRole("button", { name: "Tuesday, March 3, 2026" });
    expect(early).toHaveAttribute("aria-disabled", "true");
    await user.click(early);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("selects a range in two steps", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar mode="range" defaultMonth={new Date(2026, 2, 1)} onSelect={onSelect} locale="en-US" />);
    await user.click(screen.getByRole("button", { name: "Thursday, March 12, 2026" }));
    await user.click(screen.getByRole("button", { name: "Monday, March 9, 2026" }));
    expect(onSelect).toHaveBeenLastCalledWith({ from: new Date(2026, 2, 9), to: new Date(2026, 2, 12) });
  });

  it("opens onto the selected day, closes on selection and submits an ISO date", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DatePicker aria-label="Due date" name="due" defaultValue={new Date(2026, 4, 20)} locale="en-US" />,
    );
    const button = screen.getByRole("button", { name: "Open calendar, Due date" });
    expect(screen.getByRole("spinbutton", { name: "month" })).toHaveAttribute("aria-valuetext", "05");
    expect(container.querySelector('input[name="due"]')).toHaveValue("2026-05-20");

    await user.click(button);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Wednesday, May 20, 2026" })).toHaveFocus(),
    );
    await user.keyboard("{ArrowRight}{Enter}");
    await waitFor(() => expect(screen.queryByRole("grid")).not.toBeInTheDocument());
    expect(screen.getByRole("spinbutton", { name: "day" })).toHaveAttribute("aria-valuenow", "21");
    expect(container.querySelector('input[name="due"]')).toHaveValue("2026-05-21");
    expect(toISODate(new Date(2026, 4, 21))).toBe("2026-05-21");
  });

  it("takes a typed date and opens the calendar on it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DatePicker aria-label="Start" locale="en-US" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("spinbutton", { name: "month" }));
    await user.keyboard("3");
    // "3" cannot start a two-digit month, so focus moves on.
    expect(screen.getByRole("spinbutton", { name: "day" })).toHaveFocus();
    await user.keyboard("09");
    expect(screen.getByRole("spinbutton", { name: "year" })).toHaveFocus();
    await user.keyboard("2027");
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2027, 2, 9));

    await user.click(screen.getByRole("button", { name: "Open calendar, Start" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Tuesday, March 9, 2027" })).toHaveFocus(),
    );
  });

  it("submits both ends of a typed range", async () => {
    const user = userEvent.setup();
    const { container } = render(<DateRangePicker aria-label="Stay" name="stay" locale="en-US" />);
    const [startMonth] = screen.getAllByRole("spinbutton", { name: /^month/ });
    await user.click(startMonth);
    await user.keyboard("06012026");
    // Focus runs on from the start date into the end date.
    await user.keyboard("06052026");
    expect(container.querySelector('input[name="stay.from"]')).toHaveValue("2026-06-01");
    expect(container.querySelector('input[name="stay.to"]')).toHaveValue("2026-06-05");
  });
});

describe("DateInput", () => {
  it("orders segments by locale and names each unit with the field label", () => {
    render(
      <>
        <span id="dob-label">Date of birth</span>
        <DateInput aria-labelledby="dob-label" locale="de-DE" />
      </>,
    );
    const names = screen.getAllByRole("spinbutton").map((node) => node.getAttribute("aria-label"));
    expect(names).toEqual(["day", "month", "year"]);
    expect(screen.getByRole("spinbutton", { name: "month Date of birth" })).toBeInTheDocument();
  });

  it("steps, wraps, clamps the day to the month and clears", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateInput aria-label="Date" locale="en-US" defaultValue={new Date(2026, 0, 31)} onValueChange={onValueChange} />);
    const month = screen.getByRole("spinbutton", { name: "month" });
    await user.click(month);
    await user.keyboard("{ArrowUp}");
    // 31 January → February: the day is clamped rather than overflowing into March.
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 1, 28));
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(month).toHaveAttribute("aria-valuenow", "12");

    await user.keyboard("{Backspace}");
    expect(month).toHaveAttribute("aria-valuetext", "Empty");
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("marks dates outside min / max invalid without blocking entry", async () => {
    const user = userEvent.setup();
    render(<DateInput aria-label="Date" locale="en-US" max={new Date(2026, 0, 1)} />);
    await user.click(screen.getByRole("spinbutton", { name: "month" }));
    await user.keyboard("02022026");
    expect(screen.getByRole("group", { name: "Date" })).toHaveAttribute("aria-invalid", "true");
  });
});

describe("TimeInput", () => {
  it("types a 12-hour time and reports 24-hour values", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <TimeInput aria-label="Start time" locale="en-US" name="start" onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("spinbutton", { name: "hour" }));
    await user.keyboard("230p");
    expect(onValueChange).toHaveBeenLastCalledWith("14:30");
    expect(container.querySelector('input[name="start"]')).toHaveValue("14:30");
    expect(screen.getByRole("spinbutton", { name: "AM/PM" })).toHaveAttribute("aria-valuetext", "PM");
  });

  it("uses the locale's 24-hour clock and steps minutes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Time" locale="en-GB" defaultValue="09:50" minuteStep={15} onValueChange={onValueChange} />);
    expect(screen.queryByRole("spinbutton", { name: "AM/PM" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("spinbutton", { name: "minute" }));
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenLastCalledWith("09:05");
  });
});

describe("TreeView", () => {
  const items = [
    {
      id: "src",
      label: "src",
      children: [
        { id: "app", label: "App.tsx" },
        { id: "lib", label: "lib", children: [{ id: "cn", label: "cn.ts" }] },
      ],
    },
    { id: "readme", label: "README.md" },
  ];

  it("follows the tree keyboard pattern", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<TreeView items={items} aria-label="Files" onActivate={onActivate} />);
    const tree = screen.getByRole("tree", { name: "Files" });
    const src = within(tree).getByRole("treeitem", { name: "src" });
    expect(src).toHaveAttribute("aria-expanded", "false");
    src.focus();

    await user.keyboard("{ArrowRight}");
    expect(src).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByRole("treeitem", { name: "App.tsx" })).toHaveFocus());
    expect(screen.getByRole("treeitem", { name: "App.tsx" })).toHaveAttribute("aria-level", "2");

    await user.keyboard("{ArrowLeft}");
    await waitFor(() => expect(src).toHaveFocus());
    await user.keyboard("{End}");
    await waitFor(() => expect(screen.getByRole("treeitem", { name: "README.md" })).toHaveFocus());
    await user.keyboard("{Enter}");
    expect(onActivate).toHaveBeenCalledWith(expect.objectContaining({ id: "readme" }));
    expect(screen.getByRole("treeitem", { name: "README.md" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("Layout and feedback", () => {
  it("renders description list semantics", () => {
    render(<DescriptionList items={[{ term: "Plan", details: "Scale" }, { term: "Seats", details: null }]} />);
    expect(screen.getByText("Plan").tagName).toBe("DT");
    expect(screen.getByText("Scale").tagName).toBe("DD");
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("windows long lists but reports their full size", () => {
    const rows = Array.from({ length: 10_000 }, (_, i) => `Row ${i + 1}`);
    render(<VirtualList items={rows} itemHeight={32} height={320} renderItem={(row) => row} aria-label="Rows" />);
    const items = within(screen.getByRole("list", { name: "Rows" })).getAllByRole("listitem");
    expect(items.length).toBeLessThan(40);
    expect(items[0]).toHaveAttribute("aria-setsize", "10000");
  });

  it("resizes panels from the keyboard", async () => {
    const user = userEvent.setup();
    const onSizesChange = vi.fn();
    render(
      <ResizablePanels defaultSizes={[30, 70]} onSizesChange={onSizesChange} handleLabels={["Resize sidebar"]}>
        <div>Sidebar</div>
        <div>Main</div>
      </ResizablePanels>,
    );
    const handle = screen.getByRole("separator", { name: "Resize sidebar" });
    expect(handle).toHaveAttribute("aria-valuenow", "30");
    handle.focus();
    await user.keyboard("{ArrowRight}");
    expect(onSizesChange).toHaveBeenLastCalledWith([35, 65]);
    await user.keyboard("{Home}");
    expect(onSizesChange).toHaveBeenLastCalledWith([10, 90]);
  });

  it("makes a scroll area a focusable, named region", () => {
    render(<ScrollArea aria-label="Activity" maxHeight={200}>content</ScrollArea>);
    const region = screen.getByRole("region", { name: "Activity" });
    expect(region).toHaveAttribute("tabindex", "0");
  });

  it("announces a result state politely with a status icon", () => {
    render(<ResultState status="error" title="Export failed" description="Try again in a minute." />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Export failed");
    expect(status.querySelector('[data-tone="danger"]')).not.toBeNull();
  });

  it("focuses the error summary and links to each field", async () => {
    const user = userEvent.setup();
    render(
      <>
        <FormErrorSummary errors={[{ fieldId: "email", message: "Enter an email address" }]} />
        <input id="email" aria-label="Email" />
      </>,
    );
    const summary = screen.getByRole("alert");
    await waitFor(() => expect(summary).toHaveFocus());
    await user.click(screen.getByRole("link", { name: "Enter an email address" }));
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveFocus();
  });
});

describe("ContextMenu", () => {
  it("opens at the pointer and from Shift+F10", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger tabIndex={0}>Row</ContextMenuTrigger>
        <ContextMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Rename</DropdownMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText("Row"), { clientX: 40, clientY: 60 });
    expect(await screen.findByRole("menu", { name: "Context menu" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());

    screen.getByText("Row").focus();
    await user.keyboard("{Shift>}{F10}{/Shift}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus());
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalled();
  });
});

describe("DataTable column visibility", () => {
  it("hides columns chosen in the columns menu", async () => {
    const user = userEvent.setup();
    const columns = [
      { id: "name", header: "Name", accessor: (row: { name: string; plan: string }) => row.name, hideable: false },
      { id: "plan", header: "Plan", accessor: (row: { name: string; plan: string }) => row.plan },
    ];
    function Table() {
      const [hidden, setHidden] = React.useState<string[]>([]);
      return (
        <DataTable
          aria-label="Customers"
          data={[{ name: "Acme", plan: "Scale" }]}
          getRowId={(row) => row.name}
          columns={columns}
          hiddenColumns={hidden}
          responsive="scroll"
          toolbar={<DataTableColumnsMenu columns={columns} hiddenColumns={hidden} onHiddenColumnsChange={setHidden} />}
        />
      );
    }
    render(<Table />);
    expect(screen.getByRole("columnheader", { name: /Plan/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Columns" }));
    expect(screen.getByRole("menuitemcheckbox", { name: "Name" })).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Plan" }));
    expect(screen.queryByRole("columnheader", { name: /Plan/ })).not.toBeInTheDocument();
    // The menu stays open so several columns can be toggled in a row.
    expect(screen.getByRole("menuitemcheckbox", { name: "Plan" })).toHaveAttribute("aria-checked", "false");
    act(() => undefined);
  });
});
