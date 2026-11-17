import { useI18n } from '../../../hooks/useI18n';
import { useTrackSection } from '../../../hooks/useTrackSection';
import { Reveal } from '../../../primitives/Reveal';
import './Problem.css';

export function Problem() {
  const { t } = useI18n();
  const ref = useTrackSection<HTMLElement>('problema');

  return (
    <section id="problema" ref={ref}>
      <div className="wrap prob">
        <Reveal as="header">
          <p className="eyebrow">{t.problem.eyebrow}</p>
          <h2 style={{ marginTop: 14 }}>{t.problem.title}</h2>
          <p>{t.problem.text}</p>
        </Reveal>
        <div>
          {t.problem.items.map((item, index) => (
            <Reveal as="article" className="item" key={item.title}>
              <span className="n">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
