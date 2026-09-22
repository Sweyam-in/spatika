import * as React from "react";
import { createPortal } from "react-dom";

export type PortalProps = {
  children: React.ReactNode;
  container?: HTMLElement | null;
};

/**
 * Renders children into `document.body` (or a provided container) via React portal.
 * Mounts synchronously on the client so floating content can be measured in the
 * same layout pass (avoids width=0 positioning flashes).
 */
export function Portal({ children, container }: PortalProps) {
  const target =
    container ?? (typeof document !== "undefined" ? document.body : null);

  if (!target) return null;

  return createPortal(children, target);
}
