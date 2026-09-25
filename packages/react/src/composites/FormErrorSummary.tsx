import * as React from "react";
import { cn } from "../lib/cn";

export type FormError = {
  /** Id of the field to focus (the `id` given to `FormField` or the control). */
  fieldId: string;
  message: React.ReactNode;
};

export type FormErrorSummaryProps = {
  errors: FormError[];
  title?: React.ReactNode;
  /** Move focus to the summary when errors appear (after submit). Default true. */
  autoFocus?: boolean;
  className?: string;
};

/**
 * Lists every validation error after a submit, each linking to its field. Focus moves to the
 * summary so keyboard and screen-reader users hear how many problems there are, then follow a
 * link to fix each one. Pair with `FormField` errors for the inline message.
 */
export function FormErrorSummary({
  errors,
  title = "There is a problem",
  autoFocus = true,
  className,
}: FormErrorSummaryProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const signature = errors.map((error) => error.fieldId).join("|");
  const titleId = React.useId();

  React.useEffect(() => {
    if (autoFocus && errors.length) ref.current?.focus();
    // Re-focus only when the set of failing fields changes (a new submit), keyed by signature.
  }, [autoFocus, signature]);

  if (!errors.length) return null;

  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      aria-labelledby={titleId}
      data-slot="form-error-summary"
      className={cn("spk-error-summary", className)}
    >
      <h2 id={titleId} className="spk-error-summary-title">
        {title}
      </h2>
      <ul className="spk-error-summary-list">
        {errors.map((error) => (
          <li key={error.fieldId}>
            <a
              href={`#${error.fieldId}`}
              onClick={(event) => {
                const field = document.getElementById(error.fieldId);
                if (!field) return;
                event.preventDefault();
                field.scrollIntoView?.({ block: "center" });
                field.focus({ preventScroll: true });
              }}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
