import * as React from "react";
import { cn } from "../lib/cn";
import { Label } from "./Label";

type FormControlContextValue = {
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
};

const FormControlContext = React.createContext<FormControlContextValue | null>(null);

export type FormControlProps = React.ComponentPropsWithoutRef<"div"> & {
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
};

function FormControl({
  error,
  disabled,
  required,
  fullWidth,
  className,
  ...props
}: FormControlProps) {
  return (
    <FormControlContext.Provider value={{ error, disabled, required, fullWidth }}>
      <div
        data-slot="form-control"
        data-error={error ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={cn("flex flex-col gap-1.5", fullWidth && "w-full", className)}
        {...props}
      />
    </FormControlContext.Provider>
  );
}
FormControl.displayName = "FormControl";

function FormLabel({ className, children, ...props }: React.ComponentPropsWithoutRef<"label">) {
  const ctx = React.useContext(FormControlContext);
  return (
    <Label
      data-slot="form-label"
      className={cn(ctx?.error && "text-destructive", className)}
      {...props}
    >
      {children}
      {ctx?.required ? <span className="text-danger-text" aria-hidden>*</span> : null}
    </Label>
  );
}
FormLabel.displayName = "FormLabel";

function FormHelperText({ className, ...props }: React.ComponentPropsWithoutRef<"p">) {
  const ctx = React.useContext(FormControlContext);
  return (
    <p
      data-slot="form-helper-text"
      className={cn(
        "text-body-sm",
        ctx?.error ? "text-danger-text" : "text-fg-tertiary",
        className,
      )}
      {...props}
    />
  );
}
FormHelperText.displayName = "FormHelperText";

function FormGroup({
  row,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { row?: boolean }) {
  return (
    <div
      data-slot="form-group"
      role="group"
      className={cn("flex", row ? "flex-row flex-wrap gap-4" : "flex-col gap-2", className)}
      {...props}
    />
  );
}
FormGroup.displayName = "FormGroup";

export { FormControl, FormLabel, FormHelperText, FormGroup };
