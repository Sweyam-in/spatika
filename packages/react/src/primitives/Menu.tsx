import * as React from "react";
import { composeRefs } from "../lib/compose-refs";
import { Portal } from "../lib/portal";
import { useControllableState } from "../lib/use-controllable-state";
import { useDismissable } from "../lib/use-dismissable";
import { useFloatingPosition } from "../lib/use-floating-position";
import { cn } from "../lib/cn";
import { OVERLAY_Z_INDEX, useOverlayZIndex } from "../lib/overlay-stack";

export type MenuProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Anchor element — typically the button that opened the menu. */
  anchorEl?: HTMLElement | null;
  children?: React.ReactNode;
};

function Menu({
  open: openProp,
  defaultOpen,
  onOpenChange,
  anchorEl,
  children,
}: MenuProps) {
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const zIndex = useOverlayZIndex(OVERLAY_Z_INDEX.menu);

  React.useEffect(() => {
    triggerRef.current = anchorEl ?? null;
  }, [anchorEl]);

  const position = useFloatingPosition({
    open,
    triggerRef,
    contentRef,
    side: "bottom",
    align: "start",
    sideOffset: 4,
  });

  useDismissable({
    enabled: open,
    onDismiss: () => setOpen(false),
    refs: [triggerRef, contentRef],
  });

  if (!open) return null;

  return (
    <Portal>
      <div
        ref={contentRef}
        role="menu"
        data-slot="menu"
        className="spk-overlay spk-animate-pop z-[10000] min-w-40 overflow-hidden p-1"
        style={{
          position: "fixed",
          top: position?.top ?? 0,
          left: position?.left ?? 0,
          zIndex,
          opacity: position ? 1 : 0,
        }}
      >
        {children}
      </div>
    </Portal>
  );
}
Menu.displayName = "Menu";

function MenuList({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div role="menu" data-slot="menu-list" className={cn("flex flex-col p-1", className)} {...props} />;
}
MenuList.displayName = "MenuList";

export type MenuItemProps = React.ComponentPropsWithoutRef<"button"> & {
  selected?: boolean;
  dense?: boolean;
};

function MenuItem({ className, selected, dense, ...props }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      data-slot="menu-item"
      data-selected={selected ? "" : undefined}
      className={cn(
        "spk-item w-full text-left",
        dense && "min-h-7",
        selected && "bg-pressed font-medium",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
MenuItem.displayName = "MenuItem";

const MenuAnchor = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  (props, ref) => <button ref={ref} type="button" data-slot="menu-anchor" {...props} />,
);
MenuAnchor.displayName = "MenuAnchor";

export { Menu, MenuList, MenuItem, MenuAnchor };
