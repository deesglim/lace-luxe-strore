// Same "hand-drawn, no icon library" convention as TrustBadges — simplified
// monoline glyphs standing in for each platform rather than exact brand
// marks. Shared between the footer and the Contact page's "Reach us
// directly" section so both stay in sync if a link ever changes.
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

function FacebookIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-5 w-5">
      <circle cx="10" cy="10" r="7.2" />
      <path d="M11.6 6.5h-1.2c-.9 0-1.4.5-1.4 1.4V9.3H11l-.3 2H9V16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-5 w-5">
      <path
        d="M10 3a6.5 6.5 0 0 0-5.6 9.8L3.5 16.5l3.9-1A6.5 6.5 0 1 0 10 3Z"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M7 8.8c.2 2.1 2.1 4 4.2 4.2" strokeLinecap="round" />
    </svg>
  );
}

export const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/lace_luxebydee?igsh=emVyMWtvOTVlbTJt&utm_source=qr",
    Icon: InstagramIcon,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@deesglim?_r=1&_t=ZS-98kg667bgtJ",
    Icon: TikTokIcon,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1CYP1vjseK/?mibextid=wwXIfr",
    Icon: FacebookIcon,
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/2349164913966?text=Hi%2C%20I%E2%80%99m%20trying%20to%20make%20a%20purchase%20on%20the%20website%20but%20I%E2%80%99d%20love%20to%20make%20an%20enquiry%20before%20I%20go%20ahead.",
    Icon: WhatsAppIcon,
  },
];
