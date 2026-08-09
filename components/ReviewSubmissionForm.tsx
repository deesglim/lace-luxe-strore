"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ReviewSubmissionForm({ productId }: { productId: string }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  // Honeypot — real visitors never see or fill this field (see the
  // off-screen styling below); a filled value means it's a bot.
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (website) {
      // Bot caught by the honeypot — show the same confirmation as a real
      // submission (so it doesn't learn it was caught) without writing
      // anything to the database.
      setSubmitted(true);
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Please choose a star rating.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("reviews").insert({
      product_id: productId,
      customer_name: trimmedName,
      rating,
      comment: comment.trim() || null,
      approved: false,
    });

    if (insertError) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <p className="rounded-md border border-blush bg-blush/20 px-4 py-3 font-sans text-sm text-espresso">
        Thanks! Your review is pending approval and will appear soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-blush pt-8">
      <h3 className="font-heading text-lg text-espresso">Write a Review</h3>

      <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor="review-website">Website</label>
        <input
          id="review-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
        <span className="text-xs uppercase tracking-[0.15em] text-bronze">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-md border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none"
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className="font-sans text-xs uppercase tracking-[0.15em] text-bronze">Rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              className="text-2xl leading-none text-bronze"
            >
              {(hoverRating || rating) >= star ? "★" : "☆"}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
        <span className="text-xs uppercase tracking-[0.15em] text-bronze">
          Comment (optional)
        </span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="rounded-md border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none"
        />
      </label>

      {error && <p className="font-sans text-xs text-bronze">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-md bg-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-ivory transition hover:bg-espresso/90 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
