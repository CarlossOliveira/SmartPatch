/*
 * Linha temporal da abertura. `e` vai de 0 (fechada) a 1 (aberta).
 * A tampa sobe (o vedante sai do gargalo) e só depois desliza para o lado.
 * As canetas sobem a direito pelos furos; o leque só começa com a base fora da garrafa.
 */

export const OPEN_DURATION = 1.3;
export const BODY_HEIGHT = 3;
export const PEN_HOLE_OFFSET = 0.42;

const RISE = 2.95;
const LIFT = 0.45;
const CAP_CENTER = (BODY_HEIGHT - 0.18 + 3.9) / 2;
const PEN_RADIUS = 0.2;

export interface CapPose {
  x: number;
  y: number;
  rz: number;
}

export interface PenPose {
  a: number;
  x: number;
  y: number;
  z: number;
  tilt: number;
}

export interface OpenBounds {
  cx: number;
  cy: number;
  cz: number;
  r: number;
}

function clamp(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function ease(x: number): number {
  return x * x * (3 - 2 * x);
}

function segment(e: number, start: number, end: number): number {
  return ease(clamp((e - start) / (end - start)));
}

export function capPose(e: number): CapPose {
  const lift = segment(e, 0, 0.2);
  const slide = segment(e, 0.1, 0.42);
  return { x: -2.6 * slide, y: 0.55 * lift + 1.15 * slide, rz: 0.6 * slide };
}

export function penPose(e: number, index: number): PenPose {
  const delay = 0.34 + index * 0.05;
  const up = segment(e, delay, delay + 0.28);
  const fan = segment(e, delay + 0.28, delay + 0.46);
  const a = (index / 5) * Math.PI * 2;
  const r = PEN_HOLE_OFFSET + 0.68 * fan;
  return { a, x: Math.sin(a) * r, z: Math.cos(a) * r, y: 1.4 + RISE * up + LIFT * fan, tilt: 0.25 * fan };
}

function middle(points: number[][], axis: number): number {
  const values = points.map((p) => p[axis] ?? 0);
  return (Math.min(...values) + Math.max(...values)) / 2;
}

/**
 * Esfera que envolve o corpo, a tampa e as canetas no instante `e`.
 * Como o modelo roda livremente, basta a esfera caber na vista.
 */
export function openBounds(e: number): OpenBounds {
  const points: number[][] = [];
  const cap = capPose(e);
  const cos = Math.cos(cap.rz);
  const sin = Math.sin(cap.rz);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    points.push([ca, 0, sa], [ca, BODY_HEIGHT, sa]);
    for (const ly of [-0.54, 0.54]) {
      const lx = 1.03 * ca;
      points.push([cap.x + lx * cos - ly * sin, CAP_CENTER + cap.y + lx * sin + ly * cos, 1.03 * sa]);
    }
  }
  for (let i = 0; i < 5; i++) {
    const pen = penPose(e, i);
    const axis = [Math.sin(pen.a) * Math.sin(pen.tilt), Math.cos(pen.tilt), Math.cos(pen.a) * Math.sin(pen.tilt)];
    for (const s of [-1.24, 1.06]) {
      points.push([
        pen.x + (axis[0] ?? 0) * s,
        pen.y + (axis[1] ?? 0) * s,
        pen.z + (axis[2] ?? 0) * s,
      ]);
    }
  }
  const cx = middle(points, 0);
  const cy = middle(points, 1);
  const cz = middle(points, 2);
  const farthest = Math.max(...points.map((p) => Math.hypot((p[0] ?? 0) - cx, (p[1] ?? 0) - cy, (p[2] ?? 0) - cz)));
  return { cx, cy, cz, r: farthest + PEN_RADIUS };
}
