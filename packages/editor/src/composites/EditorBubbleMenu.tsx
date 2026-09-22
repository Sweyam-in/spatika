import type { Editor } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Code, Italic, Sparkles, Strikethrough, Underline as UnderlineIcon } from "lucide-react";
import type { AiActionDefinition } from "../lib/types";
import { ToolbarButton } from "./ToolbarButton";

type EditorBubbleMenuProps = {
  editor: Editor | null;
  aiActions?: AiActionDefinition[];
  onAiAction?: (actionId: string) => void;
};

export function EditorBubbleMenu({ editor, aiActions, onAiAction }: EditorBubbleMenuProps) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      className="spk-editor-bubble-menu"
      shouldShow={({ editor: ed, state }) => {
        const { selection } = state;
        if (selection.empty) return false;
        if (ed.isActive("image")) return false;
        return true;
      }}
    >
      <ToolbarButton
        aria-label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Inline code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="size-4" />
      </ToolbarButton>
      {aiActions?.map((action) => (
        <ToolbarButton
          key={action.id}
          aria-label={action.label}
          onClick={() => onAiAction?.(action.id)}
        >
          {action.icon ?? <Sparkles className="size-4" />}
        </ToolbarButton>
      ))}
    </BubbleMenu>
  );
}
