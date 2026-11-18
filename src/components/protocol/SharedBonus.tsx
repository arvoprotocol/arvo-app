"use client";
import { useEffect, useState } from "react";
import { formatUnits, type Address, type Hash } from "viem";
import { bonusAbi, bonusAddresses, bonusBps, bpsLabel, listBonuses, readBonus, type BonusState } from "@/lib/staking/bonus";
import { transact } from "@/lib/staking/user-transactions";
import { InfoTip } from "./InfoTip";

function arvo(value: bigint) {
  return Number(formatUnits(value, 18)).toLocaleString("en-GB", { maximumFractionDigits: 2 });
}
function date(seconds: bigint) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(Number(seconds) * 1000)) + " UTC";
}

/** Loads the shared bonus for a pool; null while loading or when none applies. */
// Shared cache so cards render with their bonus already known (no panel popping in after load).
const bonusCache = new Map<number, BonusState | null>();
/** Loads every configured bonus once; the stake page waits for this before showing vault cards. */
export async function preloadBonuses(): Promise<void> {
  if (bonusAddresses().length === 0) return;
  try { for (const s of await listBonuses()) bonusCache.set(s.poolId, s); } catch { /* cards fall back to loading individually */ }
}
export function useSharedBonus(poolId: number | null, refreshKey = 0) {
  const [state, setState] = useState<BonusState | null>(() => poolId === null ? null : bonusCache.get(poolId) ?? null);
  useEffect(() => {
    let cancelled = false;
    if (poolId === null || bonusAddresses().length === 0) return;
    readBonus(poolId).then(s => { bonusCache.set(poolId, s); if (!cancelled) setState(s); }).catch(() => { if (!cancelled) setState(null); });
    return () => { cancelled = true; };
  }, [poolId, refreshKey]);
  return poolId === null ? null : state;
}

/** Vault-card panel: fixed pot, current estimate and full-capacity rate. */
export function SharedBonus({ poolId, refreshKey = 0, dark = false }: { poolId: number; refreshKey?: number; dark?: boolean }) {
  const bonus = useSharedBonus(poolId, refreshKey);
  if (!bonus) return null;
  const funded = bonus.balance >= bonus.pot || bonus.snapshotTaken;
  const current = bonusBps(bonus, bonus.eligible);
  const full = bonus.maxPrincipal > 0n ? bonusBps(bonus, bonus.maxPrincipal) : null;
  const muted = dark ? "text-white/50" : "text-black/50";
  return <div className={`mt-4 rounded-2xl border p-4 ${dark ? "border-[#c9846a]/25 bg-[#c9846a]/10" : "border-[#c9846a]/30 bg-[#f8f2ed]"}`}>
    <p className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] ${dark ? "text-[#e2a98e]" : "text-[#ad7058]"}`}>+ Bonus pot<InfoTip dark={dark} label="How the bonus works">
      A fixed pot of {arvo(bonus.pot)} ARVO is shared between everyone in this vault, in proportion to how much each person stakes. The more ARVO joins, the smaller each share, so your estimate moves until deposits close on {date(bonus.closesAt)}; then it is fixed. You claim it when your stake unlocks. If you withdraw early in an emergency, the bonus is given up. The bonus is paid by a separate contract, independently tested with automated security analysis and AI review; it is not part of the Soken audit.
    </InfoTip></p>
    <p className="mt-2 text-sm font-semibold">{arvo(bonus.pot)} ARVO shared between stakers</p>
    <dl className={`mt-3 grid grid-cols-2 gap-3 text-xs ${muted}`}>
      <div><dt>{bonus.snapshotTaken ? "Final bonus" : "Bonus if you join now"}</dt><dd className={`mt-1 text-base font-semibold ${dark ? "text-white" : "text-[#07090b]"}`}>{bonus.eligible === 0n ? "Whole pot" : `+${bpsLabel(current)}`}</dd></div>
      {full && <div><dt>If the vault fills up</dt><dd className={`mt-1 text-base font-semibold ${dark ? "text-white" : "text-[#07090b]"}`}>+{bpsLabel(full)}</dd></div>}
    </dl>
    <p className={`mt-3 text-[11px] leading-5 ${muted}`}>
      {bonus.snapshotTaken ? `Shares were fixed when deposits closed on ${date(bonus.closesAt)}.` : `On top of the fixed reward. Final shares are set when deposits close.`}
      {!funded && " The bonus pot is still being funded."}
    </p>
  </div>;
}

/** Portfolio action: claim a matured position's bonus (paid to the owner). */
export function ClaimBonus({ poolId, positionId, matured, emergencyExit, account, onDone }: { poolId: number; positionId: bigint; matured: boolean; emergencyExit: boolean; account?: Address; onDone?: () => void }) {
  const bonus = useSharedBonus(poolId);
  const [owed, setOwed] = useState<bigint | null>(null);
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState<Hash | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!bonus) return;
    let cancelled = false;
    import("@/lib/staking/pool-transactions").then(({ stakingConnection }) => {
      const c = stakingConnection();
      if (!c) return;
      return c.publicClient.readContract({ address: bonus.address, abi: bonusAbi, functionName: "bonusFor", args: [positionId] });
    }).then(v => { if (!cancelled && typeof v === "bigint") setOwed(v); }).catch(() => { if (!cancelled) setOwed(null); });
    return () => { cancelled = true; };
  }, [bonus, positionId, revision]);
  if (!bonus || emergencyExit) return emergencyExit && bonus ? <p className="mt-2 text-xs text-black/50">Shared bonus forfeited by emergency exit.</p> : null;
  if (owed === null) return null;
  if (owed === 0n) return <p className="mt-2 text-xs text-black/50">Shared bonus: claimed.</p>;
  const ready = matured && bonus.snapshotTaken;
  async function claim() {
    if (busy || hash || !bonus) return;
    setBusy(true); setError("");
    try {
      await transact("claim", [positionId], setHash, undefined, undefined, account, { address: bonus.address, abi: bonusAbi });
      setHash(null); setRevision(x => x + 1); onDone?.();
    } catch (e) { setError(e instanceof Error ? e.message : "Bonus claim failed."); }
    finally { setBusy(false); }
  }
  return <div className="mt-3">
    <p className="text-sm">Shared bonus {bonus.snapshotTaken ? "" : "(estimate)"}: {arvo(owed)} ARVO</p>
    {ready ? <button disabled={busy || Boolean(hash)} onClick={claim} className="mt-2 rounded-lg border border-black/15 px-4 py-2 text-xs font-semibold disabled:opacity-40">{busy ? "Confirm in wallet…" : "Claim shared bonus"}</button>
      : <p className="mt-1 text-xs text-black/50">{bonus.snapshotTaken ? "Claimable from maturity." : "Fixed when entries close; claimable from maturity."}</p>}
    {hash && <p className="mt-1 break-all text-xs">Submitted: {hash}</p>}
    {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
  </div>;
}

/** Stake review line: estimated bonus for the amount being entered. */
export function BonusEstimate({ poolId, amount, refreshKey = 0 }: { poolId: number; amount: bigint; refreshKey?: number }) {
  const bonus = useSharedBonus(poolId, refreshKey);
  if (!bonus || bonus.snapshotTaken || amount <= 0n) return null;
  const total = bonus.eligible + amount;
  const estimate = (bonus.pot * amount) / total;
  return <p className="mt-2 text-xs text-black/60">
    + estimated shared bonus <span className="font-semibold text-[#07090b]">{arvo(estimate)} ARVO</span> ({bpsLabel(bonusBps(bonus, total))}) if no more ARVO enters. Falls as more ARVO enters; fixed when entries close.
  </p>;
}
