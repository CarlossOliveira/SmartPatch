import type { HowTabId, Locale } from '../types';

export const SITE_NAME = 'SmartPatch';

/** Língua usada quando o browser não indica nenhuma das suportadas. */
export const FALLBACK_LOCALE: Locale = 'en';

export const LOCALE_STORAGE_KEY = 'smartpatch.locale';

/** Ids das secções ligadas ao menu, pela ordem de Messages.nav. */
export const NAV_SECTION_IDS = ['problema', 'como', 'comparar', 'faq'];

/** Ordem de Messages.how.tabs. */
export const HOW_TAB_IDS: HowTabId[] = ['protege', 'avisa', 'lembra'];
