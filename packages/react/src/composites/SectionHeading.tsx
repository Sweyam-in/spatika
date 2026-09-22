import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { AccentRule } from "./AccentRule";
import { GradientText } from "./GradientText";

export type SectionHeadingProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
  /** Hide the accent rule under the copy. */
  showRule?: boolean;
};

/**
 * Marketing / page-section title: optional eyebrow, heading, subtitle, and accent rule.
 * Renders a `div` (not `<header>`) so it never competes with the site navbar.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  showRule = true,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      data-slot="section-heading"
      className={cn("mb-8 sm:mb-10", centered && "text-center", className)}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-2 text-caption font-medium text-fg-tertiary",
            centered && "text-center",
          )}
        >
          <GradientText>{eyebrow}</GradientText>
        </p>
      ) : null}
      <h2 className="text-[clamp(1.6rem,3.6vw,2.1rem)] font-[800] leading-[1.12] tracking-tight text-foreground">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-2 text-[14px] leading-relaxed text-muted-foreground",
            centered ? "mx-auto max-w-xl" : "max-w-lg",
          )}
        >
          {subtitle}
        </p>
      ) : null}
      {showRule ? <AccentRule className={cn("mt-4", centered && "mx-auto")} /> : null}
    </div>
  );
}
