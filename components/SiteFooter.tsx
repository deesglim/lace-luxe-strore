import Link from "next/link";
import { socialLinks } from "@/components/SocialLinks";

const quickLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/our-story", label: "Our Story" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/contact", label: "Contact Us" },
];

const policyLinks = [
  { href: "/shipping-info", label: "Shipping Information" },
  { href: "/returns-refunds", label: "Returns & Refunds" },
  { href: "/faq", label: "FAQ" },
  { href: "/terms-conditions", label: "Terms & Conditions" },
];

// Same address used on the Contact page's "Reach us directly" panel, and
// the same WhatsApp number encoded in SocialLinks' wa.me link.
const CONTACT_EMAIL = "deesglimorders@gmail.com";
const CONTACT_PHONE_DISPLAY = "+234 916 491 3966";
const CONTACT_PHONE_TEL = "+2349164913966";

function FooterColumnHeading({ children }: { children: string }) {
  return (
    <span className="font-sans text-[10px] font-medium uppercase tracking-brand text-bronze sm:text-xs md:text-nav">
      {children}
    </span>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-espresso text-ivory">
      <div className="mx-auto w-full max-w-page px-6 py-section sm:px-12 md:py-section-md lg:py-section-lg">
        {/*
          Always a 4-column row, at every breakpoint — never stacks, never
          scrolls. Text/icon size and gaps shrink progressively on narrower
          screens instead, so all four columns stay on screen without
          horizontal overflow.
        */}
        <div className="grid grid-cols-4 gap-2 text-left sm:gap-4 md:gap-6 lg:gap-10">
          <div className="flex min-w-0 flex-col items-start gap-1.5 sm:gap-3">
            <Link
              href="/"
              className="font-logo text-sm font-semibold text-ivory sm:text-lg md:text-2xl"
            >
              Lace Luxe <span className="text-bronze">by Dee</span>
            </Link>
            <p className="font-sans text-[10px] text-ivory/60 sm:text-xs md:text-sm">
              Port Harcourt, Rivers State, Nigeria
            </p>
            <div className="flex gap-1.5 sm:gap-3">
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="text-ivory/70 transition hover:text-bronze [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-4 sm:[&>svg]:w-4 md:[&>svg]:h-5 md:[&>svg]:w-5"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <nav className="flex min-w-0 flex-col items-start gap-1.5 sm:gap-3">
            <FooterColumnHeading>Quick Links</FooterColumnHeading>
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[10px] text-ivory/70 transition hover:text-ivory sm:text-xs md:text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <nav className="flex min-w-0 flex-col items-start gap-1.5 sm:gap-3">
            <FooterColumnHeading>Policies</FooterColumnHeading>
            {policyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[10px] text-ivory/70 transition hover:text-ivory sm:text-xs md:text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex min-w-0 flex-col items-start gap-1.5 sm:gap-3">
            <FooterColumnHeading>Contact</FooterColumnHeading>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="break-words font-sans text-[10px] text-ivory/70 transition hover:text-ivory sm:text-xs md:text-sm"
            >
              {CONTACT_EMAIL}
            </a>
            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className="font-sans text-[10px] text-ivory/70 transition hover:text-ivory sm:text-xs md:text-sm"
            >
              {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
        </div>

        <p className="mt-12 text-center font-sans text-xs text-ivory/40 lg:mt-16">
          © {new Date().getFullYear()} Lace Luxe by Dee. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
