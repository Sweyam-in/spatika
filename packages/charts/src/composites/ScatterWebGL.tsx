import { useEffect, useRef } from "react";
import { createScatterGL, destroyScatterGL, drawScatterGL, type ScatterGL } from "../lib/webgl-scatter";
import type { ChartLegendItem } from "./chart-ui";

type ScatterSeriesLike = {
  data: Array<{ x: number; y: number; z?: number }>;
};

export function ScatterWebGLLayer({
  width,
  height,
  series,
  meta,
  hidden,
  xAt,
  yAt,
  sizeAt,
  bubble,
  onUnavailable,
}: {
  width: number;
  height: number;
  series: ScatterSeriesLike[];
  meta: ChartLegendItem[];
  hidden: Set<string>;
  xAt: (value: number) => number;
  yAt: (value: number) => number;
  sizeAt: (z: number) => number;
  bubble: boolean;
  onUnavailable?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gpuRef = useRef<ScatterGL | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gpu = createScatterGL(canvas);
    if (!gpu) {
      onUnavailable?.();
      return;
    }
    gpuRef.current = gpu;
    return () => {
      destroyScatterGL(gpu);
      gpuRef.current = null;
    };
  }, [onUnavailable]);

  useEffect(() => {
    const gpu = gpuRef.current;
    const canvas = canvasRef.current;
    if (!gpu || !canvas) return;
    const batches = series.flatMap((item, s) => {
      const info = meta[s]!;
      if (hidden.has(info.id)) return [];
      return [
        {
          color: info.color,
          positions: item.data.map((point) => ({
            x: xAt(point.x),
            y: yAt(point.y),
            size: bubble ? sizeAt(point.z ?? 1) * 2 : 9,
          })),
        },
      ];
    });
    drawScatterGL(gpu, canvas, width, height, batches);
  });

  return (
    <canvas
      ref={canvasRef}
      className="spk-chart-webgl"
      data-slot="scatter-webgl"
      aria-hidden
    />
  );
}
