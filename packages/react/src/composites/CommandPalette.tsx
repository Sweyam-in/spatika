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
};

/** Data-driven command palette on top of `CommandDialog`. Pair with `SearchTrigger` for ⌘K. */
export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "Type a command or search…",
  emptyMessage = "No results found.",
  footer = true,
}: CommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
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
                <span className="truncate">{item.label}</span>
                {item.description ? <span className="truncate text-body-sm text-fg-tertiary">{item.description}</span> : null}
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
