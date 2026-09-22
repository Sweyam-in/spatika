import { Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { describe, expect, it, vi } from "vitest";
import { createMentionExtension } from "./mention";

describe("createMentionExtension", () => {
  it("inserts a mention node and notifies on suggestion updates", () => {
    const onUpdate = vi.fn();
    const contacts = [{ id: "asha", label: "Asha Verma" }];
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, ...createMentionExtension(contacts, onUpdate)],
      content: "<p></p>",
    });

    editor.commands.insertContent([
      { type: "mention", attrs: { id: "asha", label: "Asha Verma" } },
      { type: "text", text: " " },
    ]);

    expect(editor.getHTML()).toContain("spk-editor-mention");
    expect(editor.getText()).toContain("@Asha Verma");

    const storage = editor.extensionManager.extensions.find((ext) => ext.name === "mentionSuggestion")
      ?.storage;
    expect(storage?.contacts).toEqual(contacts);

    editor.destroy();
  });
});
