import * as React from "react";
import { cn } from "../lib/cn";

export type InputAdornmentProps = React.ComponentPropsWithoutRef<"span"> & {
  position?: "start" | "end";
};

function InputAdornment({ position = "start", className, ...props }: InputAdornmentProps) {
  return (
    <span
      data-slot="input-adornment"
      data-position={position}
      className={cn("spk-field-adornment", className)}
      {...props}
    />
  );
}
InputAdornment.displayName = "InputAdornment";

export type OutlinedInputProps = React.ComponentPropsWithoutRef<"input"> & {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  error?: boolean;
  fullWidth?: boolean;
};

const OutlinedInput = React.forwardRef<HTMLInputElement, OutlinedInputProps>(
  ({ startAdornment, endAdornment, error, fullWidth, className, ...props }, ref) => (
    <div
      data-slot="outlined-input"
      className={cn("spk-field spk-field-group", !fullWidth && "w-auto", className)}
    >
      {startAdornment}
      <input ref={ref} aria-invalid={error || undefined} data-slot="input" {...props} />
      {endAdornment}
    </div>
  ),
);
OutlinedInput.displayName = "OutlinedInput";

/** Filled field — quieter fill, no resting border. For dense toolbars and inline filters. */
const FilledInput = React.forwardRef<HTMLInputElement, OutlinedInputProps>(
  ({ startAdornment, endAdornment, error, fullWidth, className, ...props }, ref) => (
    <div
      data-slot="filled-input"
      className={cn(
        "spk-field spk-field-group border-transparent bg-surface-subtle shadow-none",
        !fullWidth && "w-auto",
        className,
      )}
    >
      {startAdornment}
      <input ref={ref} aria-invalid={error || undefined} data-slot="input" {...props} />
      {endAdornment}
    </div>
  ),
);
FilledInput.displayName = "FilledInput";

export { InputAdornment, OutlinedInput, FilledInput };
