import * as React from "react";
import { cn } from "../lib/cn";
import { Input } from "./Input";
import { Label } from "./Label";
import { Textarea } from "./Textarea";

export type TextFieldProps = Omit<React.ComponentPropsWithoutRef<"input">, "size"> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  size?: "sm" | "md";
};

/**
 * Labeled input (or textarea) with helper / error copy — MUI TextField analogue.
 */
const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      multiline,
      rows = 3,
      fullWidth,
      size = "md",
      className,
      disabled,
      required,
      type,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const fieldId = id ?? autoId;
    const helperId = helperText ? `${fieldId}-helper` : undefined;

    const fieldClass = cn(
      size === "sm" && "spk-field--sm",
      error && "aria-invalid:border-destructive",
      className,
    );

    const control = multiline ? (
      <Textarea
        id={fieldId}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={error || undefined}
        aria-describedby={helperId}
        className={cn(fullWidth && "w-full", className)}
        {...(props as React.ComponentPropsWithoutRef<"textarea">)}
      />
    ) : (
      <Input
        ref={ref}
        id={fieldId}
        type={type}
        disabled={disabled}
        required={required}
        aria-invalid={error || undefined}
        aria-describedby={helperId}
        className={cn(fullWidth && "w-full", fieldClass)}
        {...props}
      />
    );

    return (
      <div
        data-slot="text-field"
        data-error={error ? "" : undefined}
        className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}
      >
        {label ? (
          <Label htmlFor={fieldId}>
            {label}
            {required ? <span className="text-danger-text" aria-hidden>*</span> : null}
          </Label>
        ) : null}
        {control}
        {helperText ? (
          <p
            id={helperId}
            data-slot="text-field-helper"
            className={cn(
              "text-body-sm",
              error ? "text-danger-text" : "text-fg-tertiary",
            )}
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
TextField.displayName = "TextField";

export { TextField };
