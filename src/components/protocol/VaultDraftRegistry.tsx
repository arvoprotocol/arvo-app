"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { draftPreview, type VaultDraft } from "@/lib/staking/vault-draft";
import { stakingConnection } from "@/lib/staking/pool-transactions";

export function VaultDraftRegistry() {
  const [rows, setRows] = useState<VaultDraft[]>([]), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const [poolIds, setPoolIds] = useState<Record<number, string>>({});
  const [referencePrice, setReferencePrice] = useState("");
  const sending = useRef(false);
  const load = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/api/admin/vault-drafts", { cache: "no-store", signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load vault drafts.");
    setRows(data.drafts);
  }, []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal).catch(e => { if (!controller.signal.aborted) setError(e.message); }); return () => controller.abort(); }, [load]);
  async function mutate(url: string, body?: unknown, method = body ? "PATCH" : "POST") {
    if (sending.current) return;
    sending.current = true; setBusy(true); setError("");
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update vault draft.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to update draft."); }
    finally { sending.current = false; setBusy(false); }
  }
  return <section className="mt-8 rounded-[22px] border border-black/10 bg-white p-5 md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-black/40">Before launch</p><h2 className="mt-2 text-xl font-semibold">Vault drafts</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-black/50">Save terms, choose visibility and preview vaults before deployment. Opening soon previews never accept deposits.</p></div>
      <Link href="/app/admin/pools/create" className="rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white">Create vault draft</Link></div>
    <label className="mt-5 block max-w-sm text-xs font-semibold">Approved ARVO reference price (USD)<input value={referencePrice} onChange={e => setReferencePrice(e.target.value)} inputMode="decimal" placeholder="Enter approved price" className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm font-normal" /></label>
    <button type="button" disabled={busy || !referencePrice.trim()} onClick={() => void mutate("/api/admin/vault-drafts/standard", { referencePrice }, "POST")} className="mt-5 rounded-xl border border-black/10 px-4 py-3 text-xs font-semibold disabled:opacity-40">{busy ? "Saving…" : "Add four standard drafts"}</button>
    <p className="mt-2 text-[11px] text-black/40">Adds missing presets with $500-equivalent / 110% token minimums. Existing drafts are preserved; edit and save their minimums separately.</p>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-800">{error}</p>}
    {!rows.length && !error && <p className="mt-5 text-sm text-black/50">No saved drafts yet. Add the standard vaults or create your own.</p>}
    <div className="mt-5 space-y-3">{rows.map(row => { const preview = draftPreview(row), linked = row.linkedPoolId !== null; return <div key={row.id} className="rounded-xl border border-black/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">{row.title}</h3><p className="mt-1 text-xs text-black/50">{preview.days} days · ARVO {preview.arvoRate}% · USDC {preview.usdcRate}% · {linked ? `Linked to pool #${row.linkedPoolId}` : row.visibility === "openingSoon" ? "Upcoming" : "Hidden"}</p></div>
        <Link href={`/app/admin/pools/drafts/${row.id}`} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold">{linked ? "View terms" : "Edit draft"}</Link></div>
      {!linked && stakingConnection() && <div className="mt-4 flex flex-wrap items-center gap-3"><label className="text-xs">On-chain pool ID <input aria-label={`On-chain pool ID for ${row.title}`} value={poolIds[row.id] || ""} onChange={e => setPoolIds(current => ({ ...current, [row.id]: e.target.value }))} className="ml-2 w-20 rounded-lg border border-black/15 p-2" inputMode="numeric" /></label>
        <button type="button" disabled={busy || !/^\d+$/.test(poolIds[row.id] || "")} onClick={() => void mutate(`/api/admin/vault-drafts/${row.id}`, { action: "link", revision: row.revision, poolId: poolIds[row.id] })} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold disabled:opacity-40">Verify and link pool</button></div>}
      {linked && <p className="mt-3 text-[11px] leading-5 text-black/40">Terms are locked. On-chain visibility and deposit controls are managed in the pool registry below.</p>}
    </div>; })}</div>
  </section>;
}
