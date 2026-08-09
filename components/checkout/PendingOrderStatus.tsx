"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 20; // ~60 seconds

// The redirect back from Paystack can land before the webhook has actually
// processed the payment, so this polls the order's status and asks the
// (server) success page to re-render once it's no longer "pending".
export default function PendingOrderStatus({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let attempts = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      attempts += 1;
      try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.paymentStatus !== "pending") {
            if (!cancelled) router.refresh();
            return;
          }
        }
      } catch {
        // ignore transient errors, keep polling
      }

      if (cancelled) return;

      if (attempts >= MAX_ATTEMPTS) {
        setTimedOut(true);
        return;
      }

      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }

    timer = setTimeout(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, router]);

  if (timedOut) {
    return (
      <p className="max-w-sm font-sans text-sm text-charcoal/70">
        This is taking longer than expected. We&apos;ll email your
        confirmation as soon as your payment is confirmed — feel free to
        close this page.
      </p>
    );
  }

  return (
    <p className="font-sans text-sm text-charcoal/70">
      Confirming your payment…
    </p>
  );
}
