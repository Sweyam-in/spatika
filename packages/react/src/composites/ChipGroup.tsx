import { cn } from "../lib/cn";
import { typographyEyebrow } from "../lib/typography";
import { Chip } from "./Chip";

export type ChipOption = {
  value: string;
  label: string;
};

export type ChipGroupProps = {
  title?: string;
  options: ChipOption[];
  selected: string[] | undefined;
  onToggle: (value: string) => void;
  /** filter = soft pills, preference = uppercase admin chips */
  variant?: "filter" | "preference";
  className?: string;
  showCount?: boolean;
};

/** Case-insensitive membership check. */
export function isOptionSelected(list: string[] | undefined, value: string): boolean {
  return (list || []).some(
    (entry) => String(entry).toUpperCase() === String(value).toUpperCase(),
  );
}

/** Toggle a value in a list (case-insensitive). */
export function toggleOptionValue<T extends string>(list: T[] | undefined, value: T): T[] {
  const current = list || [];
  const index = current.findIndex(
    (entry) => String(entry).toUpperCase() === String(value).toUpperCase(),
  );
  if (index >= 0) {
    return current.filter((_, i) => i !== index);
  }
  return [...current, value];
}

/**
 * Titled multi-select chip row used in admin preferences and filter panels.
 */
export function ChipGroup({
  title,
  options,
  selected,
  onToggle,
  variant = "preference",
  className,
  showCount = true,
}: ChipGroupProps) {
  const selectedCount = options.filter((opt) => isOptionSelected(selected, opt.value)).length;

  return (
    <div data-slot="chip-group" className={cn("space-y-3", className)}>
      {title ? (
        <div className="flex items-center justify-between gap-2 px-0.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
            <p className={typographyEyebrow}>{title}</p>
          </div>
          {showCount && selectedCount > 0 ? (
            <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-caption font-medium text-fg-tertiary text-primary">
              {selectedCount}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = isOptionSelected(selected, opt.value);
          return (
            <Chip
              key={opt.value}
              variant={variant}
              active={active}
              onClick={() => onToggle(opt.value)}
            >
              {opt.label}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}
