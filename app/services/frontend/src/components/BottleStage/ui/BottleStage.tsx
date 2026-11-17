import { useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';
import { useReveal } from '../../../hooks/useReveal';
import { DAYS_DIAL, DAYS_RANGE, TEMP_DIAL, TEMP_RANGE } from '../defaults';
import { useBottleScene } from '../hooks/useBottleScene';
import { useTilt } from '../hooks/useTilt';
import { ledStatus } from '../utils/led';
import { BottleSvg } from './BottleSvg';
import { Dial } from './Dial';
import './BottleStage.css';

/**
 * Palco do hero: modelo 3D (ou SVG), anéis de temperatura e dias e o estado do LED.
 * O estado da simulação (temperatura e dias) vive aqui e não é usado fora do palco.
 */
export function BottleStage() {
  const { t } = useI18n();
  const text = t.stage;
  const [temp, setTemp] = useState(TEMP_RANGE.initial);
  const [days, setDays] = useState(DAYS_RANGE.initial);
  const [tempFocused, setTempFocused] = useState(false);
  const [daysFocused, setDaysFocused] = useState(false);
  const status = ledStatus(temp, days);
  const [stageRef, revealClass] = useReveal<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const glReady = useBottleScene(
    canvasRef,
    stageRef,
    { temp, days, color: status.color, daysUnit: text.dialDays },
    reduceMotion,
  );
  useTilt(wrapRef, bottleRef, reduceMotion);
  const tempId = useId();
  const daysId = useId();

  const classes = glReady ? `stage ${revealClass} gl` : `stage ${revealClass}`;
  const style = { '--d': '.15s', '--led': status.color } as CSSProperties;

  return (
    <div ref={stageRef} className={classes} style={style}>
      <div className="bottle-wrap" ref={wrapRef}>
        {/* O canvas roda com as setas do teclado, por isso recebe foco. */}
        <canvas ref={canvasRef} className="stage-canvas" aria-label={text.canvasLabel} role="img" tabIndex={0} />
        <div className="bottle" ref={bottleRef}>
          <BottleSvg
            temp={temp}
            days={days}
            color={status.color}
            core={status.core}
            label={text.svgLabel}
            daysSuffix={text.daysSuffix}
          />
        </div>
        <svg className="dials" viewBox="0 0 200 200" aria-hidden="true">
          <Dial
            shape={TEMP_DIAL}
            min={TEMP_RANGE.min}
            max={TEMP_RANGE.max}
            value={temp}
            label={text.dialTemp}
            format={(v) => `${v}°`}
            anchor="start"
            focused={tempFocused}
            onChange={setTemp}
          />
          <Dial
            shape={DAYS_DIAL}
            min={DAYS_RANGE.min}
            max={DAYS_RANGE.max}
            value={days}
            label={text.dialDays}
            format={(v) => `${v}/28`}
            anchor="end"
            focused={daysFocused}
            onChange={setDays}
          />
        </svg>
      </div>
      <div className="sr">
        <label htmlFor={tempId}>{text.tempLabel}</label>
        <input
          id={tempId}
          type="range"
          min={TEMP_RANGE.min}
          max={TEMP_RANGE.max}
          value={temp}
          onChange={(event) => setTemp(Number(event.target.value))}
          onFocus={() => setTempFocused(true)}
          onBlur={() => setTempFocused(false)}
        />
        <label htmlFor={daysId}>{text.daysLabel}</label>
        <input
          id={daysId}
          type="range"
          min={DAYS_RANGE.min}
          max={DAYS_RANGE.max}
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          onFocus={() => setDaysFocused(true)}
          onBlur={() => setDaysFocused(false)}
        />
      </div>
      <p className="status" aria-live="polite">
        <span className="dot" />
        <span>{text.led[status.level]}</span>
      </p>
      <p className="hint">{text.hint}</p>
    </div>
  );
}
