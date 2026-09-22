import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "../lib/cn";

export type CommandSearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  typeLabel?: string;
  onSelect?: () => void;
};

export type CommandSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  shortcutHint?: string;
  results?: CommandSearchResult[];
  recent?: CommandSearchResult[];
  loading?: boolean;
  className?: string;
  /** Called when clear is pressed */
  onClear?: () => void;
};

/**
 * Inline global search with a results dropdown. For a modal palette use `CommandPalette`.
 */
export function CommandSearchField({
  value,
  onChange,
  onSubmit,
  placeholder = "Search…",
  shortcutHint = "⌘K",
  results,
  recent,
  loading,
  className,
  onClear,
}: CommandSearchFieldProps) {
  const focusedList = (results && results.length > 0 ? results : recent) ?? [];
  const showDropdown = value.length > 0 ? Boolean(results) : Boolean(recent?.length);

  return (
    <div data-slot="command-search-field" className={cn("relative w-full", className)}>
      <div className="spk-field spk-field-group spk-field--lg">
        <Search className="size-4 shrink-0 text-fg-tertiary" aria-hidden />
        <input
          value={value}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit?.();
          }}
          placeholder={placeholder}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            className="spk-btn spk-btn--ghost spk-btn--icon-xs -mr-1 text-fg-tertiary"
            onClick={() => {
              onChange("");
              onClear?.();
            }}
          >
            <X className="size-3.5" />
          </button>
        ) : shortcutHint ? (
          <kbd className="spk-kbd max-sm:hidden">{shortcutHint}</kbd>
        ) : null}
      </div>

      {showDropdown ? (
        <div
          role="listbox"
          data-side="bottom"
          className="spk-overlay spk-animate-pop absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden"
        >
          <div className="max-h-80 overflow-y-auto p-1">
            {!value && recent?.length ? <p className="spk-item-label">Recent</p> : null}
            {loading ? (
              <p className="px-3 py-6 text-center text-body text-fg-secondary">Searching…</p>
            ) : focusedList.length === 0 ? (
              <p className="px-3 py-6 text-center text-body text-fg-secondary">No results</p>
            ) : (
              focusedList.map((item) => (
                <button key={item.id} type="button" role="option" aria-selected={false} className="spk-item w-full text-left" onClick={item.onSelect}>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-[var(--spk-radius-sm)] bg-surface-subtle text-fg-secondary [&_svg]:size-3.5">
                    {item.icon ?? <Search />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-medium text-fg">{item.title}</span>
                    {item.subtitle ? <span className="block truncate text-body-sm text-fg-tertiary">{item.subtitle}</span> : null}
                  </span>
                  {item.typeLabel ? <span className="text-caption text-fg-tertiary">{item.typeLabel}</span> : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
