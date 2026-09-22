import type { Editor } from "@tiptap/core";
import type { CSSProperties } from "react";
import { EDITOR_HIGHLIGHT_COLORS, EDITOR_TEXT_COLORS } from "../lib/editor-format-colors";
import { cn } from "../lib/cn";

type PanelProps = {
  editor: Editor;
  close: () => void;
};

function ColorSwatchGrid({
  colors,
  activeValue,
  onSelect,
}: {
  colors: typeof EDITOR_TEXT_COLORS;
  activeValue: string | null | undefined;
  onSelect: (value: string | null) => void;
}) {
  return (
    <div className="spk-editor-color-grid" role="list">
      {colors.map((color) => {
        const isActive =
          color.value === null ? !activeValue : activeValue?.toLowerCase() === color.value.toLowerCase();
        return (
          <button
            key={color.id}
            type="button"
            role="listitem"
            aria-label={color.label}
            aria-pressed={isActive}
            className={cn(
              "spk-editor-color-swatch",
              color.value === null && "spk-editor-color-swatch--default",
              isActive && "spk-editor-color-swatch--active",
            )}
            style={color.value ? ({ "--swatch-color": color.value } as CSSProperties) : undefined}
            onClick={() => onSelect(color.value)}
          />
        );
      })}
    </div>
  );
}

export function TextColorPanel({ editor, close }: PanelProps) {
  const activeColor = (editor.getAttributes("textStyle").color as string | undefined) ?? null;

  const apply = (value: string | null) => {
    if (value === null) {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(value).run();
    }
    close();
  };

  return (
    <ColorSwatchGrid colors={EDITOR_TEXT_COLORS} activeValue={activeColor} onSelect={apply} />
  );
}

export function HighlightColorPanel({ editor, close }: PanelProps) {
  const activeColor = (editor.getAttributes("highlight").color as string | undefined) ?? null;

  const apply = (value: string | null) => {
    if (value === null) {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().setHighlight({ color: value }).run();
    }
    close();
  };

  return (
    <ColorSwatchGrid colors={EDITOR_HIGHLIGHT_COLORS} activeValue={activeColor} onSelect={apply} />
  );
}
