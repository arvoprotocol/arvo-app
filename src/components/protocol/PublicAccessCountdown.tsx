"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Counts down to public access; reloads once it is reached so the gate disappears. */
export function PublicAccessCountdown({ target }: { target: string }) {
  const end = new Date(target).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const first = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearTimeout(first); window.clearInterval(timer); };
  }, []);

  const left = now === null ? null : Math.max(0, end - now);

  useEffect(() => {
    if (left === 0) {
      const reload = window.setTimeout(() => window.location.reload(), 1500);
      return () => window.clearTimeout(reload);
    }
  }, [left]);

  if (left === 0) {
    return <p className="text-center text-sm font-semibold text-[#e2a98e]">Public access is open. Loading the app…</p>;
  }

  const total = Math.floor((left ?? 0) / 1000);
  const parts = [
    { label: "Days", value: Math.floor(total / 86400) },
    { label: "Hours", value: Math.floor((total % 86400) / 3600) },
    { label: "Mins", value: Math.floor((total % 3600) / 60) },
    { label: "Secs", value: total % 60 },
  ];

  return (
    <div className="grid grid-cols-4 gap-2" aria-live="off">
      {parts.map((part) => (
        <div key={part.label} className="rounded-xl border border-white/10 bg-black/20 px-2 py-3 text-center">
          <div className="text-2xl font-semibold tabular-nums tracking-[-0.03em] text-white">
            {left === null ? "––" : pad(part.value)}
          </div>
          <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">{part.label}</div>
        </div>
      ))}
    </div>
  );
}
