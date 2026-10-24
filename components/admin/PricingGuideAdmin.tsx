"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type PricingGuideRow = {
  id: string;
  email: string | null;
  name: string | null;
  amount: number;
  status: string;
  source: string;
  date: string;
  devices: number;
};

const btn =
  "border border-espresso px-3 py-1 font-sans text-xs uppercase tracking-[0.1em] text-espresso hover:bg-espresso hover:text-ivory disabled:opacity-50";

export default function PricingGuideAdmin({ rows }: { rows: PricingGuideRow[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function send(payload: Record<string, string>, key: string) {
    setBusy(key);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/pricing-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Something went wrong.");
      } else {
        setMessage("Done.");
        router.refresh();
      }
    } catch {
      setMessage("Something went wrong.");
    }
    setBusy(null);
  }

  async function grant(event: FormEvent) {
    event.preventDefault();
    await send({ action: "grant", email }, "grant");
    setEmail("");
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={grant} className="flex flex-col gap-2 border border-blush p-4">
        <label htmlFor="grant-email" className="font-sans text-sm text-espresso">
          Give free access (e.g. a Masterclass student). They need an account on the site first.
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="grant-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@email.com"
            className="min-w-0 flex-1 border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm"
          />
          <button type="submit" disabled={busy === "grant"} className={btn}>
            Give access
          </button>
        </div>
      </form>

      {message && <p className="font-sans text-sm text-bronze">{message}</p>}

      {rows.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/70">No buyers yet.</p>
      ) : (
        <div className="overflow-x-auto border border-blush">
          <table className="w-full border-collapse text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/30 text-xs uppercase tracking-[0.1em] text-bronze">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Paid</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Devices</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-blush/60 last:border-0">
                  <td className="px-4 py-3 text-charcoal">
                    {row.name && <div>{row.name}</div>}
                    <div className="text-charcoal/70">{row.email ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-charcoal">
                    {row.source === "granted" ? "Free (given)" : `₦${row.amount.toLocaleString("en-NG")}`}
                  </td>
                  <td className="px-4 py-3 text-charcoal">{row.status}</td>
                  <td className="px-4 py-3 text-charcoal/70">{row.date}</td>
                  <td className="px-4 py-3 text-charcoal/70">{row.devices}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {row.status === "paid" && (
                        <button type="button" className={btn} disabled={busy === row.id} onClick={() => send({ action: "revoke", purchaseId: row.id }, row.id)}>
                          Remove access
                        </button>
                      )}
                      {row.status === "revoked" && (
                        <button type="button" className={btn} disabled={busy === row.id} onClick={() => send({ action: "restore", purchaseId: row.id }, row.id)}>
                          Restore access
                        </button>
                      )}
                      {row.status === "paid" && row.devices > 0 && (
                        <button type="button" className={btn} disabled={busy === row.id + "d"} onClick={() => send({ action: "reset_devices", purchaseId: row.id }, row.id + "d")}>
                          Reset devices
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
