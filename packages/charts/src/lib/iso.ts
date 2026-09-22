/**
 * Isometric 2.5D helpers for SVG bar and pie charts.
 */

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

export function isoPoint(
  x: number,
  y: number,
  z: number,
  originX: number,
  originY: number,
): { x: number; y: number } {
  return {
    x: originX + (x - z) * COS,
    y: originY - y + (x + z) * SIN,
  };
}

function poly(points: Array<{ x: number; y: number }>): string {
  if (!points.length) return "";
  return `M${points.map((p) => `${p.x} ${p.y}`).join("L")}Z`;
}

export type IsoBoxFaces = {
  front: string;
  top: string;
  side: string;
};

/** Axis-aligned box: x/z on the ground plane, y up. */
export function isoBoxFaces(
  x: number,
  y0: number,
  z: number,
  w: number,
  h: number,
  d: number,
  originX: number,
  originY: number,
): IsoBoxFaces {
  const p = (px: number, py: number, pz: number) => isoPoint(px, py, pz, originX, originY);
  const a = p(x, y0, z);
  const b = p(x + w, y0, z);
  const c = p(x + w, y0 + h, z);
  const e = p(x, y0 + h, z);
  const f = p(x + w, y0, z + d);
  const g = p(x + w, y0 + h, z + d);
  const k = p(x, y0 + h, z + d);
  return {
    front: poly([a, b, c, e]),
    top: poly([e, c, g, k]),
    side: poly([b, f, g, c]),
  };
}

export function ellipsePoint(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) };
}

export function ellipseSlicePath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = ellipsePoint(cx, cy, rx, ry, startAngle);
  const end = ellipsePoint(cx, cy, rx, ry, endAngle);
  const sweep = ((endAngle - startAngle) % 360 + 360) % 360;
  if (sweep <= 0) return "";
  const large = sweep > 180 ? 1 : 0;
  return `M${cx} ${cy} L${start.x} ${start.y} A${rx} ${ry} 0 ${large} 1 ${end.x} ${end.y} Z`;
}

export function ellipseWallPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startAngle: number,
  endAngle: number,
  thickness: number,
): string {
  const top0 = ellipsePoint(cx, cy, rx, ry, startAngle);
  const top1 = ellipsePoint(cx, cy, rx, ry, endAngle);
  const bot0 = { x: top0.x, y: top0.y + thickness };
  const bot1 = { x: top1.x, y: top1.y + thickness };
  const sweep = ((endAngle - startAngle) % 360 + 360) % 360;
  if (sweep <= 0) return "";
  const large = sweep > 180 ? 1 : 0;
  return `M${bot0.x} ${bot0.y} L${top0.x} ${top0.y} A${rx} ${ry} 0 ${large} 1 ${top1.x} ${top1.y} L${bot1.x} ${bot1.y} A${rx} ${ry} 0 ${large} 0 ${bot0.x} ${bot0.y} Z`;
}
