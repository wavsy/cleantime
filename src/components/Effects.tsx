"use client";

import { useEffect, useRef } from "react";

// Page-wide motion: the scroll progress bar and the 3D reveal of `.reveal`
// elements. Elements are only hidden after hydration and only when they are
// below the fold, so nothing is invisible on first paint.
export function Effects() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar?.style.setProperty("--progress", String(max > 0 ? window.scrollY / max : 0));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let io: IntersectionObserver | undefined;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.remove("reveal-pre");
            io?.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -8% 0px" },
      );
      for (const el of document.querySelectorAll<HTMLElement>(".reveal")) {
        if (el.getBoundingClientRect().top < window.innerHeight) continue;
        const index = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
        el.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
        el.classList.add("reveal-pre");
        io.observe(el);
      }
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  return <div ref={barRef} aria-hidden className="scroll-progress" />;
}
