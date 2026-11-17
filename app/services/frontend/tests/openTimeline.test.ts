import { describe, expect, it } from 'vitest';
import { capPose, openBounds, penPose } from '../src/components/BottleStage/utils/openTimeline';

describe('openTimeline', () => {
  it('mantém a tampa no sítio com a garrafa fechada', () => {
    const pose = capPose(0);
    expect(pose.x).toBeCloseTo(0);
    expect(pose.y).toBeCloseTo(0);
    expect(pose.rz).toBeCloseTo(0);
  });

  it('desliza a tampa para o lado com a garrafa aberta', () => {
    expect(capPose(1).x).toBeCloseTo(-2.6);
  });

  it('faz as canetas subirem sem inclinar com a garrafa fechada', () => {
    const closed = penPose(0, 0);
    const open = penPose(1, 0);
    expect(closed.tilt).toBe(0);
    expect(open.y).toBeGreaterThan(closed.y);
  });

  it('cresce a esfera envolvente ao abrir', () => {
    expect(openBounds(1).r).toBeGreaterThan(openBounds(0).r);
  });
});
