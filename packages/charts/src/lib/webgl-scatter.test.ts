import { describe, expect, it } from "vitest";
import {
  nearestScatterHit,
  parseCssColor,
  shouldUseWebGL,
  WEBGL_AUTO_THRESHOLD,
} from "./webgl-scatter";

describe("webgl scatter helpers", () => {
  it("parses hex and rgb colors", () => {
    expect(parseCssColor("#ff0000")).toEqual([1, 0, 0, 1]);
    expect(parseCssColor("rgb(0, 128, 255)")).toEqual([0, 128 / 255, 1, 1]);
    expect(parseCssColor("not-a-color")).toBeNull();
  });

  it("selects webgl for auto clouds above the threshold", () => {
    expect(shouldUseWebGL("svg", 10_000)).toBe(false);
    expect(shouldUseWebGL("webgl", 3)).toBe(true);
    expect(shouldUseWebGL("auto", WEBGL_AUTO_THRESHOLD)).toBe(true);
    expect(shouldUseWebGL("auto", 10)).toBe(false);
  });

  it("finds the nearest point within the hit radius", () => {
    const hit = nearestScatterHit(
      [
        { x: 10, y: 10, r: 4, seriesIndex: 0, pointIndex: 0 },
        { x: 40, y: 40, r: 4, seriesIndex: 1, pointIndex: 2 },
      ],
      41,
      39,
    );
    expect(hit?.seriesIndex).toBe(1);
    expect(hit?.pointIndex).toBe(2);
    expect(nearestScatterHit([{ x: 0, y: 0, r: 2, seriesIndex: 0, pointIndex: 0 }], 80, 80)).toBeNull();
  });
});
