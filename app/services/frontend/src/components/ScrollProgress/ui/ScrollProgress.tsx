import { useScroll } from '../../../hooks/useScroll';
import './ScrollProgress.css';

/** Barra fina no topo que mostra quanto da página já foi lido. */
export function ScrollProgress() {
  const { progress } = useScroll();
  return <div className="bar" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />;
}
