/**
 * What a screen reader would say, checked with @guidepup/virtual-screen-reader: it walks the
 * accessibility tree the way NVDA / VoiceOver do in browse mode and logs the phrases they would
 * speak, including live-region announcements. It follows the ARIA specs rather than any one
 * screen reader's quirks, so it complements — does not replace — the manual protocol in
 * docs/testing/screen-readers.md.
 */
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { virtual } from "@guidepup/virtual-screen-reader";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "../primitives/Button";
import { Checkbox } from "../primitives/Checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../primitives/Dialog";
import { Input } from "../primitives/Input";
import { Switch } from "../primitives/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../primitives/Tabs";
import { TagInput } from "../primitives/TagInput";
import { Calendar } from "../composites/Calendar";
import { DateInput } from "../composites/DateInput";
import { FormField } from "../composites/FormField";
import { Toaster, useToast } from "../composites/Toast";
import { TreeView } from "../composites/TreeView";

/** Reads `steps` items forward from the start of `container` and returns everything spoken. */
async function read(container: HTMLElement, steps: number, before?: () => Promise<void>) {
  await virtual.start({ container });
  if (before) await before();
  for (let i = 0; i < steps; i += 1) await virtual.next();
  return virtual.spokenPhraseLog();
}

afterEach(async () => {
  await virtual.stop();
});

describe("screen reader output", () => {
  it("reads a field's label, value, error, required and invalid state together", async () => {
    const { container } = render(
      <FormField label="Email" error="Enter a valid email" required>
        <Input defaultValue="maya@" />
      </FormField>,
    );
    const spoken = await read(container, 2);
    expect(spoken).toContain("textbox, Email, maya@, Enter a valid email, invalid, required");
  });

  it("names each date segment with its unit and the field label", async () => {
    const { container } = render(
      <FormField label="Due date">
        <DateInput locale="en-US" defaultValue={new Date(2026, 4, 20)} />
      </FormField>,
    );
    const spoken = await read(container, 6);
    expect(spoken).toContain("group, Due date");
    expect(spoken.some((phrase) => phrase.startsWith("spinbutton, month Due date") && phrase.includes("current value 05"))).toBe(true);
    expect(spoken.some((phrase) => phrase.startsWith("spinbutton, day Due date") && phrase.includes("current value 20"))).toBe(true);
  });

  it("gives tabs their position, selection and panel", async () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Sections">
          <TabsTrigger value="a">Overview</TabsTrigger>
          <TabsTrigger value="b">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Overview panel</TabsContent>
        <TabsContent value="b">Billing panel</TabsContent>
      </Tabs>,
    );
    const spoken = await read(container, 6);
    expect(spoken).toContain("tab, Overview, selected, 1 control, position 1, set size 2");
    expect(spoken).toContain("tab, Billing, not selected, position 2, set size 2");
    expect(spoken).toContain("tabpanel, Overview");
  });

  it("states control roles and states, including a busy button", async () => {
    const { container } = render(
      <div>
        <Switch aria-label="Email alerts" defaultChecked />
        <Checkbox aria-label="Accept terms" />
        <Button loading>Save</Button>
      </div>,
    );
    const spoken = await read(container, 3);
    expect(spoken).toContain("switch, Email alerts, checked");
    expect(spoken).toContain("checkbox, Accept terms, not checked");
    // aria-disabled (focus stays) is spoken as disabled, with busy for the loading state.
    expect(spoken).toContain("button, Save, busy, disabled");
  });

  it("announces a dialog with its title and description as modal", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Rename file</DialogTitle>
          <DialogDescription>Names must be unique.</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    const spoken = await read(document.body, 3);
    expect(spoken).toContain("dialog, Rename file, Names must be unique., modal");
  });

  it("reads tree items with level, position and expansion", async () => {
    const { container } = render(
      <TreeView
        aria-label="Files"
        items={[
          { id: "src", label: "src", children: [{ id: "app", label: "App.tsx" }] },
          { id: "readme", label: "README.md" },
        ]}
      />,
    );
    const spoken = await read(container, 5);
    expect(spoken).toContain("tree, Files, orientated vertically");
    expect(spoken).toContain("treeitem, src, not expanded, level 1, position 1, not selected, set size 2");
  });

  it("announces a toast once, with a pause between title and description", async () => {
    function Trigger() {
      const { toast } = useToast();
      return <button onClick={() => toast({ title: "Saved", description: "Changes are live." })}>Save</button>;
    }
    render(
      <Toaster>
        <Trigger />
      </Toaster>,
    );
    const spoken = await read(document.body, 1, async () => {
      await userEvent.click(screen.getByRole("button", { name: "Save" }));
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
    });
    expect(spoken.filter((phrase) => phrase.startsWith("polite:"))).toEqual(["polite: Saved Changes are live."]);
  });

  it("announces tags as they are added and removed", async () => {
    const user = userEvent.setup();
    const { container } = render(<TagInput aria-label="Labels" />);
    const spoken = await read(container, 0, async () => {
      await user.click(screen.getByRole("textbox", { name: "Labels" }));
      await user.keyboard("design{Enter}");
      await user.keyboard("{Backspace}");
    });
    const announcements = spoken.filter((phrase) => phrase.startsWith("polite:"));
    expect(announcements.length).toBeGreaterThanOrEqual(2);
    expect(announcements[0]).toMatch(/design/i);
    expect(announcements.at(-1)).toMatch(/design/i);
  });

  it("announces the month when the calendar pages", async () => {
    const user = userEvent.setup();
    const { container } = render(<Calendar defaultMonth={new Date(2026, 2, 1)} locale="en-US" />);
    const spoken = await read(container, 0, async () => {
      await user.click(screen.getByRole("button", { name: /next month/i }));
    });
    expect(spoken).toContain("polite: April 2026");
  });
});
