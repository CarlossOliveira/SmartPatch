import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';

/**
 * Abre e fecha um <details> com a altura animada.
 * O <details> não anima sozinho, por isso anima-se a altura com a Web Animations API.
 */
export function useSlide(ref: RefObject<HTMLDetailsElement | null>, open: boolean): void {
  const reduceMotion = usePrefersReducedMotion();
  const animation = useRef<Animation | null>(null);

  useEffect(() => {
    const details = ref.current;
    if (!details) {
      return;
    }
    if (details.open === open && !animation.current) {
      return;
    }
    // Lê a altura antes de cancelar: assim apanha-a a meio de uma animação.
    const from = details.offsetHeight;
    animation.current?.cancel();
    animation.current = null;
    if (reduceMotion) {
      details.open = open;
      return;
    }
    details.open = open;
    const to = details.offsetHeight;
    // O conteúdo fica visível durante a animação.
    details.open = true;
    details.style.overflow = 'hidden';
    const running = details.animate(
      { height: [`${from}px`, `${to}px`] },
      { duration: 340, easing: 'cubic-bezier(.4,0,.2,1)' },
    );
    animation.current = running;
    running.onfinish = () => {
      details.open = open;
      details.style.overflow = '';
      animation.current = null;
    };
  }, [open, reduceMotion, ref]);
}
