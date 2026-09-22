import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const AiActionPluginKey = new PluginKey("spatikaAiAction");

export type AiActionStorage = {
  processing: boolean;
  lastSelection: { from: number; to: number } | null;
};

/** Highlights the active selection while an AI transform runs. */
export function createAiActionExtension() {
  return Extension.create({
    name: "aiAction",

    addStorage() {
      return {
        processing: false,
        lastSelection: null,
      } satisfies AiActionStorage;
    },

    addCommands() {
      return {
        setAiProcessing:
          (processing: boolean) =>
          ({ tr, dispatch }) => {
            this.storage.processing = processing;
            if (dispatch) dispatch(tr);
            return true;
          },
        setAiSelection:
          (range: { from: number; to: number } | null) =>
          ({ tr, dispatch }) => {
            this.storage.lastSelection = range;
            if (dispatch) dispatch(tr);
            return true;
          },
      };
    },

    addProseMirrorPlugins() {
      const storage = this.storage as AiActionStorage;
      return [
        new Plugin({
          key: AiActionPluginKey,
          props: {
            decorations: (state) => {
              if (!storage.processing || !storage.lastSelection) {
                return DecorationSet.empty;
              }
              const { from, to } = storage.lastSelection;
              if (from === to) return DecorationSet.empty;
              return DecorationSet.create(state.doc, [
                Decoration.inline(from, to, { class: "spk-editor-ai-selection" }),
              ]);
            },
          },
        }),
      ];
    },
  });
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiAction: {
      setAiProcessing: (processing: boolean) => ReturnType;
      setAiSelection: (range: { from: number; to: number } | null) => ReturnType;
    };
  }
}
