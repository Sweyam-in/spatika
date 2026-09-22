import { Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { describe, expect, it } from "vitest";
import { AiActionPluginKey, createAiActionExtension } from "./ai-action";

describe("createAiActionExtension", () => {
  it("stores AI processing and selection range", () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, createAiActionExtension()],
      content: "<p>Hello world</p>",
    });

    editor.commands.setAiSelection({ from: 1, to: 6 });
    editor.commands.setAiProcessing(true);

    expect(editor.storage.aiAction.lastSelection).toEqual({ from: 1, to: 6 });
    expect(editor.storage.aiAction.processing).toBe(true);

    const plugin = editor.state.plugins.find((item) => item.spec.key === AiActionPluginKey);
    expect(plugin).toBeDefined();

    editor.destroy();
  });
});
