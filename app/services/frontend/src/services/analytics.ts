import { inject, track } from '@vercel/analytics';
import type { AnalyticsData } from '../types';

/** Liga o Vercel Web Analytics. Os eventos personalizados exigem o plano Pro. */
export function initAnalytics(): void {
  inject();
}

/** Nunca passes e-mail, nome ou outro dado pessoal nas propriedades. */
export function trackEvent(name: string, data?: AnalyticsData): void {
  track(name, data);
}
