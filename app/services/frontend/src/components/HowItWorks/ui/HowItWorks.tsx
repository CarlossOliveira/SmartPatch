import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { HOW_TAB_IDS } from '../../../defaults/site';
import { useI18n } from '../../../hooks/useI18n';
import { useTrackSection } from '../../../hooks/useTrackSection';
import { Reveal } from '../../../primitives/Reveal';
import type { HowTabId, Messages } from '../../../types';
import './HowItWorks.css';

const ARROW_STEPS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
const PILL_COLORS = ['var(--ok)', 'var(--warn)', 'var(--bad)'];

function PanelVisual({ id, how }: { id: HowTabId; how: Messages['how'] }) {
  if (id === 'protege') {
    return (
      <div className="layers" aria-hidden="true">
        <div>{how.layers[0]}</div>
        <div className="l2">{how.layers[1]}</div>
        <div>{how.layers[2]}</div>
      </div>
    );
  }
  if (id === 'avisa') {
    return (
      <div className="leds">
        {how.pills.map((label, index) => (
          <span className="pill" key={label}>
            <i style={{ background: PILL_COLORS[index] }} />
            {label}
          </span>
        ))}
      </div>
    );
  }
  return (
    <svg className="spark" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 70 C40 68 60 60 90 62 S140 20 180 18 S240 40 280 55 S350 60 400 50" />
    </svg>
  );
}

export function HowItWorks() {
  const { t } = useI18n();
  const ref = useTrackSection<HTMLElement>('como');
  const [active, setActive] = useState<HowTabId>('protege');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    const step = ARROW_STEPS[event.key];
    if (step === undefined) {
      return;
    }
    event.preventDefault();
    const next = HOW_TAB_IDS[(index + step + HOW_TAB_IDS.length) % HOW_TAB_IDS.length];
    if (next) {
      setActive(next);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <section className="how" id="como" ref={ref}>
      <div className="wrap">
        <Reveal as="p" className="eyebrow">
          {t.how.eyebrow}
        </Reveal>
        <Reveal as="h2" style={{ marginTop: 14, maxWidth: '16em' }}>
          {t.how.titleBefore}
          <em>{t.how.titleEm}</em>
          {t.how.titleAfter}
        </Reveal>
        <div className="tabs">
          <Reveal className="tablist" role="tablist" aria-label={t.how.tablist}>
            {HOW_TAB_IDS.map((id, index) => (
              <button
                key={id}
                ref={(element) => {
                  tabRefs.current[id] = element;
                }}
                type="button"
                className="tab"
                role="tab"
                id={`tab-${id}`}
                aria-selected={active === id}
                aria-controls={`panel-${id}`}
                tabIndex={active === id ? 0 : -1}
                onClick={() => setActive(id)}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                {t.how.tabs[index]?.label}
                <small>{t.how.tabs[index]?.hint}</small>
              </button>
            ))}
          </Reveal>
          <Reveal delay=".1s">
            {HOW_TAB_IDS.map((id, index) => (
              <div
                key={id}
                className={active === id ? 'panel on' : 'panel'}
                role="tabpanel"
                id={`panel-${id}`}
                aria-labelledby={`tab-${id}`}
                hidden={active !== id}
              >
                <h3>{t.how.tabs[index]?.title}</h3>
                <p>{t.how.tabs[index]?.text}</p>
                <PanelVisual id={id} how={t.how} />
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
