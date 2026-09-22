import { describe, expect, it } from "vitest";
import { featureId, fitFeatures, geoPath, mercator } from "./geo";

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

  it("projects a point to a move-to command", () => {
    const d = geoPath({ type: "Point", coordinates: [0, 0] }, mercator);
    expect(d.startsWith("M")).toBe(true);
  });
});
