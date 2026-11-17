import { StrictMode, createElement } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { FALLBACK_LOCALE } from './defaults/site';
import { initAnalytics } from './services/analytics';
import { App } from './ui/App';
import { detectLocale, localeFromPath } from './utils/locale';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Falta o elemento #root no index.html');
}

// Em produção o caminho (/pt/, /en/…) diz a língua. No servidor de desenvolvimento, "/" usa a do browser.
const locale = localeFromPath(window.location.pathname) ?? detectLocale(window.navigator.languages ?? [FALLBACK_LOCALE]);
const app = createElement(StrictMode, null, createElement(App, { locale }));

initAnalytics(locale);
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
