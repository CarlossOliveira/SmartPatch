import { useState } from 'react';
import type { PointerEvent } from 'react';
import type { DialShape } from '../types';
import { CENTER, RADIUS, angleOfValue, arcPath, pointOnCircle, valueFromPoint } from '../utils/dial';

interface DialProps {
  shape: DialShape;
  min: number;
  max: number;
  value: number;
  label: string;
  format: (value: number) => string;
  anchor: 'start' | 'end';
  focused: boolean;
  onChange: (value: number) => void;
}

/** Anel que comanda um valor ao arrastar. O input range escondido continua a ser a fonte para o teclado. */
export function Dial({ shape, min, max, value, label, format, anchor, focused, onChange }: DialProps) {
  const [dragging, setDragging] = useState(false);
  const { from, to, ticks } = shape;
  const angle = angleOfValue(value, min, max, from, to);
  const [knobX, knobY] = pointOnCircle(angle);
  const [labelX, labelY] = pointOnCircle((from + to) / 2, RADIUS - 8);

  const tickMarks = [];
  for (let i = 0; i <= ticks; i++) {
    const a = from + ((to - from) * i) / ticks;
    const [x1, y1] = pointOnCircle(a, RADIUS + 2);
    const [x2, y2] = pointOnCircle(a, RADIUS + (i % 5 ? 3.2 : 4.6));
    tickMarks.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="d-tick" />);
  }

  function pick(event: PointerEvent<SVGPathElement>): void {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) {
      return;
    }
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 200 - CENTER;
    const y = ((event.clientY - rect.top) / rect.height) * 200 - CENTER;
    const next = valueFromPoint(x, y, min, max, from, to);
    if (next !== value) {
      onChange(next);
    }
  }

  return (
    <g className={dragging || focused ? 'dial on' : 'dial'}>
      <path d={arcPath(from, to)} className="d-track" />
      {tickMarks}
      <path d={arcPath(from, angle)} className="d-fill" />
      <circle cx={knobX} cy={knobY} r={3} className="d-knob" />
      <path
        d={arcPath(from, to)}
        className="d-hit"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
          pick(event);
          event.preventDefault();
        }}
        onPointerMove={(event) => {
          if (dragging) {
            pick(event);
          }
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      />
      <text x={labelX} y={labelY} className="d-val" textAnchor={anchor}>
        {format(value)}
      </text>
      <text x={labelX} y={labelY + 5.5} className="d-lbl" textAnchor={anchor}>
        {label}
      </text>
    </g>
  );
}
