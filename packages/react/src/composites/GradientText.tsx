import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type GradientTextProps = {
  children: ReactNode;
  /** `static` clips a 3-stop theme gradient; `flow` animates it. */
  variant?: "static" | "flow";
  className?: string;
  as?: "span" | "em" | "strong";
};

/** Theme-colored gradient type for wordmarks and display names. */
export function GradientText({
  children,
  variant = "static",
  className,
  as: Tag = "span",
}: GradientTextProps) {
  return (
    <Tag
      data-slot="gradient-text"
      data-variant={variant}
      className={cn(
        variant === "flow" ? "spk-gradient-text" : "spk-gradient-text-static",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
