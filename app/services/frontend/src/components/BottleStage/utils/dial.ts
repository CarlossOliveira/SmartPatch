export const CENTER = 100;
export const RADIUS = 90;

export type Point = [number, number];

/** Ponto do círculo a `deg` graus do topo, no sentido dos ponteiros do relógio. */
export function pointOnCircle(deg: number, radius: number = RADIUS): Point {
  const rad = (deg * Math.PI) / 180;
  return [CENTER + radius * Math.sin(rad), CENTER - radius * Math.cos(rad)];
}

export function arcPath(from: number, to: number, radius: number = RADIUS): string {
  const [x0, y0] = pointOnCircle(from, radius);
  const [x1, y1] = pointOnCircle(to, radius);
  const largeArc = Math.abs(to - from) > 180 ? 1 : 0;
  const sweep = to > from ? 1 : 0;
  return `M${x0} ${y0}A${radius} ${radius} 0 ${largeArc} ${sweep} ${x1} ${y1}`;
}

export function angleOfValue(value: number, min: number, max: number, from: number, to: number): number {
  return from + ((to - from) * (value - min)) / (max - min);
}

function angularDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

/**
 * Converte um ponto (relativo ao centro, em unidades do SVG) no valor do dial.
 * Fora do arco, prende ao extremo mais próximo.
 */
export function valueFromPoint(
  x: number,
  y: number,
  min: number,
  max: number,
  from: number,
  to: number,
): number {
  const angle = ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
  let fraction = (angle - from) / (to - from);
  if (fraction < 0 || fraction > 1) {
    fraction = angularDistance(angle, from) < angularDistance(angle, to) ? 0 : 1;
  }
  return Math.round(min + fraction * (max - min));
}
