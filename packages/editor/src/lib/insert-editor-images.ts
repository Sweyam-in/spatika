import type { Editor } from "@tiptap/core";
import type { ImageInsertConfig } from "./types";
import { insertImagesFromFiles, readImageFileAsDataUrl, type ImageUploadResult } from "./image-upload";

async function uploadImageFile(file: File, config?: ImageInsertConfig): Promise<ImageUploadResult> {
  if (config?.onUpload) {
    try {
      const src = await config.onUpload(file);
      return src ? { ok: true, src } : { ok: false, error: "Upload failed." };
    } catch {
      return { ok: false, error: "Upload failed." };
    }
  }
  return readImageFileAsDataUrl(file, {
    maxSizeBytes: config?.maxSizeBytes,
    accept: config?.accept,
  });
}

export async function insertImageFilesIntoEditor(
  editor: Editor,
  files: FileList | File[],
  config?: ImageInsertConfig,
) {
  const maxFiles = config?.maxFiles ?? 3;
  const results = await insertImagesFromFiles(
    files,
    (file) => uploadImageFile(file, config),
    maxFiles,
  );

  const sources = results.flatMap((result) => (result.ok ? [result.src] : []));
  if (!sources.length) return false;

  sources.forEach((src) => {
    editor.chain().focus().setImage({ src }).run();
  });
  return true;
}

export function extractImageFiles(dataTransfer: DataTransfer | null | undefined) {
  if (!dataTransfer?.files?.length) return [];
  return Array.from(dataTransfer.files).filter((file) => file.type.startsWith("image/"));
}
