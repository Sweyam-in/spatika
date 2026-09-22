import * as React from "react";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "../lib/cn";

export type SplitFeatureProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Small accent label above the title. */
  eyebrow?: ReactNode;
  /** Short proof points under the copy, each with a check. */
  bullets?: ReactNode[];
  /** Link or button under the copy. */
  actions?: ReactNode;
  /** Screenshot, `ShowcaseFrame`, chart or illustration. */
  media?: ReactNode;
  /** Put the media first on wide screens. Stacking order on phones never changes. */
  reverse?: boolean;
  /** Give the media more of the row. */
  mediaWidth?: "equal" | "wide";
  /** Heading level. */
  as?: "h2" | "h3";
  className?: string;
  children?: ReactNode;
};

/**
 * One beat of the alternating product story — copy on one side, a visual on the other.
 * Stack several with `SplitFeatureGroup` and the sides alternate for you.
 *
 * On phones the copy always comes first, whatever `reverse` says, so the page still
 * reads top to bottom in the order you wrote it.
 */
export function SplitFeature({
  title,
  description,
  eyebrow,
  bullets,
  actions,
  media,
  reverse = false,
  mediaWidth = "equal",
  as: Heading = "h2",
  className,
  children,
}: SplitFeatureProps) {
  const wide = mediaWidth === "wide";

  return (
    <div
      data-slot="split-feature"
      data-reverse={reverse ? "true" : undefined}
      className={cn(
        "grid items-center gap-8 lg:gap-14",
        wide
          ? reverse
            ? "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]"
            : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"
          : "lg:grid-cols-2",
        className,
      )}
    >
      <div
        data-slot="split-feature-copy"
        className={cn("flex min-w-0 flex-col gap-4", reverse && "lg:order-2")}
      >
        {eyebrow ? <p className="spk-mk-eyebrow">{eyebrow}</p> : null}
        <Heading className="text-title-1 tracking-tight text-fg">{title}</Heading>
        {description ? <p className="max-w-prose text-body-lg text-fg-secondary">{description}</p> : null}

        {bullets?.length ? (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-2.5 text-body text-fg-secondary">
                <span className="mt-0.5 shrink-0 text-accent-text" aria-hidden="true">
                  <Check className="size-4" />
                </span>
                <span className="min-w-0">{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {children}
        {actions ? <div className="flex flex-wrap items-center gap-3 pt-1">{actions}</div> : null}
      </div>

      {media ? (
        <div data-slot="split-feature-media" className={cn("min-w-0", reverse && "lg:order-1")}>
          {media}
        </div>
      ) : null}
    </div>
  );
}

export type SplitFeatureGroupProps = {
  /** `SplitFeature` elements. Every other one is flipped automatically. */
  children: ReactNode;
  /** Start with the media on the left instead of the right. */
  startReversed?: boolean;
  className?: string;
};

/** Stacks `SplitFeature`s with generous spacing and alternates their sides. */
export function SplitFeatureGroup({ children, startReversed = false, className }: SplitFeatureGroupProps) {
  let index = 0;
  const items = React.Children.map(children, (child) => {
    if (!React.isValidElement<SplitFeatureProps>(child)) return child;
    const reverse = index++ % 2 === 0 ? startReversed : !startReversed;
    // An explicit `reverse` on the child always wins.
    return child.props.reverse === undefined ? React.cloneElement(child, { reverse }) : child;
  });

  return (
    <div data-slot="split-feature-group" className={cn("flex flex-col gap-16 lg:gap-24", className)}>
      {items}
    </div>
  );
}
