"use client";
import {usePoolMetadata} from "@/hooks/usePoolTitles";
import {tokenDisplay} from "@/lib/staking/presentation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, CalendarClock, LockKeyhole, Plus, ShieldCheck } from "lucide-react";
import { transact } from "@/lib/staking/user-transactions";
import { encodeFunctionData, formatUnits } from "viem";
import { Panel, PanelHeader, StatCard, StatusPill } from "./ProtocolUI";
import { stakingAbi, stakingConnection } from "@/lib/staking/pool-transactions";

type PoolConfig = {
  kind: number; opensAt: bigint; closesAt: bigint; maxArvoPrincipal: bigint; maxUsdcPrincipal: bigint;
  arvoRewardBudgetRemaining: bigint; usdcRewardBudgetRemaining: bigint; enabled: boolean; finalized: boolean;
};
type VaultConfig = { duration: number; arvoRewardBps: number; usdcRewardBps: number };
type Row = { id: number; pool: PoolConfig; vault: VaultConfig; status: string; visibility: number; products: number };
const PAGE_SIZE = 20;
const names = ["Build", "Advance", "Compound", "Foundation", "Custom"];
function date(seconds: bigint) { return seconds === BigInt("0") ? "Open-ended" : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(Number(seconds) * 1000)) + " UTC"; }
const visibilityLabels = ["Hidden", "Opening soon", "Published"];
function Fact({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? "col-span-2" : ""}><dt className="text-black/55">{label}</dt><dd className="mt-0.5 font-semibold text-[#07090b]">{value}</dd></div>;
}
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2"><span className="w-32 shrink-0 font-semibold text-black/70">{label}</span><code className="min-w-0 flex-1 truncate font-mono text-[11px]">{value}</code><button type="button" onClick={() => { void navigator.clipboard?.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }} className="shrink-0 rounded-md border border-black/10 px-2 py-1 text-[11px] font-semibold hover:border-black/25">{copied ? "Copied" : "Copy"}</button></div>;
}
function status(pool: PoolConfig, now: bigint) {
  if (pool.finalized) return "Finalized";
  if (!pool.enabled) return "Disabled";
  if (now < pool.opensAt) return "Scheduled";
  if (pool.closesAt !== BigInt("0") && now >= pool.closesAt) return "Closed";
  return "Open";
}
export function PoolRegistry() {
  const [safeTx, setSafeTx] = useState<{ what: string; to: string; data: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState("");
  const [offset, setOffset] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState<{ total: number; rows: Row[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { titles, extras } = usePoolMetadata(refresh);
  const [appBusy, setAppBusy] = useState<number | null>(null);
  async function setAppHidden(poolId: number, hidden: boolean) {
    if (appBusy !== null) return;
    setAppBusy(poolId); setError("");
    try {
      const response = await fetch("/api/admin/vault-drafts/app-hidden", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ poolId, hidden }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update the app.");
      setRefresh(x => x + 1);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update the app."); }
    finally { setAppBusy(null); }
  }
  const configured = Boolean(stakingConnection());
  useEffect(() => {
    let cancelled = false;
    const connection = stakingConnection();
    if (!connection) return;
    setLoading(true); setError(""); setData(null);
    async function load() {
      const { publicClient, address, chain } = connection!;
      if (await publicClient.getChainId() !== chain.id) throw new Error("Configured RPC does not match the staking chain ID.");
      const code = await publicClient.getCode({ address });
      if (!code || code === "0x") throw new Error("No contract found at the configured staking proxy.");
      const block = await publicClient.getBlock();
      const nextId = await publicClient.readContract({ address, abi: stakingAbi, functionName: "nextVaultId", blockNumber: block.number });
      const total = Number(nextId);
      if (!Number.isSafeInteger(total) || total < 0 || total > 4294967295) throw new Error("Invalid pool count returned by the contract.");
      const ids = Array.from({ length: Math.max(0, Math.min(PAGE_SIZE, total - offset)) }, (_, index) => total - 1 - offset - index);
      const rows = await Promise.all(ids.map(async (id): Promise<Row> => {
        const [pool, vault, visibility, products] = await Promise.all([
          publicClient.readContract({ address, abi: stakingAbi, functionName: "pool", args: [id], blockNumber: block.number }),
          publicClient.readContract({ address, abi: stakingAbi, functionName: "vault", args: [id], blockNumber: block.number }),
          publicClient.readContract({ address, abi: stakingAbi, functionName: "poolVisibility", args: [id], blockNumber: block.number }),
          publicClient.readContract({ address, abi: stakingAbi, functionName: "poolProducts", args: [id], blockNumber: block.number }),
        ]);
        const config = pool as PoolConfig;
        return { id, pool: config, vault: vault as VaultConfig, status: status(config, block.timestamp), visibility: Number(visibility), products: Number(products) };
      }));
      if (!cancelled) setData({ total, rows });
    }
    load().catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load pools."); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [offset, refresh]);
  async function control(functionName: string, args: readonly unknown[], what: string) {
    if (busy || pending) return;
    setBusy(true); setError("");
    const c = stakingConnection();
    if (c) setSafeTx({ what, to: c.address, data: encodeFunctionData({abi: stakingAbi, functionName, args}) });
    try { await transact(functionName, args, hash => setPending(hash), "VAULT_MANAGER_ROLE"); setPending(""); setSafeTx(null); setRefresh(x => x + 1); }
    catch (e) { setError(e instanceof Error ? e.message : "Control failed."); }
    finally { setBusy(false); }
  }
  const count = (state: string) => data ? String(data.rows.filter((row) => row.status === state).length) : "–";
  return <>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Live vaults" value={data ? String(data.total) : "–"} detail="Created onchain" icon={<Boxes size={16} />} />
      <StatCard label="Open now" value={count("Open")} detail="Currently accepting stakes" icon={<ShieldCheck size={16} />} />
      <StatCard label="Scheduled" value={count("Scheduled")} detail="Waiting to open" icon={<CalendarClock size={16} />} />
      <StatCard label="Finalized" value={count("Finalized")} detail="Permanently closed" icon={<LockKeyhole size={16} />} />
    </section>
    <section className="mt-8"><Panel>
      <PanelHeader eyebrow="Onchain" title="Live vaults" action={<Link href="/app/admin/pools/create" className="inline-flex items-center gap-2 rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white"><Plus size={14} />Create vault</Link>} />
      <div className="p-5 md:p-6">
        {!configured && <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-black/[0.018] px-6 text-center"><StatusPill>Pre-deployment</StatusPill><h3 className="mt-4 text-xl font-semibold">No contract data yet.</h3><p className="mt-2 max-w-md text-sm leading-6 text-black/55">Configure pool terms now. Pools will appear here after the staking proxy is connected on testnet.</p></div>}
        {safeTx && <div className="mb-5 rounded-2xl border border-[#c9846a]/35 bg-[#fbf3ee] p-5">
          <p className="text-sm font-semibold">Send this through the Governance Safe</p>
          <p className="mt-1 text-xs leading-5 text-black/70">{safeTx.what}. If your wallet doesn’t hold the Vault manager role, create a new transaction in the Safe with these details, then have the owners sign.</p>
          <div className="mt-3 grid gap-2 text-xs">
            <CopyRow label="To (staking contract)" value={safeTx.to} />
            <CopyRow label="Value" value="0" />
            <CopyRow label="Data" value={safeTx.data} />
          </div>
          <button type="button" onClick={() => setSafeTx(null)} className="mt-3 text-xs font-semibold text-black/60 hover:text-black">Dismiss</button>
        </div>}
        {busy && !pending && <p role="status" className="mb-3 text-xs text-black/60">Checking the request. If your wallet opens, approve the network switch or transaction to continue.</p>}
        {pending && <p className="break-all text-xs">Submitted: {pending}. Check confirmation in your wallet before another control transaction.</p>}
        {loading && <p role="status" className="py-10 text-center text-sm text-black/50">Loading on-chain pools…</p>}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-xs text-red-800">{error}</p>}
        {data && data.total === 0 && <p className="py-10 text-center text-sm text-black/50">No pools have been created on this staking contract.</p>}
        {data && data.rows.length > 0 && <div className="grid gap-4 xl:grid-cols-2">{data.rows.map(row => <article key={row.id} className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-black/55">Vault #{row.id}</p><h3 className="mt-0.5 text-lg font-semibold tracking-[-0.02em]">{titles[row.id] ?? names[row.pool.kind] ?? "Vault"}</h3></div><div className="flex flex-wrap gap-1.5">{extras[row.id]?.appHidden && <StatusPill>Hidden in app</StatusPill>}<StatusPill tone={row.status === "Open" ? "good" : "neutral"}>{row.status}</StatusPill><StatusPill tone={row.visibility === 2 ? "warm" : "neutral"}>{visibilityLabels[row.visibility] ?? "Unknown"}</StatusPill></div></div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-3">
            <Fact label="Term" value={`${row.vault.duration / 86400} days`} />
            <Fact label="Fixed reward" value={[row.vault.arvoRewardBps ? `${row.vault.arvoRewardBps / 100}% ARVO` : "", row.vault.usdcRewardBps ? `${row.vault.usdcRewardBps / 100}% USDG` : ""].filter(Boolean).join(" + ") || "None"} />
            <Fact label="Deposits" value={`${date(row.pool.opensAt)} → ${row.pool.closesAt === BigInt("0") ? "no end date" : date(row.pool.closesAt)}`} wide />
            <Fact label="Vault size" value={[row.pool.maxArvoPrincipal ? `${tokenDisplay(row.pool.maxArvoPrincipal, 18)} ARVO` : "", row.pool.maxUsdcPrincipal ? `${tokenDisplay(row.pool.maxUsdcPrincipal, 6)} USDG` : ""].filter(Boolean).join(" + ") || "No limit"} />
            <Fact label="Rewards left to give" value={`${tokenDisplay(row.pool.arvoRewardBudgetRemaining, 18)} ARVO · ${tokenDisplay(row.pool.usdcRewardBudgetRemaining, 6)} USDG`} wide />
          </dl>
          <div className="mt-5 flex flex-wrap items-end gap-2 border-t border-black/[0.06] pt-4">
            <label className="text-xs font-semibold text-black/70">Shown in the app<select value={row.visibility} disabled={busy || Boolean(pending)} onChange={e => control("setPoolVisibility", [row.id, Number(e.target.value)], `${visibilityLabels[Number(e.target.value)]}: vault #${row.id}`)} className="mt-1.5 block w-44 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-normal"><option value={0}>Hidden</option><option value={1}>Opening soon</option><option value={2}>Published</option></select></label>
            <button disabled={busy || Boolean(pending) || row.pool.finalized || (!row.pool.enabled && Number(row.pool.opensAt) <= Date.now() / 1000)} onClick={() => control("setPoolEnabled", [row.id, !row.pool.enabled], `${row.pool.enabled ? "Close" : "Enable"} deposits: vault #${row.id}`)} className="rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold hover:border-black/25 disabled:opacity-40">{row.pool.enabled ? "Close deposits" : "Enable deposits"}</button>
            <button disabled={busy || Boolean(pending) || row.pool.enabled || row.pool.finalized} onClick={() => { if (window.confirm(`Permanently finalize vault #${row.id}? This cannot be undone. Existing stakes stay claimable.`)) void control("finalizePool", [row.id], `Finalize vault #${row.id}`); }} className="rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold hover:border-black/25 disabled:opacity-40">{row.pool.finalized ? "Finalized" : "Finalize"}</button>
          </div>
          {titles[row.id] !== undefined && <label className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#fbfaf9] px-3 py-2.5 text-xs"><input type="checkbox" className="mt-0.5 accent-[#07090b]" checked={Boolean(extras[row.id]?.appHidden)} disabled={appBusy !== null} onChange={e => void setAppHidden(row.id, e.target.checked)} /><span><span className="font-semibold">Hide from the app’s vault lists</span><span className="block text-black/60">No transaction needed. The vault stays onchain and existing stakers still see and claim their positions.</span></span></label>}
          <p className="mt-3 text-[11px] leading-5 text-black/55">“Shown in the app” is the onchain setting and needs the vault manager role. Closing deposits stops new stakes; once a vault has opened, closed deposits can’t be reopened. Finalize releases unused rewards after closing.</p>
        </article>)}</div>}
        {configured && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs"><button type="button" disabled={loading} onClick={() => setRefresh((value) => value + 1)} className="rounded-lg border border-black/10 px-3 py-2 disabled:opacity-40">Refresh</button><div className="flex items-center gap-3"><button type="button" disabled={loading || offset === 0} onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))} className="rounded-lg border border-black/10 px-3 py-2 disabled:opacity-40">Newer</button><span>Page {Math.floor(offset / PAGE_SIZE) + 1}</span><button type="button" disabled={loading || !data || offset + PAGE_SIZE >= data.total} onClick={() => setOffset((value) => value + PAGE_SIZE)} className="rounded-lg border border-black/10 px-3 py-2 disabled:opacity-40">Older</button></div></div>}
      </div>
    </Panel></section>
  </>;
}
