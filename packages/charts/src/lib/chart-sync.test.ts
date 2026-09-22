import { describe, expect, it } from "vitest";
import { publishChartSync, resetChartSync, subscribeChartSync } from "./chart-sync";

describe("chart sync bus", () => {
  it("delivers payloads to other listeners on the same id", () => {
    resetChartSync();
    const seen: number[] = [];
    const unsub = subscribeChartSync("traffic", (payload) => {
      seen.push(payload.dataIndex ?? -1);
    });
    publishChartSync({ syncId: "traffic", dataIndex: 2, source: "a" });
    publishChartSync({ syncId: "other", dataIndex: 9, source: "a" });
    expect(seen).toEqual([2]);
    unsub();
    publishChartSync({ syncId: "traffic", dataIndex: 3, source: "a" });
    expect(seen).toEqual([2]);
  });
});
