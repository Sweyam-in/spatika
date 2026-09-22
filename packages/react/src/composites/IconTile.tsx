import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Card } from "./Card";

export type IconTileProps = {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

/** Horizontal domain / feature tile: icon well + italic title + caption. */
export function IconTile({ icon, title, description, className }: IconTileProps) {
  return (
    <div data-slot="icon-tile">
      <Card
        variant="panel"
        padding="md"
        className={cn("group flex items-center gap-5 p-5", className)}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary text-3xl">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[16px] font-[900] italic text-foreground">{title}</p>
          {description ? (
            <p className="mt-0.5 text-[12px] font-bold text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
