import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type DisplayHeadingProps = {
  children: ReactNode;
  as?: "h1" | "h2";
  className?: string;
};

/** Oversized marketing hero title. Compose with Wordmark / GradientText. */
export function DisplayHeading({
  children,
  as: Tag = "h1",
  className,
}: DisplayHeadingProps) {
  return (
    <Tag
      data-slot="display-heading"
      className={cn(
        "text-[clamp(2.5rem,8vw,5.5rem)] font-[900] leading-[0.95] tracking-tight",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
