/**
 * Serialize a live chart SVG and download SVG / PNG.
 * Computed CSS (theme variables) is baked in so the file looks the same outside the app.
 */

function bakeComputedStyles(live: SVGSVGElement, clone: SVGSVGElement) {
  const liveNodes = [live, ...Array.from(live.querySelectorAll("*"))];
  const cloneNodes = [clone, ...Array.from(clone.querySelectorAll("*"))];
  for (let i = 0; i < liveNodes.length; i++) {
    const source = liveNodes[i];
    const target = cloneNodes[i] as SVGElement | undefined;
    if (!source || !target || !(source instanceof Element)) continue;
    const style = getComputedStyle(source);
    if (style.fill && style.fill !== "none") target.setAttribute("fill", style.fill);
    if (style.stroke && style.stroke !== "none") target.setAttribute("stroke", style.stroke);
    if (style.strokeWidth) target.setAttribute("stroke-width", style.strokeWidth);
    if (style.opacity && style.opacity !== "1") target.setAttribute("opacity", style.opacity);
    if (style.fontSize) target.setAttribute("font-size", style.fontSize);
    if (style.fontWeight) target.setAttribute("font-weight", style.fontWeight);
    if (style.fontFamily) target.setAttribute("font-family", style.fontFamily);
  }
}

export function serializeChartSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  if (!clone.getAttribute("viewBox")) {
    const width = svg.clientWidth || Number(svg.getAttribute("width")) || 320;
    const height = svg.clientHeight || Number(svg.getAttribute("height")) || 240;
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }
  bakeComputedStyles(svg, clone);
  return `<?xml version="1.0" encoding="UTF-8"?>${new XMLSerializer().serializeToString(clone)}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 1_000);
}

export function downloadChartSvg(svg: SVGSVGElement, filename = "chart.svg") {
  const blob = new Blob([serializeChartSvg(svg)], { type: "image/svg+xml;charset=utf-8" });
  triggerDownload(blob, filename);
}

export async function chartSvgToPngBlob(svg: SVGSVGElement): Promise<Blob> {
  const xml = serializeChartSvg(svg);
  const width = Math.max(1, svg.clientWidth || Number(svg.getAttribute("width")) || 320);
  const height = Math.max(1, svg.clientHeight || Number(svg.getAttribute("height")) || 240);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to rasterize chart SVG"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * 2);
    canvas.height = Math.round(height * 2);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable");
    const surface = svg.parentElement;
    ctx.fillStyle = surface ? getComputedStyle(surface).backgroundColor || "#ffffff" : "#ffffff";
    if (ctx.fillStyle === "rgba(0, 0, 0, 0)" || ctx.fillStyle === "transparent") ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("PNG export failed"))), "image/png");
    });
    return png;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadChartPng(svg: SVGSVGElement, filename = "chart.png") {
  const blob = await chartSvgToPngBlob(svg);
  triggerDownload(blob, filename);
}

export async function exportChart(
  svg: SVGSVGElement | null | undefined,
  format: "svg" | "png",
  filename?: string,
) {
  if (!svg) return;
  if (format === "svg") downloadChartSvg(svg, filename ?? "chart.svg");
  else await downloadChartPng(svg, filename ?? "chart.png");
}
