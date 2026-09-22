import * as React from "react";
import { Plus, X } from "lucide-react";
import { useControllableState } from "../lib/use-controllable-state";
import { cn } from "../lib/cn";
import { Backdrop } from "./Backdrop";
import { Fab } from "./Fab";

export type SpeedDialProps = Omit<React.ComponentPropsWithoutRef<"div">, "onChange"> & {
  ariaLabel: string;
  icon?: React.ReactNode;
  openIcon?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  direction?: "up" | "down" | "left" | "right";
  /** Hide the dimmer behind actions. */
  hideBackdrop?: boolean;
};

const directionClass = {
  up: "bottom-full mb-3 flex-col-reverse",
  down: "top-full mt-3 flex-col",
  left: "right-full mr-3 flex-row-reverse",
  right: "left-full ml-3 flex-row",
} as const;

function SpeedDial({
  ariaLabel,
  icon,
  openIcon,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  direction = "up",
  hideBackdrop = false,
  className,
  children,
  ...props
}: SpeedDialProps) {
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <div
      data-slot="speed-dial"
      data-open={open ? "" : undefined}
      className={cn("relative inline-flex", className)}
      {...props}
    >
      {!hideBackdrop ? (
        <Backdrop open={open} invisible onClick={() => setOpen(false)} />
      ) : null}
      <div
        className={cn(
          "absolute z-10 flex items-center gap-3 transition-[opacity,transform] duration-200",
          directionClass[direction],
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        role="menu"
        aria-hidden={!open}
      >
        {children}
      </div>
      <Fab
        aria-label={ariaLabel}
        aria-expanded={open}
        size="md"
        onClick={() => setOpen(!open)}
      >
        {open ? (openIcon ?? <X className="size-5" />) : (icon ?? <Plus className="size-5" />)}
      </Fab>
    </div>
  );
}
SpeedDial.displayName = "SpeedDial";

export type SpeedDialActionProps = React.ComponentPropsWithoutRef<"button"> & {
  icon: React.ReactNode;
  tooltipTitle?: React.ReactNode;
};

function SpeedDialAction({
  icon,
  tooltipTitle,
  className,
  ...props
}: SpeedDialActionProps) {
  return (
    <button
      type="button"
      role="menuitem"
      data-slot="speed-dial-action"
      title={typeof tooltipTitle === "string" ? tooltipTitle : undefined}
      className={cn(
        "flex size-10 items-center justify-center rounded-full border border-border/50 bg-card text-foreground shadow-md outline-none transition-[transform,box-shadow] duration-150 hover:shadow-lg focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        className,
      )}
      {...props}
    >
      <span className="sr-only">{tooltipTitle}</span>
      {icon}
    </button>
  );
}
SpeedDialAction.displayName = "SpeedDialAction";

export { SpeedDial, SpeedDialAction };
