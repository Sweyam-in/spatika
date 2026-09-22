import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type MetaChipProps = {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Compact “powered by” chip: icon + label with a quiet ring. */
export function MetaChip({ icon, children, className }: MetaChipProps) {
  return (
    <span
      data-slot="meta-chip"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/80",
        className,
      )}
    >
      {icon ? <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center opacity-90">{icon}</span> : null}
      {children}
    </span>
  );
}
