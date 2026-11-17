import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { BottleScene, SimInput } from '../types';

/**
 * Liga o modelo 3D ao canvas. Devolve true quando o WebGL arrancou.
 * O módulo do three.js carrega à parte, para não pesar no primeiro ecrã.
 */
export function useBottleScene(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  sim: SimInput,
  reduceMotion: boolean,
): boolean {
  const [ready, setReady] = useState(false);
  const sceneRef = useRef<BottleScene | null>(null);
  const firstSim = useRef(sim);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) {
      return;
    }
    let cancelled = false;
    let scene: BottleScene | null = null;
    import('../utils/bottleScene')
      .then(({ createBottleScene }) => {
        if (cancelled) {
          return;
        }
        scene = createBottleScene(canvas, stage, firstSim.current, reduceMotion);
        sceneRef.current = scene;
        setReady(scene !== null);
      })
      // WebGL ou módulo indisponível: o SVG fica como alternativa.
      .catch(() => undefined);
    return () => {
      cancelled = true;
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [canvasRef, stageRef, reduceMotion]);

  useEffect(() => {
    sceneRef.current?.setSim({ temp: sim.temp, days: sim.days, color: sim.color, daysUnit: sim.daysUnit });
  }, [sim.temp, sim.days, sim.color, sim.daysUnit]);

  return ready;
}
