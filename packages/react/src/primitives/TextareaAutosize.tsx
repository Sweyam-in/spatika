import * as React from "react";
import { composeRefs } from "../lib/compose-refs";
import { cn } from "../lib/cn";
import { useIsomorphicLayoutEffect } from "../lib/use-isomorphic-layout-effect";

export type TextareaAutosizeProps = React.ComponentPropsWithoutRef<"textarea"> & {
  minRows?: number;
  maxRows?: number;
};

const TextareaAutosize = React.forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  ({ className, minRows = 2, maxRows, onChange, style, ...props }, ref) => {
    const inner = React.useRef<HTMLTextAreaElement | null>(null);

    const resize = React.useCallback(() => {
      const node = inner.current;
      if (!node) return;
      node.style.height = "auto";
      const line = Number.parseFloat(getComputedStyle(node).lineHeight) || 20;
      const min = minRows * line;
      const max = maxRows ? maxRows * line : Number.POSITIVE_INFINITY;
      node.style.height = `${Math.min(max, Math.max(min, node.scrollHeight))}px`;
    }, [minRows, maxRows]);

    useIsomorphicLayoutEffect(() => {
      resize();
    });

    return (
      <textarea
        ref={composeRefs(ref, inner)}
        data-slot="textarea-autosize"
        rows={minRows}
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px]",
          className,
        )}
        style={{ overflow: "hidden", resize: "none", ...style }}
        onChange={(event) => {
          onChange?.(event);
          resize();
        }}
        {...props}
      />
    );
  },
);
TextareaAutosize.displayName = "TextareaAutosize";

export { TextareaAutosize };
