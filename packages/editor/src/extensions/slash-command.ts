import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import type { SlashCommandItem } from "../lib/types";

export type SlashCommandStorage = {
  items: SlashCommandItem[];
  activeIndex: number;
  query: string;
  range: { from: number; to: number } | null;
  filteredItems: SlashCommandItem[];
  runCommand: ((item: SlashCommandItem) => void) | null;
};

export const SlashCommandPluginKey = new PluginKey("spatikaSlashCommand");

export function createSlashCommandExtension(
  items: SlashCommandItem[],
  onUpdate?: (state: SlashCommandStorage) => void,
) {
  return Extension.create({
    name: "slashCommand",

    addStorage() {
      return {
        items,
        activeIndex: 0,
        query: "",
        range: null,
        filteredItems: items,
        runCommand: null,
      } satisfies SlashCommandStorage;
    },

    addProseMirrorPlugins() {
      const editor = this.editor;
      const storage = this.storage as SlashCommandStorage;

      const suggestion: Partial<SuggestionOptions<SlashCommandItem>> = {
        char: "/",
        pluginKey: SlashCommandPluginKey,
        allowSpaces: true,
        items: ({ query }) => {
          const needle = query.toLowerCase();
          return items.filter((item) => {
            if (!needle) return true;
            const haystack = [item.title, item.description, ...(item.keywords ?? [])]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return haystack.includes(needle);
          });
        },
        command: ({ editor: ed, range, props }) => {
          ed.chain().focus().deleteRange(range).run();
          props.command(editor);
        },
        render: () => ({
          onStart: (props) => {
            storage.query = props.query;
            storage.activeIndex = 0;
            storage.range = props.range;
            storage.filteredItems = props.items;
            storage.runCommand = (item) => props.command(item);
            onUpdate?.({ ...storage });
          },
          onUpdate: (props) => {
            storage.query = props.query;
            storage.activeIndex = 0;
            storage.range = props.range;
            storage.filteredItems = props.items;
            storage.runCommand = (item) => props.command(item);
            onUpdate?.({ ...storage });
          },
          onKeyDown: (props) => {
            if (props.event.key === "ArrowUp") {
              storage.activeIndex = Math.max(0, storage.activeIndex - 1);
              onUpdate?.({ ...storage });
              return true;
            }
            if (props.event.key === "ArrowDown") {
              const max = storage.filteredItems.length - 1;
              storage.activeIndex = Math.min(max, storage.activeIndex + 1);
              onUpdate?.({ ...storage });
              return true;
            }
            if (props.event.key === "Enter") {
              const item = storage.filteredItems[storage.activeIndex];
              if (item) storage.runCommand?.(item);
              return true;
            }
            if (props.event.key === "Escape") {
              storage.query = "";
              storage.range = null;
              onUpdate?.({ ...storage });
              return true;
            }
            return false;
          },
          onExit: () => {
            storage.query = "";
            storage.range = null;
            storage.activeIndex = 0;
            storage.filteredItems = items;
            storage.runCommand = null;
            onUpdate?.({ ...storage });
          },
        }),
      };

      return [Suggestion({ editor, ...suggestion })];
    },
  });
}

export function defaultSlashCommands(): SlashCommandItem[] {
  return [
    {
      id: "paragraph",
      title: "Text",
      description: "Plain paragraph",
      keywords: ["p", "text"],
      command: (editor) => editor.chain().focus().setParagraph().run(),
    },
    {
      id: "h1",
      title: "Heading 1",
      description: "Large section title",
      keywords: ["heading", "title"],
      command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: "h2",
      title: "Heading 2",
      description: "Medium section title",
      keywords: ["heading", "subtitle"],
      command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: "h3",
      title: "Heading 3",
      description: "Small section title",
      keywords: ["heading"],
      command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      id: "bullet",
      title: "Bullet list",
      description: "Unordered list",
      keywords: ["ul", "list"],
      command: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      id: "ordered",
      title: "Numbered list",
      description: "Ordered list",
      keywords: ["ol", "list"],
      command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      id: "task",
      title: "Task list",
      description: "Checklist with todos",
      keywords: ["todo", "checkbox", "task"],
      command: (editor) => editor.chain().focus().toggleTaskList().run(),
    },
    {
      id: "code-block",
      title: "Code block",
      description: "Monospace code snippet",
      keywords: ["code", "pre", "snippet"],
      command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: "quote",
      title: "Quote",
      description: "Block quotation",
      keywords: ["blockquote"],
      command: (editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      id: "divider",
      title: "Divider",
      description: "Horizontal rule",
      keywords: ["hr", "line"],
      command: (editor) => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      id: "table",
      title: "Table",
      description: "3×3 table with header",
      keywords: ["grid"],
      command: (editor) =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
  ];
}
