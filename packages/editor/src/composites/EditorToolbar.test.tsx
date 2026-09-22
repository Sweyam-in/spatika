import type { Editor } from "@tiptap/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditorToolbar } from "./EditorToolbar";

function createEditor() {
  const run = vi.fn();
  const chain = {
    focus: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleHeading: vi.fn().mockReturnThis(),
    toggleStrike: vi.fn().mockReturnThis(),
    toggleCode: vi.fn().mockReturnThis(),
    toggleCodeBlock: vi.fn().mockReturnThis(),
    toggleTaskList: vi.fn().mockReturnThis(),
    setTextAlign: vi.fn().mockReturnThis(),
    setParagraph: vi.fn().mockReturnThis(),
    extendMarkRange: vi.fn().mockReturnThis(),
    setLink: vi.fn().mockReturnThis(),
    insertTable: vi.fn().mockReturnThis(),
    setImage: vi.fn().mockReturnThis(),
    undo: vi.fn().mockReturnThis(),
    redo: vi.fn().mockReturnThis(),
    run,
  };
  return {
    isActive: vi.fn().mockReturnValue(false),
    chain: vi.fn(() => chain),
    can: vi.fn(() => ({
      undo: vi.fn().mockReturnValue(true),
      redo: vi.fn().mockReturnValue(false),
    })),
    on: vi.fn(),
    off: vi.fn(),
    getAttributes: vi.fn().mockReturnValue({ href: undefined, color: undefined }),
    state: { selection: { empty: true, from: 0, to: 0 } },
  } as unknown as Editor;
}

describe("EditorToolbar", () => {
  it("returns null without an editor", () => {
    const { container } = render(<EditorToolbar editor={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders configured groups and toggles bold", async () => {
    const editor = createEditor();
    render(
      <EditorToolbar
        editor={editor}
        config={{ layout: "compact", insert: false, ai: false, alignment: false }}
      />,
    );
    expect(screen.getByRole("toolbar", { name: "Editor formatting" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(editor.chain).toHaveBeenCalled();
  });

  it("calls onInsertImage instead of prompting", async () => {
    const editor = createEditor();
    const onInsertImage = vi.fn();
    render(
      <EditorToolbar
        editor={editor}
        config={{ textStyle: false, inlineFormat: false, lists: false, alignment: false, ai: false }}
        onInsertImage={onInsertImage}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Insert image" }));
    expect(onInsertImage).toHaveBeenCalledTimes(1);
  });

  it("opens insert panels instead of native prompts", async () => {
    const editor = createEditor();
    render(
      <EditorToolbar
        editor={editor}
        config={{ textStyle: false, inlineFormat: false, lists: false, alignment: false, ai: false }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Insert link" }));
    expect(screen.getByRole("dialog", { name: "Insert link" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Insert table" }));
    expect(screen.getByRole("dialog", { name: "Insert table" })).toBeInTheDocument();
  });

  it("renders undo and redo controls", async () => {
    const editor = createEditor();
    render(
      <EditorToolbar
        editor={editor}
        config={{ textStyle: false, inlineFormat: false, lists: false, alignment: false, insert: false, ai: false }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));
    const chain = editor.chain();
    expect(chain.undo).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();
  });

  it("renders the AI command menu when enabled", async () => {
    const editor = createEditor();
    render(
      <EditorToolbar
        editor={editor}
        config={{ textStyle: false, inlineFormat: false, lists: false, alignment: false, insert: false }}
        useAiCommandMenu
        onAiCommand={vi.fn()}
        aiCommandMenu={{ title: "Doc AI", placement: "toolbar" }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "AI commands" }));
    expect(screen.getByRole("dialog", { name: "Doc AI" })).toBeInTheDocument();
  });

  it("renders extended formatting controls", async () => {
    const editor = createEditor();
    render(
      <EditorToolbar
        editor={editor}
        config={{ textStyle: false, lists: false, alignment: false, insert: false, ai: false, history: false }}
      />,
    );
    expect(screen.getByRole("button", { name: "Strikethrough" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inline code" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subscript" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Text color" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Strikethrough" }));
    expect(editor.chain).toHaveBeenCalled();
  });

  it("renders task list, justify, and code block controls", async () => {
    const editor = createEditor();
    render(
      <EditorToolbar
        editor={editor}
        config={{ textStyle: false, inlineFormat: false, ai: false, history: false }}
      />,
    );
    expect(screen.getByRole("button", { name: "Task list" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Justify" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Code block" }));
    expect(editor.chain).toHaveBeenCalled();
  });
});
