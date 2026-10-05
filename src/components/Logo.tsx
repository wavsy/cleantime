type Props = { className?: string; inverted?: boolean };

// The mark is a clothes hanger drawn like clock hands inside a soap bubble:
// "clean" and "time" in one shape.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <rect width="64" height="64" rx="18" fill="#0b1b2b" />
      <circle cx="32" cy="32" r="23" stroke="#35d6d0" strokeOpacity="0.28" strokeWidth="2" />
      <path
        d="M14.5 21.5a23 23 0 0 1 9-9.6"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <g
        className="logo-hanger"
        stroke="#35d6d0"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M32 31v-4.5a4.6 4.6 0 1 0-4.6-4.6" />
        <path d="M32 31 16.6 40.4c-2.2 1.4-1.3 4.6 1.3 4.6h28.2c2.6 0 3.5-3.2 1.3-4.6L32 31Z" />
      </g>
      <path
        d="M49 12.5l1.2 3.3 3.3 1.2-3.3 1.2-1.2 3.3-1.2-3.3-3.3-1.2 3.3-1.2 1.2-3.3Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function Logo({ className = "", inverted = false }: Props) {
  return (
    <span className={`logo flex items-center gap-2.5 ${className}`}>
      <LogoMark className="size-9 shrink-0" />
      <span className="font-display text-lg font-bold tracking-tight">
        Clean
        <span className={inverted ? "text-aqua" : "text-aqua-deep"}>Time</span>
      </span>
    </span>
  );
}
