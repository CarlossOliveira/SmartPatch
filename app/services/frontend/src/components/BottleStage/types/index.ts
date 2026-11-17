import type { LedLevel } from '../../../types';

export interface LedStatus {
  level: LedLevel;
  color: string;
  core: string;
}

export interface SimInput {
  temp: number;
  days: number;
  color: string;
  /** Palavra "dias" na língua da página, escrita no ecrã da garrafa 3D. */
  daysUnit: string;
}

export interface SliderRange {
  min: number;
  max: number;
  initial: number;
}

export interface DialShape {
  from: number;
  to: number;
  ticks: number;
}

export interface BottleScene {
  setSim: (sim: SimInput) => void;
  dispose: () => void;
}
