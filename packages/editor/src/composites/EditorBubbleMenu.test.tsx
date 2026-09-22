import type { Editor } from "@tiptap/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditorBubbleMenu } from "./EditorBubbleMenu";

vi.mock("@tiptap/react/menus", () => ({
  BubbleMenu: ({ children }: { children: React.ReactNode }) => (
    <div role="group" aria-label="Bubble menu">
      {children}
    </div>
  ),
}));

function createEditor() {
  const run = vi.fn();
  const chain = {
    focus: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleUnderline: vi.fn().mockReturnThis(),
    run,
  };
  return {
    isActive: vi.fn().mockReturnValue(false),
    chain: vi.fn(() => chain),
  } as unknown as Editor;
}

describe("EditorBubbleMenu", () => {
  it("returns null without an editor", () => {
    const { container } = render(<EditorBubbleMenu editor={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("toggles bold from the bubble menu", async () => {
    const editor = createEditor();
    render(
      <EditorBubbleMenu
        editor={editor}
        aiActions={[{ id: "improve", label: "Improve writing" }]}
        onAiAction={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(editor.chain).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Improve writing" })).toBeInTheDocument();
  });
});
