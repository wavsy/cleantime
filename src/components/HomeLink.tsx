"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { POP_ALL_EVENT } from "@/lib/events";
import { LogoMark } from "./Logo";

type Props = { href: string; label: string; children: ReactNode };

// The logo link. Instead of reloading the page it "washes" it: a dark wave
// grows out of the logo, the page jumps to the top underneath, the wave
// lifts away and every bubble in the hero pops.
export function HomeLink({ href, label, children }: Props) {
  const [phase, setPhase] = useState<"cover" | "reveal" | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab and so on) behave normally.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (phase) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: rect.left + rect.height / 2,
      y: rect.top + rect.height / 2,
    });
    setPhase("cover");
    timers.current = [
      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
        setPhase("reveal");
      }, 620),
      window.setTimeout(
        () => window.dispatchEvent(new Event(POP_ALL_EVENT)),
        900,
      ),
      window.setTimeout(() => setPhase(null), 1450),
    ];
  };

  return (
    <>
      <a href={href} aria-label={label} onClick={onClick}>
        {children}
      </a>
      {phase &&
        createPortal(
          <div
            aria-hidden
            className={`wash wash-${phase}`}
            style={
              {
                "--x": `${origin.x}px`,
                "--y": `${origin.y}px`,
              } as React.CSSProperties
            }
          >
            <div className="wash-logo">
              <LogoMark className="size-28" />
              <span className="wash-ring" />
              <span className="wash-ring wash-ring-late" />
            </div>
            <svg
              className="wash-wave"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
            >
              <path
                fill="#35d6d0"
                d="M0 0h1440v38c-120 44-240 44-360 12S840 6 720 38 480 94 360 62 120 18 0 50Z"
              />
              <path
                fill="#0b1b2b"
                d="M0 0h1440v22c-120 40-240 40-360 10S840-8 720 22 480 72 360 42 120 2 0 32Z"
              />
            </svg>
          </div>,
          document.body,
        )}
    </>
  );
}
