import { inject } from '@vercel/analytics';
import type { AnalyticsData } from '../types';

/** Liga o Vercel Web Analytics (só visitas de página: os eventos personalizados exigem o plano Pro). */
export function initAnalytics(): void {
  inject();
}

/**
 * Regista um evento como GET a /analytics/<nome>[/<valor>…], para ser contado nos pedidos da Vercel.
 * Os valores das propriedades entram no caminho. Nunca passes e-mail, nome ou outro dado pessoal.
 * O no-store impede o browser de servir o pedido da cache, o que perderia a contagem.
 * ponytail: ninguém responde a estas rotas (404 é esperado); a contagem vem dos registos de pedidos.
 */
export function trackEvent(name: string, data?: AnalyticsData): void {
  const segments = [name, ...Object.values(data ?? {}).map(String)].map(encodeURIComponent);
  fetch(`/analytics/${segments.join('/')}`, { method: 'GET', cache: 'no-store', keepalive: true }).catch(() => {
    // Sem rede ou bloqueado por um bloqueador de anúncios: perde-se o evento, a página segue.
  });
}
