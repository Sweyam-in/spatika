import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const statusDotVariants = cva("inline-block size-2 shrink-0 rounded-full", {
  variants: {
    tone: {
      neutral: "bg-fg-tertiary",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-danger",
      primary: "bg-accent-solid",
    },
    pulse: {
      true: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: { tone: "neutral", pulse: false },
});

export function StatusDot({
  className,
  tone,
  pulse,
  label,
}: VariantProps<typeof statusDotVariants> & {
  className?: string;
  label?: string;
}) {
  return (
    <span
      data-slot="status-dot"
      role={label ? "img" : undefined}
      aria-label={label}
      className={cn(statusDotVariants({ tone, pulse }), className)}
    />
  );
}

export { statusDotVariants };
