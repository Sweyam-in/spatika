import * as React from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/cn";

export type MarqueeProps = {
  children: ReactNode;
  /** Seconds for one full pass. Longer is calmer. */
  duration?: number;
  /** Scroll direction. */
  direction?: "left" | "right";
  /** Gap between items. */
  gap?: string;
  /** Pause while the pointer is over the row. */
  pauseOnHover?: boolean;
  className?: string;
};

/**
 * Continuously scrolling row for logos or short quotes. The track is duplicated so the
 * loop is seamless; the copy is hidden from assistive tech. Under
 * `prefers-reduced-motion` it stops and wraps into a static, centred row.
 */
export function Marquee({
  children,
  duration = 40,
  direction = "left",
  gap = "3rem",
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const items = React.Children.toArray(children);

  return (
    <div
      data-slot="marquee"
      data-direction={direction}
      data-pause-on-hover={pauseOnHover ? "true" : undefined}
      className={cn("spk-mk-marquee", className)}
      style={
        {
          "--spk-mk-marquee-duration": `${duration}s`,
          "--spk-mk-marquee-gap": gap,
        } as CSSProperties
      }
    >
      <div className="spk-mk-marquee__track" data-slot="marquee-track">
        {items}
        <span aria-hidden="true" className="contents">
          {items.map((item, index) => (
            <React.Fragment key={`clone-${index}`}>{item}</React.Fragment>
          ))}
        </span>
      </div>
    </div>
  );
}
