import { useState } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import { useTrackSection } from '../../../hooks/useTrackSection';
import { Reveal } from '../../../primitives/Reveal';
import { FaqItem } from './FaqItem';
import './Faq.css';

export function Faq() {
  const { t } = useI18n();
  const ref = useTrackSection<HTMLElement>('faq');
  // Só uma pergunta fica aberta de cada vez. O estado vive aqui e o item só o reflete.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" style={{ paddingTop: 0 }} ref={ref}>
      <div className="wrap faq">
        <Reveal>
          <p className="eyebrow">{t.faq.eyebrow}</p>
          <h2 style={{ marginTop: 14 }}>{t.faq.title}</h2>
        </Reveal>
        <div>
          {t.faq.items.map((entry, index) => (
            <FaqItem
              key={entry.question}
              entry={entry}
              open={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
