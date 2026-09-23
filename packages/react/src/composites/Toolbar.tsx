import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function Toolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="toolbar"
      className={cn("flex min-h-14 w-full flex-wrap items-center justify-between gap-2 px-4", className)}
    >
      {children}
    </div>
  );
}
