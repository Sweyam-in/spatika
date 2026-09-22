import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { Input } from "../primitives/Input";

export type AmountInputProps = Omit<ComponentProps<"input">, "type" | "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  containerClassName?: string;
};

/** Currency-prefixed amount field for finance forms. */
export function AmountInput({
  value,
  onChange,
  currency = "INR",
  className,
  containerClassName,
  ...props
}: AmountInputProps) {
  return (
    <div
      data-slot="amount-input"
      className={cn("relative w-full", containerClassName)}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-body-sm font-medium text-fg-tertiary">
        {currency}
      </span>
      <Input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ""))}
        className={cn("h-11 py-0 pl-14 font-bold tabular-nums leading-none", className)}
        {...props}
      />
    </div>
  );
}
