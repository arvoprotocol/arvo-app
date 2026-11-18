"use client";
import { InfoTip } from "./InfoTip";
import { lockLabel, termLabel } from "@/lib/staking/presentation";
import { useArvoPrice, usdApprox } from "@/hooks/useArvoPrice";

/** "≈ $448" next to an ARVO amount, using the live market price. Renders nothing until a price is known. */
export function UsdHint({ arvo, dark = true, prefix = "", suffix = "" }: { arvo: number; dark?: boolean; prefix?: string; suffix?: string }) {
  const price = useArvoPrice(), usd = usdApprox(arvo, price);
  return usd ? <span className={`${prefix ? "" : "ml-1.5 "}font-normal ${dark ? "text-white/40" : "text-black/40"}`} title="Approximate value at the current ARVO market price">{prefix}≈ {usd}{suffix}</span> : null;
}

/** "Locked for 60 days from your deposit (i)" */
export function LockLine({ days, dark = true, className = "" }: { days: number; dark?: boolean; className?: string }) {
  return <p className={`mt-2 flex items-center gap-1 text-sm ${dark ? "text-white/55" : "text-black/55"} ${className}`}>
    {lockLabel(days)}
    <InfoTip dark={dark} label="How the lock works">
      Your deposit and its reward unlock together after {termLabel(days)}, counted from the moment you deposit. There is no early withdrawal, so only stake what you are comfortable leaving for the full term.
    </InfoTip>
  </p>;
}

/** "10% fixed reward over 60 days (i)" */
export function RewardLine({ percent, days, asset, dark = true, note }: { percent: number; days: number; asset: string; dark?: boolean; note?: string }) {
  return <p className={`mt-3 flex flex-wrap items-center gap-x-1 text-sm ${dark ? "text-white/55" : "text-black/55"}`}>
    <span className={`font-semibold ${dark ? "text-white/85" : "text-black/85"}`}>{percent}% fixed reward</span> over {termLabel(days)}{note ? ` · ${note}` : ""}
    <InfoTip dark={dark} label="How the reward is fixed">
      You receive {percent}% of your deposit, paid in {asset}, when the term ends. The amount is locked in the moment you deposit: it does not change if prices move or more people join.
    </InfoTip>
  </p>;
}

/** Label + value pair used in the card's terms list. */
export function TermRow({ label, value, tip, dark = true, usdArvo }: { label: string; value: string; tip?: string; dark?: boolean; usdArvo?: number }) {
  return <div className="flex items-center justify-between gap-3">
    <dt className={`flex items-center gap-1 ${dark ? "text-white/50" : "text-black/50"}`}>{label}{tip && <InfoTip dark={dark} label={`About ${label.toLowerCase()}`}>{tip}</InfoTip>}</dt>
    <dd className={`text-right font-semibold tabular-nums ${dark ? "text-white/85" : "text-black/85"}`}>{value}{usdArvo !== undefined && <UsdHint arvo={usdArvo} dark={dark} />}</dd>
  </div>;
}
