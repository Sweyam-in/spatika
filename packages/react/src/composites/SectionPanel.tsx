import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { surfaceClass } from "../lib/surfaces";

export type SectionPanelProps = {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  trailing?: ReactNode;
};

/** Settings / admin section in a bordered panel: header row, then content. */
export function SectionPanel({ icon: Icon, title, subtitle, children, className, fullWidth = false, trailing }: SectionPanelProps) {
  return (
    <section
      data-slot="section-panel"
      className={cn(
        surfaceClass("default"),
        "flex flex-col gap-4 p-[var(--spk-card-p)]",
        fullWidth && "md:col-span-2",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <div className="flex size-7 shrink-0 items-center justify-center rounded-[var(--spk-radius-sm)] bg-surface-subtle text-fg-secondary">
              <Icon className="size-4" aria-hidden />
            </div>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-title-3 text-fg">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-body-sm text-fg-secondary">{subtitle}</p> : null}
          </div>
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
      <div>{children}</div>
    </section>
  );
}
