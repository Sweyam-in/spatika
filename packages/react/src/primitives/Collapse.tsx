import * as React from "react";
import { cn } from "../lib/cn";

export type CollapseProps = Omit<React.ComponentPropsWithoutRef<"div">, "in"> & {
  /** When true, the child is expanded. */
  in?: boolean;
  /** Keep children mounted while collapsed. Defaults to true so height can animate. */
  unmountOnExit?: boolean;
};

/**
 * Height collapse used by Accordion and other expandable regions.
 * Animates `grid-template-rows` (transform-safe; no `transition-all`).
 */
const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  ({ in: open = false, unmountOnExit = false, className, children, ...props }, ref) => {
    if (unmountOnExit && !open) return null;

    return (
      <div
        ref={ref}
        data-slot="collapse"
        data-state={open ? "open" : "closed"}
        aria-hidden={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          className,
        )}
        {...props}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    );
  },
);
Collapse.displayName = "Collapse";

export { Collapse };
