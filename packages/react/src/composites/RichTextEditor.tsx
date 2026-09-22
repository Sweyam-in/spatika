/**
 * @deprecated Use `SpatikaEditor` from `@spatika/react` instead.
 * Import `@spatika/editor/styles.css` alongside `@spatika/tokens/styles.css`.
 */
import { SpatikaEditor } from "@spatika/editor";

export type RichTextEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeightClassName?: string;
};

/** @deprecated Use `SpatikaEditor` for full rich text editing with Tiptap. */
export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write something…",
  className,
  minHeightClassName = "min-h-40",
}: RichTextEditorProps) {
  return (
    <SpatikaEditor
      value={value}
      onChange={(html) => onChange?.(html)}
      placeholder={placeholder}
      className={className}
      heightClassName={minHeightClassName}
      toolbar={{
        layout: "compact",
        textStyle: false,
        alignment: false,
        insert: false,
        ai: false,
      }}
    />
  );
}
