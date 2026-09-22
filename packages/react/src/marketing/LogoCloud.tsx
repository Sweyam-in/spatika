import * as React from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/cn";
import { Marquee } from "./Marquee";

export type LogoCloudProps = {
  /** The logos — `img`, inline `svg` or plain wordmark text. */
  children: ReactNode;
  /** Line above the row — "Trusted by teams at". */
  label?: ReactNode;
  /** `row` wraps in a centred flex row; `marquee` scrolls continuously. */
  variant?: "row" | "marquee";
  /** Cap on logo height. */
  height?: string;
  /** Keep logos in full colour instead of the default greyscale-until-hover. */
  plain?: boolean;
  className?: string;
};

/**
 * Customer or integration logos. Greyscale by default so the row reads as texture and
 * the page's own accent stays dominant; individual logos come to colour on hover.
 */
export function LogoCloud({
  children,
  label,
  variant = "row",
  height = "1.75rem",
  plain = false,
  className,
}: LogoCloudProps) {
  const items = React.Children.toArray(children).map((child, index) => (
    <span
      key={index}
      data-slot="logo-cloud-item"
      data-plain={plain ? "true" : undefined}
      className="spk-mk-logo"
    >
      {child}
    </span>
  ));

  return (
    <div
      data-slot="logo-cloud"
      data-variant={variant}
      className={cn("flex flex-col items-center gap-6", className)}
      style={{ "--spk-mk-logo-h": height } as CSSProperties}
    >
      {label ? <p className="text-caption text-fg-tertiary">{label}</p> : null}
      {variant === "marquee" ? (
        <Marquee className="w-full">{items}</Marquee>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">{items}</div>
      )}
    </div>
  );
}
