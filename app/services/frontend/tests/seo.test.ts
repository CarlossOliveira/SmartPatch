import { describe, expect, it } from 'vitest';
import { LOCALES } from '../src/defaults/locales';
import { MESSAGES } from '../src/defaults/messages';
import { buildHead, buildRobots, buildRootPage, buildSitemap, escapeHtml } from '../src/utils/seo';

const SITE = 'https://smartpatch.example';

function jsonLdOf(head: string): { '@graph': { '@type': string; mainEntity?: unknown[]; inLanguage?: string }[] } {
  const match = head.match(/<script type="application\/ld\+json">(.*)<\/script>/s);
  if (!match?.[1]) {
    throw new Error('Sem JSON-LD');
  }
  return JSON.parse(match[1]);
}

describe('buildHead', () => {
  it.each(LOCALES.map((item) => item.code))('tem canonical e título próprios em %s', (code) => {
    const head = buildHead(code, SITE);
    expect(head).toContain(`<link rel="canonical" href="${SITE}/${code}/" />`);
    expect(head).toContain(`<title>${escapeHtml(MESSAGES[code].meta.title)}</title>`);
  });

  it('liga todas as línguas entre si e ao x-default', () => {
    const head = buildHead('pt', SITE);
    for (const item of LOCALES) {
      expect(head).toContain(`hreflang="${item.hreflang}" href="${SITE}/${item.code}/"`);
    }
    expect(head).toContain(`hreflang="x-default" href="${SITE}/"`);
  });

  it('declara og:locale e as alternativas', () => {
    const head = buildHead('zh', SITE);
    expect(head).toContain('property="og:locale" content="zh_CN"');
    expect(head.match(/og:locale:alternate/g)).toHaveLength(LOCALES.length - 1);
  });

  it('gera o JSON-LD do FAQ na língua da página', () => {
    const graph = jsonLdOf(buildHead('ru', SITE))['@graph'];
    const faq = graph.find((node) => node['@type'] === 'FAQPage');
    expect(faq?.mainEntity).toHaveLength(MESSAGES.ru.faq.items.length);
    expect(faq?.inLanguage).toBe('ru');
  });

  it('nunca deixa "<" solto dentro do JSON-LD', () => {
    const head = buildHead('en', SITE);
    const json = head.match(/<script type="application\/ld\+json">(.*)<\/script>/s)?.[1] ?? '';
    expect(json).not.toContain('<');
  });
});

describe('páginas auxiliares', () => {
  it('lista os 6 URLs no sitemap, cada um com as alternativas', () => {
    const sitemap = buildSitemap(SITE, '2026-11-17');
    expect(sitemap.match(/<loc>/g)).toHaveLength(LOCALES.length);
    expect(sitemap).toContain('hreflang="x-default"');
  });

  it('aponta o robots.txt para o sitemap', () => {
    expect(buildRobots(SITE)).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });

  it('põe links crawláveis para todas as línguas na raiz', () => {
    const page = buildRootPage(SITE);
    for (const item of LOCALES) {
      expect(page).toContain(`href="/${item.code}/"`);
    }
  });

  it('não duplica a barra quando o domínio acaba em /', () => {
    expect(buildHead('en', `${SITE}/`)).toContain(`href="${SITE}/en/"`);
  });
});
