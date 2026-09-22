import type { Editor } from "@tiptap/core";
import { describe, expect, it, vi } from "vitest";
import { extractImageFiles, insertImageFilesIntoEditor } from "./insert-editor-images";

function createEditor() {
  const run = vi.fn();
  const chain = {
    focus: vi.fn().mockReturnThis(),
    setImage: vi.fn().mockReturnThis(),
    run,
  };
  return {
    chain: vi.fn(() => chain),
  } as unknown as Editor;
}

describe("extractImageFiles", () => {
  it("returns an empty array when there is no data transfer", () => {
    expect(extractImageFiles(null)).toEqual([]);
    expect(extractImageFiles(undefined)).toEqual([]);
  });

  it("filters out non-image files", () => {
    const dataTransfer = {
      files: [
        new File(["img"], "photo.png", { type: "image/png" }),
        new File(["txt"], "notes.txt", { type: "text/plain" }),
      ],
    } as unknown as DataTransfer;

    expect(extractImageFiles(dataTransfer)).toHaveLength(1);
    expect(extractImageFiles(dataTransfer)[0]?.name).toBe("photo.png");
  });
});

describe("insertImageFilesIntoEditor", () => {
  it("inserts images through the editor chain", async () => {
    const editor = createEditor();
    const file = new File(["hello"], "photo.png", { type: "image/png" });

    const inserted = await insertImageFilesIntoEditor(editor, [file]);

    expect(inserted).toBe(true);
    expect(editor.chain).toHaveBeenCalled();
    const chain = editor.chain();
    expect(chain.setImage).toHaveBeenCalledWith({
      src: expect.stringContaining("data:image/png;base64,"),
    });
    expect(chain.run).toHaveBeenCalled();
  });

  it("uses the host upload handler when provided", async () => {
    const editor = createEditor();
    const onUpload = vi.fn(async () => "https://cdn.example.com/photo.png");
    const file = new File(["hello"], "photo.png", { type: "image/png" });

    const inserted = await insertImageFilesIntoEditor(editor, [file], { onUpload });

    expect(inserted).toBe(true);
    expect(onUpload).toHaveBeenCalledWith(file);
    const chain = editor.chain();
    expect(chain.setImage).toHaveBeenCalledWith({ src: "https://cdn.example.com/photo.png" });
  });

  it("returns false when every upload fails", async () => {
    const editor = createEditor();
    const file = new File(["hello"], "photo.png", { type: "image/png" });

    const inserted = await insertImageFilesIntoEditor(editor, [file], {
      onUpload: async () => "",
    });

    expect(inserted).toBe(false);
    expect(editor.chain).not.toHaveBeenCalled();
  });
});
