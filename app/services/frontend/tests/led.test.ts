import { describe, expect, it } from 'vitest';
import { ledStatus } from '../src/components/BottleStage/utils/led';

describe('ledStatus', () => {
  it('fica verde com temperatura baixa e caneta nova', () => {
    expect(ledStatus(18, 1).level).toBe('ok');
  });

  it('passa a amarelo perto do limite de temperatura', () => {
    expect(ledStatus(27, 1).level).toBe('warn');
  });

  it('passa a amarelo quando a caneta chega aos 28 dias', () => {
    expect(ledStatus(18, 28).level).toBe('warn');
  });

  it('fica vermelho a 34 °C ou mais', () => {
    expect(ledStatus(34, 1).level).toBe('bad');
    expect(ledStatus(42, 28).level).toBe('bad');
  });

  it('usa matiz 158 no verde e matiz 0 no vermelho', () => {
    expect(ledStatus(8, 1).color).toBe('hsl(158, 80%, 52%)');
    expect(ledStatus(42, 1).color).toBe('hsl(0, 80%, 52%)');
  });
});
