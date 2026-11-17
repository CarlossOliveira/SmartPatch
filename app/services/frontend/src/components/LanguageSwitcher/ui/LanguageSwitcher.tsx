import { LOCALES } from '../../../defaults/locales';
import { LOCALE_STORAGE_KEY } from '../../../defaults/site';
import { useI18n } from '../../../hooks/useI18n';
import type { Locale } from '../../../types';
import { pathOf } from '../../../utils/locale';
import './LanguageSwitcher.css';

function rememberLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Armazenamento bloqueado: a navegação continua, só não fica memorizada.
  }
}

/** Ligações normais para cada língua, para os motores de busca as seguirem sem JavaScript. */
export function LanguageSwitcher() {
  const { locale, t } = useI18n();

  return (
    <nav className="langs" aria-label={t.a11y.languages}>
      <ul>
        {LOCALES.map((item) => (
          <li key={item.code}>
            <a
              href={pathOf(item.code)}
              hrefLang={item.hreflang}
              lang={item.htmlLang}
              title={item.label}
              aria-label={item.label}
              aria-current={item.code === locale ? 'page' : undefined}
              onClick={() => rememberLocale(item.code)}
            >
              {item.short}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
