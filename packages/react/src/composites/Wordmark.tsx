import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { GradientText } from "./GradientText";

export type WordmarkProps = {
  /** Primary name, rendered in foreground. */
  name: ReactNode;
  /** Trailing bit (`.io`, last name) in the marketing gradient. */
  accent?: ReactNode;
  /** Extra punctuation in primary (the period in `Name.`). */
  mark?: ReactNode;
  /** Unstyled trailing copy after the mark (`io` in `Sweyam.io`). */
  rest?: ReactNode;
  size?: "sm" | "md" | "lg" | "display";
  as?: "span" | "h1";
  className?: string;
};

const sizeClass = {
  sm: "text-[14px] font-semibold tracking-tight",
  md: "text-xl font-[900] tracking-tight",
  lg: "text-[clamp(1.6rem,3.6vw,2.1rem)] font-[800] tracking-tight",
  display: "text-[clamp(2.5rem,8vw,5.5rem)] font-[900] leading-[0.95] tracking-tight",
} as const;

/**
 * Marketing wordmark: solid name, optional gradient accent, optional primary mark.
 */
export function Wordmark({
  name,
  accent,
  mark,
  rest,
  size = "md",
  as: Tag = "span",
  className,
}: WordmarkProps) {
  return (
    <Tag data-slot="wordmark" className={cn(sizeClass[size], className)}>
      <span className="text-foreground">{name}</span>
      {accent ? <GradientText>{accent}</GradientText> : null}
      {mark ? <span className="text-primary">{mark}</span> : null}
      {rest ? <span className="text-foreground">{rest}</span> : null}
    </Tag>
  );
}
