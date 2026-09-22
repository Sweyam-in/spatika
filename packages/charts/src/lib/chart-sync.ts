/**
 * Cross-chart hover sync, matching Recharts `syncId`.
 * Charts that share an id broadcast the active category index.
 */

export type ChartSyncPayload = {
  syncId: string;
  dataIndex: number | null;
  category?: string | number | Date;
  source: string;
};

type SyncListener = (payload: ChartSyncPayload) => void;

const listeners = new Map<string, Set<SyncListener>>();

export function subscribeChartSync(syncId: string, listener: SyncListener): () => void {
  let bucket = listeners.get(syncId);
  if (!bucket) {
    bucket = new Set();
    listeners.set(syncId, bucket);
  }
  bucket.add(listener);
  return () => {
    bucket!.delete(listener);
    if (bucket!.size === 0) listeners.delete(syncId);
  };
}

export function publishChartSync(payload: ChartSyncPayload) {
  const bucket = listeners.get(payload.syncId);
  if (!bucket) return;
  for (const listener of bucket) listener(payload);
}

/** Test helper: drop all sync listeners. */
export function resetChartSync() {
  listeners.clear();
}
