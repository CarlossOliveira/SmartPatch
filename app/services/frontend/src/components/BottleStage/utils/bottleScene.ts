import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { BottleScene, SimInput } from '../types';
import { BODY_HEIGHT, OPEN_DURATION, PEN_HOLE_OFFSET, capPose, openBounds, penPose } from './openTimeline';

type Profile = [number, number][];

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D indisponível');
  }
  return context;
}

function lathe(points: Profile, segments = 96): THREE.LatheGeometry {
  return new THREE.LatheGeometry(
    points.map((p) => new THREE.Vector2(p[0], p[1])),
    segments,
  );
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number, steps = 10): Profile {
  const points: Profile = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return points;
}

function brushedTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 1024;
  const ctx = context2d(canvas);
  for (let i = 0; i < 1024; i++) {
    const v = Math.floor(105 + Math.random() * 100);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, i, 64, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function engraveTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = context2d(canvas);
  ctx.strokeStyle = ctx.fillStyle = 'rgba(8,14,26,.9)';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.roundRect(70, 40, 26, 110, 13);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(83, 168, 20, 0, Math.PI * 2);
  ctx.fill();
  for (const y of [60, 85, 110]) {
    ctx.beginPath();
    ctx.moveTo(108, y);
    ctx.lineTo(128, y);
    ctx.stroke();
  }
  ctx.font = '600 62px Georgia,serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('SmartPatch', 150, 100);
  ctx.font = '500 26px Arial,sans-serif';
  ctx.fillText('THERMOCARE', 154, 160);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function doseWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = context2d(canvas);
  ctx.fillStyle = '#e8eef7';
  ctx.fillRect(0, 0, 128, 256);
  ctx.fillStyle = '#0e1a2b';
  ctx.font = '700 120px "Courier New",monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('18', 64, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Cria o modelo 3D procedural da garrafa dentro do canvas.
 * Devolve null se o WebGL não estiver disponível; o SVG fica como alternativa.
 */
export function createBottleScene(
  canvas: HTMLCanvasElement,
  stage: HTMLElement,
  initial: SimInput,
  reduceMotion: boolean,
): BottleScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 5.8, 9.8);
  camera.lookAt(0, 1.8, 0);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  key.shadow.radius = 5;
  key.shadow.bias = -0.0004;
  const rim = new THREE.DirectionalLight(0x7aa8ff, 1.6);
  rim.position.set(-5, 3, -4);
  scene.add(key, rim, new THREE.HemisphereLight(0x8ea8d0, 0x0b1220, 0.5));

  const brushed = brushedTexture();
  const engrave = engraveTexture();

  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = screenCanvas.height = 512;
  const screenCtx = context2d(screenCanvas);
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.colorSpace = THREE.SRGBColorSpace;
  screenTexture.anisotropy = 8;
  let daysUnit = initial.daysUnit;
  function drawScreen(temp: number, days: number, color: string): void {
    screenCtx.fillStyle = '#03060a';
    screenCtx.fillRect(0, 0, 512, 512);
    screenCtx.lineWidth = 14;
    screenCtx.lineCap = 'round';
    screenCtx.strokeStyle = 'rgba(255,255,255,.1)';
    screenCtx.beginPath();
    screenCtx.arc(256, 256, 222, 0, Math.PI * 2);
    screenCtx.stroke();
    screenCtx.strokeStyle = color;
    screenCtx.beginPath();
    screenCtx.arc(256, 256, 222, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * days) / 28);
    screenCtx.stroke();
    screenCtx.textAlign = 'center';
    screenCtx.textBaseline = 'middle';
    screenCtx.fillStyle = '#fff';
    screenCtx.font = '700 150px "Courier New",monospace';
    screenCtx.fillText(`${Math.round(temp)}°C`, 256, 220);
    screenCtx.fillStyle = '#bae6fd';
    screenCtx.font = '700 46px "Courier New",monospace';
    screenCtx.fillText(`${Math.round(days)}/28 ${daysUnit}`, 256, 340);
    screenTexture.needsUpdate = true;
  }

  const R = 1;
  const H = BODY_HEIGHT;
  const CAP0 = H + 0.05;
  const CAPH = 0.85;
  const RC = 1.03;
  const CAPTOP = CAP0 + CAPH;

  const steel = new THREE.MeshPhysicalMaterial({
    color: 0x24406b,
    metalness: 1,
    roughness: 0.42,
    roughnessMap: brushed,
    bumpMap: brushed,
    bumpScale: 0.35,
    clearcoat: 0.15,
    clearcoatRoughness: 0.5,
  });
  const capSteel = steel.clone();
  capSteel.color.set(0x1b3157);
  const black = new THREE.MeshStandardMaterial({ color: 0x05080d, metalness: 0.6, roughness: 0.35 });

  const pivot = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.add(pivot);
  scene.add(tilt);
  pivot.position.y = CAPTOP / 2;
  const stack = new THREE.Group();
  pivot.add(stack);
  const CAPC = (H - 0.18 + CAPTOP) / 2;
  const shellG = new THREE.Group();
  const pensG = new THREE.Group();
  const capG = new THREE.Group();
  const capPivot = new THREE.Group();
  capPivot.position.y = CAPC;
  capG.position.y = -CAPC;
  capPivot.add(capG);
  stack.add(shellG, pensG, capPivot);

  // Corpo: casco oco (parede exterior e interior).
  const shellMat = steel.clone();
  shellMat.side = THREE.DoubleSide;
  shellG.add(
    new THREE.Mesh(
      lathe([[0, 0], ...arc(R - 0.16, 0.16, 0.16, -Math.PI / 2, 0), [R, H], [R - 0.07, H], [R - 0.07, 0.12], [0, 0.12]]),
      shellMat,
    ),
  );
  const decal = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.004, R + 0.004, 0.72, 64, 1, true, -0.62, 1.24),
    new THREE.MeshStandardMaterial({
      map: engrave,
      transparent: true,
      metalness: 0.3,
      roughness: 0.6,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
  );
  decal.position.y = 1.55;
  shellG.add(decal);

  // Suporte interior das 5 canetas: duas placas furadas e um eixo central.
  const HOLE_R = 0.23;
  const plateShape = new THREE.Shape();
  plateShape.absarc(0, 0, 0.88, 0, Math.PI * 2, false);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const hole = new THREE.Path();
    hole.absarc(Math.sin(a) * PEN_HOLE_OFFSET, -Math.cos(a) * PEN_HOLE_OFFSET, HOLE_R, 0, Math.PI * 2, true);
    plateShape.holes.push(hole);
  }
  const plateGeo = new THREE.ExtrudeGeometry(plateShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 48,
  });
  plateGeo.rotateX(-Math.PI / 2);
  const holderMat = new THREE.MeshStandardMaterial({ color: 0x2b3442, metalness: 0.15, roughness: 0.6 });
  for (const y of [0.14, 1.15]) {
    const plate = new THREE.Mesh(plateGeo, holderMat);
    plate.position.y = y;
    shellG.add(plate);
  }
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.15, 24), holderMat);
  rod.position.y = 0.72;
  shellG.add(rod);

  // Cinco canetas de insulina.
  const penSteel = new THREE.MeshPhysicalMaterial({
    color: 0x24406b,
    metalness: 1,
    roughness: 0.4,
    roughnessMap: brushed,
    bumpMap: brushed,
    bumpScale: 0.3,
    clearcoat: 0.2,
  });
  const silver = new THREE.MeshStandardMaterial({ color: 0xe3e8f0, metalness: 1, roughness: 0.18 });
  const grip = new THREE.MeshStandardMaterial({ color: 0x0a0f18, metalness: 0.3, roughness: 0.65 });
  const pen0 = new THREE.Group();
  function addPart(geometry: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    pen0.add(mesh);
    return mesh;
  }
  addPart(lathe([[0, -1.24], ...arc(0.05, -1.19, 0.05, -Math.PI / 2, 0, 6), [0.1, -1.1], [0, -1.1]], 48), silver);
  addPart(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 48), grip, 0, -0.93);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    addPart(new THREE.BoxGeometry(0.018, 0.3, 0.02), penSteel, Math.sin(a) * 0.15, -0.93, Math.cos(a) * 0.15).rotation.y = a;
  }
  addPart(new THREE.CylinderGeometry(0.135, 0.135, 0.78, 64), penSteel, 0, -0.39);
  addPart(new THREE.CylinderGeometry(0.147, 0.147, 0.06, 64), silver, 0, 0.02);
  addPart(lathe([[0.143, 0.05], [0.143, 0.98], ...arc(0.103, 0.98, 0.04, 0, Math.PI / 2, 6), [0, 1.02]], 64), penSteel);
  addPart(new THREE.BoxGeometry(0.03, 0.85, 0.05), silver, 0, 0.55, 0.155);
  addPart(new THREE.SphereGeometry(0.045, 24, 16), silver, 0, 0.97, 0.155);
  addPart(
    new THREE.PlaneGeometry(0.12, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x9aa6b8, metalness: 1, roughness: 0.25 }),
    0,
    -0.55,
    0.1355,
  );
  addPart(
    new THREE.PlaneGeometry(0.1, 0.2),
    new THREE.MeshStandardMaterial({ map: doseWindowTexture(), roughness: 0.2 }),
    0,
    -0.55,
    0.137,
  );
  const pens: THREE.Group[] = [];
  for (let i = 0; i < 5; i++) {
    const holder = new THREE.Group();
    holder.rotation.order = 'YXZ';
    const pen = pen0.clone();
    pen.rotation.y = i * 1.3;
    holder.add(pen);
    pensG.add(holder);
    pens.push(holder);
  }

  // Tampa inteligente: LED, ecrã e vedante.
  const cap = new THREE.Mesh(
    lathe([[0, CAP0], [0.97, CAP0], [RC, CAP0 + 0.01], [RC, CAPTOP - 0.1], ...arc(RC - 0.1, CAPTOP - 0.1, 0.1, 0, Math.PI / 2, 8), [0, CAPTOP]]),
    capSteel,
  );
  const groove = new THREE.Mesh(new THREE.CylinderGeometry(0.965, 0.965, 0.07, 96), black);
  groove.position.y = H + 0.02;
  const plug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.86, 0.86, 0.2, 64),
    new THREE.MeshStandardMaterial({ color: 0x141b27, roughness: 0.85 }),
  );
  plug.position.y = H - 0.08;
  const bezel = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.9, 96), black);
  bezel.rotation.x = -Math.PI / 2;
  bezel.position.y = CAPTOP + 0.002;
  const screen = new THREE.Mesh(
    new THREE.CircleGeometry(0.7, 96),
    new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0xffffff,
      emissiveMap: screenTexture,
      emissiveIntensity: 1.15,
      roughness: 0.45,
      metalness: 0,
    }),
  );
  screen.rotation.x = -Math.PI / 2;
  screen.position.y = CAPTOP + 0.006;
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x32d296, emissiveIntensity: 3, roughness: 0.3 });
  const led = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.045, 24, 128), ledMat);
  led.rotation.x = Math.PI / 2;
  led.position.y = CAPTOP + 0.012;
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x32d296,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.13, 16, 128), haloMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = CAPTOP + 0.02;
  capG.add(cap, groove, plug, bezel, screen, halo, led);

  // Estado: abertura e enquadramento.
  let open = 0;
  let wantOpen = false;
  let fit = 2.4;
  let goHome = true;
  let dragging = false;
  let idle = 0;
  let vyaw = 0;
  let vpitch = 0;
  const smooth = (x: number) => x * x * (3 - 2 * x);

  function toggleOpen(): void {
    wantOpen = !wantOpen;
    goHome = true;
    vyaw = vpitch = 0;
    idle = 0;
    navigator.vibrate?.(25);
  }

  function layout(dt: number): void {
    open = Math.min(1, Math.max(0, open + ((wantOpen ? 1 : -1) * dt) / OPEN_DURATION));
    const c = capPose(open);
    capPivot.position.set(c.x, CAPC + c.y, 0);
    capPivot.rotation.z = c.rz;
    pens.forEach((holder, i) => {
      const p = penPose(open, i);
      holder.position.set(p.x, p.y, p.z);
      holder.rotation.set(p.tilt, p.a, 0);
    });
    const b = openBounds(open);
    stack.position.set(-b.cx, -b.cy, -b.cz);
    pivot.scale.setScalar(Math.min(1, fit / b.r));
    stage.style.setProperty('--open', smooth(open).toFixed(3));
  }

  // Valores do ecrã e do LED: tendem para o alvo em cada frame.
  const ledTarget = new THREE.Color(initial.color);
  const ledColor = new THREE.Color(initial.color);
  let tShow = initial.temp;
  let dShow = initial.days;
  let tGoal = initial.temp;
  let dGoal = initial.days;
  let lastKey = '';

  // Rotação livre nos 3 eixos, por quaternion (sem limites de ângulo).
  const euler = new THREE.Euler();
  const delta = new THREE.Quaternion();
  const q = new THREE.Quaternion().setFromEuler(euler.set(0, -1.5, 0));
  const home = new THREE.Quaternion().setFromEuler(euler.set(0.15, 0.55, 0));
  let px = 0;
  let py = 0;
  let tx = 0;
  let ty = 0;
  let lastX = 0;
  let lastY = 0;
  function spin(pitch: number, yaw: number): void {
    q.premultiply(delta.setFromEuler(euler.set(pitch, yaw, 0)));
  }

  const controller = new AbortController();
  const { signal } = controller;
  let lastDir = 0;
  let flips: number[] = [];
  let lastShake = 0;
  let travel = 0;

  canvas.addEventListener(
    'pointerdown',
    (e) => {
      dragging = true;
      goHome = false;
      lastX = e.clientX;
      lastY = e.clientY;
      vyaw = vpitch = 0;
      canvas.setPointerCapture(e.pointerId);
    },
    { signal },
  );
  canvas.addEventListener(
    'pointermove',
    (e) => {
      const r = canvas.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (!dragging) {
        return;
      }
      const mx = e.clientX - lastX;
      const my = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      spin(my * 0.01, mx * 0.01);
      vyaw = mx * 0.6;
      vpitch = my * 0.6;
      idle = 0;
      // Agitar: 2 inversões de direção (eixo dominante) em menos de 0,9 s abrem ou fecham a garrafa.
      // Só conta a inversão se o traço anterior tiver 14 px ou mais, para um arrasto lento não disparar.
      if (Math.hypot(mx, my) > 2) {
        const dir = Math.abs(mx) > Math.abs(my) ? Math.sign(mx) : 2 * Math.sign(my);
        const now = performance.now();
        if (lastDir !== 0 && dir === -lastDir) {
          if (travel >= 14) {
            flips = flips.filter((t0) => now - t0 < 900);
            flips.push(now);
            if (flips.length >= 2 && now - lastShake > 900) {
              lastShake = now;
              flips = [];
              dragging = false;
              toggleOpen();
            }
          }
          travel = 0;
        }
        travel += Math.hypot(mx, my);
        lastDir = dir;
      }
    },
    { signal },
  );
  const release = () => {
    dragging = false;
  };
  canvas.addEventListener('pointerup', release, { signal });
  canvas.addEventListener('pointercancel', release, { signal });
  canvas.addEventListener(
    'pointerleave',
    () => {
      px = py = 0;
    },
    { signal },
  );
  canvas.addEventListener(
    'dblclick',
    () => {
      goHome = true;
      vyaw = vpitch = 0;
    },
    { signal },
  );
  canvas.addEventListener(
    'keydown',
    (e) => {
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [0, -0.3],
        ArrowRight: [0, 0.3],
        ArrowUp: [-0.3, 0],
        ArrowDown: [0.3, 0],
      };
      const move = moves[e.key];
      if (move) {
        e.preventDefault();
        goHome = false;
        idle = 0;
        spin(move[0], move[1]);
      }
    },
    { signal },
  );

  function resize(): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) {
      return;
    }
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.9 ? 36 : 28;
    camera.updateProjectionMatrix();
    const halfH = camera.position.distanceTo(new THREE.Vector3(0, CAPTOP / 2, 0)) * Math.tan((camera.fov * Math.PI) / 360);
    fit = 0.86 * Math.min(halfH, halfH * camera.aspect);
    // O modelo fica dentro dos anéis (largura min(w, 1,3·h)) e longe das etiquetas TEMP e DIAS:
    // raio máximo = 32 % da largura dos anéis.
    fit = Math.min(fit, (halfH * 0.32 * Math.min(w, 1.3 * h)) / (h / 2));
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  let visible = true;
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
  });
  visibilityObserver.observe(canvas);

  let last = performance.now();
  let elapsed = 0;
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    if (!visible || document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;
    const k = (s: number) => 1 - Math.exp(-s * dt);

    if (goHome) {
      q.slerp(home, k(3));
    } else if (!dragging) {
      spin(vpitch * dt, vyaw * dt);
      const friction = Math.exp(-3 * dt);
      vyaw *= friction;
      vpitch *= friction;
      idle += dt;
      if (!reduceMotion && idle > 2.5) {
        spin(0, 0.25 * dt);
      }
    }
    q.normalize();
    pivot.quaternion.copy(q);
    layout(dt);
    tx += (px - tx) * k(4);
    ty += (py - ty) * k(4);
    tilt.rotation.x = 0.1 + ty * 0.12;
    tilt.rotation.z = -tx * 0.06;
    tilt.position.y = reduceMotion ? 0 : Math.sin(elapsed * 1.1) * 0.05;

    tShow += (tGoal - tShow) * k(9);
    dShow += (dGoal - dShow) * k(9);
    ledColor.lerp(ledTarget, k(6));
    const key2 = `${Math.round(tShow)}|${Math.round(dShow)}|${ledColor.getHexString()}|${daysUnit}`;
    if (key2 !== lastKey) {
      lastKey = key2;
      drawScreen(tShow, dShow, `#${ledColor.getHexString()}`);
    }
    const pulse = reduceMotion ? 1 : 0.85 + 0.15 * Math.sin(elapsed * 2.2);
    ledMat.emissive.copy(ledColor);
    ledMat.emissiveIntensity = 3 * pulse;
    haloMat.color.copy(ledColor);

    renderer.render(scene, camera);
  });

  return {
    setSim(sim) {
      tGoal = sim.temp;
      dGoal = sim.days;
      daysUnit = sim.daysUnit;
      ledTarget.set(sim.color);
    },
    dispose() {
      controller.abort();
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      // ponytail: liberta só as geometrias; materiais e texturas ficam para o GC, porque o modelo só desaparece ao sair da página.
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
        }
      });
      renderer.dispose();
    },
  };
}
