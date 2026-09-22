import { describe, expect, it } from "vitest";
import { serializeChartSvg } from "./chart-export";

describe("chart export", () => {
  it("serializes an SVG with an XML header", () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "120");
    svg.setAttribute("height", "80");
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "120");
    rect.setAttribute("height", "80");
    rect.setAttribute("fill", "var(--chart-1)");
    svg.appendChild(rect);
    document.body.appendChild(svg);
    const xml = serializeChartSvg(svg);
    expect(xml).toContain("<?xml");
    expect(xml).toContain("<svg");
    svg.remove();
  });
});
