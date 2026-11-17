import { useEffect, useState } from 'react';
import { scrollRatio } from '../utils/scrollRatio';

interface ScrollState {
  progress: number;
  stuck: boolean;
}

/** Lê o scroll da página: progresso de 0 a 1 e se já saiu do topo. */
export function useScroll(): ScrollState {
  const [state, setState] = useState<ScrollState>({ progress: 0, stuck: false });

  useEffect(() => {
    const read = () => {
      const html = document.documentElement;
      setState({
        progress: scrollRatio(html.scrollTop, html.scrollHeight, html.clientHeight),
        stuck: html.scrollTop > 10,
      });
    };
    read();
    window.addEventListener('scroll', read, { passive: true });
    return () => window.removeEventListener('scroll', read);
  }, []);

  return state;
}
