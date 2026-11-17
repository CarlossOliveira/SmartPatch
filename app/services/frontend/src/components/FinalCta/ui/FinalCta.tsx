import { useI18n } from '../../../hooks/useI18n';
import { useTrackSection } from '../../../hooks/useTrackSection';
import { CtaLink } from '../../../primitives/CtaLink';
import { Reveal } from '../../../primitives/Reveal';
import './FinalCta.css';

interface FinalCtaProps {
  onReserve: () => void;
}

export function FinalCta({ onReserve }: FinalCtaProps) {
  const { t } = useI18n();
  const ref = useTrackSection<HTMLElement>('pre-reserva');

  return (
    <section className="final" id="pre-reserva" ref={ref}>
      <div className="wrap">
        <Reveal as="h2">{t.final.title}</Reveal>
        <Reveal as="p" delay=".08s">
          {t.final.text}
        </Reveal>
        <Reveal className="cta-row" delay=".16s">
          <CtaLink onClick={onReserve}>
            {t.final.cta}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M2 8h12M9 3l5 5-5 5" />
            </svg>
          </CtaLink>
        </Reveal>
      </div>
    </section>
  );
}
