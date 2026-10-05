"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type LinkItem = { href: string; label: string };

type Props = {
  label: string;
  items: LinkItem[];
  phones: LinkItem[];
  extra?: LinkItem[];
};

export function MobileMenu({ label, items, phones, extra = [] }: Props) {
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
          a fixed overlay inside the header itself. It scrolls on its own, so
          every button stays reachable on short screens. */}
      {open &&
        createPortal(
          <div className="menu-sheet fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col gap-8 overflow-y-auto overscroll-contain bg-ink px-6 pt-4 text-foam md:hidden">
            <nav className="flex flex-col [perspective:800px]">
              {items.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="menu-link flex items-center justify-between border-b border-foam/10 py-4 font-display text-2xl font-bold"
                >
                  {item.label}
                  <span aria-hidden className="text-aqua">
                    →
                  </span>
                </a>
              ))}
            </nav>

            <div className="mt-auto grid grid-cols-2 gap-2.5">
              {phones.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="rounded-full bg-aqua px-2 py-3.5 text-center text-sm font-semibold text-ink"
                >
                  {phone.label}
                </a>
              ))}
              {extra.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-foam/25 px-2 py-3.5 text-center text-sm font-semibold"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
