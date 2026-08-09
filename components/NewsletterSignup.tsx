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
    <section className="border-t border-blush bg-blush/20 py-16">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-6 text-center">
        <h2 className="font-heading text-2xl text-espresso">Stay in the Loop</h2>
        <p className="font-sans text-sm text-charcoal/70">
          Be the first to hear about new arrivals, restocks, and exclusive offers.
        </p>
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 rounded-md border border-charcoal/20 bg-ivory px-4 py-3 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 rounded-md bg-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-ivory transition hover:bg-espresso/90 disabled:opacity-50"
          >
            {submitting ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
        {result && (
          <p
            className={`font-sans text-xs ${result.ok ? "text-espresso" : "text-bronze"}`}
          >
            {result.message}
          </p>
        )}
      </div>
    </section>
  );
}
