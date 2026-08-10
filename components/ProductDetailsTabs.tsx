"use client";

import { useState } from "react";

type TabId = "details" | "why-choose" | "why-not";

export default function ProductDetailsTabs({
  laceType,
  availableColors,
  availableSizes,
  whyChoose,
  whyNotChoose,
}: {
  laceType: string | null;
  availableColors: string;
  availableSizes: string;
  whyChoose: string[];
  whyNotChoose: string[];
}) {
  const hasSpecs = Boolean(laceType || availableColors || availableSizes);

  const tabs: { id: TabId; label: string }[] = [
    ...(hasSpecs ? [{ id: "details" as const, label: "Details" }] : []),
    ...(whyChoose.length > 0 ? [{ id: "why-choose" as const, label: "Why Choose" }] : []),
    ...(whyNotChoose.length > 0 ? [{ id: "why-not" as const, label: "Why Not Choose" }] : []),
  ];

  const [active, setActive] = useState<TabId>(tabs[0]?.id ?? "details");

  if (tabs.length === 0) return null;
  const activeTab = tabs.some((tab) => tab.id === active) ? active : tabs[0].id;

  return (
    <div className="mt-16 border-t border-blush pt-10 lg:mt-20">
      <div className="flex gap-8 border-b border-blush">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`-mb-px border-b-2 pb-3 font-label text-xs font-medium uppercase tracking-label transition ${
              activeTab === tab.id
                ? "border-bronze text-espresso"
                : "border-transparent text-charcoal/50 hover:text-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl pt-8">
        {activeTab === "details" && (
          <dl className="flex flex-col font-sans text-sm">
            {laceType && (
              <div className="flex justify-between gap-4 border-b border-border/60 py-2.5">
                <dt className="text-charcoal/60">Lace Type</dt>
                <dd className="text-right text-espresso">{laceType}</dd>
              </div>
            )}
            {availableColors && (
              <div className="flex justify-between gap-4 border-b border-border/60 py-2.5">
                <dt className="text-charcoal/60">Color</dt>
                <dd className="text-right text-espresso">{availableColors}</dd>
              </div>
            )}
            {availableSizes && (
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-charcoal/60">Lace Size</dt>
                <dd className="text-right text-espresso">{availableSizes}</dd>
              </div>
            )}
          </dl>
        )}

        {activeTab === "why-choose" && (
          <ul className="flex flex-col gap-2">
            {whyChoose.map((point, index) => (
              <li key={index} className="flex items-start gap-2 font-sans text-sm text-charcoal/80">
                <span aria-hidden className="text-green-700">
                  ✓
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "why-not" && (
          <ul className="flex flex-col gap-2">
            {whyNotChoose.map((point, index) => (
              <li key={index} className="flex items-start gap-2 font-sans text-sm text-charcoal/80">
                <span aria-hidden className="text-charcoal/40">
                  ✗
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
