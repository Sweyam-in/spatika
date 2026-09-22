import type { Editor } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
import { AlignCenter, AlignLeft, AlignRight, Trash2 } from "lucide-react";
import type { ImageAlign } from "../extensions/resizable-image";
import { ToolbarButton } from "./ToolbarButton";

type ImageBubbleMenuProps = {
  editor: Editor | null;
};

export function ImageBubbleMenu({ editor }: ImageBubbleMenuProps) {
  if (!editor) return null;

  const setAlign = (align: ImageAlign) => {
    editor.chain().focus().updateAttributes("image", { align }).run();
  };

  const setWidth = (width: string) => {
    editor.chain().focus().updateAttributes("image", { width }).run();
  };

  return (
    <BubbleMenu
      editor={editor}
      className="spk-editor-bubble-menu"
      shouldShow={({ editor: ed }) => ed.isActive("image")}
    >
      <ToolbarButton aria-label="Align image left" onClick={() => setAlign("left")}>
        <AlignLeft className="size-4" />
      </ToolbarButton>
      <ToolbarButton aria-label="Align image center" onClick={() => setAlign("center")}>
        <AlignCenter className="size-4" />
      </ToolbarButton>
      <ToolbarButton aria-label="Align image right" onClick={() => setAlign("right")}>
        <AlignRight className="size-4" />
      </ToolbarButton>
      <ToolbarButton aria-label="Image width 50%" onClick={() => setWidth("50%")}>
        50%
      </ToolbarButton>
      <ToolbarButton aria-label="Image width 100%" onClick={() => setWidth("100%")}>
        100%
      </ToolbarButton>
      <ToolbarButton
        aria-label="Delete image"
        onClick={() => editor.chain().focus().deleteSelection().run()}
      >
        <Trash2 className="size-4" />
      </ToolbarButton>
    </BubbleMenu>
  );
}
