"use client";

import { useEffect, useState } from "react";

const ROTATE_INTERVAL_MS = 5000;

// A single active announcement just displays statically — the interval
// below only ever starts once there are at least two to cycle between.
export default function AnnouncementRotator({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <div className="flex h-9 items-center justify-center overflow-hidden bg-espresso px-4">
      <p
        key={index}
        className="animate-announcement-fade truncate font-sans text-xs uppercase tracking-[0.1em] text-ivory sm:text-sm"
      >
        {messages[index]}
      </p>
    </div>
  );
}
