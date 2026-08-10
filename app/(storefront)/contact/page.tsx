import ContactForm from "@/components/ContactForm";
import { socialLinks } from "@/components/SocialLinks";

const CONTACT_EMAIL = "deesglimorders@gmail.com";

function EmailIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-5 w-5">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
      <path d="M3 5.5l7 5.5 7-5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-ivory px-6 py-20">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-12 text-center">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
            Get in Touch
          </span>
          <h1 className="mt-3 font-heading text-4xl font-medium text-espresso sm:text-5xl">
            Contact <span className="italic text-bronze">Us</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md font-sans text-sm text-charcoal/70">
            Questions about an order, a piece, or just want to say hi? Send us
            a message — we&apos;d love to hear from you.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <ContactForm />

          <div className="flex flex-col gap-6 rounded-2xl border border-blush bg-blush/10 p-6">
            <div>
              <p className="font-heading text-lg text-espresso">Reach us directly</p>
              <p className="font-sans text-sm text-charcoal/60">
                Prefer social or email? We&apos;re there too.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-sans text-sm text-charcoal transition hover:text-bronze"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-charcoal/15 text-espresso">
                    <Icon />
                  </span>
                  {name}
                </a>
              ))}

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-3 font-sans text-sm text-charcoal transition hover:text-bronze"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-charcoal/15 text-espresso">
                  <EmailIcon />
                </span>
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
