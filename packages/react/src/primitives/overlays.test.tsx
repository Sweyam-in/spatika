import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { openLayerCount } from "../lib/layer-stack";
import { OVERLAY_Z_INDEX } from "../lib/overlay-stack";
import { Toaster, useToast } from "../composites/Toast";
import { Button } from "./Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";

afterEach(() => {
  vi.useRealTimers();
});

describe("layer stack", () => {
  it("closes only the topmost layer on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Edit record</DialogTitle>
          <DropdownMenu>
            <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(openLayerCount()).toBe(0);
  });

  it("keeps a parent popover open when a nested layer is pressed", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <p>Outside</p>
        <Popover>
          <PopoverTrigger>Filters</PopoverTrigger>
          <PopoverContent aria-label="Filters panel">
            <DropdownMenu>
              <DropdownMenuTrigger>Status</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Active</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </PopoverContent>
        </Popover>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Filters" }));
    await user.click(await screen.findByRole("button", { name: "Status" }));
    const item = await screen.findByRole("menuitem", { name: "Active" });

    // Pressing inside the portaled menu must not count as "outside" the popover.
    fireEvent.pointerDown(item);
    expect(screen.getByRole("button", { name: "Status" })).toBeInTheDocument();

    // Pressing the page closes the whole stack.
    fireEvent.pointerDown(screen.getByText("Outside"));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Status" })).not.toBeInTheDocument());
  });

  it("lets consumers veto Escape on a dialog", async () => {
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        <DialogContent onEscapeKeyDown={(event) => event.preventDefault()}>
          <DialogTitle>Unsaved changes</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Dialog", () => {
  it("references its title and description only when they are rendered", () => {
    const { rerender } = render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Invite</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Invite" });
    expect(dialog).not.toHaveAttribute("aria-describedby");

    rerender(
      <Dialog open>
        <DialogContent>
          <DialogTitle id="custom-title">Invite</DialogTitle>
          <DialogDescription>Send a link by email.</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", "custom-title");
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription("Send a link by email.");
  });

  it("keeps Tab inside the innermost of two nested dialogs and restores focus", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open outer</DialogTrigger>
        <DialogContent hideClose>
          <DialogTitle>Outer</DialogTitle>
          <Button>Outer action</Button>
          <Dialog>
            <DialogTrigger>Open inner</DialogTrigger>
            <DialogContent hideClose>
              <DialogTitle>Inner</DialogTitle>
              <Button>First</Button>
              <Button>Second</Button>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Open outer" }));
    await user.click(await screen.findByRole("button", { name: "Open inner" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "First" })).toHaveFocus());

    await user.tab();
    expect(screen.getByRole("button", { name: "Second" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.getByRole("button", { name: "Open inner" })).toHaveFocus());
    expect(screen.getByRole("dialog", { name: "Outer" })).toBeInTheDocument();
  });
});

