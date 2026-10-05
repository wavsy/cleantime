"use client";

import { useEffect, useRef, useState } from "react";

const scenes = {
  bubbles: () => import("./three/bubbles"),
  hanger: () => import("./three/hanger"),
};

type Props = { scene: keyof typeof scenes; className?: string };

// Decorative 3D canvas. The scene code is loaded after first paint so the
// heading and buttons never wait for WebGL.
export function Scene3D({ scene, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stop: (() => void) | undefined;
    let cancelled = false;

    const load = () => {
      scenes[scene]()
        .then(({ start }) => {
          if (cancelled) return;
          stop = start(canvas);
          setReady(true);
        })
        .catch(() => {
          // No WebGL: the page simply stays without the 3D scene.
        });
    };

    const hasIdle = typeof window.requestIdleCallback === "function";
    const handle = hasIdle
      ? window.requestIdleCallback(load, { timeout: 2000 })
      : window.setTimeout(load, 600);

    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      stop?.();
    };
  }, [scene]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      } ${className}`}
    />
  );
}
