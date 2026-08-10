"use client";

import { useState, type FormEvent } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!response.ok) {
        setResult({ ok: false, message: "Something went wrong. Please try again." });
        return;
      }

      const data: { alreadySubscribed: boolean } = await response.json();
      if (data.alreadySubscribed) {
        setResult({ ok: false, message: "You're already subscribed!" });
        return;
      }

      setResult({ ok: true, message: "You're on the list! Watch your inbox for updates." });
      setEmail("");
    } catch {
      setResult({ ok: false, message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-blush bg-ivory py-section md:py-section-md lg:py-section-lg">
      <div className="mx-auto w-full max-w-content px-6 sm:px-12">
        {/* Contained, bordered card — same "banner floating on the page"
            treatment as OffersTeaser's Buy More & Save More strip — so this
            reads as its own distinct section rather than fusing with the
            (also-espresso) footer directly below it. */}
        <div className="relative overflow-hidden rounded-md bg-espresso px-6 py-10 sm:px-10 sm:py-14">
          {/* Soft bronze/blush glows — purely decorative, sit behind the content */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bronze/25 blur-[110px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 h-[280px] w-[280px] translate-x-1/3 translate-y-1/3 rounded-full bg-blush/10 blur-[90px]"
          />

          <div className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-4 text-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              aria-hidden
              className="text-bronze"
            >
              <path
                d="M12 20.2s-7.6-4.5-10-9C.4 7.8 2 4 5.8 4c2 0 3.6 1.1 4.2 2.6C10.6 5.1 12.2 4 14.2 4 18 4 19.6 7.8 18 11.2c-2.4 4.5-6 9-6 9Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-center font-heading text-2xl font-medium text-ivory sm:text-3xl">
              Join The Lace Girlies Community
            </h2>
            <p className="whitespace-nowrap font-sans text-[10px] text-ivory/70 sm:text-xs">
              Be the first to hear about new arrivals, restocks, and exclusive offers.
            </p>
            {/* Single merged capsule at every breakpoint — the button is
                always docked inside the pill's right edge, just scaled down
                on mobile, rather than becoming a separate stacked button. */}
            <form
              onSubmit={handleSubmit}
              className="mt-1 flex w-full items-center rounded-full border border-ivory/20 bg-ivory/5 p-1 backdrop-blur-sm sm:p-1.5"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="h-11 min-w-0 flex-1 rounded-full border-0 bg-transparent px-4 font-sans text-sm text-ivory placeholder:text-ivory/40 focus:outline-none sm:h-12 sm:px-6"
              />
              <button
                type="submit"
                disabled={submitting}
                className="h-11 shrink-0 rounded-full bg-bronze px-5 font-sans text-xs font-semibold uppercase tracking-brand text-ivory transition hover:bg-bronze/90 disabled:opacity-50 sm:h-12 sm:px-8 sm:text-sm"
              >
                {submitting ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
            {result && (
              <p className={`font-sans text-xs ${result.ok ? "text-ivory" : "text-blush"}`}>
                {result.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
