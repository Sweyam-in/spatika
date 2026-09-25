import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { composeRefs } from "../lib/compose-refs";
import { useControllableState } from "../lib/use-controllable-state";

export type TagInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "value" | "defaultValue" | "onChange" | "size"
> & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  /** Maximum number of tags. The field stops accepting input at the limit. */
  max?: number;
  allowDuplicates?: boolean;
  /**
   * Return `false` or an error message to reject a tag. Rejected text stays in the field so
   * it can be corrected; the message is announced to screen readers.
   */
  validate?: (tag: string, tags: string[]) => boolean | string;
  /** Keys that commit the typed text. Default `["Enter", ","]`. */
  separators?: string[];
  /** Commit pending text when the field loses focus. Default true. */
  addOnBlur?: boolean;
  size?: "sm" | "md";
  containerClassName?: string;
  /** Accessible label for each chip's remove button. */
  removeLabel?: (tag: string) => string;
};

/**
 * Free-form multi-value field (emails, labels, keywords). Tags are committed with Enter or
 * a comma, pasted lists are split, and Backspace in an empty field removes the last tag.
 * Arrow keys move between chips; Delete / Backspace on a chip removes it.
 */
const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      value: valueProp,
      defaultValue = [],
      onValueChange,
      max,
      allowDuplicates = false,
      validate,
      separators = ["Enter", ","],
      addOnBlur = true,
      size = "md",
      className,
      containerClassName,
      removeLabel = (tag) => `Remove ${tag}`,
      disabled,
      readOnly,
      placeholder,
      onKeyDown,
      onBlur,
      onPaste,
      ...props
    },
    ref,
  ) => {
    const [tagsState, setTags] = useControllableState<string[]>({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });
    const tags = tagsState ?? [];
    const [text, setText] = React.useState("");
    const [announcement, setAnnouncement] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const listRef = React.useRef<HTMLUListElement | null>(null);
    const full = max != null && tags.length >= max;
    const locked = disabled || readOnly;

    const add = (raw: string[]) => {
      const next = [...tags];
      const added: string[] = [];
      for (const candidate of raw.map((item) => item.trim()).filter(Boolean)) {
        if (max != null && next.length >= max) {
          setAnnouncement(`Limit of ${max} reached`);
          break;
        }
        if (!allowDuplicates && next.some((tag) => tag.toLowerCase() === candidate.toLowerCase())) {
          setAnnouncement(`${candidate} is already added`);
          continue;
        }
        const verdict = validate?.(candidate, next) ?? true;
        if (verdict !== true) {
          setAnnouncement(typeof verdict === "string" ? verdict : `${candidate} is not valid`);
          return false;
        }
        next.push(candidate);
        added.push(candidate);
      }
      if (added.length) {
        setTags(next);
        setAnnouncement(`Added ${added.join(", ")}`);
      }
      return true;
    };

    const removeAt = (index: number, focusAfter: "input" | "neighbour" = "input") => {
      const removed = tags[index];
      setTags(tags.filter((_, i) => i !== index));
      setAnnouncement(`Removed ${removed}`);
      requestAnimationFrame(() => {
        const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button");
        const neighbour = buttons?.[Math.min(index, (buttons?.length ?? 1) - 1)];
        if (focusAfter === "neighbour" && neighbour) neighbour.focus();
        else inputRef.current?.focus();
      });
    };

    const commitText = () => {
      if (!text.trim()) return;
      if (add([text])) setText("");
    };

    const chipKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        buttons[Math.max(0, index - 1)]?.focus();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (index === buttons.length - 1) inputRef.current?.focus();
        else buttons[index + 1]?.focus();
      } else if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        removeAt(index, "neighbour");
      }
    };

    return (
      <div
        data-slot="tag-input"
        className={cn(
          "spk-field spk-field-group spk-tag-input",
          size === "sm" && "spk-field--sm",
          containerClassName,
        )}
        aria-disabled={disabled || undefined}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            event.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >
        {tags.length ? (
          <ul ref={listRef} className="contents" aria-label="Selected">
            {tags.map((tag, index) => (
              <li key={`${tag}-${index}`} className="spk-tag-input-chip">
                <span>{tag}</span>
                {locked ? null : (
                  <button
                    type="button"
                    className="spk-tag-input-remove"
                    aria-label={removeLabel(tag)}
                    onClick={() => removeAt(index)}
                    onKeyDown={(event) => chipKeyDown(event, index)}
                  >
                    <X aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : null}
        <input
          ref={composeRefs(ref, inputRef)}
          data-slot="tag-input-field"
          className={className}
          disabled={disabled}
          readOnly={readOnly || full}
          placeholder={tags.length ? undefined : placeholder}
          aria-description={max != null ? `${tags.length} of ${max}` : undefined}
          {...props}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || locked) return;
            if (separators.includes(event.key) && !event.nativeEvent.isComposing) {
              if (text.trim()) {
                event.preventDefault();
                commitText();
              } else if (event.key !== "Enter") {
                event.preventDefault();
              }
            } else if (event.key === "Backspace" && text === "" && tags.length) {
              event.preventDefault();
              removeAt(tags.length - 1);
            } else if (event.key === "ArrowLeft" && event.currentTarget.selectionStart === 0 && tags.length) {
              event.preventDefault();
              const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button");
              buttons?.[buttons.length - 1]?.focus();
            }
          }}
          onPaste={(event) => {
            onPaste?.(event);
            if (event.defaultPrevented || locked) return;
            const pasted = event.clipboardData.getData("text");
            if (/[,\n\t;]/.test(pasted)) {
              event.preventDefault();
              add(pasted.split(/[,\n\t;]+/));
            }
          }}
          onBlur={(event) => {
            onBlur?.(event);
            if (addOnBlur) commitText();
          }}
        />
        <span className="sr-only" aria-live="polite">
          {announcement}
        </span>
      </div>
    );
  },
);
TagInput.displayName = "TagInput";

export { TagInput };
