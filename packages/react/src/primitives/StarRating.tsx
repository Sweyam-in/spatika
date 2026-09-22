import * as React from "react";
import { Star } from "lucide-react";
import { useControllableState } from "../lib/use-controllable-state";
import { cn } from "../lib/cn";

export type RatingProps = Omit<React.ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue"> & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  max?: number;
  precision?: 0.5 | 1;
  readOnly?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  emptyLabelText?: string;
};

const sizeClass = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

/**
 * Star rating. `StarRating` is the same component with a required `value`.
 */
function Rating({
  value: valueProp,
  defaultValue = 0,
  onChange,
  max = 5,
  precision = 1,
  readOnly = false,
  disabled = false,
  size = "md",
  emptyLabelText = "Rating",
  className,
  ...props
}: RatingProps) {
  const [value = 0, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange,
  });
  const [hover, setHover] = React.useState<number | null>(null);
  const display = hover ?? value;
  const locked = readOnly || disabled;

  return (
    <div
      data-slot="rating"
      role={locked ? "img" : "radiogroup"}
      aria-label={`${display} of ${max} stars`}
      className={cn("inline-flex items-center gap-0.5", disabled && "opacity-50", className)}
      {...props}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const fill = Math.min(1, Math.max(0, display - i));
        return (
          <button
            key={n}
            type="button"
            role={locked ? undefined : "radio"}
            aria-checked={locked ? undefined : n === Math.ceil(value)}
            aria-label={`${n} ${emptyLabelText}`}
            disabled={locked}
            className={cn("relative rounded p-0.5", locked ? "cursor-default" : "hover:scale-110 active:scale-95")}
            onMouseEnter={() => {
              if (!locked) setHover(n);
            }}
            onMouseLeave={() => setHover(null)}
            onClick={() => {
              if (locked) return;
              const next = precision === 0.5 && value === n ? n - 0.5 : n;
              setValue(next);
            }}
          >
            <Star className={cn(sizeClass[size], "text-muted-foreground/35")} />
            <span
              className="absolute inset-0.5 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className={cn(sizeClass[size], "fill-primary text-primary")} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
Rating.displayName = "Rating";

function StarRating({
  value,
  onChange,
  max = 5,
  readOnly = false,
  className,
}: {
  value: number;
  onChange?: (next: number) => void;
  max?: number;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <Rating value={value} onChange={onChange} max={max} readOnly={readOnly} className={className} />
  );
}

export { Rating, StarRating };
