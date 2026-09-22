import type { Editor } from "@tiptap/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ImageInsertPanel, LinkInsertPanel, TableInsertPanel } from "./ToolbarInsertPanels";

function createEditor() {
  const run = vi.fn();
  const chain = {
    focus: vi.fn().mockReturnThis(),
    extendMarkRange: vi.fn().mockReturnThis(),
    setLink: vi.fn().mockReturnThis(),
    unsetLink: vi.fn().mockReturnThis(),
    setImage: vi.fn().mockReturnThis(),
    insertTable: vi.fn().mockReturnThis(),
    run,
  };
  return {
    getAttributes: vi.fn().mockReturnValue({ href: undefined }),
    chain: vi.fn(() => chain),
  } as unknown as Editor;
}

describe("ToolbarInsertPanels", () => {
  it("applies a link from the panel", async () => {
    const editor = createEditor();
    const close = vi.fn();
    render(<LinkInsertPanel editor={editor} close={close} />);
    await userEvent.clear(screen.getByLabelText("URL"));
    await userEvent.type(screen.getByLabelText("URL"), "https://spatika.dev");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(editor.chain).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });

  it("inserts an image from the panel URL field", async () => {
    const editor = createEditor();
    const close = vi.fn();
    render(<ImageInsertPanel editor={editor} close={close} />);
    expect(screen.getByText("Click to upload or drag and drop")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Image URL"), "https://example.com/a.png");
    await userEvent.click(screen.getByRole("button", { name: "Insert" }));
    expect(editor.chain).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });

  it("inserts a table from the grid picker", async () => {
    const editor = createEditor();
    const close = vi.fn();
    render(<TableInsertPanel editor={editor} close={close} />);
    await userEvent.click(screen.getByRole("gridcell", { name: "5 by 4 table" }));
    const chain = editor.chain();
    expect(chain.insertTable).toHaveBeenCalledWith({
      rows: 4,
      cols: 5,
      withHeaderRow: true,
    });
    expect(close).toHaveBeenCalled();
  });

  it("inserts a gallery photo from the quick-pick grid", async () => {
    const editor = createEditor();
    const close = vi.fn();
    const onGalleryPrefetch = vi.fn();
    const chain = editor.chain();

    render(
      <ImageInsertPanel
        editor={editor}
        close={close}
        config={{
          galleryPhotos: [{ id: 1, url: "https://example.com/gallery.png", alt: "Gallery photo" }],
          onGalleryPrefetch,
          galleryOpenLabel: "Open full gallery",
          galleryInsertWidth: "min(100%, 28rem)",
        }}
      />,
    );

    expect(onGalleryPrefetch).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Gallery photo" }));
    expect(chain.setImage).toHaveBeenCalledWith({
      src: "https://example.com/gallery.png",
      width: "min(100%, 28rem)",
    });
    expect(close).toHaveBeenCalled();
  });

  it("opens the host gallery action from the insert panel", async () => {
    const editor = createEditor();
    const close = vi.fn();
    const onGalleryOpen = vi.fn();

    render(
      <ImageInsertPanel
        editor={editor}
        close={close}
        config={{ onGalleryOpen, galleryOpenLabel: "Open full gallery" }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Open full gallery" }));
    expect(onGalleryOpen).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });

  it("does not submit surrounding forms when pressing Enter in the URL field", async () => {
    const editor = createEditor();
    const close = vi.fn();
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());

    render(
      <form onSubmit={onSubmit}>
        <ImageInsertPanel editor={editor} close={close} />
      </form>,
    );

    const input = screen.getByLabelText("Image URL");
    await userEvent.type(input, "https://example.com/a.png{enter}");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(editor.chain).toHaveBeenCalled();
  });

  it("does not submit surrounding forms when clicking a gallery photo", async () => {
    const editor = createEditor();
    const close = vi.fn();
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());

    render(
      <form onSubmit={onSubmit}>
        <ImageInsertPanel
          editor={editor}
          close={close}
          config={{
            galleryPhotos: [{ id: 1, url: "https://example.com/gallery.png", alt: "Gallery photo" }],
          }}
        />
      </form>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Gallery photo" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(editor.chain).toHaveBeenCalled();
  });
});
