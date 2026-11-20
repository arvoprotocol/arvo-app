"use client";
import { InfoTip } from "./InfoTip";
import { lockLabel, termLabel } from "@/lib/staking/presentation";
import { useArvoPrice, usdApprox } from "@/hooks/useArvoPrice";

/** "≈ $448" next to an ARVO amount, using the live market price. Renders nothing until a price is known. */
export function UsdHint({ arvo, dark = true, prefix = "", suffix = "" }: { arvo: number; dark?: boolean; prefix?: string; suffix?: string }) {
  const price = useArvoPrice(), usd = usdApprox(arvo, price);
  return usd ? <span className={`${prefix ? "" : "ml-1.5 "}whitespace-nowrap font-normal ${dark ? "text-white/55" : "text-black/45"}`} title="Approximate value at the current ARVO market price">{prefix}≈ {usd}{suffix}</span> : null;
}

/** "Locked for 60 days from your deposit (i)" */
export function LockLine({ days, dark = true, className = "" }: { days: number; dark?: boolean; className?: string }) {
  return <p className={`mt-2 flex items-center gap-1 text-sm ${dark ? "text-white/70" : "text-black/60"} ${className}`}>
    {lockLabel(days)}
    <InfoTip dark={dark} label="How the lock works">
      Your deposit and its reward unlock together after {termLabel(days)}, counted from the moment you deposit. There is no early withdrawal, so only stake what you are comfortable leaving for the full term.
    </InfoTip>
  </p>;
}

/** "10% fixed reward over 60 days (i)" */
export function RewardLine({ percent, days, asset, dark = true, note, bonus = false }: { percent: number; days: number; asset: string; dark?: boolean; note?: string; bonus?: boolean }) {
  return <p className={`mt-3 flex flex-wrap items-center gap-x-1 text-sm ${dark ? "text-white/70" : "text-black/60"}`}>
    <span className={`font-semibold ${dark ? "text-white/85" : "text-black/85"}`}>{percent}% fixed reward</span>{bonus && <span className={`font-semibold ${dark ? "text-[#e2a98e]" : "text-[#ad7058]"}`}>+ bonus</span>} <span className="inline-flex items-center gap-1 whitespace-nowrap">over {termLabel(days)}{note ? ` · ${note}` : ""}
    <InfoTip dark={dark} label="How the reward is fixed">
      You receive {percent}% of your deposit, paid in {asset}, when the term ends. The amount is locked in the moment you deposit: it does not change if prices move or more people join.{bonus ? " The bonus pot is shared on top of this; see the bonus strip on this card." : ""}
    </InfoTip></span>
  </p>;
}

/** Label + value pair used in the card's terms list. */
export function TermRow({ label, value, tip, dark = true, usdArvo }: { label: string; value: string; tip?: string; dark?: boolean; usdArvo?: number }) {
  return <div className="flex items-start justify-between gap-3">
    <dt className={`flex shrink-0 items-center gap-1 whitespace-nowrap ${dark ? "text-white/50" : "text-black/50"}`}>{label}{tip && <InfoTip dark={dark} label={`About ${label.toLowerCase()}`}>{tip}</InfoTip>}</dt>
    <dd className={`min-w-0 text-right font-semibold tabular-nums ${dark ? "text-white/85" : "text-black/85"}`}><span className="whitespace-nowrap">{value}</span>{usdArvo !== undefined && <span className="block text-[11px] leading-4 [&>span]:ml-0"><UsdHint arvo={usdArvo} dark={dark} /></span>}</dd>
  </div>;
}

/** "1.5M", "100M", "250K": short figures for the card stats. */
export function compactNumber(value: number): string {
  if (!Number.isFinite(value)) return "–";
  return new Intl.NumberFormat("en-GB", { notation: value >= 10_000 ? "compact" : "standard", maximumFractionDigits: 2 }).format(value);
}

export type Stat = { label: string; value: string; unit?: string; tip?: string; usdArvo?: number };
/** Three small side-by-side stats (minimum, size, reward currency). */
export function TermStats({ items }: { items: Stat[] }) {
  return <dl className="grid grid-cols-3 gap-2">{items.map(item => <div key={item.label} className="min-w-0 rounded-xl bg-white/[0.045] px-3 py-2.5">
    <dt className="flex items-center gap-1 whitespace-nowrap text-[11px] text-white/65">{item.label}{item.tip && <InfoTip dark size={12} label={`About ${item.label.toLowerCase()}`}>{item.tip}</InfoTip>}</dt>
    <dd className="mt-1 text-sm font-semibold leading-tight tabular-nums text-white"><span className="block truncate sm:inline">{item.value}</span>{item.unit && <span className="block truncate text-[11px] font-medium text-white/65 sm:ml-1 sm:inline">{item.unit}</span>}</dd>
    {item.usdArvo !== undefined && <dd className="text-[11px] leading-4 [&>span]:ml-0"><UsdHint arvo={item.usdArvo} /></dd>}
  </div>)}</dl>;
}
