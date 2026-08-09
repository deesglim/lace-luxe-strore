"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type NavLink = { href: string; label: string };

export default function MobileNav({ links }: { links: NavLink[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-md border border-charcoal/15 text-espresso transition hover:border-bronze hover:text-bronze"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      {mounted &&
        createPortal(
          <>
            <div
              onClick={() => setIsOpen(false)}
              aria-hidden
              className={`fixed inset-0 z-[100] bg-charcoal/50 transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />
            <aside
              aria-hidden={!isOpen}
              style={{ maxWidth: 320 }}
              className={`fixed inset-y-0 left-0 z-[110] flex w-full max-w-[320px] flex-col bg-ivory shadow-2xl transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between border-b border-blush px-6 py-5">
                <span className="font-heading text-lg italic text-espresso">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-md text-charcoal/60 transition hover:bg-blush/50 hover:text-espresso"
                >
                  ✕
                </button>
              </div>
              <nav className="flex flex-col gap-1 px-4 py-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="rounded-md px-2 py-3 font-sans text-sm uppercase tracking-[0.15em] text-charcoal transition hover:bg-bronze/5 hover:text-bronze"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </aside>
          </>,
          document.body,
        )}
    </div>
  );
}
