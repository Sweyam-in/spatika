import * as React from "react";
import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { Label } from "../primitives/Label";

export type FormFieldProps = {
  /** Id for the control. Generated when omitted and injected into the child if it has none. */
  id?: string;
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
 * Label + control + help/error. Wires `id`, `aria-labelledby` (for controls a `<label>` cannot
 * name, such as radio groups), `aria-describedby`, `aria-invalid` and `aria-required` onto a
 * single child control automatically. Errors are announced politely as they change.
 */
export function FormField({
  id: idProp,
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
  const generatedId = React.useId();
  const childProps = (React.isValidElement(children) ? children.props : {}) as Record<string, unknown> & {
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    "aria-label"?: string;
    "aria-labelledby"?: string;
  };
  const id = idProp ?? childProps.id ?? `field${generatedId.replace(/:/g, "")}`;
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, descriptionId].filter(Boolean).join(" ") || undefined;

  const control = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: childProps.id ?? id,
        "aria-labelledby":
          childProps["aria-labelledby"] ?? (childProps["aria-label"] ? undefined : labelId),
        "aria-describedby":
          [childProps["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? true : childProps["aria-invalid"],
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
        <Label id={labelId} htmlFor={id}>
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
        {/* Always mounted so screen readers announce an error when it appears or changes. */}
        <div data-slot="form-field-error-region" aria-live="polite" className="empty:hidden">
          {error ? (
            <p id={errorId} data-slot="form-field-error" className="flex items-start gap-1.5 text-body-sm text-danger-text">
              <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
              {error}
            </p>
          ) : null}
        </div>
        {description ? (
          <p id={descriptionId} className="text-body-sm text-fg-tertiary">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
