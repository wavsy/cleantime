import {
  PMREMGenerator,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type Pointer = { x: number; y: number; active: boolean };

export type Stage = {
  scene: Scene;
  camera: PerspectiveCamera;
  pointer: Pointer;
  /** How far the canvas is from the middle of the screen: -1 above, 1 below. */
  scroll: { value: number };
  /** Calls `handler` with pointer coordinates when the canvas is tapped. */
  onTap(handler: (x: number, y: number) => void): void;
  /** Runs `frame` every animation frame while the canvas is on screen. */
  run(frame: (time: number, delta: number) => void): void;
  onResize(handler: () => void): void;
  dispose(): void;
};

// Shared plumbing for every 3D scene on the page: renderer, studio lighting,
// pointer tracking, resizing, and pausing while off screen.
export function createStage(canvas: HTMLCanvasElement, cameraZ: number): Stage {
  const host = canvas.parentElement!;
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new PerspectiveCamera(40, 1, 0.1, 60);
  camera.position.z = cameraZ;

  const pointer: Pointer = { x: 0, y: 0, active: false };
  const onPointerMove = (e: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointer.active = Math.abs(pointer.x) <= 1 && Math.abs(pointer.y) <= 1;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  // A finger leaves no hover behind, so let the scene settle when it lifts.
  const onPointerEnd = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return;
    pointer.x = 0;
    pointer.y = 0;
    pointer.active = false;
  };
  window.addEventListener("pointerup", onPointerEnd, { passive: true });
  window.addEventListener("pointercancel", onPointerEnd, { passive: true });

  const tapHandlers: ((x: number, y: number) => void)[] = [];
  const onPointerDown = (e: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    if (Math.abs(x) > 1 || Math.abs(y) > 1) return;
    for (const handler of tapHandlers) handler(x, y);
  };
  window.addEventListener("pointerdown", onPointerDown, { passive: true });

  const scroll = { value: 0 };

  const resizeHandlers: (() => void)[] = [];
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    for (const handler of resizeHandlers) handler();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(host);

  let raf = 0;

  return {
    scene,
    camera,
    pointer,
    scroll,
    onTap(handler) {
      tapHandlers.push(handler);
    },
    run(frame) {
      let last = performance.now();
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        if (!visible || document.hidden) {
          last = now;
          return;
        }
        const delta = Math.min((now - last) / 1000, 0.05);
        last = now;
        const rect = host.getBoundingClientRect();
        scroll.value = Math.max(
          -1.5,
          Math.min(1.5, (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight),
        );
        frame(now / 1000, delta);
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);
    },
    onResize(handler) {
      resizeHandlers.push(handler);
      handler();
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
      window.removeEventListener("pointerdown", onPointerDown);
      resizeObserver.disconnect();
      io.disconnect();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
