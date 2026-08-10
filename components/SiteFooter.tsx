import Link from "next/link";
import { socialLinks } from "@/components/SocialLinks";
import TrustBadges from "@/components/TrustBadges";

const customerCareLinks = [
  { href: "/shipping-info", label: "Shipping Information" },
  { href: "/returns-refunds", label: "Returns & Refunds" },
  { href: "/faq", label: "FAQs" },
  { href: "/terms-conditions", label: "Terms & Conditions" },
];

// Category links only — Wholesale stays fully removed site-wide, so it
// never appears here even though it once did.
const shopLinks = [
  { href: `/shop?type=${encodeURIComponent("HD Lace")}`, label: "HD Lace" },
  { href: `/shop?type=${encodeURIComponent("Swiss Lace")}`, label: "Swiss Lace" },
];

// Same address used on the Contact page's "Reach us directly" panel; the
// WhatsApp/Instagram links are pulled from SocialLinks so both stay in
// sync if either ever changes.
const CONTACT_EMAIL = "deesglimorders@gmail.com";
const whatsappLink = socialLinks.find((link) => link.name === "WhatsApp")!;
const instagramLink = socialLinks.find((link) => link.name === "Instagram")!;

const contactLinks = [
  { key: "whatsapp", href: whatsappLink.href, label: "WhatsApp", external: true },
  { key: "email", href: `mailto:${CONTACT_EMAIL}`, label: "Email", external: false },
  { key: "instagram", href: instagramLink.href, label: "Instagram", external: true },
];

function FooterColumnHeading({ children }: { children: string }) {
  return (
    <span className="font-label text-[10px] font-medium uppercase tracking-label text-bronze sm:text-xs md:text-nav">
      {children}
    </span>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-espresso text-ivory">
      <div className="mx-auto w-full max-w-page px-6 pt-[56px] pb-[40px] lg:px-[60px] lg:pt-[64px]">
        <TrustBadges />

        {/*
          Always a 4-column row, at every breakpoint — never stacks, never
          scrolls. Text/icon size and gaps shrink progressively on narrower
          screens instead, so all four columns stay on screen without
          horizontal overflow.
        */}
        <div className="mt-8 grid grid-cols-4 gap-1 border-t border-ivory/10 pt-8 text-left sm:mt-10 sm:gap-2 sm:pt-10 md:gap-3 lg:gap-5">
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
            <FooterColumnHeading>Customer Care</FooterColumnHeading>
            {customerCareLinks.map((link) => (
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
            <FooterColumnHeading>Shop</FooterColumnHeading>
            {shopLinks.map((link) => (
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
            {contactLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="break-words font-sans text-[10px] text-ivory/70 transition hover:text-ivory sm:text-xs md:text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <p className="mt-12 text-center font-sans text-xs text-ivory/40 lg:mt-16">
          © {new Date().getFullYear()} Lace Luxe by Dee. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
