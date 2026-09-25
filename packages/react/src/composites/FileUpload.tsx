import * as React from "react";
import { FileIcon, UploadCloud, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/use-controllable-state";
import { IconButton } from "../primitives/IconButton";

export type FileRejection = {
  file: File;
  reason: "type" | "size" | "count";
  message: string;
};

export type FileUploadProps = {
  value?: File[];
  defaultValue?: File[];
  /** The accepted file list after a selection, drop or removal. */
  onValueChange?: (files: File[]) => void;
  /** Called with each batch of rejected files. */
  onReject?: (rejections: FileRejection[]) => void;
  /** Same syntax as the native `accept` attribute: `image/*,.pdf`. */
  accept?: string;
  multiple?: boolean;
  /** Bytes per file. */
  maxSize?: number;
  maxFiles?: number;
  /** Upload progress (0–100) keyed by `fileKey(file)` — the list shows a bar while < 100. */
  progress?: Record<string, number>;
  /** Per-file error keyed by `fileKey(file)`. */
  errors?: Record<string, string>;
  title?: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  /** Form field name — the native input carries the files for plain form posts. */
  name?: string;
  id?: string;
  "aria-describedby"?: string;
  className?: string;
};

/** Stable key for a file within one session (name + size + modified time). */
export function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

export function formatBytes(bytes: number, locale?: string) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(value)} ${units[unit]}`;
}

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith(".")
        ? name.endsWith(rule)
        : rule.endsWith("/*")
          ? type.startsWith(rule.slice(0, -1))
          : type === rule,
    );
}

/**
 * Drag-and-drop file picker with validation and a file list. The drop zone wraps a real
 * file input, so it is keyboard- and screen-reader-operable and works in plain forms.
 * Uploading is up to you: pass `progress` and `errors` keyed by `fileKey(file)`.
 */
export function FileUpload({
  value: valueProp,
  defaultValue = [],
  onValueChange,
  onReject,
  accept,
  multiple = true,
  maxSize,
  maxFiles,
  progress,
  errors,
  title = "Drop files here or browse",
  hint,
  disabled,
  invalid,
  name,
  id,
  "aria-describedby": describedBy,
  className,
}: FileUploadProps) {
  const [filesState, setFiles] = useControllableState<File[]>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const files = filesState ?? [];
  const [dragging, setDragging] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const dragDepth = React.useRef(0);
  const hintId = React.useId();
  const limit = multiple ? maxFiles : 1;

  const defaultHint = [
    accept ? accept.split(",").map((rule) => rule.trim()).join(", ") : null,
    maxSize ? `up to ${formatBytes(maxSize)}` : null,
    limit && limit > 1 ? `${limit} files max` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // Mirror the list into the native input so plain form submissions include dropped files.
  React.useEffect(() => {
    const input = inputRef.current;
    if (!input || !name || typeof DataTransfer === "undefined") return;
    try {
      const transfer = new DataTransfer();
      files.forEach((file) => transfer.items.add(file));
      input.files = transfer.files;
    } catch {
      /* Older browsers cannot assign FileList — the onValueChange list is still correct. */
    }
  }, [files, name]);

  const addFiles = (incoming: File[]) => {
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];
    const base = multiple ? files : [];
    for (const file of incoming) {
      if (!matchesAccept(file, accept)) {
        rejected.push({ file, reason: "type", message: `${file.name} is not an accepted file type` });
      } else if (maxSize != null && file.size > maxSize) {
        rejected.push({ file, reason: "size", message: `${file.name} is larger than ${formatBytes(maxSize)}` });
      } else if (limit != null && base.length + accepted.length >= limit) {
        rejected.push({ file, reason: "count", message: `${file.name} was not added — ${limit} file limit` });
      } else if (!base.some((existing) => fileKey(existing) === fileKey(file))) {
        accepted.push(file);
      }
    }
    if (accepted.length) setFiles([...base, ...accepted]);
    if (rejected.length) onReject?.(rejected);
    setMessage(
      [
        accepted.length ? `${accepted.length} file${accepted.length === 1 ? "" : "s"} added` : "",
        ...rejected.map((rejection) => rejection.message),
      ]
        .filter(Boolean)
        .join(". "),
    );
  };

  const remove = (file: File) => {
    setFiles(files.filter((item) => fileKey(item) !== fileKey(file)));
    setMessage(`${file.name} removed`);
    inputRef.current?.focus();
  };

  return (
    <div data-slot="file-upload" className={className}>
      <label
        className="spk-dropzone"
        data-dragging={dragging || undefined}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        onDragEnter={(event) => {
          event.preventDefault();
          if (disabled) return;
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) event.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          if (!disabled) addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          name={name}
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={[hintId, describedBy].filter(Boolean).join(" ")}
          onChange={(event) => {
            const picked = Array.from(event.target.files ?? []);
            // Reset so choosing the same file again still fires change.
            if (!name) event.target.value = "";
            addFiles(picked);
          }}
        />
        <span className="spk-dropzone-icon" aria-hidden>
          <UploadCloud />
        </span>
        <span className="spk-dropzone-title">{title}</span>
        <span id={hintId} className="spk-dropzone-hint">
          {hint ?? defaultHint}
        </span>
      </label>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
      {files.length ? (
        <ul className="spk-file-list" aria-label="Selected files">
          {files.map((file) => {
            const key = fileKey(file);
            const percent = progress?.[key];
            const error = errors?.[key];
            const uploading = percent != null && percent < 100 && !error;
            return (
              <li key={key} className="spk-file-item" data-status={error ? "error" : uploading ? "uploading" : "ready"}>
                <FileIcon className="size-4 text-fg-tertiary" aria-hidden />
                <div className="min-w-0">
                  <div className="spk-file-name" title={file.name}>
                    {file.name}
                  </div>
                  <div className="spk-file-meta">
                    {error ?? (uploading ? `${Math.round(percent)}% · ${formatBytes(file.size)}` : formatBytes(file.size))}
                  </div>
                  {uploading ? (
                    <div
                      className="spk-file-progress"
                      role="progressbar"
                      aria-label={`Uploading ${file.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(percent)}
                    >
                      <span style={{ width: `${percent}%` }} />
                    </div>
                  ) : null}
                </div>
                <IconButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={`Remove ${file.name}`}
                  disabled={disabled}
                  onClick={() => remove(file)}
                >
                  <X className="size-3.5" />
                </IconButton>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
