import * as React from "react";
import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { Label } from "../primitives/Label";

export type FormFieldProps = {
  id: string;
  label: string;
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
  /** Shows "Optional" beside the label (use instead of marking every other field required). */
  optional?: boolean;
  /** Trailing element on the label row, e.g. a "Forgot password?" link. */
  labelAction?: ReactNode;
  /** `horizontal` puts the label in a left column at ≥640px (settings pages). */
  layout?: "vertical" | "horizontal";
};

/**
 * Label + control + help/error. Wires `aria-describedby`, `aria-invalid` and `aria-required`
 * onto a single child control automatically.
 */
export function FormField({
  id,
  label,
  description,
  error,
  children,
  className,
  required,
  optional,
  labelAction,
  layout = "vertical",
}: FormFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, descriptionId].filter(Boolean).join(" ") || undefined;

  const control = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        "aria-describedby":
          [(children.props as { "aria-describedby"?: string })["aria-describedby"], describedBy]
            .filter(Boolean)
            .join(" ") || undefined,
        "aria-invalid": error ? true : (children.props as { "aria-invalid"?: boolean })["aria-invalid"],
        "aria-required": required || undefined,
      })
    : children;

  return (
    <div
      data-slot="form-field"
      data-invalid={error ? "true" : undefined}
      className={cn(
        layout === "horizontal" ? "grid gap-1.5 sm:grid-cols-[minmax(10rem,14rem)_1fr] sm:gap-6" : "flex flex-col gap-1.5",
        className,
      )}
    >
      <div className={cn("flex items-center justify-between gap-2", layout === "horizontal" && "sm:items-start sm:pt-2")}>
        <Label htmlFor={id}>
          {label}
          {required ? (
            <span className="text-danger-text" aria-hidden>
              *
            </span>
          ) : null}
          {optional ? <span className="font-normal text-fg-tertiary">Optional</span> : null}
        </Label>
        {labelAction ? <div className="text-body-sm">{labelAction}</div> : null}
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        {control}
        {error ? (
          <p id={errorId} className="flex items-start gap-1.5 text-body-sm text-danger-text" role="alert">
            <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
            {error}
          </p>
        ) : null}
        {description ? (
          <p id={descriptionId} className="text-body-sm text-fg-tertiary">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
