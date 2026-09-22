import * as React from "react";
import { cn } from "../lib/cn";

export type CircularProgressProps = React.ComponentPropsWithoutRef<"span"> & {
  variant?: "indeterminate" | "determinate";
  value?: number;
  size?: number;
  thickness?: number;
};

/**
 * Circular indicator. Indeterminate spins; determinate fills an SVG track.
 */
function CircularProgress({
  variant = "indeterminate",
  value = 0,
  size = 40,
  thickness = 4,
  className,
  ...props
}: CircularProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  if (variant === "indeterminate") {
    return (
      <span
        role="progressbar"
        aria-label="Loading"
        data-slot="circular-progress"
        className={cn("inline-flex text-primary", className)}
        {...props}
      >
        <svg
          className="animate-spin"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={thickness}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.25} ${circumference}`}
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      data-slot="circular-progress"
      className={cn("inline-flex text-primary", className)}
      {...props}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300"
        />
      </svg>
    </span>
  );
}
CircularProgress.displayName = "CircularProgress";

export { CircularProgress };
