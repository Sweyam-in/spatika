import type { Editor } from "@tiptap/core";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Palette,
  Pilcrow,
  Quote,
  Redo2,
  Sparkles,
  SquareCode,
  Strikethrough,
  Subscript,
  Superscript,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { AiActionDefinition, AiCommandMenuConfig, ImageInsertConfig, SpatikaEditorToolbarConfig } from "../lib/types";
import { DEFAULT_TOOLBAR } from "../lib/types";
import { cn } from "../lib/cn";
import { AiCommandMenu, type AiCommandRunRequest } from "./AiCommandMenu";
import { ToolbarButton } from "./ToolbarButton";
import { ImageInsertPanel, LinkInsertPanel, TableInsertPanel } from "./ToolbarInsertPanels";
import { HighlightColorPanel, TextColorPanel } from "./ToolbarFormatPanels";
import { ToolbarPopover } from "./ToolbarPopover";

type EditorToolbarProps = {
  editor: Editor | null;
  config?: SpatikaEditorToolbarConfig;
  toolbarActions?: ReactNode;
  aiActions?: AiActionDefinition[];
  aiCommandMenu?: AiCommandMenuConfig | false;
  useAiCommandMenu?: boolean;
  onAiCommand?: (request: AiCommandRunRequest) => void;
  onAiAction?: (actionId: string) => void;
  onInsertImage?: () => void;
  imageInsert?: ImageInsertConfig;
  className?: string;
};

function ToolbarGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("spk-editor-toolbar-group", className)}>{children}</div>;
}

export function EditorToolbar({
  editor,
  config,
  toolbarActions,
  aiActions,
  aiCommandMenu,
  useAiCommandMenu = false,
  onAiCommand,
  onAiAction,
  onInsertImage,
  imageInsert,
  className,
}: EditorToolbarProps) {
  const toolbar = { ...DEFAULT_TOOLBAR, ...config };
  const [, setRevision] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const refresh = () => setRevision((value) => value + 1);
    editor.on("transaction", refresh);
    return () => {
      editor.off("transaction", refresh);
    };
  }, [editor]);

  if (!editor) return null;

  const historyGroup = toolbar.history ? (
    <ToolbarGroup>
      <ToolbarButton
        aria-label="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="size-4" />
      </ToolbarButton>
    </ToolbarGroup>
  ) : null;

  const textStyleGroup = toolbar.textStyle ? (
    <ToolbarGroup>
      <ToolbarButton
        aria-label="Paragraph"
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>
    </ToolbarGroup>
  ) : null;

  const inlineGroup = toolbar.inlineFormat ? (
    <ToolbarGroup>
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
      <ToolbarButton
        aria-label="Subscript"
        active={editor.isActive("subscript")}
        onClick={() => editor.chain().focus().toggleSubscript().run()}
      >
        <Subscript className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Superscript"
        active={editor.isActive("superscript")}
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
      >
        <Superscript className="size-4" />
      </ToolbarButton>
      <ToolbarPopover
        label="Text color"
        title="Text color"
        icon={<Palette className="size-4" />}
        active={Boolean(editor.getAttributes("textStyle").color)}
      >
        {({ close }) => <TextColorPanel editor={editor} close={close} />}
      </ToolbarPopover>
      <ToolbarPopover
        label="Highlight"
        title="Highlight color"
        icon={<Highlighter className="size-4" />}
        active={editor.isActive("highlight")}
      >
        {({ close }) => <HighlightColorPanel editor={editor} close={close} />}
      </ToolbarPopover>
      <ToolbarButton
        aria-label="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>
    </ToolbarGroup>
  ) : null;

  const listGroup = toolbar.lists ? (
    <ToolbarGroup>
      <ToolbarButton
        aria-label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Task list"
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <ListTodo className="size-4" />
      </ToolbarButton>
    </ToolbarGroup>
  ) : null;

  const alignGroup = toolbar.alignment ? (
    <ToolbarGroup>
      <ToolbarButton
        aria-label="Align left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Align center"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Align right"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Justify"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify className="size-4" />
      </ToolbarButton>
    </ToolbarGroup>
  ) : null;

  const insertGroup = toolbar.insert ? (
    <ToolbarGroup>
      <ToolbarPopover label="Insert link" title="Insert link" icon={<Link2 className="size-4" />}>
        {({ close }) => <LinkInsertPanel editor={editor} close={close} />}
      </ToolbarPopover>
      <ToolbarButton
        aria-label="Insert divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        aria-label="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <SquareCode className="size-4" />
      </ToolbarButton>
      <ToolbarPopover label="Insert table" title="Insert table" icon={<Table2 className="size-4" />}>
        {({ close }) => <TableInsertPanel editor={editor} close={close} />}
      </ToolbarPopover>
      {onInsertImage ? (
        <ToolbarButton aria-label="Insert image" onClick={onInsertImage}>
          <ImageIcon className="size-4" />
        </ToolbarButton>
      ) : (
        <ToolbarPopover label="Insert image" title="Insert image" icon={<ImageIcon className="size-4" />}>
          {({ close }) => <ImageInsertPanel editor={editor} close={close} config={imageInsert} />}
        </ToolbarPopover>
      )}
    </ToolbarGroup>
  ) : null;

  const aiGroup =
    toolbar.ai && useAiCommandMenu && onAiCommand ? (
      <ToolbarGroup>
        <AiCommandMenu
          editor={editor}
          config={typeof aiCommandMenu === "object" ? aiCommandMenu : undefined}
          actions={aiActions}
          onRun={onAiCommand}
        />
      </ToolbarGroup>
    ) : toolbar.ai && aiActions?.length ? (
      <ToolbarGroup>
        {aiActions.map((action) => (
          <ToolbarButton
            key={action.id}
            aria-label={action.label}
            onClick={() => onAiAction?.(action.id)}
          >
            {action.icon ?? <Sparkles className="size-4" />}
          </ToolbarButton>
        ))}
      </ToolbarGroup>
    ) : null;

  const groupNodes = [
    { id: "history", node: historyGroup },
    { id: "text-style", node: textStyleGroup },
    { id: "inline", node: inlineGroup },
    { id: "lists", node: listGroup },
    { id: "align", node: alignGroup },
    { id: "insert", node: insertGroup },
    { id: "ai", node: aiGroup },
  ].filter((entry) => entry.node);

  return (
    <div
      className={cn(
        "spk-editor-toolbar",
        toolbar.layout === "compact" && "spk-editor-toolbar--compact",
        className,
      )}
      role="toolbar"
      aria-label="Editor formatting"
    >
      <div className="spk-editor-toolbar-row">
        {groupNodes.map((entry) => (
          <div key={entry.id}>{entry.node}</div>
        ))}
      </div>
      {toolbarActions ? <div className="spk-editor-toolbar-actions">{toolbarActions}</div> : null}
    </div>
  );
}
