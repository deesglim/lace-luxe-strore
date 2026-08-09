"use client";

import type { NewsletterSubscriber } from "@/lib/newsletter";

function toCsv(subscribers: NewsletterSubscriber[]): string {
  const rows = subscribers.map((subscriber) => [
    subscriber.email,
    new Date(subscriber.created_at).toISOString(),
  ]);

  return ["Email,Subscribed Date", ...rows.map((row) => row.map(escapeCsvCell).join(","))].join(
    "\n",
  );
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function NewsletterExportButton({
  subscribers,
}: {
  subscribers: NewsletterSubscriber[];
}) {
  function handleExport() {
    const csv = toCsv(subscribers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={subscribers.length === 0}
      className="rounded-md border border-charcoal/20 px-4 py-2 font-sans text-xs uppercase tracking-[0.15em] text-charcoal transition hover:border-bronze disabled:opacity-50"
    >
      Export as CSV
    </button>
  );
}
