import * as React from "react";
import { Portal } from "../lib/portal";
import { useFocusTrap } from "../lib/use-focus-trap";
import { useDismissLayer } from "../lib/layer-stack";
import { cn } from "../lib/cn";
import { ModalDepthProvider, OVERLAY_Z_INDEX, fixedLayerStyle } from "../lib/overlay-stack";
import { Backdrop } from "./Backdrop";

export type ModalProps = Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
  open?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  keepMounted?: boolean;
  disableEscapeKeyDown?: boolean;
  hideBackdrop?: boolean;
};

/**
 * Low-level modal. Prefer Dialog for titled confirmations.
 */
function Modal({
  open = false,
  onClose,
  children,
  keepMounted,
  disableEscapeKeyDown,
  hideBackdrop,
  className,
  style,
  ...props
}: ModalProps) {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  useFocusTrap(contentRef, open);

  useDismissLayer({
    enabled: open,
    refs: [contentRef],
    onEscapeKeyDown: disableEscapeKeyDown ? undefined : () => onClose?.(),
  });

  if (!open && !keepMounted) return null;

  return (
    <Portal>
      <div
        data-slot="modal"
        hidden={!open}
        className={cn("fixed inset-0 flex items-center justify-center p-4", className)}
        style={fixedLayerStyle(OVERLAY_Z_INDEX.modal, style)}
        {...props}
      >
        {hideBackdrop ? null : (
          <Backdrop open={open} contained className="absolute inset-0" onClick={onClose} />
        )}
        <div
          ref={contentRef}
          role="presentation"
          className="relative z-10 outline-none"
        >
          <ModalDepthProvider>{children}</ModalDepthProvider>
        </div>
      </div>
    </Portal>
  );
}
Modal.displayName = "Modal";

export { Modal };
