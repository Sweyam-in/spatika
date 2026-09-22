import type { Editor } from "@tiptap/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HighlightColorPanel, TextColorPanel } from "./ToolbarFormatPanels";

function createEditor() {
  const run = vi.fn();
  const chain = {
    focus: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    unsetColor: vi.fn().mockReturnThis(),
    setHighlight: vi.fn().mockReturnThis(),
    unsetHighlight: vi.fn().mockReturnThis(),
    run,
  };
  return {
    getAttributes: vi.fn((mark: string) => {
      if (mark === "textStyle") return { color: undefined };
      if (mark === "highlight") return { color: undefined };
      return {};
    }),
    chain: vi.fn(() => chain),
    chainRef: chain,
  } as unknown as Editor & { chainRef: typeof chain };
}

describe("ToolbarFormatPanels", () => {
  it("applies a text color and closes", async () => {
    const editor = createEditor();
    const close = vi.fn();
    render(<TextColorPanel editor={editor} close={close} />);
    await userEvent.click(screen.getByRole("listitem", { name: "Red text" }));
    expect(editor.chainRef.setColor).toHaveBeenCalledWith("#dc2626");
    expect(close).toHaveBeenCalled();
  });

  it("clears highlight color and closes", async () => {
    const editor = createEditor();
    const close = vi.fn();
    render(<HighlightColorPanel editor={editor} close={close} />);
    await userEvent.click(screen.getByRole("listitem", { name: "Remove highlight" }));
    expect(editor.chainRef.unsetHighlight).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });
});
