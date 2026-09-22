import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";
import { ToolbarButton } from "./ToolbarButton";
import { useIsomorphicLayoutEffect } from "../lib/use-isomorphic-layout-effect";

type ToolbarPopoverProps = {
  label: string;
  icon: ReactNode;
  title: string;
  className?: string;
  active?: boolean;
  children: (api: { close: () => void }) => ReactNode;
};

export function ToolbarPopover({
  label,
  icon,
  title,
  className,
  active = false,
  children,
}: ToolbarPopoverProps) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const close = () => setOpen(false);

  useIsomorphicLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const margin = 12;
      const panelWidth = panelRef.current?.offsetWidth || 280;
      let left = rect.left;
      if (typeof window !== "undefined") {
        if (left + panelWidth > window.innerWidth - margin) {
          left = Math.max(margin, window.innerWidth - margin - panelWidth);
        } else if (left < margin) {
          left = margin;
        }
      }
      setPanelStyle({
        top: rect.bottom + 6,
        left,
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const panel =
    open && panelStyle ? (
      <div
        ref={panelRef}
        id={titleId}
        className="spk-editor-toolbar-popover-panel spk-editor-toolbar-popover-panel--portal"
        role="dialog"
        aria-label={title}
        style={{ top: panelStyle.top, left: panelStyle.left }}
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="spk-editor-toolbar-popover-title">{title}</div>
        {children({ close })}
      </div>
    ) : null;

  return (
    <div ref={rootRef} className={cn("spk-editor-toolbar-popover", className)}>
      <ToolbarButton
        ref={triggerRef}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? titleId : undefined}
        active={open || active}
        onClick={() => setOpen((value) => !value)}
      >
        {icon}
      </ToolbarButton>
      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
