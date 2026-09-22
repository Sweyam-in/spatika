import * as React from "react";

export type NoSsrProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  defer?: boolean;
};

/**
 * Renders children only after mount — useful for browser-only APIs.
 */
function NoSsr({ children, fallback = null, defer = false }: NoSsrProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (!defer) {
      setMounted(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, [defer]);

  return <>{mounted ? children : fallback}</>;
}
NoSsr.displayName = "NoSsr";

export { NoSsr };
