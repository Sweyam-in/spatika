import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Button } from "../primitives/Button";

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Primary action shortcut. */
  actionLabel?: string;
  onAction?: () => void;
  /** Custom action row (overrides `actionLabel`). */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** `bordered` draws a dashed well; `plain` sits directly on the page / inside a table. */
  variant?: "bordered" | "plain";
  size?: "sm" | "md";
};

/** Zero-state for lists, tables and dashboards. Explains what goes here and how to start. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actions,
  children,
  className,
  variant = "bordered",
  size = "md",
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center text-center",
        size === "sm" ? "px-4 py-6" : "px-6 py-10",
        variant === "bordered" && "rounded-[var(--spk-radius-md)] border border-dashed border-line-strong",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-3 flex size-10 items-center justify-center rounded-[var(--spk-radius-sm)] border border-line bg-surface text-fg-tertiary shadow-xs">
          <Icon className="size-5" aria-hidden />
        </div>
      ) : null}
      <h3 className="text-title-3 text-fg">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-body text-fg-secondary">{description}</p> : null}
      {actions ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{actions}</div>
      ) : actionLabel && onAction ? (
        <Button className="mt-4" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
