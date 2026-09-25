import * as React from "react";
import { X } from "lucide-react";
import { Portal } from "../lib/portal";
import { cn } from "../lib/cn";
import { OVERLAY_Z_INDEX, fixedLayerStyle } from "../lib/overlay-stack";
import { IconButton } from "./IconButton";

export type SnackbarOrigin = {
  vertical?: "top" | "bottom";
  horizontal?: "left" | "center" | "right";
};

export type SnackbarProps = Omit<React.ComponentPropsWithoutRef<"div">, "content"> & {
  open?: boolean;
  onClose?: () => void;
  autoHideDuration?: number | null;
  message?: React.ReactNode;
  action?: React.ReactNode;
  anchorOrigin?: SnackbarOrigin;
};

const originClass = {
  "top-left": "top-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
} as const;

function Snackbar({
  open = false,
  onClose,
  autoHideDuration = 4000,
  message,
  action,
  anchorOrigin = { vertical: "bottom", horizontal: "left" },
  className,
  children,
  ...props
}: SnackbarProps) {
  React.useEffect(() => {
    if (!open || !autoHideDuration || !onClose) return;
    const id = window.setTimeout(onClose, autoHideDuration);
    return () => window.clearTimeout(id);
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  const key = `${anchorOrigin.vertical ?? "bottom"}-${anchorOrigin.horizontal ?? "left"}` as keyof typeof originClass;

  return (
    <Portal>
      <div
        role="status"
        data-slot="snackbar"
        className={cn(
          "spk-overlay spk-animate-toast fixed flex max-w-sm items-center gap-3 px-3.5 py-2.5 text-body",
          originClass[key],
          className,
        )}
        style={fixedLayerStyle(OVERLAY_Z_INDEX.toast)}
        {...props}
      >
        <div className="min-w-0 flex-1">{message ?? children}</div>
        {action}
        {onClose ? (
          <IconButton aria-label="Close" size="sm" onClick={onClose}>
            <X className="size-3.5" />
          </IconButton>
        ) : null}
      </div>
    </Portal>
  );
}
Snackbar.displayName = "Snackbar";

function SnackbarContent({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div data-slot="snackbar-content" className={cn("text-sm font-medium", className)} {...props} />;
}
SnackbarContent.displayName = "SnackbarContent";

export { Snackbar, SnackbarContent };
