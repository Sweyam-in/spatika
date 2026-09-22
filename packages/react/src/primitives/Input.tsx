import * as React from "react";
import { cn } from "../lib/cn";

export type InputSize = "sm" | "md" | "lg" | "touch";

export type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  /**
   * Control height (`sm` · `md` · `lg` · `touch`). Defaults to the density token.
   * A number is forwarded as the native `size` attribute for compatibility.
   */
  size?: InputSize | number;
  /** Content rendered inside the field before the input (icon, currency, prefix). */
  leading?: React.ReactNode;
  /** Content rendered inside the field after the input (unit, shortcut, clear button). */
  trailing?: React.ReactNode;
  /** Classes for the wrapper when `leading` / `trailing` are used. */
  containerClassName?: string;
  /** Borderless field for toolbars and inline editing. */
  variant?: "default" | "ghost";
};

const sizeClass: Record<InputSize, string> = {
  sm: "spk-field--sm",
  md: "",
  lg: "spk-field--lg",
  touch: "spk-field--touch",
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, containerClassName, type, size = "md", leading, trailing, variant = "default", ...props },
    ref,
  ) => {
    const sizeKey: InputSize = typeof size === "string" ? size : "md";
    const nativeSize = typeof size === "number" ? size : undefined;
    const fieldClass = cn(
      "spk-field",
      sizeClass[sizeKey],
      variant === "ghost" && "spk-field--ghost",
    );

    if (leading || trailing) {
      return (
        <div
          data-slot="input-group"
          className={cn(fieldClass, "spk-field-group", containerClassName)}
          onMouseDown={(event) => {
            const target = event.target as HTMLElement;
            if (target.tagName !== "INPUT") {
              event.preventDefault();
              target.closest("[data-slot=input-group]")?.querySelector("input")?.focus();
            }
          }}
        >
          {leading ? <span className="spk-field-adornment">{leading}</span> : null}
          <input type={type} ref={ref} size={nativeSize} data-slot="input" className={className} {...props} />
          {trailing ? <span className="spk-field-adornment">{trailing}</span> : null}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        size={nativeSize}
        data-slot="input"
        className={cn(
          fieldClass,
          "file:mr-3 file:h-full file:border-0 file:bg-transparent file:text-label file:font-medium file:text-fg",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
