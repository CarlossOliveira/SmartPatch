import { useEffect, useRef } from 'react';
import { trackEvent } from '../services/analytics';

/** Regista `secao_vista` uma vez, quando 40 % da secção fica visível. */
export function useTrackSection<T extends HTMLElement>(name: string): React.RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          trackEvent('secao_vista', { secao: name });
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [name]);

  return ref;
}
