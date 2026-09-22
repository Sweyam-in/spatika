import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MapChart } from "./MapChart";

describe("MapChart", () => {
  it("draws choropleth paths from GeoJSON", () => {
    const { container } = render(
      <MapChart
        width={240}
        height={160}
        geoData={{
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              id: "a",
              properties: { name: "A" },
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [0, 0],
                    [4, 0],
                    [4, 3],
                    [0, 3],
                    [0, 0],
                  ],
                ],
              },
            },
          ],
        }}
        series={[{ data: [{ id: "a", value: 12, label: "A" }] }]}
      />,
    );
    expect(container.querySelector('[data-slot="map-chart"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="map-chart"] path')).toBeTruthy();
  });
});
