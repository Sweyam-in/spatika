import * as React from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/cn";

export type SectionBackdropKind = "aurora" | "glow" | "grid" | "dots" | "rays";

export type SectionBackdropProps = {
  /**
   * `aurora` — two soft accent fields · `glow` — one spotlight behind a centred hero ·
   * `grid` / `dots` — hairline pattern that fades at the edges · `rays` — a faint prism fan.
   */
  kind?: SectionBackdropKind;
  /** Multiplier on the backdrop opacity. Drop it below 1 on busy sections. */
  strength?: number;
  /** Slow drift on `aurora` and `glow`. Ignored under `prefers-reduced-motion`. */
  animated?: boolean;
  className?: string;
};

/**
 * Decorative layer for a marketing section — purely presentational and token-derived, so
 * it retints with the theme. Sits behind `MarketingSection` content automatically.
 */
export function SectionBackdrop({
  kind = "aurora",
  strength = 1,
  animated = false,
  className,
}: SectionBackdropProps) {
  return (
    <div
      data-slot="section-backdrop"
      data-kind={kind}
      data-animated={animated ? "true" : undefined}
      aria-hidden="true"
      className={cn("spk-mk-backdrop", className)}
      style={{ "--spk-mk-backdrop-strength": strength } as CSSProperties}
    />
  );
}

export type MarketingSectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** Background material. `inverse` and `accent` flip the ink for everything inside. */
  tone?: "plain" | "wash" | "sunken" | "inverse" | "accent";
  /** Content width. `narrow` suits long-form copy; `full` opts out of the inner container. */
  width?: "default" | "narrow" | "full";
  /** Hairline separators between stacked sections. */
  edge?: "none" | "top" | "bottom" | "both";
  /** Decorative backdrop — pass a kind, or an options object. */
  backdrop?: SectionBackdropKind | SectionBackdropProps;
  /** Vertical rhythm. `tight` halves the section padding, `none` removes it. */
  spacing?: "none" | "tight" | "default";
  /** Extra classes for the inner max-width container. */
  innerClassName?: string;
  children?: ReactNode;
};

const spacingStyle: Record<NonNullable<MarketingSectionProps["spacing"]>, CSSProperties | undefined> = {
  none: { paddingBlock: 0 },
  tight: { paddingBlock: "calc(var(--spk-mk-section-py) * 0.55)" },
  default: undefined,
};

/**
 * Full-bleed band of a marketing page: background tone, generous vertical rhythm, an
 * optional decorative backdrop, and a centred max-width container for the content.
 *
 * This is the marketing counterpart to `PageSection` — reach for `PageSection` inside
 * product screens, and for this on landing, pricing and story pages.
 */
export const MarketingSection = React.forwardRef<HTMLElement, MarketingSectionProps>(
  function MarketingSection(
    {
      tone = "plain",
      width = "default",
      edge = "none",
      backdrop,
      spacing = "default",
      className,
      innerClassName,
      children,
      style,
      ...props
    },
    ref,
  ) {
    const backdropProps: SectionBackdropProps | null =
      backdrop == null ? null : typeof backdrop === "string" ? { kind: backdrop } : backdrop;

    return (
      <section
        ref={ref}
        data-slot="marketing-section"
        data-tone={tone}
        data-edge={edge === "none" ? undefined : edge}
        className={cn("spk-mk-section", className)}
        style={{ ...spacingStyle[spacing], ...style }}
        {...props}
      >
        {backdropProps ? <SectionBackdrop {...backdropProps} /> : null}
        {width === "full" ? (
          <div data-slot="marketing-section-inner" data-width="full" className={cn("relative z-[1]", innerClassName)}>
            {children}
          </div>
        ) : (
          <div
            data-slot="marketing-section-inner"
            data-width={width}
            className={cn("spk-mk-section__inner", innerClassName)}
          >
            {children}
          </div>
        )}
      </section>
    );
  },
);
