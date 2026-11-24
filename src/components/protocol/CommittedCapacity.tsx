"use client";
import { tokenDisplayShort as tokenDisplay } from "@/lib/staking/presentation";
import { InfoTip } from "./InfoTip";

/**
 * Capacity bar with two filled segments:
 *  - committed: capacity recorded by the protocol for capital committed outside the app
 *    (the contract's protocol allocation; it counts toward the cap but is not deposited onchain)
 *  - deposited: principal staked onchain through the app
 * The remainder is what is still open for onchain deposits.
 */
export function CommittedCapacity({ asset, cap, committed, deposited, decimals, committedLabel, preview = false, bare = false }: {
  asset: string; cap: bigint; committed: bigint; deposited: bigint; decimals: number; committedLabel: string; preview?: boolean; bare?: boolean;
}) {
  if (cap <= 0n) return null;
  const pct = (n: bigint) => Number((n * 10000n) / cap) / 100;
  const committedPct = Math.min(100, pct(committed));
  const depositedPct = Math.min(100 - committedPct, pct(deposited));
  const filled = committed + deposited;
  const available = filled >= cap ? 0n : cap - filled;
  const amount = (n: bigint) => tokenDisplay(n, decimals);
  return <div className={bare ? "" : "mt-5 border-t border-white/10 pt-4"}>
    <div className="flex items-baseline justify-between gap-3">
      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">{preview ? "Vault size" : "Vault filled"}<InfoTip dark label="About committed capital">{amount(committed)} {asset} of this vault has already been committed by investors outside the app, so it counts towards the vault size. The rest is open to deposits here. Only deposits made in the app earn the reward shown on this card.</InfoTip></p>
      <p className="text-[11px] tabular-nums text-white/60">{amount(filled)} / {amount(cap)} {asset}</p>
    </div>
    <div role="progressbar" aria-label={`${asset} vault capacity`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(committedPct + depositedPct)}
      aria-valuetext={`${amount(committed)} ${asset} ${committedLabel}, ${amount(deposited)} deposited onchain, ${amount(available)} available`}
      className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/10">
      <div className="arvo-bar h-full bg-[repeating-linear-gradient(135deg,#8f5b47_0_6px,#a86d55_6px_12px)]" style={{ width: `${committedPct}%` }} />
      <div className="arvo-bar h-full bg-[linear-gradient(90deg,#c9846a,#e2a98e)]" style={{ width: `${depositedPct}%` }} />
    </div>
    <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px] leading-4">
      <div><dt className="flex items-center gap-1.5 text-white/60"><span className="h-2 w-2 rounded-sm bg-[#9a624d]" />Committed</dt><dd className="mt-1 font-semibold tabular-nums text-white/85">{amount(committed)}</dd></div>
      <div><dt className="flex items-center gap-1.5 text-white/60"><span className="h-2 w-2 rounded-sm bg-[#d8977c]" />In the app</dt><dd className="mt-1 font-semibold tabular-nums text-white/85">{amount(deposited)}</dd></div>
      <div><dt className="flex items-center gap-1.5 text-white/60"><span className="h-2 w-2 rounded-sm bg-white/15" />Still open</dt><dd className="mt-1 font-semibold tabular-nums text-[#edb9a2]">{amount(available)}</dd></div>
    </dl>
  </div>;
}
