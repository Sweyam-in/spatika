import { cn } from "../lib/cn";

export function DividerLabel({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      data-slot="divider-label"
      className={cn("flex items-center gap-3", className)}
    >
      <div className="h-px flex-1 bg-border/60" />
      <span className="text-caption font-medium text-fg-tertiary">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}
