import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/cn";

/** Compact icon control for the editor toolbar. Avoids a @spatika/react dependency. */
export const ToolbarButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean;
    children: ReactNode;
  }
>(function ToolbarButton({ className, active, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      data-slot="editor-toolbar-button"
      data-active={active ? "true" : undefined}
      className={cn("spk-editor-toolbar-btn", active && "spk-editor-toolbar-btn--active", className)}
      {...props}
    >
      {children}
    </button>
  );
});
