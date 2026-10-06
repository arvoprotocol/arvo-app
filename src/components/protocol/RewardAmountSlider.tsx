"use client";
import { formatUnits } from "viem";
import { tokenAmount } from "@/lib/staking/pool-form";
import { tokenDisplay } from "@/lib/staking/presentation";
export function RewardAmountSlider({ label, value, minimum, capacity, decimals, asset, onChange }: { label: string; value: string; minimum: string; capacity: string; decimals: number; asset: string; onChange: (value: string) => void }) {
  let min = 0n, max = 0n, amount = 0n;
  try { min = tokenAmount(minimum, decimals, "Minimum"); const cap = tokenAmount(capacity, decimals, "Capacity"); max = cap > 0n ? cap : min * 10n; amount = tokenAmount(value, decimals, "Deposit"); } catch { amount = min; }
  const span = max > min ? max - min : 0n;
  const bounded = amount < min ? min : amount > max ? max : amount;
  const position = span ? Number((bounded - min) * 1000n / span) : 0;
  return <span className="mt-3 block">
    <input type="range" aria-label={label} aria-valuetext={`${tokenDisplay(bounded, decimals)} ${asset}`} min={0} max={1000} step={1} disabled={span === 0n} value={position} onChange={e => onChange(formatUnits(min + span * BigInt(e.target.value) / 1000n, decimals))} className="block w-full cursor-pointer accent-[#ad7058] disabled:opacity-40"/>
    <span className="mt-1 flex justify-between gap-2 text-[10px] font-normal text-black/45"><span>Min {tokenDisplay(min, decimals)}</span><span>{tokenDisplay(max, decimals)} {asset}</span></span>
  </span>;
}
