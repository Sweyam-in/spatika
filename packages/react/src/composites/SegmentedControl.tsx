import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "../lib/cn";

export type SegmentedControlOption<T extends string = string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps<T extends string = string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
  /** Stretch to fill the container. */
  block?: boolean;
  "aria-label"?: string;
};

/** Single-select segmented toggle (period, view mode). Arrow keys move selection. */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
  size = "md",
  block = false,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const enabled = options.filter((opt) => !opt.disabled);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key) || enabled.length === 0) return;
    event.preventDefault();
    const index = enabled.findIndex((opt) => opt.value === value);
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = enabled.length - 1;
    else next = (index + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length;
    const target = enabled[next];
    if (!target) return;
    onChange(target.value);
    const button = event.currentTarget.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(target.value)}"]`);
    button?.focus();
  };

  return (
    <div
      data-slot="segmented-control"
      role="radiogroup"
      aria-label={ariaLabel}
      data-size={size}
      data-block={block ? "true" : undefined}
      className={cn("spk-segmented", className)}
      onKeyDown={onKeyDown}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-value={opt.value}
            tabIndex={active ? 0 : -1}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className="spk-segmented-item [&_svg]:size-3.5"
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
