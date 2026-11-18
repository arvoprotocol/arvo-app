"use client";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import type { PoolRow } from "@/hooks/useStakingData";
import { annualRates } from "@/components/protocol/AnnualReward";
import { useSharedBonus } from "@/components/protocol/SharedBonus";
import { appPath } from "@/lib/protocol/app-url";
import { Calculator, ChevronDown } from "lucide-react";

const fmt = (v: bigint, d = 18, max = 2) => Number(formatUnits(v, d)).toLocaleString("en-GB", { maximumFractionDigits: max });
const date = (s: number) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(s * 1000)) + " UTC";
function ago(s: number) {
  const d = Math.max(0, Math.floor(Date.now() / 1000) - s);
  return d < 60 ? "just now" : d < 3600 ? `${Math.floor(d / 60)} min ago` : d < 86400 ? `${Math.floor(d / 3600)} h ago` : `${Math.floor(d / 86400)} d ago`;
}

/** ARVO→ARVO rewards calculator: base, estimated shared bonus, APY comparison and maturity date. */
export function VaultCalculator({ row }: { row: PoolRow }) {
  const bonus = useSharedBonus(row.id);
  const [input, setInput] = useState("");
  const [now] = useState(() => Math.floor(Date.now() / 1000));
  if (!row.vault.arvoStakeEnabled || !row.vault.arvoRewardEnabled || row.vault.arvoRewardBps <= 0) return null;
  let amount = 0n;
  try { amount = input.trim() ? parseUnits(input.replace(/,/g, "").trim(), 18) : 0n; } catch { amount = 0n; }
  const base = amount * BigInt(row.vault.arvoRewardBps) / 10_000n;
  const est = bonus && !bonus.snapshotTaken && amount > 0n ? (bonus.pot * amount) / (bonus.eligible + amount) : 0n;
  const days = row.vault.duration / 86400;
  const rates = annualRates(row.vault.arvoRewardBps / 100, days);
  const start = Math.max(now, Number(row.pool.opensAt));
  const belowMin = amount > 0n && amount < row.vault.minArvo;
  return <details className="group rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 open:pb-4">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold text-[#e2a98e] [&::-webkit-details-marker]:hidden"><span className="inline-flex items-center gap-2"><Calculator size={14} />Estimate my reward</span><ChevronDown size={14} className="transition-transform duration-200 group-open:rotate-180" /></summary>
    <label className="mt-3 block text-[11px] text-white/50">How much ARVO would you stake?
      <input value={input} onChange={e => setInput(e.target.value)} inputMode="decimal" placeholder={fmt(row.vault.minArvo, 18, 0)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#c9846a]/60" />
    </label>
    {belowMin && <p className="mt-2 text-[11px] text-amber-300">Minimum stake is {fmt(row.vault.minArvo, 18, 0)} ARVO.</p>}
    {amount > 0n && !belowMin && <dl className="mt-3 space-y-1.5 text-xs">
      <div className="flex justify-between gap-3"><dt className="text-white/50">Fixed reward ({row.vault.arvoRewardBps / 100}%)</dt><dd className="font-semibold tabular-nums">{fmt(base)} ARVO</dd></div>
      {bonus && !bonus.snapshotTaken && <div className="flex justify-between gap-3"><dt className="text-white/50">Estimated bonus*</dt><dd className="font-semibold tabular-nums">{fmt(est)} ARVO</dd></div>}
      <div className="flex justify-between gap-3 border-t border-white/10 pt-1.5"><dt className="text-white/50">You get back</dt><dd className="font-semibold tabular-nums text-[#e2a98e]">{fmt(amount + base + est)} ARVO</dd></div>
      <div className="flex justify-between gap-3"><dt className="text-white/50">Unlocks</dt><dd className="font-semibold">{date(start + row.vault.duration)}</dd></div>
      {rates && <div className="flex justify-between gap-3"><dt className="text-white/50">APY (for comparison)</dt><dd className="font-semibold tabular-nums">{rates.apy.toFixed(2)}%</dd></div>}
    </dl>}
    <p className="mt-3 text-[10px] leading-4 text-white/40">The fixed reward is set by the contract when you stake. {bonus ? "*The bonus is shared between everyone in the vault, so it gets smaller as more ARVO joins; it is finalised when deposits close. " : ""}Unlock date assumes you stake today.</p>
  </details>;
}

/** Live social proof for a vault: stakers, deposits and recent activity. */
type Momentum = { stakers: number; deposits: number; recent: { user: string; arvo: string; usdc?: string; at: number | null }[] };
const momentumCache = new Map<number, Momentum>();
/** Live activity in a fixed-height slot: skeleton → data (or an empty state) without moving the card. */
export function VaultMomentum({ poolId, flush = false }: { poolId: number; flush?: boolean }) {
  const [data, setData] = useState<Momentum | null>(() => momentumCache.get(poolId) ?? null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const load = () => fetch(appPath(`/app/vault-activity?pool=${poolId}`)).then(r => r.ok ? r.json() : null).then(d => {
      if (cancelled) return;
      if (d && typeof d.stakers === "number") { momentumCache.set(poolId, d); setData(d); } else setFailed(true);
    }).catch(() => { if (!cancelled) setFailed(true); });
    load();
    const timer = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [poolId]);
  const amount = (r: Momentum["recent"][number]) => BigInt(r.usdc ?? "0") > 0n && BigInt(r.arvo) === 0n ? `${fmt(BigInt(r.usdc!), 6, 0)} USDG` : `${fmt(BigInt(r.arvo), 18, 0)} ARVO`;
  // One fixed-height row (no jump while loading); the list opens only when someone asks for it.
  const row = "flex h-11 items-center justify-between gap-3 px-4 text-xs", top = flush ? "" : "mt-4 ";
  if (!data) return <div className={`${top}rounded-2xl border border-white/10`}><div className={row}>{failed ? <span className="text-white/45">Recent activity is unavailable right now</span> : <span aria-hidden className="arvo-skeleton-dark h-3 w-36" />}</div></div>;
  if (data.deposits === 0) return <div className={`arvo-fade ${top}rounded-2xl border border-white/10`}><div className={row}><span className="text-white/60">No deposits yet · be one of the first</span></div></div>;
  return <details className={`arvo-fade group ${top}rounded-2xl border border-white/10`}>
    <summary className={`${row} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
      <span className="flex items-center gap-2 font-semibold text-white/85"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />{data.stakers.toLocaleString("en-GB")} staker{data.stakers === 1 ? "" : "s"} · {data.deposits.toLocaleString("en-GB")} deposit{data.deposits === 1 ? "" : "s"}</span>
      <span className="inline-flex items-center gap-1 text-white/45 group-open:text-white/70"><span className="group-open:hidden">Recent</span><span className="hidden group-open:inline">Hide</span><ChevronDown size={14} className="transition-transform duration-200 group-open:rotate-180" /></span>
    </summary>
    <ul className="space-y-1.5 border-t border-white/10 px-4 py-3 text-xs text-white/55">{data.recent.slice(0, 5).map((r, i) => <li key={i} className="flex justify-between gap-3"><span className="font-mono">{r.user}</span><span className="tabular-nums">{amount(r)}{r.at ? ` · ${ago(r.at)}` : ""}</span></li>)}</ul>
  </details>;
}
