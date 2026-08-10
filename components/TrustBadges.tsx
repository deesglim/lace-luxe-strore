// Minimal hand-drawn line icons — no icon library in this project (see
// the plain-unicode buttons elsewhere, e.g. CartLineItem's +/− controls),
// so these follow the same "just write the markup" convention.
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <path
        d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <path d="M3 6h11v9H3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 10h4l3 3v2h-7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="17" r="1.6" />
      <circle cx="17.5" cy="17" r="1.6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <rect x="5" y="11" width="14" height="9" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <path
        d="M12 20s-7-4.35-9.5-8.5C1 8.5 2.5 5 6 5c2 0 3.5 1.2 4 2.5.5-1.3 2-2.5 4-2.5 3.5 0 5 3.5 3.5 6.5C19 15.65 12 20 12 20z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const badges = [
  { Icon: ShieldIcon, label: "Premium Quality Guaranteed" },
  { Icon: TruckIcon, label: "Fast Shipping" },
  { Icon: LockIcon, label: "Secure Payments" },
  { Icon: HeartIcon, label: "1000+ Happy Customers" },
];

// Lives inside SiteFooter now (site-wide, every page) rather than as its
// own mid-page section — just the row itself, styled for the footer's dark
// espresso background. The footer controls the surrounding spacing so it
// sits flush with no extra gap of its own.
export default function TrustBadges() {
  return (
    <div className="grid w-full grid-cols-4 gap-2 sm:gap-4 lg:gap-8">
      {/*
        Always a 4-column row, at every breakpoint — never wraps/stacks.
        Icon size, text size, and gaps shrink progressively on narrower
        screens instead, same approach as the footer's link-row fix.
      */}
      {badges.map(({ Icon, label }) => (
        <div key={label} className="flex min-w-0 flex-col items-center gap-1.5 text-center sm:gap-3">
          <span className="text-bronze [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5 lg:[&>svg]:h-6 lg:[&>svg]:w-6">
            <Icon />
          </span>
          <p className="line-clamp-2 font-sans text-[9px] uppercase leading-tight tracking-[0.1em] text-ivory/70 sm:text-[10px] sm:tracking-[0.15em] lg:text-xs">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
