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

export default function TrustBadges() {
  return (
    <section className="border-t border-blush py-section md:py-section-md lg:py-section-lg">
      <div className="mx-auto grid w-full max-w-content grid-cols-2 gap-8 px-6 sm:grid-cols-4 sm:px-12">
        {badges.map(({ Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-3 text-center">
            <span className="text-bronze">
              <Icon />
            </span>
            <p className="font-sans text-xs uppercase tracking-[0.15em] text-charcoal/70">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
