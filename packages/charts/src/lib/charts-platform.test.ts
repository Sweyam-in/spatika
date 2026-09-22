import { describe, expect, it } from "vitest";
import { featureId, fitFeatures, geoPath, mercator } from "./geo";
import { ellipseSlicePath, isoBoxFaces, isoPoint } from "./iso";
import {
  nearestScatterHit,
  parseCssColor,
  shouldUseWebGL,
  WEBGL_AUTO_THRESHOLD,
} from "./webgl-scatter";

describe("geo", () => {
  it("projects the equator to the mercator midpoint", () => {
    const [x, y] = mercator([0, 0]);
    expect(x).toBeCloseTo(0.5);
    expect(y).toBeCloseTo(0.5);
  });

  it("builds a closed polygon path fitted to a viewport", () => {
    const features = [
      {
        type: "Feature" as const,
        id: "box",
        properties: { name: "Box" },
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            [
              [0, 0],
              [10, 0],
              [10, 10],
              [0, 10],
              [0, 0],
            ],
          ],
        },
      },
    ];
    const project = fitFeatures(features, 200, 100, 10);
    const d = geoPath(features[0]!.geometry, project);
    expect(d.startsWith("M")).toBe(true);
    expect(d.includes("Z")).toBe(true);
    expect(featureId(features[0]!)).toBe("box");
  });
});

describe("iso", () => {
  it("projects isometric points with y up", () => {
    const origin = isoPoint(0, 0, 0, 40, 80);
    const raised = isoPoint(0, 10, 0, 40, 80);
    expect(raised.y).toBeLessThan(origin.y);
  });

  it("emits three faces for a box", () => {
    const faces = isoBoxFaces(0, 0, 0, 10, 20, 8, 40, 80);
    expect(faces.front.startsWith("M")).toBe(true);
    expect(faces.top).not.toEqual(faces.front);
    expect(faces.side).not.toEqual(faces.top);
  });

  it("draws an elliptical pie slice", () => {
    const d = ellipseSlicePath(50, 40, 30, 12, 0, 90);
    expect(d.includes("A30 12")).toBe(true);
  });
});

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
