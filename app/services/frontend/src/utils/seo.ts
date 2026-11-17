import { CONTACT_EMAIL } from '../defaults/contact';
import { LOCALES, LOCALE_CODES } from '../defaults/locales';
import { MESSAGES } from '../defaults/messages';
import { FALLBACK_LOCALE, LOCALE_STORAGE_KEY, SITE_NAME } from '../defaults/site';
import type { Locale, LocaleInfo } from '../types';
import { pathOf } from './locale';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absoluteUrl(siteUrl: string, path: string): string {
  return `${siteUrl.replace(/\/+$/, '')}${path}`;
}

function infoOf(locale: Locale): LocaleInfo {
  const info = LOCALES.find((item) => item.code === locale);
  if (!info) {
    throw new Error(`Língua desconhecida: ${locale}`);
  }
  return info;
}

export function htmlLangOf(locale: Locale): string {
  return infoOf(locale).htmlLang;
}

/** Links alternativos entre línguas. O x-default aponta para a raiz, que escolhe a língua. */
function alternateLinks(siteUrl: string): string[] {
  const links = LOCALES.map(
    (item) => `<link rel="alternate" hreflang="${item.hreflang}" href="${absoluteUrl(siteUrl, pathOf(item.code))}" />`,
  );
  links.push(`<link rel="alternate" hreflang="x-default" href="${absoluteUrl(siteUrl, '/')}" />`);
  return links;
}

function jsonLd(locale: Locale, siteUrl: string): string {
  const messages = MESSAGES[locale];
  const url = absoluteUrl(siteUrl, pathOf(locale));
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: absoluteUrl(siteUrl, '/'),
        email: CONTACT_EMAIL,
        description: messages.meta.orgDescription,
      },
      { '@type': 'WebSite', name: SITE_NAME, url, inLanguage: htmlLangOf(locale) },
      {
        '@type': 'FAQPage',
        url,
        inLanguage: htmlLangOf(locale),
        mainEntity: messages.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
  // SECURITY: escapa "<" para o JSON nunca fechar a tag <script>.
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}

/** Conteúdo do <head> específico de uma língua: título, descrição, canonical, hreflang, Open Graph e JSON-LD. */
export function buildHead(locale: Locale, siteUrl: string): string {
  const meta = MESSAGES[locale].meta;
  const info = infoOf(locale);
  const url = absoluteUrl(siteUrl, pathOf(locale));
  const lines = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    '<meta name="robots" content="index, follow, max-image-preview:large" />',
    `<meta name="author" content="${SITE_NAME}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...alternateLinks(siteUrl),
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.ogTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.ogDescription)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="${info.ogLocale}" />`,
  ];
  for (const other of LOCALES) {
    if (other.code !== locale) {
      lines.push(`<meta property="og:locale:alternate" content="${other.ogLocale}" />`);
    }
  }
  lines.push(
    '<meta name="twitter:card" content="summary" />',
    `<meta name="twitter:title" content="${escapeHtml(meta.twitterTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.twitterDescription)}" />`,
    `<script type="application/ld+json">${jsonLd(locale, siteUrl)}</script>`,
  );
  return lines.join('\n    ');
}

/**
 * Código que escolhe a língua em "/": primeiro a guardada, depois a do browser, por fim a de reserva.
 * Usa só sintaxe antiga porque corre antes de qualquer pacote.
 */
export function buildDetectScript(): string {
  const codes = JSON.stringify(LOCALE_CODES);
  return [
    '(function () {',
    `  var codes = ${codes};`,
    '  var chosen = null;',
    '  try {',
    `    var saved = localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)});`,
    '    if (saved && codes.indexOf(saved) > -1) { chosen = saved; }',
    '  } catch (error) { chosen = null; }',
    '  var tags = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];',
    '  for (var i = 0; i < tags.length && !chosen; i++) {',
    '    var primary = String(tags[i]).toLowerCase().split("-")[0];',
    '    if (codes.indexOf(primary) > -1) { chosen = primary; }',
    '  }',
    `  location.replace("/" + (chosen || ${JSON.stringify(FALLBACK_LOCALE)}) + "/");`,
    '})();',
  ].join('\n');
}

/** Página "/": escolhe a língua e, sem JavaScript, mostra links para todas. É o alvo do x-default. */
export function buildRootPage(siteUrl: string): string {
  const links = LOCALES.map(
    (item) =>
      `<li><a href="${pathOf(item.code)}" hreflang="${item.hreflang}" lang="${item.htmlLang}">${escapeHtml(item.label)}</a></li>`,
  ).join('\n        ');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(MESSAGES[FALLBACK_LOCALE].meta.title)}</title>
    <meta name="description" content="${escapeHtml(MESSAGES[FALLBACK_LOCALE].meta.description)}" />
    <link rel="canonical" href="${absoluteUrl(siteUrl, '/')}" />
    ${alternateLinks(siteUrl).join('\n    ')}
    <script>${buildDetectScript()}</script>
  </head>
  <body>
    <main>
      <h1>${SITE_NAME}</h1>
      <ul>
        ${links}
      </ul>
    </main>
  </body>
</html>
`;
}

export function buildSitemap(siteUrl: string, lastmod: string): string {
  const entries = LOCALE_CODES.map((code) => {
    const alternates = [
      ...LOCALES.map(
        (item) =>
          `    <xhtml:link rel="alternate" hreflang="${item.hreflang}" href="${absoluteUrl(siteUrl, pathOf(item.code))}" />`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(siteUrl, '/')}" />`,
    ].join('\n');
    return `  <url>\n    <loc>${absoluteUrl(siteUrl, pathOf(code))}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}

export function buildRobots(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(siteUrl, '/sitemap.xml')}\n`;
}
