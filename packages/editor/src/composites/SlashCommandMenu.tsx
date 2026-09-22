import type { Editor } from "@tiptap/core";
import type { SlashCommandItem } from "../lib/types";
import { cn } from "../lib/cn";

type SlashCommandMenuProps = {
  editor: Editor | null;
  items: SlashCommandItem[];
  query: string;
  activeIndex: number;
  open: boolean;
  onSelect: (item: SlashCommandItem) => void;
};

export function SlashCommandMenu({
  items,
  query,
  activeIndex,
  open,
  onSelect,
}: SlashCommandMenuProps) {
  if (!open || items.length === 0) return null;

  return (
    <div className="spk-editor-suggestion" role="listbox" aria-label="Slash commands">
      <div className="spk-editor-suggestion-header">
        {query ? `Results for “/${query}”` : "Insert block"}
      </div>
      <ul className="spk-editor-suggestion-list">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={cn(
                "spk-editor-suggestion-item",
                index === activeIndex && "spk-editor-suggestion-item--active",
              )}
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(item);
              }}
            >
              <span className="spk-editor-suggestion-title">{item.title}</span>
              {item.description ? (
                <span className="spk-editor-suggestion-desc">{item.description}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
