"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not send your message. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Could not send your message. Please try again.");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-blush bg-blush/20 px-6 py-10 text-center">
        <p className="font-heading text-xl text-espresso">Thanks! We&apos;ll get back to you soon.</p>
        <p className="font-sans text-sm text-charcoal/70">
          We usually reply within a day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-blush bg-ivory p-6 shadow-sm"
    >
      <div>
        <p className="font-heading text-lg text-espresso">Send us a message</p>
        <p className="font-sans text-sm text-charcoal/60">
          We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-xl border border-charcoal/15 bg-blush/10 px-4 py-3 font-sans text-sm text-charcoal placeholder:text-charcoal/40 focus:border-espresso focus:outline-none"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="rounded-xl border border-charcoal/15 bg-blush/10 px-4 py-3 font-sans text-sm text-charcoal placeholder:text-charcoal/40 focus:border-espresso focus:outline-none"
        />
      </div>

      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here…"
        rows={5}
        className="rounded-xl border border-charcoal/15 bg-blush/10 px-4 py-3 font-sans text-sm text-charcoal placeholder:text-charcoal/40 focus:border-espresso focus:outline-none"
      />

      {error && <p className="font-sans text-xs text-bronze">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="self-end rounded-full bg-espresso px-8 py-3 font-sans text-sm uppercase tracking-[0.2em] text-ivory transition hover:bg-espresso/90 disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
