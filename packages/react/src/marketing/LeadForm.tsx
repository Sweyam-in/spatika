import * as React from "react";
import type { FormEvent, ReactNode } from "react";
import { cn } from "../lib/cn";
import { Button } from "../primitives/Button";
import { Input } from "../primitives/Input";

export type LeadFormStatus = "idle" | "submitting" | "success" | "error";

export type LeadFormProps = {
  /**
   * Called with the email (and the form element, for extra fields you passed as
   * `children`). Return a promise and the button shows a pending state on its own.
   */
  onSubmit?: (value: string, form: HTMLFormElement) => void | Promise<void>;
  /** Field label. Visible unless `hideLabel`, but always announced. */
  label?: ReactNode;
  hideLabel?: boolean;
  placeholder?: string;
  /** Submit button copy. */
  action?: ReactNode;
  /** Fine print under the form — consent, frequency, "no spam". */
  note?: ReactNode;
  /** `inline` puts the field and button on one row; `stacked` is full width. */
  layout?: "inline" | "stacked";
  /** Controlled status. Leave unset and the form tracks its own. */
  status?: LeadFormStatus;
  /** Message shown under the form after success or failure. */
  message?: ReactNode;
  /** Message announced on success when you have not passed `message`. */
  successMessage?: ReactNode;
  /** Extra fields (name, company, a textarea) rendered above the email row. */
  children?: ReactNode;
  /** Native form action — for a Formspree / Mailchimp style endpoint. */
  formAction?: string;
  method?: "get" | "post";
  name?: string;
  className?: string;
};

/**
 * Email capture for a marketing page — the newsletter row under a hero, the waitlist
 * block, the "talk to us" form. Pass extra fields as `children` and they submit with it.
 *
 * Status is uncontrolled by default: if `onSubmit` returns a promise, the button shows a
 * pending state and the success message is announced politely when it resolves.
 */
export function LeadForm({
  onSubmit,
  label = "Email address",
  hideLabel = true,
  placeholder = "you@company.com",
  action = "Subscribe",
  note,
  layout = "inline",
  status: statusProp,
  message,
  successMessage = "Thanks — check your inbox to confirm.",
  children,
  formAction,
  method = "post",
  name,
  className,
}: LeadFormProps) {
  const fieldId = React.useId();
  const [internal, setInternal] = React.useState<LeadFormStatus>("idle");
  const [value, setValue] = React.useState("");
  const status = statusProp ?? internal;
  const inline = layout === "inline";
  const pending = status === "submitting";
  const done = status === "success";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (!onSubmit) return;
    event.preventDefault();
    const form = event.currentTarget;
    try {
      setInternal("submitting");
      await onSubmit(value, form);
      setInternal("success");
    } catch {
      setInternal("error");
    }
  };

  const feedback = message ?? (done ? successMessage : null);

  return (
    <form
      data-slot="lead-form"
      data-layout={layout}
      data-status={status}
      className={cn("spk-mk-lead flex min-w-0 flex-col gap-2", className)}
      onSubmit={onSubmit ? handleSubmit : undefined}
      action={formAction}
      method={formAction ? method : undefined}
      name={name}
    >
      {children ? <div className="flex min-w-0 flex-col gap-3">{children}</div> : null}

      <div className={cn("flex min-w-0 gap-2", inline ? "flex-col sm:flex-row" : "flex-col")}>
        <div className="min-w-0 flex-1">
          <label
            htmlFor={fieldId}
            className={cn(hideLabel ? "sr-only" : "mb-1.5 block text-label text-fg-secondary")}
          >
            {label}
          </label>
          <Input
            id={fieldId}
            name="email"
            type="email"
            required
            autoComplete="email"
            size="lg"
            placeholder={placeholder}
            value={value}
            disabled={pending || done}
            onChange={(event) => setValue(event.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" size="lg" loading={pending} disabled={done} className={cn(!inline && "w-full")}>
          {action}
        </Button>
      </div>

      {feedback ? (
        <p
          data-slot="lead-form-message"
          role="status"
          aria-live="polite"
          className={cn("text-body-sm", status === "error" ? "text-danger-text" : "text-fg-secondary")}
        >
          {feedback}
        </p>
      ) : null}

      {note ? <p className="text-caption text-fg-tertiary">{note}</p> : null}
    </form>
  );
}
