import type { Editor } from "@tiptap/core";
import { Images, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ImageInsertConfig } from "../lib/types";
import { cn } from "../lib/cn";
import { insertImageFilesIntoEditor } from "../lib/insert-editor-images";
import { TableGridPicker } from "./TableGridPicker";

type PanelProps = {
  editor: Editor;
  close: () => void;
};

type ImagePanelProps = PanelProps & {
  config?: ImageInsertConfig;
};

function preventFormSubmitOnEnter(event: React.KeyboardEvent) {
  if (event.key === "Enter") {
    event.preventDefault();
  }
}

export function LinkInsertPanel({ editor, close }: PanelProps) {
  const previous = editor.getAttributes("link").href as string | undefined;
  const [url, setUrl] = useState(previous ?? "https://");

  const apply = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
    }
    close();
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    close();
  };

  return (
    <div className="spk-editor-toolbar-popover-form">
      <label className="spk-editor-toolbar-popover-field">
        <span>URL</span>
        <input
          type="url"
          className="spk-editor-toolbar-popover-input"
          value={url}
          placeholder="https://"
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            preventFormSubmitOnEnter(event);
            if (event.key === "Enter") apply();
            if (event.key === "Escape") close();
          }}
          autoFocus
        />
      </label>
      <div className="spk-editor-toolbar-popover-actions">
        {previous ? (
          <button type="button" className="spk-editor-toolbar-popover-btn spk-editor-toolbar-popover-btn--ghost" onClick={remove}>
            Remove
          </button>
        ) : null}
        <button type="button" className="spk-editor-toolbar-popover-btn spk-editor-toolbar-popover-btn--ghost" onClick={close}>
          Cancel
        </button>
        <button type="button" className="spk-editor-toolbar-popover-btn spk-editor-toolbar-popover-btn--primary" onClick={apply}>
          Apply
        </button>
      </div>
    </div>
  );
}

function insertImageSrc(editor: Editor, src: string, width?: string) {
  const attrs = width ? { src, width } : { src };
  editor.chain().focus().setImage(attrs as { src: string }).run();
}

function resolveGalleryPhotoSrc(photo: NonNullable<ImageInsertConfig["galleryPhotos"]>[number]) {
  return photo.thumbnailUrl?.trim() || photo.url;
}

export function ImageInsertPanel({ editor, close, config }: ImagePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const maxFiles = config?.maxFiles ?? 3;
  const maxSizeBytes = config?.maxSizeBytes ?? 5 * 1024 * 1024;
  const accept = config?.accept ?? "image/*";
  const limitMb = Math.round(maxSizeBytes / (1024 * 1024));
  const galleryPhotos = config?.galleryPhotos ?? [];
  const galleryEnabled = Boolean(config?.onGalleryOpen || galleryPhotos.length > 0);

  useEffect(() => {
    config?.onGalleryPrefetch?.();
  }, [config]);

  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const inserted = await insertImageFilesIntoEditor(editor, files, config);
    if (!inserted) {
      setError("Could not insert image.");
      return;
    }
    close();
  };

  const insertFromUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    insertImageSrc(editor, trimmed);
    close();
  };

  const insertGalleryPhoto = (photoUrl: string) => {
    if (!photoUrl.trim()) return;
    insertImageSrc(editor, photoUrl, config?.galleryInsertWidth);
    close();
  };

  const openHostGallery = () => {
    config?.onGalleryOpen?.();
    close();
  };

  return (
    <div className="spk-editor-toolbar-popover-form spk-editor-image-insert">
      {galleryEnabled ? (
        <div className="spk-editor-image-gallery">
          {galleryPhotos.length > 0 ? (
            <div className="spk-editor-image-gallery-grid">
              {galleryPhotos.slice(0, 12).map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  className="spk-editor-image-gallery-item"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    insertGalleryPhoto(photo.url);
                  }}
                >
                  <img src={resolveGalleryPhotoSrc(photo)} alt={photo.alt ?? "Gallery photo"} />
                </button>
              ))}
            </div>
          ) : (
            <p className="spk-editor-image-gallery-empty">
              {config?.galleryEmptyMessage ?? "No gallery photos available yet."}
            </p>
          )}
          {config?.onGalleryOpen ? (
            <button type="button" className="spk-editor-image-gallery-open" onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openHostGallery();
            }}>
              <Images className="size-4" aria-hidden="true" />
              {config.galleryOpenLabel ?? "Open gallery"}
            </button>
          ) : null}
        </div>
      ) : null}
      {galleryEnabled ? (
        <div className="spk-editor-image-insert-divider">
          <span>or upload</span>
        </div>
      ) : null}
      <button
        type="button"
        className={cn(
          "spk-editor-image-dropzone",
          dragging && "spk-editor-image-dropzone--active",
        )}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files.length) {
            void handleFiles(event.dataTransfer.files);
          }
        }}
      >
        <span className="spk-editor-image-dropzone-icon" aria-hidden="true">
          <Upload className="size-5" />
        </span>
        <span className="spk-editor-image-dropzone-title">Click to upload or drag and drop</span>
        <span className="spk-editor-image-dropzone-hint">
          Maximum {maxFiles} files, {limitMb}MB each
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files?.length) {
            void handleFiles(event.target.files);
          }
        }}
      />
      {error ? <p className="spk-editor-image-insert-error">{error}</p> : null}
      <div className="spk-editor-image-insert-divider">
        <span>or paste a URL</span>
      </div>
      <label className="spk-editor-toolbar-popover-field">
        <span>Image URL</span>
        <input
          type="url"
          className="spk-editor-toolbar-popover-input"
          value={url}
          placeholder="https://example.com/photo.jpg"
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            preventFormSubmitOnEnter(event);
            if (event.key === "Enter") insertFromUrl();
            if (event.key === "Escape") close();
          }}
        />
      </label>
      <div className="spk-editor-toolbar-popover-actions">
        <button type="button" className="spk-editor-toolbar-popover-btn spk-editor-toolbar-popover-btn--ghost" onClick={close}>
          Cancel
        </button>
        <button
          type="button"
          className="spk-editor-toolbar-popover-btn spk-editor-toolbar-popover-btn--primary"
          onClick={insertFromUrl}
          disabled={!url.trim()}
        >
          Insert
        </button>
      </div>
    </div>
  );
}

export function TableInsertPanel({ editor, close }: PanelProps) {
  const insert = (nextRows: number, nextCols: number, withHeaderRow: boolean) => {
    editor
      .chain()
      .focus()
      .insertTable({
        rows: nextRows,
        cols: nextCols,
        withHeaderRow,
      })
      .run();
    close();
  };

  return <TableGridPicker onInsert={insert} />;
}
