import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScatterWebGLLayer } from "./ScatterWebGL";

describe("ScatterWebGLLayer", () => {
  it("renders a canvas layer and reports when WebGL is unavailable", () => {
    const onUnavailable = vi.fn();
    const { container } = render(
      <ScatterWebGLLayer
        width={120}
        height={80}
        series={[{ data: [{ x: 1, y: 2 }] }]}
        meta={[{ id: "a", label: "A", color: "#2563eb" }]}
        hidden={new Set()}
        xAt={(value) => value}
        yAt={(value) => value}
        sizeAt={(z) => z}
        bubble={false}
        onUnavailable={onUnavailable}
      />,
    );
    expect(container.querySelector('[data-slot="scatter-webgl"]')).toBeTruthy();
    expect(onUnavailable).toHaveBeenCalled();
  });
});
