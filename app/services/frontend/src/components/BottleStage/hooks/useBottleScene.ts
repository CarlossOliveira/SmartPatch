import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { BottleScene, SimInput } from '../types';

export type SceneStatus = 'loading' | 'ready' | 'failed';

/**
 * Liga o modelo 3D ao canvas. Devolve "ready" quando o WebGL arrancou e "failed" quando não deu.
 * O módulo do three.js carrega à parte, para não pesar no primeiro ecrã.
 * A preferência de movimento reduzido é lida em cada frame: mudá-la não recria a cena.
 */
export function useBottleScene(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  sim: SimInput,
  reduceMotion: boolean,
): SceneStatus {
  const [status, setStatus] = useState<SceneStatus>('loading');
  const sceneRef = useRef<BottleScene | null>(null);
  const firstSim = useRef(sim);
  const reduceRef = useRef(reduceMotion);

  useEffect(() => {
    reduceRef.current = reduceMotion;
  }, [reduceMotion]);

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
        scene = createBottleScene(canvas, stage, firstSim.current, () => reduceRef.current);
        sceneRef.current = scene;
        setStatus(scene ? 'ready' : 'failed');
        // GPU a perder o contexto (muitos contextos abertos, driver): o canvas fica em branco, por isso volta o SVG.
        canvas.addEventListener('webglcontextlost', () => setStatus('failed'), { once: true });
      })
      // WebGL ou módulo indisponível: o SVG fica como alternativa.
      .catch(() => {
        if (!cancelled) {
          setStatus('failed');
        }
      });
    return () => {
      cancelled = true;
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [canvasRef, stageRef]);

  useEffect(() => {
    sceneRef.current?.setSim({ temp: sim.temp, days: sim.days, color: sim.color, daysUnit: sim.daysUnit });
  }, [sim.temp, sim.days, sim.color, sim.daysUnit]);

  return status;
}
