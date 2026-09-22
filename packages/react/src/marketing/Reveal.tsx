import * as React from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/cn";

export type RevealProps = {
  children: ReactNode;
  /** How the element arrives. */
  effect?: "rise" | "fade" | "scale" | "slide-left" | "slide-right";
  /** Delay in milliseconds — stagger a row by passing `index * 80`. */
  delay?: number;
  /** Fraction of the element that must be visible before it plays. */
  threshold?: number;
  /** Replay every time the element re-enters the viewport. */
  once?: boolean;
  as?: "div" | "section" | "li" | "article" | "span";
  className?: string;
  style?: CSSProperties;
};

/**
 * Plays a short entrance the first time its content scrolls into view.
 *
 * Motion is the one thing a landing page can overdo, so this stays deliberately small:
 * opacity plus a few pixels of travel. Under `prefers-reduced-motion` the transition is
 * dropped entirely and content renders in place — and it renders visible when
 * `IntersectionObserver` is unavailable (SSR, older engines, jsdom).
 */
export function Reveal({
  children,
  effect = "rise",
  delay = 0,
  threshold = 0.15,
  once = true,
  as: Comp = "div",
  className,
  style,
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold]);

  const Tag = Comp as "div";
  return (
    <Tag
      ref={ref}
      data-slot="reveal"
      data-effect={effect}
      data-visible={visible ? "true" : "false"}
      className={cn("spk-mk-reveal", className)}
      style={{ "--spk-mk-reveal-delay": `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
