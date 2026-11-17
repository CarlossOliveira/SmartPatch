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
