"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Undo2 } from "lucide-react";

async function send(url: string, method: string, body: unknown) {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Something went wrong.");
  return result;
}

export function AllocationInput({ id, usd, locked }: { id: number; usd: string | null; locked: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(usd ?? ""), [busy, setBusy] = useState(false), [error, setError] = useState(""), [saved, setSaved] = useState(false);
  const changed = value.trim() !== (usd ?? "");
  async function save() {
    setBusy(true); setError(""); setSaved(false);
    try { await send(`/api/admin/partners/${id}/allocation`, "PUT", { allocationUsd: value.trim() || null }); setSaved(true); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to save."); }
    finally { setBusy(false); }
  }
  return <div>
    <div className="flex items-center gap-2">
      <span className="text-sm text-black/40">$</span>
      <input value={value} onChange={e => { setValue(e.target.value); setSaved(false); }} disabled={locked || busy} inputMode="decimal" placeholder="0.00" aria-label="Amount owed in USD" className="w-28 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm tabular-nums outline-none focus:border-[#ad7058]/60 disabled:bg-black/[.03] disabled:text-black/50" />
      {changed && !locked && <button onClick={() => void save()} disabled={busy} className="rounded-lg bg-[#07090b] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>}
      {saved && !changed && <Check size={14} className="text-emerald-700" />}
    </div>
    {locked && <p className="mt-1 text-[11px] text-black/40">Locked: releases recorded</p>}
    {error && <p className="mt-1 text-[11px] text-red-700">{error}</p>}
  </div>;
}

export function ReleaseAction({ id, tranche, sent, txHash, due }: { id: number; tranche: number; sent: boolean; txHash: string | null; due: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false), [hash, setHash] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function run(method: "POST" | "DELETE") {
    if (method === "DELETE" && !window.confirm("Undo this recorded release? This only changes the record, not anything onchain.")) return;
    setBusy(true); setError("");
    try { await send(`/api/admin/partners/${id}/releases`, method, { tranche, txHash: hash.trim() || undefined }); setOpen(false); setHash(""); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to update."); }
    finally { setBusy(false); }
  }
  if (sent) return <div className="flex items-center gap-2">
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"><Check size={12} />Sent</span>
    {txHash && <a href={`https://robinscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-[#ad7058]">Tx ↗</a>}
    <button onClick={() => void run("DELETE")} disabled={busy} aria-label="Undo" title="Undo record" className="text-black/35 hover:text-black"><Undo2 size={13} /></button>
    {error && <span className="text-[11px] text-red-700">{error}</span>}
  </div>;
  if (!open) return <button onClick={() => setOpen(true)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${due ? "bg-[#07090b] text-white" : "border border-black/10 text-black/60 hover:border-black/30"}`}>Mark as sent</button>;
  return <div className="w-full max-w-md">
    <div className="flex flex-wrap items-center gap-2">
      <input value={hash} onChange={e => setHash(e.target.value)} placeholder="Transaction hash 0x… (optional)" className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 font-mono text-[11px] outline-none focus:border-[#ad7058]/60" />
      <button onClick={() => void run("POST")} disabled={busy} className="rounded-lg bg-[#07090b] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Record"}</button>
      <button onClick={() => { setOpen(false); setError(""); }} className="text-xs text-black/45">Cancel</button>
    </div>
    {error && <p className="mt-1 text-[11px] text-red-700">{error}</p>}
  </div>;
}

export function CopyWallet({ wallet }: { wallet: string }) {
  const [copied, setCopied] = useState(false);
  return <button onClick={() => { void navigator.clipboard.writeText(wallet).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {}); }} title={wallet} className="inline-flex items-center gap-1.5 font-mono text-[11px] text-black/55 hover:text-black">
    {wallet.slice(0, 8)}…{wallet.slice(-6)} {copied ? <Check size={11} className="text-emerald-700" /> : <Copy size={11} />}
  </button>;
}
