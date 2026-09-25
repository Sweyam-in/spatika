import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/use-controllable-state";

export type OtpInputProps = {
  /** Number of characters. Default 6. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called once when every cell is filled. */
  onComplete?: (value: string) => void;
  /** `numeric` (default) accepts digits; `alphanumeric` accepts letters and digits. */
  type?: "numeric" | "alphanumeric";
  /** Render a separator after every `groupSize` cells (e.g. 3 → `123–456`). */
  groupSize?: number;
  /** Obscure entered characters. */
  mask?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  /** Accessible name of the group. Default "Verification code". */
  "aria-label"?: string;
  "aria-describedby"?: string;
  id?: string;
  name?: string;
  className?: string;
};

/**
 * One-time-code entry. Each character has its own cell; typing advances, Backspace steps
 * back, arrows move, and pasting (or SMS autofill via `autocomplete="one-time-code"`) fills
 * every cell at once.
 */
export function OtpInput({
  length = 6,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onComplete,
  type = "numeric",
  groupSize,
  mask,
  disabled,
  invalid,
  autoFocus,
  "aria-label": ariaLabel = "Verification code",
  "aria-describedby": describedBy,
  id,
  name,
  className,
}: OtpInputProps) {
  const [valueState, setValue] = useControllableState<string>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const value = (valueState ?? "").slice(0, length);
  const cells = React.useRef<(HTMLInputElement | null)[]>([]);
  const pattern = type === "numeric" ? /\d/ : /[a-z0-9]/i;
  const lastCompleted = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (value.length === length && lastCompleted.current !== value) {
      lastCompleted.current = value;
      onComplete?.(value);
    } else if (value.length < length) {
      lastCompleted.current = null;
    }
  }, [value, length, onComplete]);

  const focusCell = (index: number) => {
    const cell = cells.current[Math.max(0, Math.min(length - 1, index))];
    cell?.focus();
    cell?.select();
  };

  const writeFrom = (index: number, input: string) => {
    const chars = input.split("").filter((char) => pattern.test(char));
    if (!chars.length) return;
    const next = value.padEnd(index, " ").split("");
    chars.forEach((char, offset) => {
      if (index + offset < length) next[index + offset] = type === "numeric" ? char : char.toUpperCase();
    });
    const joined = next.join("").replace(/\s+$/, "").slice(0, length);
    setValue(joined);
    focusCell(Math.min(index + chars.length, length - 1));
  };

  return (
    <div
      role="group"
      id={id}
      aria-label={ariaLabel}
      aria-describedby={describedBy}
      data-slot="otp-input"
      className={cn("spk-otp", className)}
    >
      {Array.from({ length }, (_, index) => {
        const char = value[index]?.trim() ?? "";
        return (
          <React.Fragment key={index}>
            {groupSize && index > 0 && index % groupSize === 0 ? (
              <span className="spk-otp-separator" aria-hidden />
            ) : null}
            <input
              ref={(node) => {
                cells.current[index] = node;
              }}
              className="spk-field spk-otp-cell"
              type={mask ? "password" : "text"}
              inputMode={type === "numeric" ? "numeric" : "text"}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              autoFocus={autoFocus && index === 0}
              maxLength={length}
              aria-label={`Character ${index + 1} of ${length}`}
              aria-invalid={invalid || undefined}
              disabled={disabled}
              value={char}
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => {
                const typed = event.target.value;
                // Autofill and some keyboards deliver the whole code into one cell.
                if (typed.length > 1) writeFrom(index, typed.startsWith(char) ? typed.slice(char.length) || typed : typed);
                else if (typed === "") {
                  const next = value.split("");
                  next[index] = " ";
                  setValue(next.join("").replace(/\s+$/, ""));
                } else writeFrom(index, typed);
              }}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !char) {
                  event.preventDefault();
                  const next = value.split("");
                  next[index - 1] = " ";
                  setValue(next.join("").replace(/\s+$/, ""));
                  focusCell(index - 1);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  focusCell(index - 1);
                } else if (event.key === "ArrowRight") {
                  event.preventDefault();
                  focusCell(index + 1);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  focusCell(0);
                } else if (event.key === "End") {
                  event.preventDefault();
                  focusCell(Math.min(value.length, length - 1));
                }
              }}
              onPaste={(event) => {
                event.preventDefault();
                writeFrom(index, event.clipboardData.getData("text"));
              }}
            />
          </React.Fragment>
        );
      })}
      {name ? <input type="hidden" name={name} value={value.replace(/\s/g, "")} /> : null}
    </div>
  );
}
