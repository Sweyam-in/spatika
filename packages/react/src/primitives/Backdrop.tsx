import * as React from "react";
import { Portal } from "../lib/portal";
import { cn } from "../lib/cn";
import { OVERLAY_Z_INDEX, fixedLayerStyle } from "../lib/overlay-stack";

export type BackdropProps = React.ComponentPropsWithoutRef<"div"> & {
  open?: boolean;
  /** Skip the dimmed fill — useful as a click-catcher. */
  invisible?: boolean;
  /** Render in-place instead of portaling to document.body. */
  contained?: boolean;
};

/**
 * Full-viewport dimmer, typically paired with a modal or speed dial.
 */
function Backdrop({
  open = false,
  invisible = false,
  contained = false,
  className,
  style,
  children,
  ...props
}: BackdropProps) {
  if (!open) return null;

  const node = (
    <div
      data-slot="backdrop"
      className={cn(
        contained ? "absolute inset-0" : "fixed inset-0",
        !invisible && "bg-[color-mix(in_srgb,var(--foreground)_28%,transparent)]",
        className,
      )}
      style={contained ? style : { ...fixedLayerStyle(OVERLAY_Z_INDEX.modal), ...style }}
      {...props}
    >
      {children}
    </div>
  );

  if (contained) return node;
  return <Portal>{node}</Portal>;
}
Backdrop.displayName = "Backdrop";

export { Backdrop };
