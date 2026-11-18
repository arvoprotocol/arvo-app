"use client";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import type { PoolRow } from "@/hooks/useStakingData";
import { annualRates } from "@/components/protocol/AnnualReward";
import { useSharedBonus } from "@/components/protocol/SharedBonus";
import { appPath } from "@/lib/protocol/app-url";

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
  return <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
    <summary className="cursor-pointer list-none text-xs font-semibold text-[#e2a98e] [&::-webkit-details-marker]:hidden">Calculate your rewards ↓</summary>
    <label className="mt-3 block text-[11px] text-white/50">ARVO to stake
      <input value={input} onChange={e => setInput(e.target.value)} inputMode="decimal" placeholder={fmt(row.vault.minArvo, 18, 0)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#c9846a]/60" />
    </label>
    {belowMin && <p className="mt-2 text-[11px] text-amber-300">Minimum stake is {fmt(row.vault.minArvo, 18, 0)} ARVO.</p>}
    {amount > 0n && !belowMin && <dl className="mt-3 space-y-1.5 text-xs">
      <div className="flex justify-between gap-3"><dt className="text-white/50">Base reward ({row.vault.arvoRewardBps / 100}%)</dt><dd className="font-semibold tabular-nums">{fmt(base)} ARVO</dd></div>
      {bonus && !bonus.snapshotTaken && <div className="flex justify-between gap-3"><dt className="text-white/50">Est. shared bonus*</dt><dd className="font-semibold tabular-nums">{fmt(est)} ARVO</dd></div>}
      <div className="flex justify-between gap-3 border-t border-white/10 pt-1.5"><dt className="text-white/50">Back at maturity</dt><dd className="font-semibold tabular-nums text-[#e2a98e]">{fmt(amount + base + est)} ARVO</dd></div>
      <div className="flex justify-between gap-3"><dt className="text-white/50">Matures</dt><dd className="font-semibold">{date(start + row.vault.duration)}</dd></div>
      {rates && <div className="flex justify-between gap-3"><dt className="text-white/50">Illustrative APY</dt><dd className="font-semibold tabular-nums">{rates.apy.toFixed(2)}%</dd></div>}
    </dl>}
    <p className="mt-3 text-[10px] leading-4 text-white/40">Estimate only. The base reward is fixed by the contract when you stake. {bonus ? "*The bonus estimate assumes no more ARVO enters and is fixed when entries close. " : ""}Maturity assumes you stake now. APY assumes reinvestment at identical terms and is not guaranteed.</p>
  </details>;
}

/** Live social proof for a vault: stakers, deposits and recent activity. */
export function VaultMomentum({ poolId }: { poolId: number }) {
  const [data, setData] = useState<{ stakers: number; deposits: number; recent: { user: string; arvo: string; at: number | null }[] } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const load = () => fetch(appPath(`/app/vault-activity?pool=${poolId}`)).then(r => r.ok ? r.json() : null).then(d => { if (!cancelled && d && typeof d.stakers === "number") setData(d); }).catch(() => undefined);
    load();
    const timer = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [poolId]);
  if (!data || data.deposits === 0) return null;
  return <div className="mt-4 rounded-2xl border border-white/10 p-4 text-xs">
    <p className="flex items-center gap-2 font-semibold"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />{data.stakers.toLocaleString("en-GB")} staker{data.stakers === 1 ? "" : "s"} · {data.deposits.toLocaleString("en-GB")} deposit{data.deposits === 1 ? "" : "s"}</p>
    {data.recent.length > 0 && <ul className="mt-2.5 space-y-1 text-white/55">{data.recent.slice(0, 3).map((r, i) => <li key={i} className="flex justify-between gap-3"><span className="font-mono">{r.user}</span><span className="tabular-nums">{fmt(BigInt(r.arvo), 18, 0)} ARVO{r.at ? ` · ${ago(r.at)}` : ""}</span></li>)}</ul>}
  </div>;
}
