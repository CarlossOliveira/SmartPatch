import { useEffect, useRef } from 'react';
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

/**
 * Botão pequeno com o código da língua atual. Abre uma lista de ligações normais,
 * que ficam no HTML mesmo fechadas para os motores de busca as seguirem.
 */
export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const ref = useRef<HTMLDetailsElement>(null);
  const current = LOCALES.find((item) => item.code === locale);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent): void {
      const menu = ref.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  return (
    <details className="langs" ref={ref}>
      <summary aria-label={t.a11y.languages}>
        <span>{current?.short}</span>
      </summary>
      <ul>
        {LOCALES.map((item) => (
          <li key={item.code}>
            <a
              href={pathOf(item.code)}
              hrefLang={item.hreflang}
              lang={item.htmlLang}
              aria-current={item.code === locale ? 'page' : undefined}
              onClick={() => rememberLocale(item.code)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
