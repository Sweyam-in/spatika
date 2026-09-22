import * as React from "react";
import { cn } from "../lib/cn";
import { Button } from "../primitives/Button";

export type HeaderIconButtonProps = React.ComponentProps<"button"> & {
  active?: boolean;
  /** Unread / status count shown as a pill */
  badge?: number | string | boolean;
  size?: "sm" | "md";
};

/**
 * Square frosted toolbar control used in sticky headers and app chrome.
 * Fully customizable via className; children typically an icon.
 */
export function HeaderIconButton({
  className,
  active,
  badge,
  size = "md",
  children,
  ...props
}: HeaderIconButtonProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const showBadge = badge === true || (typeof badge === "number" && badge > 0) || typeof badge === "string";

  return (
    <Button
      type="button"
      variant="ghost"
      data-slot="header-icon-button"
      data-active={active ? "true" : "false"}
      className={cn(
        dim,
        "relative text-fg-secondary hover:text-fg",
        active && "bg-pressed text-fg",
        className,
      )}
      {...props}
    >
      {children}
      {showBadge ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-solid px-1 text-[0.625rem] font-semibold text-primary-foreground ring-2 ring-surface spk-numeric">
          {badge === true ? "" : badge}
        </span>
      ) : null}
    </Button>
  );
}
