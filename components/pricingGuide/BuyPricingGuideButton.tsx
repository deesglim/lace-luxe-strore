"use client";

import { useState } from "react";

export default function BuyPricingGuideButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pricing-guide/checkout", { method: "POST" });
      const data = await response.json();
      if (data.alreadyOwned) {
        // The calculator is a route handler returning a full HTML page, not a
        // Next.js page, so it needs a full browser navigation.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/pricing-guide/calculator";
        return;
      }
      if (!response.ok || !data.authorizationUrl) {
        setError(data.error ?? "Could not start your payment. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.authorizationUrl;
    } catch {
      setError("Could not start your payment. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-md bg-espresso px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] text-ivory transition hover:bg-espresso/90 disabled:opacity-60"
      >
        {loading ? "Taking you to payment…" : label}
      </button>
      {error && <p className="font-sans text-sm text-bronze">{error}</p>}
    </div>
  );
}
