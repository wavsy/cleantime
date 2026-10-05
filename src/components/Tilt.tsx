"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  max?: number;
};

// Tilts its content in 3D: toward the mouse on desktop, toward the finger
// while pressed on touch screens. Scrolling is never blocked.
export function Tilt({ children, className = "", max = 9 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const tiltTo = (e: PointerEvent<HTMLDivElement>, strength: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--ry", `${(x - 0.5) * 2 * strength}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 2 * strength}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
    el.style.setProperty("--glare", "1");
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--glare", "0");
  };

  return (
    <div
      ref={ref}
      onPointerMove={(e) => e.pointerType === "mouse" && tiltTo(e, max)}
      onPointerDown={(e) => e.pointerType !== "mouse" && tiltTo(e, max * 1.4)}
      onPointerUp={reset}
      onPointerCancel={reset}
      onPointerLeave={reset}
      className={`tilt ${className}`}
    >
      {children}
      <span aria-hidden className="tilt-glare" />
    </div>
  );
}
