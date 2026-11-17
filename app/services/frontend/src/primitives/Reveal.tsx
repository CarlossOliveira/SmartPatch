import { createElement } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { useReveal } from '../hooks/useReveal';

type RevealTag = 'div' | 'p' | 'h1' | 'h2' | 'header' | 'article' | 'span';

interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: RevealTag;
  delay?: string;
}

/** Elemento que entra com fade e subida quando aparece no ecrã. Aceita os atributos HTML normais. */
export function Reveal({ as = 'div', delay, className, style, children, ...rest }: RevealProps) {
  const [ref, revealClass] = useReveal<HTMLElement>();
  const classes = className ? `${revealClass} ${className}` : revealClass;
  const finalStyle = delay ? ({ ...style, '--d': delay } as CSSProperties) : style;
  return createElement(as, { ...rest, ref, className: classes, style: finalStyle }, children);
}
