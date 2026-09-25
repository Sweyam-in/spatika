import { Skeleton } from "@spatika/react";

/** Shown while a code-split page loads. A status region, so assistive tech hears "Loading page". */
export function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-label="Loading page" data-slot="route-fallback">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full max-w-sm" />
    </div>
  );
}
