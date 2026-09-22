import type { Editor } from "@tiptap/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ImageBubbleMenu } from "./ImageBubbleMenu";

vi.mock("@tiptap/react/menus", () => ({
  BubbleMenu: ({ children }: { children: React.ReactNode }) => (
    <div role="group" aria-label="Image bubble menu">
      {children}
    </div>
  ),
}));

function createEditor() {
  const run = vi.fn();
  const chain = {
    focus: vi.fn().mockReturnThis(),
    updateAttributes: vi.fn().mockReturnThis(),
    deleteSelection: vi.fn().mockReturnThis(),
    run,
  };
  return {
    isActive: vi.fn().mockReturnValue(true),
    chain: vi.fn(() => chain),
  } as unknown as Editor;
}

describe("ImageBubbleMenu", () => {
  it("returns null without an editor", () => {
    const { container } = render(<ImageBubbleMenu editor={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("updates image width from bubble controls", async () => {
    const editor = createEditor();
    render(<ImageBubbleMenu editor={editor} />);
    await userEvent.click(screen.getByRole("button", { name: "Image width 50%" }));
    const chain = editor.chain();
    expect(chain.updateAttributes).toHaveBeenCalledWith("image", { width: "50%" });
    expect(chain.run).toHaveBeenCalled();
  });
});
