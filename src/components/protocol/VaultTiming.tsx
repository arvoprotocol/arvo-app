"use client";
import { useEffect, useState } from "react";
import { countdown, dateDisplay, windowPhase } from "@/lib/staking/presentation";
export function useVaultClock() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  return now;
}
export function VaultTiming({ opensAt, closesAt, preview = false, dark = false, compact = false }: { opensAt: string | null; closesAt: string | null; preview?: boolean; dark?: boolean; compact?: boolean }) {
  const now = useVaultClock(), phase = now === null ? "upcoming" : windowPhase(opensAt, closesAt, now);
  const target = phase === "upcoming" ? opensAt : phase === "window" ? closesAt : null;
  const label = !opensAt ? "Opening date to be announced" : phase === "closed" ? preview ? "Planned entry window ended" : "Entry window closed" : phase === "window" ? closesAt ? preview ? "Planned closing in" : "Closes in" : preview ? "Planned entry window" : "Entry window" : preview ? "Planned opening in" : "Opens in";
  return <div className={`mt-5 rounded-2xl border p-4 ${compact && dark ? "border-[#c9846a]/30 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.35),transparent_28%),linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#8b5cf6_135%)] text-[#07090b]" : dark ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-[#f8f4ef]"}`}>
    <p className={`text-[10px] font-semibold uppercase tracking-widest ${compact && dark ? "text-[#07090b]/65" : dark ? "text-[#e2a98e]" : "text-[#ad7058]"}`}>{label}</p>
    {target && <p className="mt-2 font-mono text-base font-semibold tabular-nums" role="timer" aria-label={phase === "upcoming" ? "Time until opening" : "Time until closing"}>{now === null ? "Calculating…" : countdown(target, now)}</p>}
    {phase === "window" && !closesAt && <p className="mt-1 text-xs">{closesAt ? "Until the deposit window closes" : "No scheduled closing date"}</p>}
    {!compact && <div className={`mt-3 space-y-1 text-[11px] leading-5 ${dark ? "text-white/55" : "text-black/55"}`}>
      {opensAt && <p>Opens <time dateTime={opensAt}>{dateDisplay(opensAt)}</time></p>}
      {opensAt && <p>Closes {closesAt ? <time dateTime={closesAt}>{dateDisplay(closesAt)}</time> : "No scheduled close"}</p>}
      {preview && !compact && <p>Planned schedule · deposits remain unavailable in this preview.</p>}
    </div>}
  </div>;
}
