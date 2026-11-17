import { useState } from 'react';
import type { ReactNode } from 'react';
import { NAV_SECTION_IDS } from '../../../defaults/site';
import { useI18n } from '../../../hooks/useI18n';
import { useScroll } from '../../../hooks/useScroll';
import { CtaLink } from '../../../primitives/CtaLink';
import { useActiveSection } from '../hooks/useActiveSection';
import './Header.css';

interface HeaderProps {
  /** Seletor de língua. Chega por argumento porque o Header não importa outros componentes. */
  switcher: ReactNode;
  onReserve: () => void;
}

export function Header({ switcher, onReserve }: HeaderProps) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const { stuck } = useScroll();
  const active = useActiveSection(NAV_SECTION_IDS);

  return (
    <header className={stuck ? 'top stuck' : 'top'} id="top">
      <div className="wrap nav">
        <a className="logo" href="#top" aria-label={t.a11y.logo}>
          <i />
          SmartPatch
        </a>
        <nav className={menuOpen ? 'links open' : 'links'} id="menu" aria-label={t.a11y.mainNav}>
          {NAV_SECTION_IDS.map((id, index) => (
            <a key={id} href={`#${id}`} className={active === id ? 'on' : undefined} onClick={() => setMenuOpen(false)}>
              {t.nav[index]}
            </a>
          ))}
        </nav>
        {switcher}
        <CtaLink onClick={onReserve}>{t.reserveShort}</CtaLink>
        <button
          type="button"
          className="burger"
          aria-label={t.a11y.menu}
          aria-expanded={menuOpen}
          aria-controls="menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
