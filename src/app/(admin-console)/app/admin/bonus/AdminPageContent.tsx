"use client";
import { useCallback, useEffect, useState } from "react";
import { formatUnits, type Hash } from "viem";
import { PageTitle, Panel, PanelHeader, StatusPill } from "@/components/protocol/ProtocolUI";
import { useVaultClock } from "@/components/protocol/VaultTiming";
import { bonusAbi, bonusAddresses, bonusBps, bpsLabel, listBonuses, type BonusState } from "@/lib/staking/bonus";
import { transact } from "@/lib/staking/user-transactions";

function arvo(value: bigint) {
  return `${Number(formatUnits(value, 18)).toLocaleString("en-GB", { maximumFractionDigits: 2 })} ARVO`;
}
function when(seconds: bigint) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(Number(seconds) * 1000)) + " UTC";
}

function stage(b: BonusState, now: bigint) {
  if (b.balance < b.pot && !b.snapshotTaken) return { label: "Pot not funded", tone: "warn" as const };
  if (now >= b.claimDeadline) return { label: "Claims closed", tone: "done" as const };
  if (b.snapshotTaken) return { label: now >= b.earliestMaturity ? "Claims open" : "Totals recorded", tone: "ok" as const };
  if (now >= b.earliestMaturity) return { label: "Snapshot missed", tone: "warn" as const };
  if (now >= b.closesAt) return { label: "Record totals now", tone: "warn" as const };
  return { label: "Entries open or pending", tone: "ok" as const };
}

export default function AdminBonusPage() {
  const clock = useVaultClock();
  const now = BigInt(Math.floor((clock ?? 0) / 1000));
  const [bonuses, setBonuses] = useState<BonusState[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [hash, setHash] = useState<Hash | null>(null);
  const configured = bonusAddresses().length;

  const load = useCallback(() => {
    listBonuses().then(setBonuses).catch(e => setError(e instanceof Error ? e.message : "Unable to read bonus contracts."));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function act(b: BonusState, functionName: "snapshot" | "returnToTreasury") {
    if (busy) return;
    setBusy(`${b.address}:${functionName}`); setError("");
    try {
      await transact(functionName, [], setHash, undefined, undefined, undefined, { address: b.address, abi: bonusAbi });
      setHash(null); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Transaction failed."); }
    finally { setBusy(null); }
  }

  return <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
    <PageTitle eyebrow="Rewards" title="Shared bonus." copy="Fixed ARVO bonus pots shared by stake size, one bonus contract per vault. These actions are open to any wallet; no special role is needed." />
    <p className="mt-4 text-xs"><a href="/api/admin/founding-stakers" className="font-semibold underline">Download founding stakers (CSV)</a> <span className="text-black/60">· First Edition depositors from onchain events, excluding emergency exits.</span></p>
    {error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {hash && <p className="mt-4 break-all text-xs">Submitted: {hash}</p>}
    {configured === 0 && <section className="mt-8 rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm md:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#ad7058]">Not set up yet</p>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">No bonus pot is connected to the app</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">The “+5% bonus” on First Edition is paid from a separate bonus contract that holds the ARVO pot. Until one is set up for this network, the card shows the planned bonus but nobody can earn it. Setting it up takes three steps, done once per vault, before deposits open:</p>
      <ol className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Create the bonus contract", "A one-off deployment linked to the vault. It is tested with a dry run first and only goes live with your approval."],
          ["Fund the pot", "Send exactly the bonus amount of ARVO from the Treasury Safe to the new contract. This needs the Safe owners to approve."],
          ["Connect it to the app", "Add the contract address to the server settings and rebuild. This page then shows the pot, shares and claims."],
        ].map(([title, copy], i) => <li key={title} className="rounded-xl border border-black/[0.07] bg-[#fbfaf9] p-4"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#07090b] text-xs font-semibold text-white">{i + 1}</span><p className="mt-3 text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-black/65">{copy}</p></li>)}
      </ol>
      <p className="mt-4 text-xs leading-5 text-black/55">Technical reference: <code>script/DeploySharedBonus.s.sol</code> in the contracts repo, and the <code>NEXT_PUBLIC_BONUS_ADDRESSES</code> setting.</p>
    </section>}
    {configured > 0 && bonuses === null && !error && <p role="status" className="mt-8 text-sm">Reading bonus contracts…</p>}
    {bonuses?.length === 0 && configured > 0 && <p className="mt-8 text-sm text-amber-800">Configured bonus addresses were found, but none is bound to this staking proxy and chain.</p>}

    <div className="mt-8 space-y-6">{bonuses?.map(b => {
      const s = stage(b, now);
      const canSnapshot = !b.snapshotTaken && now >= b.closesAt && now < b.earliestMaturity && b.balance >= b.pot;
      const returnable = b.balance > b.outstanding ? b.balance - b.outstanding : 0n;
      const current = bonusBps(b, b.eligible);
      const full = b.maxPrincipal > 0n ? bonusBps(b, b.maxPrincipal) : null;
      return <Panel key={b.address}>
        <PanelHeader eyebrow={`Vault #${b.poolId}`} title={`${arvo(b.pot)} bonus pot`} action={<StatusPill>{s.label}</StatusPill>} />
        <div className="grid gap-x-8 px-5 pb-2 md:grid-cols-2 md:px-6">
          <Row label="Bonus contract" value={b.address} />
          <Row label="Treasury (leftovers)" value={b.treasury} />
          <Row label="Funded balance" value={`${arvo(b.balance)}${b.balance < b.pot && !b.snapshotTaken ? " · below pot" : ""}`} />
          <Row label={b.snapshotTaken ? "Eligible ARVO (final)" : "Eligible ARVO (live)"} value={arvo(b.eligible)} />
          <Row label={b.snapshotTaken ? "Bonus rate (final)" : "Bonus rate now"} value={b.eligible === 0n ? "–" : bpsLabel(current)} />
          <Row label="Bonus rate at full capacity" value={full ? bpsLabel(full) : "Uncapped pool"} />
          <Row label="Entries close" value={when(b.closesAt)} />
          <Row label="Record totals by" value={`${when(b.earliestMaturity)} (first maturity)`} />
          <Row label="Claimed so far" value={arvo(b.totalClaimed)} />
          <Row label="Claim deadline" value={when(b.claimDeadline)} />
        </div>
        <div className="flex flex-wrap gap-3 border-t border-black/[0.06] p-5 md:p-6">
          <button disabled={!canSnapshot || Boolean(busy)} onClick={() => act(b, "snapshot")} className="rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white disabled:opacity-40">{busy === `${b.address}:snapshot` ? "Confirm in wallet…" : "Record bonus totals"}</button>
          <button disabled={returnable === 0n || Boolean(busy)} onClick={() => act(b, "returnToTreasury")} className="rounded-xl border border-black/10 px-4 py-3 text-xs font-semibold disabled:opacity-40">{busy === `${b.address}:returnToTreasury` ? "Confirm in wallet…" : `Return ${returnable > 0n ? arvo(returnable) : "unclaimed ARVO"} to Treasury`}</button>
          <p className="w-full text-xs leading-5 text-black/60">
            Record totals once, after entries close and before the first maturity. If it is missed, no bonus can be paid and the whole pot returns to the Treasury.
            Only ARVO above what is still owed to stakers can be returned before the claim deadline.
          </p>
        </div>
      </Panel>;
    })}</div>
  </div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-5 border-b border-black/[0.06] py-3"><span className="text-xs text-black/55">{label}</span><span className="max-w-[65%] break-all text-right text-xs font-semibold">{value}</span></div>;
}
