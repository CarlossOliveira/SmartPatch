import { useI18n } from '../../../hooks/useI18n';
import { Reveal } from '../../../primitives/Reveal';
import './Facts.css';

export function Facts() {
  const { t } = useI18n();

  return (
    <div className="facts">
      <div className="wrap">
        {t.facts.map((fact, index) => (
          <Reveal key={fact.value} className="fact" delay={index === 0 ? undefined : `${(index * 0.08).toFixed(2)}s`}>
            <strong>{fact.value}</strong>
            <span>{fact.label}</span>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
