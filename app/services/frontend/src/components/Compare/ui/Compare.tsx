import { useI18n } from '../../../hooks/useI18n';
import { useTrackSection } from '../../../hooks/useTrackSection';
import { CtaLink } from '../../../primitives/CtaLink';
import { Reveal } from '../../../primitives/Reveal';
import './Compare.css';

interface CompareProps {
  onReserve: () => void;
}

export function Compare({ onReserve }: CompareProps) {
  const { t } = useI18n();
  const ref = useTrackSection<HTMLElement>('comparar');
  const text = t.compare;

  return (
    <section id="comparar" ref={ref}>
      <div className="wrap">
        <div className="cmp-head">
          <Reveal>
            <p className="eyebrow">{text.eyebrow}</p>
            <h2 style={{ marginTop: 14, maxWidth: '12em' }}>{text.title}</h2>
          </Reveal>
          <Reveal>
            <CtaLink className="ghost" onClick={onReserve}>
              {text.cta}
            </CtaLink>
          </Reveal>
        </div>
        <div className="table" role="table" aria-label={text.table}>
          <div className="row h" role="row">
            <span role="columnheader">{text.topic}</span>
            <span role="columnheader">{text.other}</span>
            <span role="columnheader">{text.ours}</span>
          </div>
          {text.rows.map((row) => (
            <Reveal className="row" role="row" key={row}>
              <span role="cell">{row}</span>
              <span className="n" role="cell">
                <svg viewBox="0 0 18 18" fill="none" stroke="#b34a4a" strokeWidth="2" aria-hidden="true">
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
                {text.no}
              </span>
              <span className="y" role="cell">
                <svg viewBox="0 0 18 18" fill="none" stroke="#1f9a6d" strokeWidth="2.2" aria-hidden="true">
                  <path d="M3 9.5l4 4 8-9" />
                </svg>
                {text.yes}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
