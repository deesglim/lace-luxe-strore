"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function partsUntil(target: number, now: number) {
  const ms = Math.max(0, target - now);
  const s = Math.floor(ms / 1000);
  return {
    done: ms === 0,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/**
 * Counts down to the real end of the launch price. It never resets: when it
 * reaches zero the page refreshes and the server shows the regular price.
 */
export default function SaleCountdown({
  endsAt,
  tone = "light",
}: {
  endsAt: string;
  tone?: "light" | "dark";
}) {
  const router = useRouter();
  const target = new Date(endsAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  const p = partsUntil(target, now ?? target - 1);

  useEffect(() => {
    if (now !== null && p.done) router.refresh();
  }, [now, p.done, router]);

  const box = tone === "dark" ? "bg-ivory/10 text-ivory" : "bg-espresso text-ivory";
  const label = tone === "dark" ? "text-ivory/70" : "text-charcoal/70";
  const units: [number, string][] = [
    [p.days, "Days"],
    [p.hours, "Hours"],
    [p.minutes, "Mins"],
    [p.seconds, "Secs"],
  ];

  return (
    <div className="flex gap-2" role="timer" aria-live="off" aria-label="Time left at the launch price">
      {units.map(([value, unit]) => (
        <div key={unit} className="flex flex-col items-center gap-1">
          <span className={`min-w-[3.25rem] px-2 py-2 text-center font-heading text-2xl tabular-nums ${box}`}>
            {now === null ? "--" : String(value).padStart(2, "0")}
          </span>
          <span className={`font-sans text-[10px] uppercase tracking-[0.2em] ${label}`}>{unit}</span>
        </div>
      ))}
    </div>
  );
}
