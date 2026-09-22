import type { MentionContact } from "../lib/types";
import { cn } from "../lib/cn";

type MentionMenuProps = {
  contacts: MentionContact[];
  query: string;
  activeIndex: number;
  open: boolean;
  onSelect: (contact: MentionContact) => void;
};

export function MentionMenu({ contacts, query, activeIndex, open, onSelect }: MentionMenuProps) {
  if (!open || contacts.length === 0) return null;

  return (
    <div className="spk-editor-suggestion" role="listbox" aria-label="Mentions">
      <div className="spk-editor-suggestion-header">
        {query ? `People matching “@${query}”` : "Mention someone"}
      </div>
      <ul className="spk-editor-suggestion-list">
        {contacts.map((contact, index) => (
          <li key={contact.id}>
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
                onSelect(contact);
              }}
            >
              <span className="spk-editor-suggestion-title">{contact.label}</span>
              {contact.subtitle ? (
                <span className="spk-editor-suggestion-desc">{contact.subtitle}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
