import { describe, expect, it } from 'vitest';
import { angleOfValue, arcPath, pointOnCircle, valueFromPoint } from '../src/components/BottleStage/utils/dial';

describe('dial', () => {
  it('põe o ângulo 0 no topo do círculo', () => {
    const [x, y] = pointOnCircle(0);
    expect(x).toBeCloseTo(100);
    expect(y).toBeCloseTo(10);
  });

  it('devolve os extremos do arco nos valores mínimo e máximo', () => {
    expect(angleOfValue(8, 8, 42, 220, 320)).toBe(220);
    expect(angleOfValue(42, 8, 42, 220, 320)).toBe(320);
  });

  it('começa o caminho do arco num comando M', () => {
    expect(arcPath(220, 320)).toMatch(/^M[\d.]+ [\d.]+A90 90 0 0 1 /);
  });

  it('converte um ponto do meio do arco no valor do meio', () => {
    const [x, y] = pointOnCircle(270);
    expect(valueFromPoint(x - 100, y - 100, 8, 42, 220, 320)).toBe(25);
  });

  it('prende ao extremo mais próximo quando o ponto está fora do arco', () => {
    expect(valueFromPoint(0, -50, 8, 42, 220, 320)).toBe(42);
    expect(valueFromPoint(0, 50, 8, 42, 220, 320)).toBe(8);
  });
});
