import * as React from "react";
import type { ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../lib/cn";

export type PricingFeature = {
  /** Feature copy. */
  label: ReactNode;
  /** Render as not-included (struck through, muted). */
  excluded?: boolean;
};

export type PricingCardProps = {
  /** Plan name — "Free", "Team", "Enterprise". */
  name: ReactNode;
  /** The headline number. Pass a string so you control currency and formatting. */
  price: ReactNode;
  /** What the price is per — "/month", "per seat / month". */
  period?: ReactNode;
  /** One line on who the plan is for. */
  description?: ReactNode;
  /** Plan contents. Strings are shorthand for `{ label }`. */
  features?: (PricingFeature | string)[];
  /** The plan's call to action — a `Button`, usually full width. */
  action?: ReactNode;
  /** Fine print under the action. */
  note?: ReactNode;
  /** Lifts and rings the plan you want people to pick. */
  featured?: boolean;
  /** Ribbon on a featured plan — "Most popular". */
  badge?: ReactNode;
  className?: string;
  children?: ReactNode;
};

function normalize(feature: PricingFeature | string): PricingFeature {
  return typeof feature === "string" ? { label: feature } : feature;
}

/** One plan in a `PricingTable`. */
export function PricingCard({
  name,
  price,
  period,
  description,
  features = [],
  action,
  note,
  featured = false,
  badge,
  className,
  children,
}: PricingCardProps) {
  return (
    <div
      data-slot="pricing-card"
      data-featured={featured ? "true" : undefined}
      className={cn("spk-mk-price", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 data-slot="pricing-card-name" className="text-title-3 text-fg">
          {name}
        </h3>
        {badge ? (
          <span className="spk-mk-pill__tag" data-slot="pricing-card-badge">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span data-slot="pricing-card-amount" className="spk-mk-price__amount spk-numeric">
          {price}
        </span>
        {period ? <span className="text-body-sm text-fg-tertiary">{period}</span> : null}
      </div>

      {description ? <p className="mt-2 text-body text-fg-secondary">{description}</p> : null}

      {action ? <div className="mt-5">{action}</div> : null}
      {note ? <p className="mt-2 text-caption text-fg-tertiary">{note}</p> : null}

      {features.length ? (
        <ul className="spk-mk-price__features mt-6">
          {features.map(normalize).map((feature, index) => (
            <li
              key={index}
              className="spk-mk-price__feature"
              data-muted={feature.excluded ? "true" : undefined}
            >
              <span className="spk-mk-price__check" aria-hidden="true">
                {feature.excluded ? <Minus className="size-4" /> : <Check className="size-4" />}
              </span>
              <span className="min-w-0">{feature.label}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {children}
    </div>
  );
}

export type PricingTableProps = {
  children: ReactNode;
  /** Plans per row at the large breakpoint. */
  columns?: 2 | 3 | 4;
  /** Billing switch or note above the plans — a `SegmentedControl`, usually. */
  toolbar?: ReactNode;
  className?: string;
};

const columnClass: Record<NonNullable<PricingTableProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "md:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
};

/**
 * Row of plans. Featured plans lift above the row on wide screens, so keep the plan
 * you want chosen in the middle.
 */
export function PricingTable({ children, columns = 3, toolbar, className }: PricingTableProps) {
  return (
    <div data-slot="pricing-table" className={cn("flex flex-col gap-8", className)}>
      {toolbar ? <div className="flex justify-center">{toolbar}</div> : null}
      <div
        data-slot="pricing-table-plans"
        className={cn("grid items-start gap-6 md:gap-5", columnClass[columns])}
      >
        {children}
      </div>
    </div>
  );
}
