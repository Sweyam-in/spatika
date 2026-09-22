import * as React from "react";

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server.
 *
 * Layout effects never run during server rendering, and React warns about them. Components that
 * only touch the DOM (theme classes, measurement, autosize) use this so apps can render Spatika on
 * the server without noise.
 */
export const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;
