import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { describe, expect, it } from "vitest";
import { ResizableImage } from "./resizable-image";

describe("ResizableImage", () => {
  it("parses width and align attributes from HTML", () => {
    const editor = new Editor({
      extensions: [
        StarterKit.configure({
          code: false,
          codeBlock: false,
          link: false,
          underline: false,
        }),
        ResizableImage,
      ],
      content: '<img src="https://example.com/a.png" data-width="50%" data-align="left" />',
    });

    const html = editor.getHTML();
    expect(html).toContain('data-width="50%"');
    expect(html).toContain('data-align="left"');
    expect(html).toContain("spk-editor-image-wrap--left");

    editor.destroy();
  });
});
