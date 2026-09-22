import * as React from "react";
import { cn } from "../lib/cn";
import { Label } from "./Label";

export type FormControlLabelProps = Omit<React.ComponentPropsWithoutRef<"label">, "control"> & {
  control: React.ReactElement<{ disabled?: boolean }>;
  label: React.ReactNode;
  labelPlacement?: "end" | "start" | "top" | "bottom";
  disabled?: boolean;
};

const placementClass = {
  end: "flex-row",
  start: "flex-row-reverse",
  top: "flex-col-reverse items-center",
  bottom: "flex-col items-center",
} as const;

/**
 * Pairs a checkbox, radio, or switch with its visible label.
 */
function FormControlLabel({
  control,
  label,
  labelPlacement = "end",
  disabled,
  className,
  ...props
}: FormControlLabelProps) {
  const controlDisabled = disabled || control.props.disabled;

  return (
    <Label
      data-slot="form-control-label"
      data-disabled={controlDisabled ? "" : undefined}
      className={cn(
        "inline-flex w-fit cursor-pointer items-center gap-2",
        placementClass[labelPlacement],
        controlDisabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...props}
    >
      {React.cloneElement(control, { disabled: controlDisabled })}
      <span className="text-sm font-medium">{label}</span>
    </Label>
  );
}
FormControlLabel.displayName = "FormControlLabel";

export { FormControlLabel };
