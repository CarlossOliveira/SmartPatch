import type { ReactNode } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import { useTrackSection } from '../../../hooks/useTrackSection';
import { CtaLink } from '../../../primitives/CtaLink';
import { Reveal } from '../../../primitives/Reveal';
import './Hero.css';

interface HeroProps {
  /** Palco do modelo 3D. Chega por argumento porque o Hero não importa outros componentes. */
  stage: ReactNode;
  onReserve: () => void;
}

export function Hero({ stage, onReserve }: HeroProps) {
  const { t } = useI18n();
  const ref = useTrackSection<HTMLDivElement>('hero');

  return (
    <div className="hero" ref={ref}>
      <div className="wrap hero-c">
        <Reveal as="p" className="eyebrow">
          {t.hero.eyebrow}
        </Reveal>
        <Reveal as="h1" delay=".08s">
          {t.hero.title} <em>{t.hero.titleEm}</em>
        </Reveal>
        {stage}
        <Reveal as="p" className="lede" delay=".2s">
          {t.hero.lede}
        </Reveal>
        <Reveal className="cta-row" delay=".26s">
          <CtaLink onClick={onReserve}>
            {t.hero.cta}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M2 8h12M9 3l5 5-5 5" />
            </svg>
          </CtaLink>
          <a className="btn ghost" href="#como">
            {t.hero.ghost}
          </a>
        </Reveal>
        <Reveal as="p" className="fine" delay=".3s">
          {t.hero.fine}
        </Reveal>
      </div>
    </div>
  );
}
