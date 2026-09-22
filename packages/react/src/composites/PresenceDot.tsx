import { cn } from "../lib/cn";

export type PresenceDotProps = {
  tone?: "primary" | "success";
  /** Dual-span scale ping. Defaults to true. */
  ping?: boolean;
  className?: string;
  label?: string;
};

const toneClass = {
  primary: "bg-primary",
  success: "bg-[var(--accent-info)]",
} as const;

/** Live status pip with optional ping halo (availability badges, hero chips). */
export function PresenceDot({
  tone = "primary",
  ping = true,
  className,
  label,
}: PresenceDotProps) {
  return (
    <span
      data-slot="presence-dot"
      role={label ? "img" : undefined}
      aria-label={label}
      className={cn("relative flex h-2 w-2", className)}
    >
      {ping ? (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            toneClass[tone],
          )}
          aria-hidden
        />
      ) : null}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", toneClass[tone])} />
    </span>
  );
}
