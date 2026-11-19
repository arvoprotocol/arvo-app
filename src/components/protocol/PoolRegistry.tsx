"use client";
import {usePoolTitles} from "@/hooks/usePoolTitles";
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
function date(seconds: bigint) { return seconds === BigInt("0") ? "Open-ended" : new Date(Number(seconds) * 1000).toLocaleString(); }
function status(pool: PoolConfig, now: bigint) {
  if (pool.finalized) return "Finalized";
  if (!pool.enabled) return "Disabled";
  if (now < pool.opensAt) return "Scheduled";
  if (pool.closesAt !== BigInt("0") && now >= pool.closesAt) return "Closed";
  return "Open";
}
export function PoolRegistry() {
  const [calldata, setCalldata] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState("");
  const [offset, setOffset] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState<{ total: number; rows: Row[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const titles = usePoolTitles(refresh);
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
  async function control(functionName: string, args: readonly unknown[]) {
    if (busy || pending) return;
    setBusy(true); setError("");
    setCalldata(encodeFunctionData({abi: stakingAbi, functionName, args}));
    try { await transact(functionName, args, hash => setPending(hash), "VAULT_MANAGER_ROLE"); setPending(""); setRefresh(x => x + 1); }
    catch (e) { setError(e instanceof Error ? e.message : "Control failed."); }
    finally { setBusy(false); }
  }
  const count = (state: string) => data ? String(data.rows.filter((row) => row.status === state).length) : "–";
  return <>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total pools" value={data ? String(data.total) : "–"} detail="Created on-chain" icon={<Boxes size={16} />} />
      <StatCard label="Open on this page" value={count("Open")} detail="Currently accepting stakes" icon={<ShieldCheck size={16} />} />
      <StatCard label="Scheduled on this page" value={count("Scheduled")} detail="Waiting to open" icon={<CalendarClock size={16} />} />
      <StatCard label="Finalized on this page" value={count("Finalized")} detail="Permanently closed" icon={<LockKeyhole size={16} />} />
    </section>
    <section className="mt-8"><Panel>
      <PanelHeader eyebrow="Pool registry" title="All pools" action={<Link href="/app/admin/pools/create" className="inline-flex items-center gap-2 rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white"><Plus size={14} />Create pool</Link>} />
      <div className="p-5 md:p-6">
        {!configured && <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-black/[0.018] px-6 text-center"><StatusPill>Pre-deployment</StatusPill><h3 className="mt-4 text-xl font-semibold">No contract data yet.</h3><p className="mt-2 max-w-md text-sm leading-6 text-black/40">Configure pool terms now. Pools will appear here after the staking proxy is connected on testnet.</p></div>}
        {calldata && <label className="mb-4 block text-xs">Selected control calldata for the staking proxy (Safe/timelock)<textarea readOnly value={calldata} rows={3} className="mt-2 w-full rounded-xl border border-black/10 p-3" /></label>}
        {busy && !pending && <p role="status" className="mb-3 text-xs text-black/60">Checking the request. If your wallet opens, approve the network switch or transaction to continue.</p>}
        {pending && <p className="break-all text-xs">Submitted: {pending}. Check confirmation in your wallet before another control transaction.</p>}
        {loading && <p role="status" className="py-10 text-center text-sm text-black/50">Loading on-chain pools…</p>}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-xs text-red-800">{error}</p>}
        {data && data.total === 0 && <p className="py-10 text-center text-sm text-black/50">No pools have been created on this staking contract.</p>}
        {data && data.rows.length > 0 && <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-black/10 text-black/45">{["Pool", "Status", "Cycle", "Rewards per cycle", "Window", "Principal capacity", "Remaining reward budget", "Visibility & deposits"].map((label) => <th key={label} className="whitespace-nowrap px-3 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{data.rows.map((row) => <tr key={row.id} className="border-b border-black/[0.06] align-top"><td className="px-3 py-4 font-semibold">#{row.id} {titles[row.id] ?? names[row.pool.kind] ?? "Pool"}</td><td className="px-3 py-4"><StatusPill tone={row.status === "Open" ? "good" : "neutral"}>{row.status}</StatusPill></td><td className="whitespace-nowrap px-3 py-4">{row.vault.duration / 86400} days</td><td className="whitespace-nowrap px-3 py-4">ARVO {row.vault.arvoRewardBps / 100}%<br />USDG {row.vault.usdcRewardBps / 100}%</td><td className="whitespace-nowrap px-3 py-4">{date(row.pool.opensAt)}<br />{date(row.pool.closesAt)}</td><td className="whitespace-nowrap px-3 py-4">ARVO {row.pool.maxArvoPrincipal === BigInt("0") ? "Uncapped" : tokenDisplay(row.pool.maxArvoPrincipal, 18)}<br />USDG {row.pool.maxUsdcPrincipal === BigInt("0") ? "Uncapped" : tokenDisplay(row.pool.maxUsdcPrincipal, 6)}</td><td className="whitespace-nowrap px-3 py-4">ARVO {tokenDisplay(row.pool.arvoRewardBudgetRemaining, 18)}<br />USDG {tokenDisplay(row.pool.usdcRewardBudgetRemaining, 6)}</td><td className="min-w-[210px] px-3 py-4"><label className="block text-xs">Visibility<select value={row.visibility} disabled={busy || Boolean(pending)} onChange={e => control("setPoolVisibility", [row.id, Number(e.target.value)])} className="mt-2 w-full rounded-lg border border-black/10 p-2"><option value={0}>Hidden</option><option value={1}>Opening soon</option><option value={2}>Published</option></select></label><button disabled={busy || Boolean(pending) || row.pool.finalized || (!row.pool.enabled && Number(row.pool.opensAt) <= Date.now() / 1000)} onClick={() => control("setPoolEnabled", [row.id, !row.pool.enabled])} className="mt-2 rounded-lg border border-black/10 p-2 text-xs disabled:opacity-40">{row.pool.enabled ? "Close deposits" : "Try enabling deposits"}</button><button disabled={busy || Boolean(pending) || row.pool.enabled || row.pool.finalized} onClick={() => { if (window.confirm(`Permanently finalize pool #${row.id}? This cannot be undone. Existing user positions remain governed by the contract.`)) void control("finalizePool", [row.id]); }} className="mt-2 block rounded-lg border border-black/10 p-2 text-xs disabled:opacity-40">{row.pool.finalized ? "Finalized" : "Finalize closed pool"}</button><p className="mt-2 text-[10px] text-black/45">Visibility does not close on-chain deposits. Closed pools cannot reopen after their opening time.</p></td></tr>)}</tbody></table></div>}
        {configured && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs"><button type="button" disabled={loading} onClick={() => setRefresh((value) => value + 1)} className="rounded-lg border border-black/10 px-3 py-2 disabled:opacity-40">Refresh</button><div className="flex items-center gap-3"><button type="button" disabled={loading || offset === 0} onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))} className="rounded-lg border border-black/10 px-3 py-2 disabled:opacity-40">Newer</button><span>Page {Math.floor(offset / PAGE_SIZE) + 1}</span><button type="button" disabled={loading || !data || offset + PAGE_SIZE >= data.total} onClick={() => setOffset((value) => value + PAGE_SIZE)} className="rounded-lg border border-black/10 px-3 py-2 disabled:opacity-40">Older</button></div></div>}
      </div>
    </Panel></section>
  </>;
}
