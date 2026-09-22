import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useControllableState } from "../lib/use-controllable-state";
import { useDismissable } from "../lib/use-dismissable";
import { cn } from "../lib/cn";
import { Input } from "./Input";
import { Label } from "./Label";

export type AutocompleteOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

function normalizeOptions(options: Array<string | AutocompleteOption>): AutocompleteOption[] {
  return options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
}

export type AutocompleteProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onChange" | "defaultValue"
> & {
  options: Array<string | AutocompleteOption>;
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onChange?: (value: string | string[] | null, option?: AutocompleteOption | AutocompleteOption[] | null) => void;
  multiple?: boolean;
  freeSolo?: boolean;
  label?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  noOptionsText?: string;
};

function asList(value: string | string[] | null | undefined): string[] {
  if (value == null || value === "") return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Filterable combobox. Supports single, multiple, and free-solo entry.
 */
function Autocomplete({
  options: optionsProp,
  value: valueProp,
  defaultValue,
  onChange,
  multiple = false,
  freeSolo = false,
  label,
  placeholder = "Search…",
  disabled,
  fullWidth,
  noOptionsText = "No options",
  className,
  id,
  ...props
}: AutocompleteProps) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const options = React.useMemo(() => normalizeOptions(optionsProp), [optionsProp]);
  const [value, setValue] = useControllableState<string | string[] | null>({
    prop: valueProp,
    defaultProp: defaultValue ?? (multiple ? [] : null),
    onChange: (next) => {
      const list = asList(next);
      const matched = options.filter((opt) => list.includes(opt.value));
      onChange?.(next, multiple ? matched : (matched[0] ?? null));
    },
  });
  const selected = asList(value);
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const filtered = options.filter((opt) => {
    if (multiple && selected.includes(opt.value) && !query) return true;
    return opt.label.toLowerCase().includes(query.toLowerCase());
  });

  useDismissable({
    enabled: open,
    onDismiss: () => setOpen(false),
    refs: [rootRef, listRef],
  });

  const commit = (next: string) => {
    if (disabled) return;
    if (multiple) {
      const list = selected.includes(next)
        ? selected.filter((item) => item !== next)
        : [...selected, next];
      setValue(list);
      setQuery("");
    } else {
      setValue(next);
      setQuery("");
      setOpen(false);
    }
  };

  const display = multiple
    ? query
    : open
      ? query
      : (options.find((opt) => opt.value === selected[0])?.label ?? selected[0] ?? "");

  return (
    <div
      ref={rootRef}
      data-slot="autocomplete"
      className={cn("relative", fullWidth && "w-full", className)}
      {...props}
    >
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <div
        className={cn(
          "spk-field mt-1.5 h-auto min-h-[var(--spk-control-h)] flex-wrap gap-1 px-2 py-1",
          disabled && "opacity-50",
        )}
      >
        {multiple
          ? selected.map((item) => {
              const opt = options.find((option) => option.value === item);
              return (
                <span
                  key={item}
                  className="inline-flex h-6 items-center gap-1 rounded-full border border-line bg-surface-subtle pr-1 pl-2 text-caption font-medium text-fg"
                >
                  {opt?.label ?? item}
                  <button
                    type="button"
                    aria-label={`Remove ${opt?.label ?? item}`}
                    className="inline-flex size-4 items-center justify-center rounded-full text-fg-tertiary hover:bg-hover hover:text-fg"
                    onClick={() => commit(item)}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              );
            })
          : null}
        <Input
          id={fieldId}
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          placeholder={selected.length && multiple ? undefined : placeholder}
          value={multiple ? query : display}
          className="h-7! min-w-16 flex-1 border-0! bg-transparent! px-1! shadow-none!"
          onFocus={() => {
            setOpen(true);
            if (!multiple) {
              const current =
                options.find((opt) => opt.value === selected[0])?.label ?? selected[0] ?? "";
              setQuery(current);
            }
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setHighlight(0);
            if (!multiple && !freeSolo) {
              /* keep typing local until a selection is committed */
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setHighlight((index) => Math.min(filtered.length - 1, index + 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlight((index) => Math.max(0, index - 1));
            } else if (event.key === "Enter") {
              event.preventDefault();
              const hit = filtered[highlight];
              if (hit) commit(hit.value);
              else if (freeSolo && query.trim()) commit(query.trim());
            } else if (event.key === "Escape") {
              setOpen(false);
            } else if (event.key === "Backspace" && multiple && !query && selected.length) {
              commit(selected[selected.length - 1]!);
            }
          }}
        />
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </div>
      {open ? (
        <div
          ref={listRef}
          role="listbox"
          data-slot="autocomplete-list"
          className="spk-overlay spk-animate-pop absolute z-50 mt-1 max-h-60 w-full overflow-auto p-1"
        >
          {filtered.length === 0 ? (
            <div className="px-2 py-2 text-body text-fg-secondary">{noOptionsText}</div>
          ) : (
            filtered.map((opt, index) => {
              const active = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={opt.disabled}
                  className={cn(
                    "spk-item w-full justify-between text-left",
                    index === highlight && "bg-hover",
                    opt.disabled && "opacity-40",
                  )}
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => commit(opt.value)}
                >
                  {opt.label}
                  {active ? <Check className="size-3.5 text-accent-text" /> : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
Autocomplete.displayName = "Autocomplete";

export { Autocomplete };
