import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { listRowToggleClass } from "../lib/chips";

export function ListRow({
  active = false,
  className,
  children,
  trailing,
  onClick,
}: {
  active?: boolean;
  className?: string;
  children: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      data-slot="list-row"
      className={cn(listRowToggleClass(active), className)}
      onClick={onClick}
    >
      <span className="min-w-0 flex-1 text-left">{children}</span>
      {trailing}
    </button>
  );
}
