type Props = { className?: string; inverted?: boolean };

// "Hanger Home": the shoulders of a clothes hanger are the roof of a house,
// for the shop's headline promise of pickup and delivery at the door.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <rect width="64" height="64" rx="18" fill="#0b1b2b" />
      <path
        d="M15.5 41.5v11h33v-11"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        className="logo-hanger"
        d="M8.5 38.5 32 22.5l23.5 16M32 22.5v-4.2a5.6 5.6 0 1 0-5.6-5.6"
        stroke="#35d6d0"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className = "", inverted = false }: Props) {
  return (
    <span className={`logo flex items-center gap-2.5 ${className}`}>
      <LogoMark className="size-9 shrink-0" />
      {/* The name is dropped on the very narrowest phones so the menu fits. */}
      <span className="font-display text-lg font-bold tracking-tight max-[350px]:hidden">
        Clean
        <span className={inverted ? "text-aqua" : "text-aqua-deep"}>Time</span>
      </span>
    </span>
  );
}
