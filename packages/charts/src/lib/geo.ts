/**
 * Tiny GeoJSON helpers — Mercator / equirectangular, no d3-geo.
 */

export type GeoPosition = [number, number];

export type GeoJsonGeometry =
  | { type: "Polygon"; coordinates: GeoPosition[][] }
  | { type: "MultiPolygon"; coordinates: GeoPosition[][][] }
  | { type: "Point"; coordinates: GeoPosition }
  | { type: "LineString"; coordinates: GeoPosition[] }
  | { type: "MultiLineString"; coordinates: GeoPosition[][] };

export type GeoJsonFeature = {
  type: "Feature";
  id?: string | number;
  properties?: Record<string, unknown> | null;
  geometry: GeoJsonGeometry | null;
};

export type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

export type GeoProjectionKind = "mercator" | "equirectangular";

export function mercator([lon, lat]: GeoPosition): [number, number] {
  const x = (lon + 180) / 360;
  const clamped = Math.min(85.051129, Math.max(-85.051129, lat));
  const sin = Math.sin((clamped * Math.PI) / 180);
  const y = 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI);
  return [x, y];
}

export function equirectangular([lon, lat]: GeoPosition): [number, number] {
  return [(lon + 180) / 360, (90 - lat) / 180];
}

export function projectLonLat(pos: GeoPosition, kind: GeoProjectionKind): [number, number] {
  return kind === "equirectangular" ? equirectangular(pos) : mercator(pos);
}

export function featureId(feature: GeoJsonFeature, idProperty = "id"): string {
  if (feature.id != null) return String(feature.id);
  const value = feature.properties?.[idProperty] ?? feature.properties?.name;
  return value != null ? String(value) : "";
}

function walkGeometry(geometry: GeoJsonGeometry, visit: (pos: GeoPosition) => void) {
  if (geometry.type === "Point") {
    visit(geometry.coordinates);
    return;
  }
  if (geometry.type === "LineString") {
    geometry.coordinates.forEach(visit);
    return;
  }
  if (geometry.type === "MultiLineString") {
    geometry.coordinates.forEach((line) => line.forEach(visit));
    return;
  }
  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach((ring) => ring.forEach(visit));
    return;
  }
  geometry.coordinates.forEach((poly) => poly.forEach((ring) => ring.forEach(visit)));
}

export function walkFeatures(features: GeoJsonFeature[], visit: (pos: GeoPosition) => void) {
  for (const feature of features) {
    if (feature.geometry) walkGeometry(feature.geometry, visit);
  }
}

function ringPath(ring: GeoPosition[], project: (pos: GeoPosition) => [number, number]): string {
  if (!ring.length) return "";
  const pts = ring.map(project);
  return `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
}

function linePath(line: GeoPosition[], project: (pos: GeoPosition) => [number, number]): string {
  if (!line.length) return "";
  const pts = line.map(project);
  return `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}`;
}

export function geoPath(
  geometry: GeoJsonGeometry,
  project: (pos: GeoPosition) => [number, number],
): string {
  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => ringPath(ring, project)).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map((poly) => poly.map((ring) => ringPath(ring, project)).join(" "))
      .join(" ");
  }
  if (geometry.type === "LineString") return linePath(geometry.coordinates, project);
  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.map((line) => linePath(line, project)).join(" ");
  }
  const [x, y] = project(geometry.coordinates);
  return `M${x} ${y}m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0`;
}

export function fitFeatures(
  features: GeoJsonFeature[],
  width: number,
  height: number,
  padding: number,
  kind: GeoProjectionKind = "mercator",
): (pos: GeoPosition) => [number, number] {
  const raw = (pos: GeoPosition) => projectLonLat(pos, kind);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  walkFeatures(features, (pos) => {
    const [x, y] = raw(pos);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  const bw = Math.max(1e-6, maxX - minX);
  const bh = Math.max(1e-6, maxY - minY);
  const innerW = Math.max(1, width - padding * 2);
  const innerH = Math.max(1, height - padding * 2);
  const scale = Math.min(innerW / bw, innerH / bh);
  const tx = padding + (innerW - bw * scale) / 2;
  const ty = padding + (innerH - bh * scale) / 2;
  return (pos) => {
    const [x, y] = raw(pos);
    return [tx + (x - minX) * scale, ty + (y - minY) * scale];
  };
}
