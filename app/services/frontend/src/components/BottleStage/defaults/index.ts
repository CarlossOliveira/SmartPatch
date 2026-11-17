import type { DialShape, SliderRange } from '../types';

export const TEMP_RANGE: SliderRange = { min: 8, max: 42, initial: 18 };
export const DAYS_RANGE: SliderRange = { min: 1, max: 28, initial: 1 };

// Arcos de 100° centrados na horizontal: ficam ao lado da garrafa.
export const TEMP_DIAL: DialShape = { from: 220, to: 320, ticks: 17 };
export const DAYS_DIAL: DialShape = { from: 140, to: 40, ticks: 27 };
