import { Extension, mergeAttributes, Node } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import type { MentionContact } from "../lib/types";

export type MentionStorage = {
  contacts: MentionContact[];
  activeIndex: number;
  query: string;
  range: { from: number; to: number } | null;
  filteredItems: MentionContact[];
  runCommand: ((item: MentionContact) => void) | null;
};

export const MentionPluginKey = new PluginKey("spatikaMention");

export function createMentionExtension(
  contacts: MentionContact[],
  onUpdate?: (state: MentionStorage) => void,
) {
  const MentionNode = Node.create({
    name: "mention",
    group: "inline",
    inline: true,
    atom: true,
    selectable: false,

    addAttributes() {
      return {
        id: { default: null },
        label: { default: null },
      };
    },

    parseHTML() {
      return [{ tag: 'span[data-type="mention"]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
      return [
        "span",
        mergeAttributes(HTMLAttributes, {
          "data-type": "mention",
          class: "spk-editor-mention",
        }),
        `@${node.attrs.label ?? node.attrs.id}`,
      ];
    },

    renderText({ node }) {
      return `@${node.attrs.label ?? node.attrs.id}`;
    },
  });

  const suggestionExtension = ExtensionWithSuggestion(contacts, onUpdate);
  return [MentionNode, suggestionExtension];
}

function ExtensionWithSuggestion(
  contacts: MentionContact[],
  onUpdate?: (state: MentionStorage) => void,
) {
  return Extension.create({
    name: "mentionSuggestion",

    addStorage() {
      return {
        contacts,
        activeIndex: 0,
        query: "",
        range: null,
        filteredItems: contacts,
        runCommand: null,
      } satisfies MentionStorage;
    },

    addProseMirrorPlugins() {
      const editor = this.editor;
      const storage = this.storage as MentionStorage;

      const suggestion: Partial<SuggestionOptions<MentionContact>> = {
        char: "@",
        pluginKey: MentionPluginKey,
        allowSpaces: false,
        items: ({ query }) => {
          const needle = query.toLowerCase();
          return contacts.filter((contact) =>
            contact.label.toLowerCase().includes(needle),
          );
        },
        command: ({ editor: ed, range, props }) => {
          ed.chain()
            .focus()
            .insertContentAt(range, [
              {
                type: "mention",
                attrs: { id: props.id, label: props.label },
              },
              { type: "text", text: " " },
            ])
            .run();
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
              storage.activeIndex = Math.min(storage.filteredItems.length - 1, storage.activeIndex + 1);
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
            storage.filteredItems = contacts;
            storage.runCommand = null;
            onUpdate?.({ ...storage });
          },
        }),
      };

      return [Suggestion({ editor, ...suggestion })];
    },
  });
}
