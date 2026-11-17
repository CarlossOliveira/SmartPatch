import type { Locale, LocaleInfo } from '../types';

/** A primeira língua da lista é a de origem do projeto. */
export const LOCALES: LocaleInfo[] = [
  { code: 'pt', label: 'Português', short: 'PT', htmlLang: 'pt-PT', hreflang: 'pt-PT', ogLocale: 'pt_PT' },
  { code: 'en', label: 'English', short: 'EN', htmlLang: 'en', hreflang: 'en', ogLocale: 'en_US' },
  { code: 'es', label: 'Español', short: 'ES', htmlLang: 'es', hreflang: 'es', ogLocale: 'es_ES' },
  { code: 'fr', label: 'Français', short: 'FR', htmlLang: 'fr', hreflang: 'fr', ogLocale: 'fr_FR' },
  { code: 'ru', label: 'Русский', short: 'RU', htmlLang: 'ru', hreflang: 'ru', ogLocale: 'ru_RU' },
  { code: 'zh', label: '中文', short: '中文', htmlLang: 'zh-Hans', hreflang: 'zh-Hans', ogLocale: 'zh_CN' },
];

export const LOCALE_CODES: Locale[] = LOCALES.map((locale) => locale.code);
