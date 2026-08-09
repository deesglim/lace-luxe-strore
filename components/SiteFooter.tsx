import Link from "next/link";

// Same "hand-drawn, no icon library" convention as TrustBadges — simplified
// monoline glyphs standing in for each platform rather than exact brand
// marks.
function InstagramIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-5 w-5">
      <rect x="3" y="3" width="14" height="14" rx="4" />
      <circle cx="10" cy="10" r="3.2" />
      <circle cx="14.2" cy="5.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-5 w-5">
      <circle cx="8.5" cy="13.5" r="3" />
      <path d="M11.5 3v10.5" strokeLinecap="round" />
      <path d="M11.5 3c0 2.7 2 4.7 4.5 4.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-5 w-5">
      <rect x="2.5" y="5" width="15" height="10" rx="3" />
      <path d="M8.5 8l4 2-4 2V8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-5 w-5">
      <circle cx="10" cy="10" r="7.2" />
      <path d="M11.6 6.5h-1.2c-.9 0-1.4.5-1.4 1.4V9.3H11l-.3 2H9V16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Placeholders — swap for the real profile URLs when available.
const socialLinks = [
  { name: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { name: "TikTok", href: "https://tiktok.com", Icon: TikTokIcon },
  { name: "YouTube", href: "https://youtube.com", Icon: YouTubeIcon },
  { name: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
];

const quickLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/our-story", label: "Our Story" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/contact", label: "Contact Us" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-espresso px-6 py-12 sm:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <Link href="/" className="font-heading text-xl italic text-ivory">
            Lace Luxe <span className="text-bronze">by Dee</span>
          </Link>
          <p className="font-sans text-xs text-ivory/60">
            Port Harcourt, Rivers State, Nigeria
          </p>
          <div className="flex gap-3">
            {socialLinks.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="text-ivory/70 transition hover:text-bronze"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <nav className="flex flex-col items-center gap-2 sm:items-start">
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-bronze">
            Quick Links
          </span>
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-sm text-ivory/70 transition hover:text-ivory"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="mt-10 text-center font-sans text-xs text-ivory/40">
        © {new Date().getFullYear()} Lace Luxe by Dee. All rights reserved.
      </p>
    </footer>
  );
}
