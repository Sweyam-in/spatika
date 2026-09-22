import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { SectionBackdrop, type SectionBackdropKind, type SectionBackdropProps } from "./MarketingSection";

export type CtaBandProps = {
  title: ReactNode;
  /** One line of copy. A CTA band is not the place for a paragraph. */
  description?: ReactNode;
  /** The actions — one primary, at most one secondary. */
  actions?: ReactNode;
  /** Fine print under the actions. */
  note?: ReactNode;
  /** `surface` — hairline card · `accent` — accent gradient · `inverse` — dark slab. */
  tone?: "surface" | "accent" | "inverse";
  /** `split` puts actions beside the copy on wide screens; `stacked` centres everything. */
  layout?: "split" | "stacked";
  /** Decorative backdrop inside the band. */
  backdrop?: SectionBackdropKind | SectionBackdropProps;
  /** Heading level. */
  as?: "h2" | "h3";
  className?: string;
};

/** The closing ask of a marketing page — one headline, one line of copy, one action. */
export function CtaBand({
  title,
  description,
  actions,
  note,
  tone = "surface",
  layout = "split",
  backdrop,
  as: Heading = "h2",
  className,
}: CtaBandProps) {
  const stacked = layout === "stacked";
  const backdropProps: SectionBackdropProps | null =
    backdrop == null ? null : typeof backdrop === "string" ? { kind: backdrop } : backdrop;

  return (
    <div
      data-slot="cta-band"
      data-tone={tone}
      data-layout={layout}
      className={cn("spk-mk-cta", stacked && "items-center text-center", className)}
    >
      {backdropProps ? <SectionBackdrop {...backdropProps} /> : null}

      <div className={cn("relative z-[1] min-w-0", stacked && "flex flex-col items-center")}>
        <Heading className="text-title-1 tracking-tight text-fg">{title}</Heading>
        {description ? (
          <p className={cn("mt-2 max-w-xl text-body-lg text-fg-secondary", stacked && "mx-auto")}>
            {description}
          </p>
        ) : null}
      </div>

      {actions || note ? (
        <div className={cn("relative z-[1] flex shrink-0 flex-col gap-2", stacked ? "items-center" : "items-start md:items-end")}>
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
          {note ? <p className="text-caption text-fg-tertiary">{note}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
