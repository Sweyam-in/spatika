
import * as React from "react";

import { getAvatarColor, getInitials } from "../lib/avatar-utils";
import { cn } from "../lib/cn";

type ImageStatus = "idle" | "loading" | "loaded" | "error";

type AvatarContextValue = {
  imageStatus: ImageStatus;
  setImageStatus: (status: ImageStatus) => void;
};

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const avatarSizeClass: Record<AvatarSize, string> = {
  xs: "size-5 text-[0.5625rem]",
  sm: "size-6 text-[0.625rem]",
  md: "size-8 text-caption",
  lg: "size-10 text-body-sm",
  xl: "size-14 text-title-3",
};

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & { size?: AvatarSize; shape?: "circle" | "square" }
>(({ className, children, size = "lg", shape = "circle", ...props }, ref) => {
  const [imageStatus, setImageStatus] = React.useState<ImageStatus>("idle");

  const hasImage = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type as { displayName?: string })?.displayName === "AvatarImage" &&
      !!(child.props as { src?: string }).src,
  );

  return (
    <AvatarContext.Provider value={{ imageStatus, setImageStatus }}>
      <span
        key={hasImage ? "has-image" : "no-image"}
        ref={ref}
        data-slot="avatar"
        className={cn(
          "relative flex shrink-0 overflow-hidden font-medium select-none",
          avatarSizeClass[size],
          shape === "circle" ? "rounded-full" : "rounded-[var(--spk-radius-sm)]",
          className,
        )}
        {...props}
      >
        {children}
      </span>
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentPropsWithoutRef<"img">
>(({ src, className, onLoad, onError, ...props }, ref) => {
  const ctx = React.useContext(AvatarContext);
  const setImageStatus = ctx?.setImageStatus;

  React.useEffect(() => {
    if (!src) {
      setImageStatus?.("error");
      return;
    }
    setImageStatus?.("loading");
  }, [src, setImageStatus]);

  if (!src) return null;

  return (
    <img
      ref={ref}
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full object-cover",
        ctx?.imageStatus !== "loaded" && "hidden",
        className,
      )}
      src={src}
      onLoad={(event) => {
        setImageStatus?.("loaded");
        onLoad?.(event);
      }}
      onError={(event) => {
        setImageStatus?.("error");
        onError?.(event);
      }}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(AvatarContext);
  const show = !ctx || ctx.imageStatus !== "loaded";

  if (!show) return null;

  return (
    <span
      ref={ref}
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-[inherit] bg-surface-sunken text-fg-secondary",
        className,
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

/**
 * Plain initials circle — use when {@link AvatarFallback} would stay hidden
 * without an image load cycle (e.g. no {@link AvatarImage} child).
 */
function InitialsAvatar({
  name,
  className,
  textClassName,
  size,
}: {
  name?: string | null;
  className?: string;
  textClassName?: string;
  size?: AvatarSize;
}) {
  const n = name?.trim() || "User";
  const initials = getInitials(n) || "?";
  return (
    <div
      role="img"
      aria-label={n}
      data-slot="initials-avatar"
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-medium",
        size ? avatarSizeClass[size] : undefined,
        getAvatarColor(n),
        className,
      )}
    >
      <span className={cn("leading-none", textClassName)}>{initials}</span>
    </div>
  );
}

export type AvatarGroupProps = React.ComponentPropsWithoutRef<"div"> & {
  max?: number;
  total?: number;
  spacing?: "sm" | "md" | "lg";
};

const spacingClass = {
  sm: "-space-x-1",
  md: "-space-x-2",
  lg: "-space-x-3",
} as const;

/**
 * Overlapping avatar stack with an overflow count.
 */
function AvatarGroup({
  max = 5,
  total,
  spacing = "md",
  className,
  children,
  ...props
}: AvatarGroupProps) {
  const avatars = React.Children.toArray(children);
  const extra = Math.max(0, (total ?? avatars.length) - max);
  const shown = extra > 0 ? avatars.slice(0, max) : avatars;

  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "flex items-center [&>*]:ring-2 [&>*]:ring-surface",
        spacingClass[spacing],
        className,
      )}
      {...props}
    >
      {shown}
      {extra > 0 ? (
        <span
          data-slot="avatar-group-surplus"
          className="relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-fg-secondary spk-numeric"
        >
          +{extra}
        </span>
      ) : null}
    </div>
  );
}
AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarImage, AvatarFallback, InitialsAvatar, AvatarGroup, avatarSizeClass };
