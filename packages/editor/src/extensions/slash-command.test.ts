import { Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { describe, expect, it, vi } from "vitest";
import { createSlashCommandExtension, defaultSlashCommands } from "./slash-command";

describe("defaultSlashCommands", () => {
  it("includes common block types", () => {
    const ids = defaultSlashCommands().map((item) => item.id);
    expect(ids).toEqual(
      expect.arrayContaining(["paragraph", "h1", "bullet", "task", "code-block", "table", "divider"]),
    );
  });
});

describe("createSlashCommandExtension", () => {
  it("registers slash command storage and filters items by query", () => {
    const onUpdate = vi.fn();
    const custom = {
      id: "custom",
      title: "Custom block",
      command: vi.fn(),
    };
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        createSlashCommandExtension([...defaultSlashCommands(), custom], onUpdate),
      ],
      content: "<p></p>",
    });

    const storage = editor.storage.slashCommand;
    expect(storage.items.some((item: { id: string }) => item.id === "custom")).toBe(true);

    const pluginItems = storage.items.filter((item: { title: string }) =>
      item.title.toLowerCase().includes("heading"),
    );
    expect(pluginItems.length).toBeGreaterThan(0);

    editor.destroy();
  });
});
