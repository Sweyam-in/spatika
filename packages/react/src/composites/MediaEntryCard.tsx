import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type MediaEntryCardProps = {
  title: string;
  body?: string;
  imageUrl?: string;
  hideImage?: boolean;
  /** Soft accent stripe when no image */
  accentClassName?: string;
  chips?: ReactNode;
  meta?: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  menu?: ReactNode;
  highlighted?: boolean;
  onClick?: () => void;
  className?: string;
  /** Override media width on sm+ */
  mediaClassName?: string;
};

/**
 * Long horizontal entry card (story / activity style) with optional side media.
 * All content regions are slots for full customization.
 */
export function MediaEntryCard({
  title,
  body,
  imageUrl,
  hideImage,
  accentClassName = "bg-primary",
  chips,
  meta,
  footerLeft,
  footerRight,
  menu,
  highlighted,
  onClick,
  className,
  mediaClassName,
}: MediaEntryCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      data-slot="media-entry-card"
      onClick={onClick}
      className={cn(
        "group relative flex w-full overflow-hidden rounded-2xl border border-border/40 bg-card/80 text-left shadow-sm transition-[transform,box-shadow,border-color] duration-200",
        " hover:border-primary/25 hover:shadow-lg",
        highlighted && "border-primary/50 shadow-md",
        className,
      )}
    >
      {!hideImage && imageUrl ? (
        <div
          className={cn(
            "relative hidden w-[38%] shrink-0 sm:block",
            mediaClassName,
          )}
        >
          <img src={imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-card/80 to-transparent" />
        </div>
      ) : (
        <div className={cn("w-1 shrink-0 self-stretch opacity-80", accentClassName)} />
      )}

      <div className="flex min-h-[160px] min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
            {chips ? <div className="mt-1.5 flex flex-wrap gap-1.5">{chips}</div> : null}
          </div>
          {menu}
        </div>
        {meta ? (
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            {meta}
          </div>
        ) : null}
        {body ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
        ) : null}
        {(footerLeft || footerRight) && (
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/20 pt-2">
            <div className="min-w-0 flex flex-wrap gap-1.5">{footerLeft}</div>
            <div className="shrink-0">{footerRight}</div>
          </div>
        )}
      </div>
    </Comp>
  );
}
