import type { LedLevel } from '../../../types';
import type { LedStatus } from '../types';

function levelOf(risk: number): LedLevel {
  if (risk < 0.3) {
    return 'ok';
  }
  if (risk < 0.65) {
    return 'warn';
  }
  return 'bad';
}

/**
 * Estado ilustrativo do LED. O risco vai de 0 (até 20 °C e dia 22) a 1 (34 °C ou dia 28).
 * A cor passa do verde (matiz 158) ao vermelho (matiz 0).
 */
export function ledStatus(temp: number, days: number): LedStatus {
  const risk = Math.min(1, Math.max(0, (temp - 20) / 14, (days - 22) / 12));
  const hue = Math.round(158 * (1 - risk));
  return {
    level: levelOf(risk),
    color: `hsl(${hue}, 80%, 52%)`,
    core: `hsl(${hue}, 90%, 78%)`,
  };
}
