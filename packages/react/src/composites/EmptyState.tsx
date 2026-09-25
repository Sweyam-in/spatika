import { AlertTriangle, CheckCircle2, Info, OctagonAlert, type LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
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
  /** Colours the icon well: `neutral` (default) for empty lists, the others for outcomes. */
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  /** Heading level of the title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  role?: HTMLAttributes<HTMLDivElement>["role"];
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
  tone = "neutral",
  headingLevel = 3,
  role,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as "h3";
  return (
    <div
      role={role}
      data-slot="empty-state"
      data-tone={tone}
      className={cn(
        "flex flex-col items-center text-center",
        size === "sm" ? "px-4 py-6" : "px-6 py-10",
        variant === "bordered" && "rounded-[var(--spk-radius-md)] border border-dashed border-line-strong",
        className,
      )}
    >
      {Icon ? (
        <div className="spk-state-icon" data-tone={tone}>
          <Icon className="size-5" aria-hidden />
        </div>
      ) : null}
      <Heading className="text-title-3 text-fg">{title}</Heading>
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

export type ResultStateProps = Omit<EmptyStateProps, "tone" | "icon"> & {
  /** Outcome being reported. */
  status: "success" | "warning" | "error" | "info";
  /** Override the default status icon. */
  icon?: LucideIcon;
};

const resultIcon = { success: CheckCircle2, warning: AlertTriangle, error: OctagonAlert, info: Info } as const;
const resultTone = { success: "success", warning: "warning", error: "danger", info: "info" } as const;

/**
 * Outcome of an action or page load — "Payment received", "Export failed", "You don't have
 * access". Announced politely (`role="status"`) and coloured by status, never by colour alone:
 * each status has its own icon and the title states the outcome.
 */
export function ResultState({ status, icon, variant = "plain", role = "status", ...props }: ResultStateProps) {
  return (
    <EmptyState
      {...props}
      variant={variant}
      role={role}
      tone={resultTone[status]}
      icon={icon ?? resultIcon[status]}
    />
  );
}
