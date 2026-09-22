import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type TestimonialCardProps = {
  /** The quote itself, without quotation marks — the card draws its own. */
  quote: ReactNode;
  /** Who said it. */
  author: ReactNode;
  /** Role and company. */
  role?: ReactNode;
  /** An `Avatar`, `InitialsAvatar` or image. */
  avatar?: ReactNode;
  /** Customer logo, shown top-left. */
  logo?: ReactNode;
  /** A `Rating`, or any small trailing mark. */
  rating?: ReactNode;
  /** `card` — hairline surface · `plain` — copy only · `featured` — accent-tinted. */
  variant?: "card" | "plain" | "featured";
  /** `lg` sets the quote at title size — for a single pull quote. */
  size?: "md" | "lg";
  /** Draw the decorative quotation mark. */
  showMark?: boolean;
  className?: string;
};

/** A customer quote with attribution. Compose several inside a `Grid` or `Marquee`. */
export function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  logo,
  rating,
  variant = "card",
  size = "md",
  showMark = true,
  className,
}: TestimonialCardProps) {
  return (
    <figure
      data-slot="testimonial-card"
      data-variant={variant}
      data-size={size}
      className={cn("spk-mk-quote", className)}
    >
      {showMark ? (
        <span className="spk-mk-quote__mark" aria-hidden="true">
          &rdquo;
        </span>
      ) : null}

      {logo ? <div className="spk-mk-logo" data-plain="true">{logo}</div> : null}
      {rating ? <div className="min-w-0">{rating}</div> : null}

      <blockquote data-slot="testimonial-card-quote" className="spk-mk-quote__body">
        {quote}
      </blockquote>

      <figcaption className="mt-auto flex items-center gap-3">
        {avatar ? <div className="shrink-0">{avatar}</div> : null}
        <div className="min-w-0">
          <p className="text-label font-medium text-fg">{author}</p>
          {role ? <p className="text-caption text-fg-tertiary">{role}</p> : null}
        </div>
      </figcaption>
    </figure>
  );
}
