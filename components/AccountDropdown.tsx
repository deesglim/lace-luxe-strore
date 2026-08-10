"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SignOutButton from "@/components/SignOutButton";

function AccountGlyph() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.2-3.8 4.2-6 7-6s5.8 2.2 7 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The dropdown panel always sits on its own solid ivory card, regardless
// of the header's current state — but it's still a DOM descendant of the
// header's icon row, which (while the homepage hero is showing through a
// transparent header) applies a `[&_a]:text-ivory [&_button]:text-ivory`
// override to every nested link/button so the icons stay legible against
// the hero image. That override was winning over this menu's own
// text-charcoal at rest (only losing to it on :hover, where the hover
// variant's higher specificity took over) — ivory text on an ivory card
// is invisible until hovered. `!` makes these colors unconditional so the
// menu is always readable no matter what state the header is in.
const menuItemClass =
  "block w-full px-5 py-3 text-left font-sans text-sm !text-charcoal transition hover:bg-blush/20 hover:!text-espresso";

export default function AccountDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="My Account"
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex h-10 w-10 items-center justify-center rounded-md border transition ${
          open
            ? "border-bronze text-bronze"
            : "border-charcoal/15 text-espresso hover:border-bronze hover:text-bronze"
        }`}
      >
        <AccountGlyph />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-48 origin-top-right overflow-hidden rounded-md border border-blush bg-ivory shadow-2xl">
          <Link href="/account" onClick={() => setOpen(false)} className={menuItemClass}>
            Profile
          </Link>
          <Link
            href="/account/orders"
            onClick={() => setOpen(false)}
            className={`border-t !border-blush ${menuItemClass}`}
          >
            Orders
          </Link>
          <div className="border-t border-blush">
            <SignOutButton className={menuItemClass} />
          </div>
        </div>
      )}
    </div>
  );
}
