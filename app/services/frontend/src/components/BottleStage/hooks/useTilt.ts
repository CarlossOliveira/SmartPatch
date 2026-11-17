import { useEffect } from 'react';
import type { RefObject } from 'react';

/** Inclina o SVG de alternativa com o rato. Só corre com cursor e sem redução de movimento. */
export function useTilt(
  areaRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
  reduceMotion: boolean,
): void {
  useEffect(() => {
    const area = areaRef.current;
    const target = targetRef.current;
    if (!area || !target || reduceMotion || !window.matchMedia('(hover: hover)').matches) {
      return;
    }
    const controller = new AbortController();
    area.addEventListener(
      'pointermove',
      (event) => {
        const rect = area.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        target.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 12}deg)`;
      },
      { signal: controller.signal },
    );
    area.addEventListener(
      'pointerleave',
      () => {
        target.style.transform = '';
      },
      { signal: controller.signal },
    );
    return () => controller.abort();
  }, [areaRef, targetRef, reduceMotion]);
}
