import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type TimelineItemProps = {
  title: ReactNode;
  meta?: ReactNode;
  description?: ReactNode;
  /** Icon inside the marker. Without one, a small dot is drawn. */
  icon?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
  className?: string;
};

const toneDot: Record<NonNullable<TimelineItemProps["tone"]>, string> = {
  neutral: "bg-fg-tertiary",
  accent: "bg-accent-solid",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

/** Single activity row inside a Timeline. */
export function TimelineItem({ title, meta, description, icon, trailing, active, tone, className }: TimelineItemProps) {
  const resolvedTone = tone ?? (active ? "accent" : "neutral");
  return (
    <li data-slot="timeline-item" className={cn("group/timeline relative flex gap-3 pb-5 last:pb-0", className)}>
      <div className="relative flex w-6 shrink-0 justify-center">
        <span aria-hidden className="absolute top-6 bottom-0 w-px bg-line group-last/timeline:hidden" />
        {icon ? (
          <span
            className={cn(
              "relative mt-0.5 flex size-6 items-center justify-center rounded-full border bg-surface [&_svg]:size-3.5",
              active ? "border-accent-border text-accent-text" : "border-line text-fg-tertiary",
            )}
          >
            {icon}
          </span>
        ) : (
          <span className="relative mt-2 flex size-2 items-center justify-center">
            <span className={cn("size-2 rounded-full ring-4 ring-surface", toneDot[resolvedTone])} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-baseline gap-2">
          <div className="min-w-0 flex-1 text-body text-fg">{title}</div>
          {meta ? <div className="shrink-0 text-caption text-fg-tertiary spk-numeric">{meta}</div> : null}
          {trailing ? <div className="shrink-0">{trailing}</div> : null}
        </div>
        {description ? <div className="mt-1 text-body-sm text-fg-secondary">{description}</div> : null}
      </div>
    </li>
  );
}

export type TimelineProps = {
  children: ReactNode;
  className?: string;
};

/** Vertical activity feed. */
export function Timeline({ children, className }: TimelineProps) {
  return (
    <ol data-slot="timeline" className={cn("flex flex-col", className)}>
      {children}
    </ol>
  );
}
