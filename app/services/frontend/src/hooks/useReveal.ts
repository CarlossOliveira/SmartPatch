import { useEffect, useRef, useState } from 'react';

/** Mostra o elemento com a animação de entrada quando 12 % dele fica visível. */
export function useReveal<T extends HTMLElement>(): [React.RefObject<T | null>, string] {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, shown ? 'rv in' : 'rv'];
}
