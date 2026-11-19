"use client";
import { useEffect, useState } from "react";
import { countdown, dateDisplay, shortDate, windowPhase } from "@/lib/staking/presentation";
import { InfoTip } from "./InfoTip";
export function useVaultClock() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  return now;
}
export function VaultTiming({ opensAt, closesAt, preview = false, dark = false, compact = false, flush = false, inline = false }: { opensAt: string | null; closesAt: string | null; preview?: boolean; dark?: boolean; compact?: boolean; flush?: boolean; inline?: boolean }) {
  const now = useVaultClock(), phase = now === null ? (opensAt ? "upcoming" : "unscheduled") : windowPhase(opensAt, closesAt, now);
  const target = phase === "upcoming" ? opensAt : phase === "window" ? closesAt : null;
  const label = phase === "unscheduled" ? "Opening date" : phase === "closed" ? "Deposits closed" : phase === "window" ? closesAt ? "Deposits close in" : "Open for deposits" : "Opens in";
  const line = phase === "unscheduled" ? "To be announced" : phase === "closed" ? (preview ? "This vault is no longer taking deposits" : "Existing stakes continue until they mature") : phase === "window" ? closesAt ? `Last day to join: ${shortDate(closesAt)}` : "No closing date · open until the vault is full" : opensAt ? shortDate(opensAt) : "";
  const tip = phase === "window" && closesAt ? "You can deposit any time before this. Each deposit is locked for the full term from the moment you make it, so later deposits mature later."
    : phase === "upcoming" ? `Deposits open at this time.${closesAt ? ` They close ${shortDate(closesAt)}.` : ""} Your term starts when you deposit, not when the vault opens.`
    : phase === "window" ? "This vault has no closing date. It stops taking deposits when it is full or its rewards are fully allocated." : null;
  const hero = compact && dark;
  if (inline) {
    const sentence = phase === "unscheduled" ? "Opening date to be announced" : phase === "closed" ? "Deposits closed" : phase === "window" && !closesAt ? "Open for deposits" : phase === "window" ? "Deposits close in" : "Opens in";
    const when = phase === "upcoming" && opensAt ? shortDate(opensAt) : phase === "window" && closesAt ? shortDate(closesAt) : phase === "window" ? "No closing date" : phase === "closed" ? "Existing stakes continue" : "";
    return <div className="flex min-h-[2.75rem] flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-xl bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.35),transparent_28%),linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#a98bf0_135%)] px-4 py-2.5 text-[13px] text-[#07090b]">
      <span className="flex items-center gap-1.5">{sentence}{target && <span className="font-semibold tabular-nums" role="timer" aria-label={phase === "upcoming" ? "Time until deposits open" : "Time until deposits close"}>{now === null ? "\u00a0" : countdown(target, now)}</span>}{tip && <InfoTip ink size={12} label="About the deposit window">{tip}</InfoTip>}</span>
      {when && <span className="font-semibold tabular-nums">{when}</span>}
    </div>;
  }
  return <div className={`${flush ? "h-full" : "mt-5"} rounded-2xl border p-4 ${hero ? "border-[#c9846a]/30 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.35),transparent_28%),linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#8b5cf6_135%)] text-[#07090b]" : dark ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-[#f8f4ef]"}`}>
    <p className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest ${hero ? "text-[#07090b]/65" : dark ? "text-[#e2a98e]" : "text-[#ad7058]"}`}>{label}{tip && <InfoTip label="About the deposit window" dark={dark && !hero}>{tip}</InfoTip>}</p>
    {target ? <p className="mt-1.5 font-mono text-base font-semibold tabular-nums" role="timer" aria-label={phase === "upcoming" ? "Time until deposits open" : "Time until deposits close"}>{now === null ? "\u00a0" : countdown(target, now)}</p>
      : <p className="mt-1.5 text-base font-semibold">{phase === "window" ? "Open now" : phase === "closed" ? "Closed" : "Coming soon"}</p>}
    <p className={`mt-1 text-xs ${hero ? "text-[#07090b]/70" : dark ? "text-white/55" : "text-black/55"}`}>{line}</p>
    {!compact && opensAt && <div className={`mt-3 space-y-1 border-t pt-3 text-[11px] leading-5 ${dark ? "border-white/10 text-white/55" : "border-black/10 text-black/55"}`}>
      <p>Opens <time dateTime={opensAt}>{dateDisplay(opensAt)}</time></p>
      <p>Closes {closesAt ? <time dateTime={closesAt}>{dateDisplay(closesAt)}</time> : "when full (no closing date)"}</p>
    </div>}
    {preview && !compact && <p className={`mt-2 text-[11px] ${dark ? "text-white/45" : "text-black/45"}`}>Preview only: deposits are not open yet and terms may still change.</p>}
  </div>;
}
