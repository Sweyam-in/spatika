import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function ActionBar({
  children,
  className,
  sticky = false,
}: {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
}) {
  return (
    <div
      data-slot="action-bar"
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface px-4 py-3",
        sticky && "sticky bottom-0 z-20",
        className,
      )}
    >
      {children}
    </div>
  );
}
