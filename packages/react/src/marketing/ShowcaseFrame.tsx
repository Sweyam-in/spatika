import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type ShowcaseFrameProps = {
  children: ReactNode;
  /** `browser` — dots and a URL pill · `window` — dots only · `phone` — device bezel · `none` — bare. */
  chrome?: "browser" | "window" | "phone" | "none";
  /** URL shown in the browser bar. */
  url?: string;
  /** Title shown in the window bar when there is no URL. */
  title?: ReactNode;
  /** Perspective tilt — turns a flat screenshot into an object on the page. */
  tilt?: boolean;
  /** Sweep a facet highlight across the frame on hover. */
  shine?: boolean;
  className?: string;
  /** Classes for the content area inside the chrome. */
  bodyClassName?: string;
};

/**
 * Chrome around a product screenshot, live demo or video. Everything is drawn from
 * tokens, so the frame follows the active theme instead of shipping a light-mode PNG.
 */
export function ShowcaseFrame({
  children,
  chrome = "browser",
  url,
  title,
  tilt = false,
  shine = false,
  className,
  bodyClassName,
}: ShowcaseFrameProps) {
  const showBar = chrome === "browser" || chrome === "window";

  return (
    <div
      data-slot="showcase-frame"
      data-chrome={chrome}
      data-tilt={tilt ? "true" : undefined}
      className={cn("spk-mk-frame", shine && "spk-mk-shine", className)}
    >
      {chrome === "phone" ? <span className="spk-mk-frame__notch" aria-hidden="true" /> : null}
      {showBar ? (
        <div className="spk-mk-frame__bar" data-slot="showcase-frame-bar" aria-hidden="true">
          <span className="spk-mk-frame__dots">
            <span className="spk-mk-frame__dot" />
            <span className="spk-mk-frame__dot" />
            <span className="spk-mk-frame__dot" />
          </span>
          {chrome === "browser" && url ? (
            <span className="spk-mk-frame__url">{url}</span>
          ) : title ? (
            <span className="spk-mk-frame__url border-none bg-transparent">{title}</span>
          ) : null}
        </div>
      ) : null}
      <div className={cn("spk-mk-frame__body", bodyClassName)} data-slot="showcase-frame-body">
        {children}
      </div>
    </div>
  );
}
