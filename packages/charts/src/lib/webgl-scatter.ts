/**
 * Raw WebGL scatter renderer — no three.js.
 * Canvas sits behind SVG axes; hit-testing stays on the CPU.
 */

export type ScatterRenderer = "svg" | "webgl" | "auto";

export const WEBGL_AUTO_THRESHOLD = 2000;

export function shouldUseWebGL(renderer: ScatterRenderer | undefined, pointCount: number): boolean {
  if (renderer === "webgl") return true;
  if (renderer === "auto") return pointCount >= WEBGL_AUTO_THRESHOLD;
  return false;
}

export type Rgba = [number, number, number, number];

export function parseCssColor(css: string): Rgba | null {
  const hex = css.trim();
  const hexMatch = /^#([0-9a-f]{3,8})$/i.exec(hex);
  if (hexMatch) {
    let h = hexMatch[1]!;
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    const n = Number.parseInt(h.slice(0, 6), 16);
    const a = h.length === 8 ? Number.parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, a];
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i.exec(hex);
  if (rgb) {
    return [
      Number(rgb[1]) / 255,
      Number(rgb[2]) / 255,
      Number(rgb[3]) / 255,
      rgb[4] != null ? Number(rgb[4]) : 1,
    ];
  }
  return null;
}

export function resolveCssColor(color: string, el?: Element | null): Rgba {
  const parsed = parseCssColor(color);
  if (parsed) return parsed;
  if (typeof document === "undefined" || !el) return [0.35, 0.55, 0.95, 1];
  const probe = document.createElement("span");
  probe.style.color = color;
  probe.style.position = "absolute";
  probe.style.pointerEvents = "none";
  probe.style.opacity = "0";
  el.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  return parseCssColor(computed) ?? [0.35, 0.55, 0.95, 1];
}

export type ScatterHitCandidate = {
  x: number;
  y: number;
  r: number;
  seriesIndex: number;
  pointIndex: number;
};

export function nearestScatterHit(
  candidates: ScatterHitCandidate[],
  px: number,
  py: number,
  pad = 4,
): ScatterHitCandidate | null {
  let best: ScatterHitCandidate | null = null;
  let bestDist = Infinity;
  for (const item of candidates) {
    const dx = item.x - px;
    const dy = item.y - py;
    const dist = Math.hypot(dx, dy);
    if (dist <= item.r + pad && dist < bestDist) {
      best = item;
      bestDist = dist;
    }
  }
  return best;
}

export function svgPointerPosition(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const bounds = svg.getBoundingClientRect();
  const w = bounds.width || width;
  const h = bounds.height || height;
  return {
    x: ((clientX - bounds.left) / w) * width,
    y: ((clientY - bounds.top) / h) * height,
  };
}

const VS = `
attribute vec2 a_position;
attribute float a_size;
uniform vec2 u_resolution;
uniform float u_dpr;
void main() {
  vec2 zeroToOne = a_position / u_resolution;
  vec2 clip = zeroToOne * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = max(1.0, a_size * u_dpr);
}
`;

const FS = `
precision mediump float;
uniform vec4 u_color;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  if (dot(c, c) > 0.25) discard;
  gl_FragColor = u_color;
}
`;

export type ScatterGL = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  aPosition: number;
  aSize: number;
  uResolution: WebGLUniformLocation | null;
  uDpr: WebGLUniformLocation | null;
  uColor: WebGLUniformLocation | null;
};

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createScatterGL(canvas: HTMLCanvasElement): ScatterGL | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
  });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VS);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  const buffer = gl.createBuffer();
  if (!buffer) return null;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  return {
    gl,
    program,
    buffer,
    aPosition: gl.getAttribLocation(program, "a_position"),
    aSize: gl.getAttribLocation(program, "a_size"),
    uResolution: gl.getUniformLocation(program, "u_resolution"),
    uDpr: gl.getUniformLocation(program, "u_dpr"),
    uColor: gl.getUniformLocation(program, "u_color"),
  };
}

export type ScatterGLSeries = {
  positions: Array<{ x: number; y: number; size: number }>;
  color: string;
};

export function drawScatterGL(
  gpu: ScatterGL,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  series: ScatterGLSeries[],
): void {
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const pixelW = Math.max(1, Math.round(width * dpr));
  const pixelH = Math.max(1, Math.round(height * dpr));
  if (canvas.width !== pixelW) canvas.width = pixelW;
  if (canvas.height !== pixelH) canvas.height = pixelH;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const { gl } = gpu;
  gl.viewport(0, 0, pixelW, pixelH);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(gpu.program);
  gl.uniform2f(gpu.uResolution, width, height);
  gl.uniform1f(gpu.uDpr, dpr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gpu.buffer);

  const stride = 3 * 4;
  for (const item of series) {
    if (!item.positions.length) continue;
    const data = new Float32Array(item.positions.length * 3);
    item.positions.forEach((point, i) => {
      data[i * 3] = point.x;
      data[i * 3 + 1] = point.y;
      data[i * 3 + 2] = point.size;
    });
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(gpu.aPosition);
    gl.vertexAttribPointer(gpu.aPosition, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(gpu.aSize);
    gl.vertexAttribPointer(gpu.aSize, 1, gl.FLOAT, false, stride, 8);
    const [r, g, b, a] = resolveCssColor(item.color, canvas.parentElement ?? canvas);
    gl.uniform4f(gpu.uColor, r, g, b, a);
    gl.drawArrays(gl.POINTS, 0, item.positions.length);
  }
}

export function destroyScatterGL(gpu: ScatterGL): void {
  const { gl } = gpu;
  gl.deleteBuffer(gpu.buffer);
  gl.deleteProgram(gpu.program);
}
