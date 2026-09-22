import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

/** Compact icon control for the chart toolbar. Avoids a @spatika/react dependency. */
export function ChartToolbarButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      data-slot="chart-toolbar-button"
      className={cn("spk-chart-toolbar-btn", className)}
      {...props}
    >
      {children}
    </button>
  );
}
