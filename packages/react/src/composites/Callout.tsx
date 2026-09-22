import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Alert, AlertDescription, AlertTitle } from "../primitives/Alert";

export function Callout({
  title,
  children,
  variant = "info",
  className,
}: {
  title?: string;
  children: ReactNode;
  variant?: "default" | "info" | "warm" | "highlight" | "danger";
  className?: string;
}) {
  return (
    <Alert data-slot="callout" variant={variant} className={className}>
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
