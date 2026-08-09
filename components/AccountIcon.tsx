import Link from "next/link";

export default function AccountIcon({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <Link
      href={isLoggedIn ? "/account" : "/login"}
      aria-label={isLoggedIn ? "My Account" : "Log in"}
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
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.2-3.8 4.2-6 7-6s5.8 2.2 7 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
