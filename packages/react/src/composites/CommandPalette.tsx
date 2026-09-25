import type { ReactNode } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "../primitives/Command";
import { Kbd } from "../primitives/Kbd";

export type CommandPaletteItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Secondary text shown after the label. */
  description?: string;
  /** Keys shown on the right, e.g. `["G", "D"]`. */
  shortcut?: string[];
  /** Extra search terms. */
  keywords?: string[];
  disabled?: boolean;
  onSelect: () => void;
};

export type CommandPaletteGroup = {
  heading: string;
  items: CommandPaletteItem[];
};

export type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandPaletteGroup[];
  placeholder?: string;
  emptyMessage?: ReactNode;
  /** Show the keyboard legend. */
  footer?: boolean;
  /**
   * Custom ranking `(value, search, keywords) => score`; 0 hides the item. The default is
   * cmdk's fuzzy match, which suits short command lists; large indexes (docs search) usually
   * want word-aware matching.
   */
  filter?: (value: string, search: string, keywords?: string[]) => number;
};

/** Data-driven command palette on top of `CommandDialog`. Pair with `SearchTrigger` for ⌘K. */
export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "Type a command or search…",
  emptyMessage = "No results found.",
  footer = true,
  filter,
}: CommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} filter={filter}>
      <CommandInput placeholder={placeholder} autoFocus />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group.heading} heading={group.heading}>
            {group.items.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.label} ${item.id}`}
                keywords={item.keywords}
                disabled={item.disabled}
                onSelect={() => {
                  item.onSelect();
                  onOpenChange(false);
                }}
              >
                {item.icon}
                <span className="spk-command-label">{item.label}</span>
                {item.description ? <span className="spk-command-description">{item.description}</span> : null}
                {item.shortcut ? (
                  <CommandShortcut>
                    {item.shortcut.map((key) => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </CommandShortcut>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      {footer ? (
        <CommandFooter>
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> select
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Kbd>esc</Kbd> close
          </span>
        </CommandFooter>
      ) : null}
    </CommandDialog>
  );
}
