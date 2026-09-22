import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Chip } from "./Chip";

export type QuickFilterItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
};

export type QuickFilterGroup = {
  id?: string;
  label?: string;
  items: QuickFilterItem[];
};

export type QuickFilterRailProps = {
  groups: QuickFilterGroup[];
  value?: string | string[];
  onChange?: (id: string) => void;
  /** solid = filled primary when active (directory style); soft = tinted (default chip) */
  activeStyle?: "solid" | "soft";
  className?: string;
};

/**
 * Horizontal scroll filter rail with optional grouped sections.
 */
export function QuickFilterRail({
  groups,
  value,
  onChange,
  activeStyle = "soft",
  className,
}: QuickFilterRailProps) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div
      data-slot="quick-filter-rail"
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {groups.map((group, gi) => (
        <div key={group.id ?? group.label ?? gi} className="flex shrink-0 items-center gap-2">
          {gi > 0 ? <div className="h-6 w-px shrink-0 bg-border/50" /> : null}
          {group.label ? (
            <span className="shrink-0 text-caption font-medium text-fg-tertiary">
              {group.label}
            </span>
          ) : null}
          {group.items.map((item) => {
            const active = selected.includes(item.id);
            return (
              <Chip
                key={item.id}
                variant="filter"
                active={activeStyle === "soft" ? active : false}
                onClick={() => onChange?.(item.id)}
                className={cn(
                  "shrink-0 gap-1.5",
                  activeStyle === "solid" &&
                    (active
                      ? "border-primary/60 bg-primary text-primary-foreground hover:bg-primary"
                      : "border-border/40 bg-card/40"),
                )}
              >
                {item.icon}
                {item.label}
                {typeof item.count === "number" ? (
                  <span
                    className={cn(
                      "ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold",
                      active && activeStyle === "solid"
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/15 text-primary",
                    )}
                  >
                    {item.count}
                  </span>
                ) : null}
              </Chip>
            );
          })}
        </div>
      ))}
    </div>
  );
}
