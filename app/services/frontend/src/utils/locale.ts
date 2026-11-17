import { LOCALE_CODES } from '../defaults/locales';
import { FALLBACK_LOCALE } from '../defaults/site';
import type { Locale } from '../types';

export function isLocale(value: string): value is Locale {
  return (LOCALE_CODES as string[]).includes(value);
}

/** Converte uma etiqueta de língua do browser (pt-BR, zh-Hans-CN…) numa língua suportada. */
export function matchLocale(tag: string): Locale | null {
  const primary = tag.toLowerCase().split('-')[0] ?? '';
  if (isLocale(primary)) {
    return primary;
  }
  return null;
}

/** Escolhe a primeira língua suportada da lista do browser. Sem correspondência, usa a língua de reserva. */
export function detectLocale(languages: readonly string[]): Locale {
  for (const tag of languages) {
    const match = matchLocale(tag);
    if (match) {
      return match;
    }
  }
  return FALLBACK_LOCALE;
}

/** Lê a língua do primeiro segmento do caminho, por exemplo /en/ ou /zh/. */
export function localeFromPath(pathname: string): Locale | null {
  const first = pathname.split('/').find((segment) => segment !== '') ?? '';
  if (isLocale(first)) {
    return first;
  }
  return null;
}

/** Caminho canónico de uma língua. Leva sempre barra final. */
export function pathOf(locale: Locale): string {
  return `/${locale}/`;
}
