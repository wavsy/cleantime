"use client";

import { useState, type ReactNode } from "react";

type Props = {
  before: ReactNode;
  after: ReactNode;
  beforeLabel: string;
  afterLabel: string;
  sliderLabel: string;
};

export function BeforeAfter({
  before,
  after,
  beforeLabel,
  afterLabel,
  sliderLabel,
}: Props) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl select-none sm:aspect-[16/9]">
      <div className="absolute inset-0">{after}</div>
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {before}
      </div>

      <span className="absolute top-4 left-4 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-foam">
        {beforeLabel}
      </span>
      <span className="absolute top-4 right-4 rounded-full bg-foam/90 px-3 py-1 text-xs font-medium text-ink">
        {afterLabel}
      </span>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-foam shadow-[0_0_0_1px_rgb(11_27_43/0.15)]"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-foam text-ink shadow-lg">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M7 5l-4 5 4 5M13 5l4 5-4 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label={sliderLabel}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
