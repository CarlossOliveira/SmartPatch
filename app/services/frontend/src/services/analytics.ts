import { computeRoute, inject, pageview } from '@vercel/analytics';
import type { AnalyticsData, Locale } from '../types';

/**
 * Liga o Vercel Web Analytics (só visitas de página: os eventos personalizados exigem o plano Pro).
 * O painel Routes só mostra rotas que a framework indica. Sem framework, a visita é enviada à mão
 * com a rota /[lang]/, que agrupa as seis línguas (o caminho real, como /pt/, continua no painel Pages).
 * O envio automático fica desligado para a visita não contar duas vezes.
 */
export function initAnalytics(locale: Locale): void {
  inject({ disableAutoTrack: true });
  const path = window.location.pathname;
  pageview({ route: computeRoute(path, { lang: locale }), path });
}

/**
 * Regista um evento como visita virtual a /analytics/<nome>[/<valor>…].
 * A rota /analytics/<nome> conta cada evento no painel Routes e o caminho completo, com os valores,
 * aparece no painel Pages. Nunca passes e-mail, nome ou outro dado pessoal nos valores.
 * ponytail: os eventos contam como visitas de página (inflacionam o total de Page Views).
 * O envio de eventos a sério (track) exige o plano Pro.
 */
export function trackEvent(name: string, data?: AnalyticsData): void {
  const segments = [name, ...Object.values(data ?? {}).map(String)].map(encodeURIComponent);
  pageview({ route: `/analytics/${segments[0]}`, path: `/analytics/${segments.join('/')}` });
}
