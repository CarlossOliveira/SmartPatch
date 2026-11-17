import en from '../../../resources/i18n/locales/en.json';
import es from '../../../resources/i18n/locales/es.json';
import fr from '../../../resources/i18n/locales/fr.json';
import pt from '../../../resources/i18n/locales/pt.json';
import ru from '../../../resources/i18n/locales/ru.json';
import zh from '../../../resources/i18n/locales/zh.json';
import type { Locale, Messages } from '../../types';

/** Os textos vivem em resources/i18n/locales/<língua>.json. O tipo Messages garante que nenhum fica incompleto. */
export const MESSAGES: Record<Locale, Messages> = { pt, en, es, fr, ru, zh };
