import * as React from "react";
import { cn } from "../lib/cn";

export type ListProps = React.ComponentPropsWithoutRef<"ul"> & {
  dense?: boolean;
  disablePadding?: boolean;
};

const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ className, dense, disablePadding, ...props }, ref) => (
    <ul
      ref={ref}
      data-slot="list"
      data-dense={dense ? "" : undefined}
      className={cn(
        "m-0 list-none",
        disablePadding ? "p-0" : dense ? "py-1" : "py-2",
        className,
      )}
      {...props}
    />
  ),
);
List.displayName = "List";

export type ListItemProps = React.ComponentPropsWithoutRef<"li"> & {
  disablePadding?: boolean;
  disableGutters?: boolean;
};

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, disablePadding, disableGutters, ...props }, ref) => (
    <li
      ref={ref}
      data-slot="list-item"
      className={cn(
        "flex items-center gap-3",
        disablePadding ? "p-0" : disableGutters ? "py-2" : "px-4 py-2.5",
        className,
      )}
      {...props}
    />
  ),
);
ListItem.displayName = "ListItem";

export type ListItemButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  selected?: boolean;
};

const ListItemButton = React.forwardRef<HTMLButtonElement, ListItemButtonProps>(
  ({ className, selected, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-slot="list-item-button"
      data-selected={selected ? "" : undefined}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium outline-none transition-colors",
        "hover:bg-muted/40 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        selected && "bg-primary/10 text-primary",
        className,
      )}
      {...props}
    />
  ),
);
ListItemButton.displayName = "ListItemButton";

function ListItemIcon({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      data-slot="list-item-icon"
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}
ListItemIcon.displayName = "ListItemIcon";

export type ListItemTextProps = React.ComponentPropsWithoutRef<"div"> & {
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
};

function ListItemText({
  className,
  primary,
  secondary,
  children,
  ...props
}: ListItemTextProps) {
  return (
    <div data-slot="list-item-text" className={cn("min-w-0 flex-1", className)} {...props}>
      <div className="truncate text-sm font-semibold">{primary ?? children}</div>
      {secondary ? (
        <div className="truncate text-xs font-medium text-muted-foreground">{secondary}</div>
      ) : null}
    </div>
  );
}
ListItemText.displayName = "ListItemText";

function ListSubheader({ className, ...props }: React.ComponentPropsWithoutRef<"li">) {
  return (
    <li
      data-slot="list-subheader"
      className={cn(
        "px-3 pt-3 pb-1 text-caption font-medium text-fg-tertiary",
        className,
      )}
      {...props}
    />
  );
}
ListSubheader.displayName = "ListSubheader";

export { List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader };
