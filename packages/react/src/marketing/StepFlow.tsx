import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type FlowStep = {
  title: ReactNode;
  description?: ReactNode;
  /** Replaces the number — a lucide icon, usually. */
  icon?: ReactNode;
  /** Screenshot or snippet for this step. */
  media?: ReactNode;
};

export type StepFlowProps = {
  steps: FlowStep[];
  /** `vertical` reads as a walkthrough; `horizontal` as a three-beat "how it works". */
  orientation?: "vertical" | "horizontal";
  /** Draw the connector between steps. */
  connected?: boolean;
  className?: string;
};

/**
 * Numbered "how it works" sequence. Renders an ordered list, so the order is real for
 * screen readers rather than implied by the connector line.
 */
export function StepFlow({ steps, orientation = "horizontal", connected = true, className }: StepFlowProps) {
  const horizontal = orientation === "horizontal";

  return (
    <ol
      data-slot="step-flow"
      data-orientation={orientation}
      className={cn(
        "m-0 grid list-none gap-8 p-0",
        horizontal ? "md:grid-cols-3 md:gap-12" : "gap-7",
        className,
      )}
    >
      {steps.map((step, index) => (
        <li
          key={index}
          data-slot="step-flow-item"
          data-orientation={orientation}
          data-connected={connected && index < steps.length - 1 ? "true" : undefined}
          className={cn("spk-mk-step", horizontal && "gap-3")}
        >
          <span className="spk-mk-step__index" aria-hidden={step.icon ? "true" : undefined}>
            {step.icon ?? index + 1}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h3 className="text-title-3 text-fg">{step.title}</h3>
            {step.description ? <p className="text-body text-fg-secondary">{step.description}</p> : null}
            {step.media ? <div className="mt-2 min-w-0">{step.media}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
