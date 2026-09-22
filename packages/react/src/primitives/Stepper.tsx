import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../lib/cn";

type StepperContextValue = {
  activeStep: number;
  orientation: "horizontal" | "vertical";
  alternativeLabel: boolean;
};

const StepperContext = React.createContext<StepperContextValue | null>(null);
const StepIndexContext = React.createContext(0);

function useStepper(component: string) {
  const ctx = React.useContext(StepperContext);
  if (!ctx) throw new Error(`${component} must be used within <Stepper>`);
  return ctx;
}

export type StepperProps = React.ComponentPropsWithoutRef<"div"> & {
  activeStep?: number;
  orientation?: "horizontal" | "vertical";
  alternativeLabel?: boolean;
};

function Stepper({
  activeStep = 0,
  orientation = "horizontal",
  alternativeLabel = false,
  className,
  children,
  ...props
}: StepperProps) {
  const steps = React.Children.toArray(children);

  return (
    <StepperContext.Provider
      value={{ activeStep, orientation, alternativeLabel }}
    >
      <div
        data-slot="stepper"
        data-orientation={orientation}
        className={cn(
          "flex w-full",
          orientation === "vertical" ? "flex-col gap-0" : "flex-row items-start",
          className,
        )}
        {...props}
      >
        {steps.map((child, index) => (
          <StepIndexContext.Provider key={index} value={index}>
            {child}
            {index < steps.length - 1 ? <StepConnector /> : null}
          </StepIndexContext.Provider>
        ))}
      </div>
    </StepperContext.Provider>
  );
}
Stepper.displayName = "Stepper";

export type StepProps = React.ComponentPropsWithoutRef<"div"> & {
  completed?: boolean;
  disabled?: boolean;
};

function Step({ completed, disabled, className, children, ...props }: StepProps) {
  const stepper = useStepper("Step");
  const index = React.useContext(StepIndexContext);
  const active = stepper.activeStep === index;
  const isCompleted = completed ?? index < stepper.activeStep;

  return (
    <div
      data-slot="step"
      data-active={active ? "" : undefined}
      data-completed={isCompleted ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "flex min-w-0",
        stepper.orientation === "vertical" ? "flex-col" : "flex-none",
        stepper.alternativeLabel && "flex-col items-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
Step.displayName = "Step";

function StepConnector({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const stepper = useStepper("StepConnector");
  const index = React.useContext(StepIndexContext);
  const completed = index < stepper.activeStep;

  return (
    <div
      data-slot="step-connector"
      aria-hidden
      className={cn(
        stepper.orientation === "vertical"
          ? "ml-[15px] h-6 w-px shrink-0"
          : "mx-2 mt-[15px] h-px min-w-4 flex-1",
        completed ? "bg-primary" : "bg-border",
        className,
      )}
      {...props}
    />
  );
}
StepConnector.displayName = "StepConnector";

export type StepLabelProps = React.ComponentPropsWithoutRef<"div"> & {
  optional?: React.ReactNode;
  error?: boolean;
};

function StepLabel({ className, optional, error, children, ...props }: StepLabelProps) {
  const stepper = useStepper("StepLabel");
  const index = React.useContext(StepIndexContext);
  const active = stepper.activeStep === index;
  const completed = index < stepper.activeStep;

  return (
    <div
      data-slot="step-label"
      className={cn(
        "flex items-center gap-3",
        stepper.alternativeLabel && "flex-col gap-2 text-center",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-semibold spk-numeric",
          completed && "bg-primary text-primary-foreground",
          active && !completed && "bg-primary text-primary-foreground ring-4 ring-primary/20",
          !active && !completed && "border border-border/60 bg-muted/40 text-muted-foreground",
          error && "bg-destructive text-white ring-0",
        )}
      >
        {completed ? <Check className="size-4" /> : index + 1}
      </span>
      <div className="min-w-0">
        <div
          className={cn(
            "text-sm font-bold",
            active || completed ? "text-foreground" : "text-muted-foreground",
            error && "text-destructive",
          )}
        >
          {children}
        </div>
        {optional ? (
          <div className="text-xs font-medium text-muted-foreground">{optional}</div>
        ) : null}
      </div>
    </div>
  );
}
StepLabel.displayName = "StepLabel";

function StepContent({ className, children, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const stepper = useStepper("StepContent");
  const index = React.useContext(StepIndexContext);
  if (stepper.orientation !== "vertical") return null;
  if (stepper.activeStep !== index) return null;

  return (
    <div
      data-slot="step-content"
      className={cn("ml-4 border-l border-border/40 py-3 pl-7 text-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}
StepContent.displayName = "StepContent";

export { Stepper, Step, StepLabel, StepContent, StepConnector };
