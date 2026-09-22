import { describe, expect, it } from "vitest";
import { ellipseSlicePath, isoBoxFaces, isoPoint } from "./iso";

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
