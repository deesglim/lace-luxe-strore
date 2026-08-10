"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import AnnouncementRotator from "@/components/AnnouncementRotator";

type NavLink = { href: string; label: string };
type Announcement = { id: string; text: string };

function SearchGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

// Homepage: fixed, so it never reserves flow space — HomeHero sits at the
// true top of the document and the header floats transparently over it via
// z-index, with no negative margins involved anywhere. Every other page:
// sticky, reserving its own height normally (unchanged, zero regression —
// those pages' own top padding was already sized for a header that takes
// up real flow space). Because isHome never changes mid-scroll (only on
// navigation), this never toggles position type while the page is static,
// so there's no layout jump — only the background/text color transitions.
export default function HeaderChrome({
  navLinks,
  accountSlot,
  announcements,
}: {
  navLinks: NavLink[];
  accountSlot: ReactNode;
  announcements: Announcement[];
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isHome) return;
    function onScroll() {
      setScrolled(window.scrollY > 16);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={`${isHome ? "fixed" : "sticky"} inset-x-0 top-0 z-40 transition-colors duration-300 ${
        transparent
          ? "bg-transparent"
          : "border-b border-blush bg-ivory shadow-sm"
      }`}
    >
      <AnnouncementRotator messages={announcements.map((a) => a.text)} />

      <div className="mx-auto flex h-[72px] max-w-page items-center justify-between px-6 lg:h-[88px] lg:px-[60px]">
        <Link
          href="/"
          className={`font-logo text-lg font-semibold transition-colors md:text-xl ${
            transparent ? "text-ivory" : "text-espresso"
          }`}
        >
          Lace Luxe <span className="text-bronze">by Dee</span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-label text-nav font-medium uppercase tracking-nav transition-colors ${
                transparent
                  ? "text-ivory/90 hover:text-ivory"
                  : "text-charcoal hover:text-bronze"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div
          className={`flex items-center gap-1 ${
            transparent
              ? "[&_a]:border-ivory/40 [&_a]:text-ivory [&_a:hover]:border-ivory [&_button]:border-ivory/40 [&_button]:text-ivory [&_button:hover]:border-ivory"
              : ""
          }`}
        >
          {/* Fixed-size slot (matches the closed button's own footprint)
              so this element's contribution to the flex row's width never
              changes — the expanded input is absolutely positioned and
              overlays leftward instead of growing the row, which is what
              was pushing the logo/nav/icons out of place. */}
          <div className="relative h-10 w-10 shrink-0">
            {searchOpen ? (
              <form action="/shop" method="GET" className="absolute right-0 top-0 z-10">
                <input
                  ref={searchInputRef}
                  type="text"
                  name="search"
                  placeholder="Search…"
                  onBlur={() => setSearchOpen(false)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setSearchOpen(false);
                  }}
                  className="h-10 w-[140px] rounded-md border border-charcoal/15 bg-ivory px-3 font-sans text-sm text-charcoal shadow-md transition focus:border-espresso focus:outline-none sm:w-[220px]"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search products"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-charcoal/15 text-espresso transition hover:border-bronze hover:text-bronze"
              >
                <SearchGlyph />
              </button>
            )}
          </div>
          {accountSlot}
        </div>
      </div>
    </header>
  );
}
