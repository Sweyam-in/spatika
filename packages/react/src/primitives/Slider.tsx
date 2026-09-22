import * as React from "react";
import { useControllableState } from "../lib/use-controllable-state";
import { cn } from "../lib/cn";

type SliderProps = Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange"> & {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Accessible name for the thumb when there is no visible label. */
  "aria-label"?: string;
  /** Formats `aria-valuetext` (e.g. currency). */
  getValueText?: (value: number) => string;
};

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      defaultValue,
      value: valueProp,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      "aria-label": ariaLabel,
      getValueText,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useControllableState<number[]>({
      prop: valueProp,
      defaultProp: defaultValue ?? [min],
      onChange: onValueChange,
    });

    const values = value ?? [min];
    const primary = values[0] ?? min;
    const pct = ((primary - min) / (max - min || 1)) * 100;

    const commit = (next: number) => {
      const clamped = Math.min(max, Math.max(min, next));
      const stepped = Math.round(clamped / step) * step;
      setValue([Number(stepped.toFixed(6))]);
    };

    return (
      <div
        ref={ref}
        data-slot="slider"
        data-disabled={disabled ? "" : undefined}
        className={cn("spk-slider", className)}
        {...props}
      >
        <div data-slot="slider-track" className="spk-slider-track">
          <div data-slot="slider-range" className="spk-slider-range" style={{ left: 0, width: `${pct}%` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          value={primary}
          aria-label={ariaLabel}
          aria-valuetext={getValueText?.(primary)}
          data-slot="slider-thumb"
          className="spk-slider-input"
          onChange={(event) => commit(Number(event.target.value))}
        />
        <span aria-hidden className="spk-slider-thumb" style={{ left: `${pct}%` }} />
      </div>
    );
  },
);
Slider.displayName = "Slider";

export { Slider };
