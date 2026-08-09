"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAllowedNextStatuses, ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import type { Order } from "@/types";

const inputClass =
  "border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none";

export default function OrderStatusUpdater({
  orderId,
  status,
  paymentStatus,
  trackingNote,
}: {
  orderId: string;
  status: Order["status"];
  paymentStatus: Order["payment_status"];
  trackingNote: string | null;
}) {
  const router = useRouter();
  const allowed = getAllowedNextStatuses({ status, payment_status: paymentStatus });

  const [nextStatus, setNextStatus] = useState<Order["status"] | "">(
    allowed[0] ?? "",
  );
  const [note, setNote] = useState(trackingNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (allowed.length === 0) {
    return (
      <p className="font-sans text-sm text-charcoal/60">
        This order is in a final state ({ORDER_STATUS_LABELS[status]}) — no
        further status changes.
      </p>
    );
  }

  async function handleSave() {
    if (!nextStatus) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          trackingNote: nextStatus === "shipped" ? note : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not update status.");
        setSaving(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Could not update status. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 border border-blush p-4">
      <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
        <span className="text-xs uppercase tracking-[0.15em] text-bronze">
          Move to
        </span>
        <select
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value as Order["status"])}
          className={inputClass}
        >
          {allowed.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      {nextStatus === "shipped" && (
        <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
          <span className="text-xs uppercase tracking-[0.15em] text-bronze">
            Tracking Note (optional)
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tracking number or carrier note"
            className={inputClass}
          />
        </label>
      )}

      {error && (
        <p className="font-sans text-xs text-bronze">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !nextStatus}
        className="self-start bg-espresso px-5 py-2.5 font-sans text-sm uppercase tracking-[0.2em] text-ivory disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
