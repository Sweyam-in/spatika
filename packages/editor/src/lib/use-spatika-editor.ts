import { useEffect, useMemo, useRef } from "react";
import type { Extensions } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import { createAiActionExtension } from "../extensions/ai-action";
import { createMentionExtension } from "../extensions/mention";
import { ResizableImage } from "../extensions/resizable-image";
import {
  createSlashCommandExtension,
  defaultSlashCommands,
} from "../extensions/slash-command";
import type { PlaceholderConfig, UseSpatikaEditorOptions } from "./types";
import { extractImageFiles, insertImageFilesIntoEditor } from "./insert-editor-images";

function resolvePlaceholder(placeholder?: PlaceholderConfig) {
  if (!placeholder) return "Start writing…";
  if (typeof placeholder === "string") return placeholder;
  return (props: { node: { type: { name: string }; attrs: { level?: number } }; pos: number }) =>
    placeholder({
      type: props.node.type.name,
      level: props.node.attrs.level,
      pos: props.pos,
    });
}

export function buildSpatikaExtensions(
  options: UseSpatikaEditorOptions & {
    onSlashUpdate?: Parameters<typeof createSlashCommandExtension>[1];
    onMentionUpdate?: Parameters<typeof createMentionExtension>[1];
  },
): Extensions {
  const imageExtension = options.resizableImages ? ResizableImage : Image;
  const slashItems = [
    ...defaultSlashCommands(),
    ...(options.slashCommands ?? []),
  ];

  const extensions: Extensions = [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: false,
      underline: false,
      ...options.starterKit,
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: "spk-editor-link" },
    }),
    Placeholder.configure({
      placeholder: resolvePlaceholder(options.placeholder),
    }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    imageExtension.configure({ inline: false, allowBase64: true }),
    createSlashCommandExtension(slashItems, options.onSlashUpdate),
    ...(options.onAiSelectionAction || options.onAiCommand ? [createAiActionExtension()] : []),
    ...(options.extensions ?? []),
  ];

  if (options.mentions?.length) {
    extensions.push(...createMentionExtension(options.mentions, options.onMentionUpdate));
  }

  return extensions;
}

export function useSpatikaEditor(options: UseSpatikaEditorOptions) {
  const onChangeRef = useRef(options.onChange);
  onChangeRef.current = options.onChange;
  const slashUpdateRef = useRef(options.onSlashUpdate);
  slashUpdateRef.current = options.onSlashUpdate;
  const mentionUpdateRef = useRef(options.onMentionUpdate);
  mentionUpdateRef.current = options.onMentionUpdate;
  const imageInsertRef = useRef(options.imageInsert);
  imageInsertRef.current = options.imageInsert;
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  const extensions = useMemo(
    () =>
      buildSpatikaExtensions({
        ...options,
        onSlashUpdate: (state) => slashUpdateRef.current?.(state),
        onMentionUpdate: (state) => mentionUpdateRef.current?.(state),
      }),
    [
      options.placeholder,
      options.resizableImages,
      options.slashCommands,
      options.mentions,
      options.extensions,
      options.starterKit,
      options.onAiSelectionAction,
      options.onAiCommand,
    ],
  );

  const editor = useEditor({
    immediatelyRender: true,
    extensions,
    content: options.value,
    editable: !options.disabled,
    onUpdate: ({ editor: ed }) => {
      onChangeRef.current(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: "spk-editor-content ProseMirror",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Rich text editor",
      },
      handleDrop(view, event) {
        const files = extractImageFiles(event.dataTransfer);
        if (!files.length) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (coords) {
          view.dispatch(
            view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(coords.pos))),
          );
        }
        const ed = editorRef.current;
        if (ed) void insertImageFilesIntoEditor(ed, files, imageInsertRef.current);
        return true;
      },
      handlePaste(_view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const files = Array.from(items)
          .filter((item) => item.type.startsWith("image/"))
          .map((item) => item.getAsFile())
          .filter((file): file is File => Boolean(file));
        if (!files.length) return false;
        event.preventDefault();
        const ed = editorRef.current;
        if (ed) void insertImageFilesIntoEditor(ed, files, imageInsertRef.current);
        return true;
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // useEditor can hand back an instance that React StrictMode's delayed cleanup has already
  // destroyed (its schema is gone); touching it throws, so the sync effects skip it and run
  // again with the replacement instance.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!options.disabled);
  }, [editor, options.disabled]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = editor.getHTML();
    if (options.value !== current) {
      editor.commands.setContent(options.value, { emitUpdate: false });
    }
  }, [editor, options.value]);

  return {
    editor,
    isReady: Boolean(editor),
  };
}
