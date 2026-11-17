/* global process, console */
// Pré-renderiza uma página por língua depois do `vite build`.
// Uso: node scripts/prerender.mjs   (variável SITE_URL = endereço público, sem barra final)
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const serviceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(serviceRoot, 'dist');

function resolveSiteUrl() {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  console.warn('Aviso: SITE_URL não definido. Os URLs absolutos usam http://localhost:4173.');
  return 'http://localhost:4173';
}

const siteUrl = resolveSiteUrl();
const template = await readFile(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--seo-head-->') || !template.includes('<!--app-->')) {
  throw new Error('O index.html compilado perdeu os marcadores <!--seo-head--> ou <!--app-->.');
}

const vite = await createServer({
  root: path.join(serviceRoot, 'resources'),
  configFile: path.join(serviceRoot, 'vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
});

try {
  const load = (file) => vite.ssrLoadModule(path.join(serviceRoot, 'src', file));
  const { App } = await load('ui/App.tsx');
  const { LOCALES } = await load('defaults/locales.ts');
  const { buildHead, buildRobots, buildRootPage, buildSitemap, htmlLangOf } = await load('utils/seo.ts');

  for (const { code } of LOCALES) {
    const body = renderToString(createElement(App, { locale: code }));
    const page = template
      .replace(/<html lang="[^"]*"/, `<html lang="${htmlLangOf(code)}"`)
      .replace('<!--seo-head-->', buildHead(code, siteUrl))
      .replace('<!--app-->', body);
    await mkdir(path.join(dist, code), { recursive: true });
    await writeFile(path.join(dist, code, 'index.html'), page);
  }

  await writeFile(path.join(dist, 'index.html'), buildRootPage(siteUrl));
  await writeFile(path.join(dist, 'sitemap.xml'), buildSitemap(siteUrl, new Date().toISOString().slice(0, 10)));
  await writeFile(path.join(dist, 'robots.txt'), buildRobots(siteUrl));
  console.log(`Pré-renderizadas ${LOCALES.length} páginas para ${siteUrl}`);
} finally {
  await vite.close();
}
