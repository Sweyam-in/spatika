import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type PageShellProps = {
  children: ReactNode;
  className?: string;
  /** Include horizontal page padding. */
  padded?: boolean;
  /** Constrain content width (`--spk-page-max`). */
  contained?: boolean;
};

/** Page frame on the canvas colour. */
export function PageShell({ children, className, padded = true, contained = false }: PageShellProps) {
  return (
    <div data-slot="page-shell" className={cn("app-page", className)}>
      <div className={cn(padded && "app-shell", contained && "mx-auto max-w-[var(--spk-page-max)]")}>{children}</div>
    </div>
  );
}