describe("Tooltip", () => {
  it("stays open while the pointer moves onto the tooltip (WCAG 1.4.13)", async () => {
    vi.useFakeTimers();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Info</TooltipTrigger>
          <TooltipContent>Details</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Info" });
    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
    expect(screen.getByRole("tooltip")).toHaveTextContent("Details");

    fireEvent.pointerLeave(trigger, { pointerType: "mouse" });
    fireEvent.pointerEnter(screen.getByRole("tooltip"), { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.pointerLeave(screen.getByRole("tooltip"), { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("does not open from a touch hover and closes on Escape from anywhere", () => {
    render(
      <Tooltip delayDuration={0}>
        <TooltipTrigger>Info</TooltipTrigger>
        <TooltipContent>Details</TooltipContent>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Info" });
    fireEvent.pointerEnter(trigger, { pointerType: "touch" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    act(() => trigger.focus());
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(trigger).toHaveAccessibleDescription("Details");

    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("stacks above modal dialogs", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <Tooltip open>
            <TooltipTrigger>Help</TooltipTrigger>
            <TooltipContent>Explains the setting</TooltipContent>
          </Tooltip>
        </DialogContent>
      </Dialog>,
    );
    const tooltipZ = Number(screen.getByRole("tooltip").style.zIndex);
    const dialogZ = Number(screen.getByRole("dialog").style.zIndex);
    expect(tooltipZ).toBe(OVERLAY_Z_INDEX.tooltip);
    expect(tooltipZ).toBeGreaterThan(dialogZ);
  });
});

describe("Toaster", () => {
  function Fire() {
    const { toast } = useToast();
    return <Button onClick={() => toast({ title: "Saved" })}>Fire</Button>;
  }

  it("renders above modals in one polite live region", async () => {
    const user = userEvent.setup();
    render(
      <Toaster>
        <Fire />
      </Toaster>,
    );
    await user.click(screen.getByRole("button", { name: "Fire" }));
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(Number(region.style.zIndex)).toBeGreaterThan(OVERLAY_Z_INDEX.modal);
    expect(region.querySelector('[role="status"]')).toBeNull();
    expect(region).toHaveTextContent("Saved");
  });
});

describe("DropdownMenu keyboard", () => {
  function Actions({ onSelect = () => {} }: { onSelect?: (value: string) => void }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => onSelect("edit")}>Edit</DropdownMenuItem>
          <DropdownMenuItem disabled>Archive</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSelect("duplicate")}>Duplicate</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSelect("delete")}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  it("exposes the menu button pattern", async () => {
    const user = userEvent.setup();
    render(<Actions />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    const menu = await screen.findByRole("menu", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
    expect(screen.getByRole("menuitem", { name: "Archive" })).toHaveAttribute("aria-disabled", "true");
  });

  it("moves focus with arrows, skips disabled items, wraps, and supports Home/End and type-ahead", async () => {
    const user = userEvent.setup();
    render(<Actions />);
    screen.getByRole("button", { name: "Actions" }).focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus());

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await user.keyboard("du");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
  });

  it("opens on ArrowUp at the last item, activates with Enter and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Actions onSelect={onSelect} />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    trigger.focus();
    await user.keyboard("{ArrowUp}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus());
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("delete");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("returns focus to the trigger on Escape", async () => {
    const user = userEvent.setup();
    render(<Actions />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus());
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});

describe("Popover focus", () => {
  function FilterPopover({ keepFocus = false }: { keepFocus?: boolean }) {
    return (
      <div>
        <Popover>
          <PopoverTrigger>Filters</PopoverTrigger>
          <PopoverContent
            aria-label="Filters"
            onOpenAutoFocus={keepFocus ? (event) => event.preventDefault() : undefined}
          >
            <input aria-label="Owner" />
            <button type="button">Apply</button>
          </PopoverContent>
        </Popover>
        <button type="button">Next on page</button>
      </div>
    );
  }

  it("moves focus in on open, tabs out to the element after the trigger, and restores focus on Escape", async () => {
    const user = userEvent.setup();
    render(<FilterPopover />);
    const trigger = screen.getByRole("button", { name: "Filters" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Owner" })).toHaveFocus());

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();

    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Owner" })).toHaveFocus());
    await user.tab();
    expect(screen.getByRole("button", { name: "Apply" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Next on page" })).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("bridges Tab from the trigger into the content when open-autofocus is prevented", async () => {
    const user = userEvent.setup();
    render(<FilterPopover keepFocus />);
    const trigger = screen.getByRole("button", { name: "Filters" });
    await user.click(trigger);
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-controls", screen.getByRole("dialog").id);
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Owner" })).toHaveFocus();
  });
});

describe("Select keyboard", () => {
  it("wires the listbox, supports type-ahead and returns focus on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Select defaultValue="apple">
        <SelectTrigger aria-label="Fruit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole("button", { name: "Fruit" });
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    const listbox = await screen.findByRole("listbox");
    expect(trigger).toHaveAttribute("aria-controls", listbox.id);
    await waitFor(() => expect(screen.getByRole("option", { name: "Apple" })).toHaveFocus());

    await user.keyboard("c");
    expect(screen.getByRole("option", { name: "Cherry" })).toHaveFocus();
    // Let the type-ahead buffer expire, as it does between a person's searches.
    await new Promise((resolve) => setTimeout(resolve, 600));
    await user.keyboard("bl");
    expect(screen.getByRole("option", { name: "Blueberry" })).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
