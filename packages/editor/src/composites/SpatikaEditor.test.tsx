import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { defaultSlashCommands } from "../extensions/slash-command";
import { buildSpatikaExtensions } from "../lib/use-spatika-editor";
import { SpatikaEditor } from "./SpatikaEditor";

function ControlledEditor(
  props: Partial<React.ComponentProps<typeof SpatikaEditor>> & { initial?: string },
) {
  const [value, setValue] = useState(props.initial ?? "<p>Hello editor</p>");
  return (
    <SpatikaEditor
      value={value}
      onChange={setValue}
      placeholder="Write here…"
      toolbar={{ layout: "compact", ai: false }}
      {...props}
    />
  );
}

describe("buildSpatikaExtensions", () => {
  it("includes default slash commands and starter kit", () => {
    const extensions = buildSpatikaExtensions({
      value: "",
      onChange: () => {},
    });
    expect(extensions.length).toBeGreaterThan(5);
    expect(defaultSlashCommands().map((item) => item.id)).toContain("h1");
  });
});

describe("SpatikaEditor", () => {
  it("renders toolbar controls and editable surface", async () => {
    render(<ControlledEditor />);
    expect(await screen.findByRole("toolbar", { name: "Editor formatting" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Rich text editor" })).toBeInTheDocument();
    expect(screen.getByLabelText("Bold")).toBeInTheDocument();
  });

  it("calls onChange when block formatting is applied", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledEditor onChange={onChange} initial="<p>Hello</p>" />);
    const surface = await screen.findByRole("textbox", { name: "Rich text editor" });
    await user.click(surface);
    await user.click(screen.getByLabelText("Heading 1"));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      const last = onChange.mock.calls.at(-1)?.[0] as string;
      expect(last).toContain("<h1");
    });
  });

  it("shows slash command menu when typing /", async () => {
    const user = userEvent.setup();
    render(<ControlledEditor initial="<p></p>" />);
    const surface = await screen.findByRole("textbox", { name: "Rich text editor" });
    await user.click(surface);
    await user.type(surface, "/heading");
    await waitFor(
      () => {
        expect(screen.getByRole("listbox", { name: "Slash commands" })).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByRole("option", { name: /Heading 1/i })).toBeInTheDocument();
  });

  it("shows mention menu when mentions are provided", async () => {
    const user = userEvent.setup();
    render(
      <ControlledEditor
        initial="<p></p>"
        mentions={[{ id: "1", label: "Asha Verma", subtitle: "Design" }]}
      />,
    );
    const surface = await screen.findByRole("textbox", { name: "Rich text editor" });
    await user.click(surface);
    await user.keyboard("@ash");
    expect(await screen.findByRole("listbox", { name: "Mentions" })).toBeInTheDocument();
    expect(screen.getByText("Asha Verma")).toBeInTheDocument();
  });

  it("shows the AI dock when an AI handler is provided", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ControlledEditor
        onAiCommand={async () => "Rewritten text"}
        aiCommandMenu={{ title: "AI Toolkit examples", placement: "dock" }}
        toolbar={{ ai: true, layout: "compact", insert: false, alignment: false, lists: false, textStyle: false }}
      />,
    );
    await screen.findByRole("textbox", { name: "Rich text editor" });
    expect(
      screen.getByPlaceholderText("Ask about this document or request a change…"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Proofread selection")).not.toBeInTheDocument();
    expect(container.querySelector(".spk-editor-ai-dock-footer")).toBeInTheDocument();
    expect(container.querySelector(".spk-editor-shell--with-ai-dock")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "AI commands" }));
    expect(screen.getByRole("dialog", { name: "AI Toolkit examples" })).toBeInTheDocument();
  });

  it("shows the toolbar AI menu when placement is toolbar", async () => {
    const user = userEvent.setup();
    render(
      <ControlledEditor
        onAiCommand={async () => "Rewritten text"}
        aiCommandMenu={{ title: "AI Toolkit examples", placement: "toolbar" }}
        toolbar={{ ai: true, layout: "compact", insert: false, alignment: false, lists: false, textStyle: false }}
      />,
    );
    await screen.findByRole("textbox", { name: "Rich text editor" });
    await user.click(screen.getByRole("button", { name: "AI commands" }));
    expect(screen.getByRole("dialog", { name: "AI Toolkit examples" })).toBeInTheDocument();
  });

  it("expands to fullscreen on focus when mobileFullscreen is enabled", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("max-width: 767px"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    const user = userEvent.setup();
    render(
      <ControlledEditor
        mobileFullscreen
        initial="<p>Mobile edit</p>"
        toolbar={{ ai: false, layout: "compact" }}
      />,
    );
    const surface = await screen.findByRole("textbox", { name: "Rich text editor" });
    await user.click(surface);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
    });

    vi.unstubAllGlobals();
  });

  it("invokes onAiSelectionAction when text is selected", async () => {
    const onAiSelectionAction = vi.fn(async () => "Rewritten text");
    render(
      <ControlledEditor
        initial="<p>Selected text</p>"
        onAiSelectionAction={onAiSelectionAction}
        aiCommandMenu={false}
        aiActions={[{ id: "improve", label: "Improve writing" }]}
        toolbar={{ ai: true, layout: "compact", insert: false, alignment: false, lists: false, textStyle: false }}
      />,
    );
    await screen.findByRole("textbox", { name: "Rich text editor" });
    await screen.getByLabelText("Improve writing").click();
    expect(onAiSelectionAction).not.toHaveBeenCalled();
  });
});
