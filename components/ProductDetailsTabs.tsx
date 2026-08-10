"use client";

import { useState } from "react";

type TabId = "why-choose" | "why-not";

export default function ProductDetailsTabs({
  whyChoose,
  whyNotChoose,
}: {
  whyChoose: string[];
  whyNotChoose: string[];
}) {
  const tabs: { id: TabId; label: string }[] = [
    ...(whyChoose.length > 0 ? [{ id: "why-choose" as const, label: "Why Choose" }] : []),
    ...(whyNotChoose.length > 0 ? [{ id: "why-not" as const, label: "Why Not Choose" }] : []),
  ];

  const [active, setActive] = useState<TabId>(tabs[0]?.id ?? "why-choose");

  if (tabs.length === 0) return null;
  const activeTab = tabs.some((tab) => tab.id === active) ? active : tabs[0].id;

  return (
    <div className="mt-16 lg:mt-20">
      <div className="rounded-brand border border-blush bg-blush/20 p-6 sm:p-8 lg:p-10">
        {/* Pill segmented control, labeled with the same serif used for
            the content below — a more editorial pairing than the plain
            uppercase Montserrat labels used elsewhere on the page. */}
        <div className="inline-flex flex-wrap gap-1 rounded-full bg-ivory p-1 shadow-[inset_0_0_0_1px_rgba(58,47,42,0.08)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`rounded-full px-5 py-2 font-heading text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-espresso text-ivory shadow-sm"
                  : "text-charcoal/60 hover:text-espresso"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8 max-w-2xl">
          {activeTab === "why-choose" && (
            <ul className="flex flex-col gap-3">
              {whyChoose.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-brand border border-blush bg-ivory px-4 py-3.5"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bronze text-xs text-ivory"
                  >
                    ✓
                  </span>
                  <span className="font-heading text-base italic leading-relaxed text-charcoal/85">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {activeTab === "why-not" && (
            <ul className="flex flex-col gap-3">
              {whyNotChoose.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-brand border border-blush bg-ivory px-4 py-3.5"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-charcoal/15 text-xs text-charcoal/70"
                  >
                    ✕
                  </span>
                  <span className="font-heading text-base italic leading-relaxed text-charcoal/85">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
