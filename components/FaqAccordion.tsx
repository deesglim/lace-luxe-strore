"use client";

import { useState } from "react";

export type FaqItem = { question: string; answer: string };

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col divide-y divide-blush border-y border-blush">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left transition hover:text-bronze"
            >
              <span className="font-heading text-lg text-espresso">{item.question}</span>
              <span className="shrink-0 font-sans text-xl text-bronze" aria-hidden>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <p className="pb-5 font-sans text-sm leading-relaxed text-charcoal/80">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
