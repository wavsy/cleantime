"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  label: string;
  items: { href: string; label: string }[];
  phones: { href: string; label: string }[];
};

export function MobileMenu({ label, items, phones }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-expanded={open}
        className="relative grid size-10 place-items-center rounded-full bg-ink text-foam"
      >
        <span className={`burger ${open ? "burger-open" : ""}`} aria-hidden />
      </button>

      {/* Portalled to <body>: the header's backdrop blur would otherwise trap
          a fixed overlay inside the header itself. */}
      {open &&
        createPortal(
          <div className="fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col bg-ink px-6 md:hidden pt-10 pb-10 text-foam">
            <nav className="flex flex-col gap-1 [perspective:800px]">
              {items.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${i * 70}ms` }}
                  className="menu-link border-b border-foam/10 py-4 font-display text-3xl font-bold"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              {phones.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="rounded-full bg-aqua py-4 text-center font-semibold text-ink"
                >
                  {phone.label}
                </a>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
