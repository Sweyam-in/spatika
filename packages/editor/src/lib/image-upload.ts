export type ImageUploadOptions = {
  maxSizeBytes?: number;
  accept?: string;
};

export type ImageUploadResult =
  | { ok: true; src: string }
  | { ok: false; error: string };

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

export function readImageFileAsDataUrl(
  file: File,
  options: ImageUploadOptions = {},
): Promise<ImageUploadResult> {
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE;
  const accept = options.accept ?? "image/*";

  if (!file.type.startsWith("image/") && !accept.includes("*")) {
    return Promise.resolve({ ok: false, error: "Only image files are supported." });
  }

  if (file.size > maxSizeBytes) {
    const limitMb = Math.round(maxSizeBytes / (1024 * 1024));
    return Promise.resolve({ ok: false, error: `Maximum file size is ${limitMb}MB.` });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve({ ok: true, src: reader.result });
      } else {
        resolve({ ok: false, error: "Could not read the image file." });
      }
    };
    reader.onerror = () => resolve({ ok: false, error: "Could not read the image file." });
    reader.readAsDataURL(file);
  });
}

export function insertImagesFromFiles(
  files: FileList | File[],
  upload: (file: File) => Promise<ImageUploadResult>,
  limit = 3,
): Promise<ImageUploadResult[]> {
  const list = Array.from(files).slice(0, limit);
  return Promise.all(list.map((file) => upload(file)));
}
