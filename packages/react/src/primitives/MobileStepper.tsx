import * as React from "react";
import { cn } from "../lib/cn";
import { LinearProgress } from "./Progress";

export type MobileStepperProps = React.ComponentPropsWithoutRef<"div"> & {
  steps: number;
  activeStep?: number;
  position?: "static" | "bottom" | "top";
  variant?: "dots" | "text" | "progress";
  nextButton?: React.ReactNode;
  backButton?: React.ReactNode;
};

function MobileStepper({
  steps,
  activeStep = 0,
  position = "static",
  variant = "dots",
  nextButton,
  backButton,
  className,
  ...props
}: MobileStepperProps) {
  return (
    <div
      data-slot="mobile-stepper"
      data-position={position}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-border/40 bg-card/40 px-3 py-2",
        position === "bottom" && "sticky bottom-0",
        position === "top" && "sticky top-0",
        className,
      )}
      {...props}
    >
      {backButton}
      <div className="min-w-0 flex-1">
        {variant === "text" ? (
          <p className="text-center text-xs font-bold text-muted-foreground">
            {activeStep + 1} / {steps}
          </p>
        ) : variant === "progress" ? (
          <LinearProgress value={((activeStep + 1) / steps) * 100} />
        ) : (
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: steps }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "size-1.5 rounded-full",
                  i === activeStep ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </div>
        )}
      </div>
      {nextButton}
    </div>
  );
}
MobileStepper.displayName = "MobileStepper";

export { MobileStepper };
