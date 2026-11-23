"use client";
import { useEffect, useRef, useState } from "react";
import { CalendarClock, CheckCircle2, Clock3, ExternalLink, LockKeyhole, Wallet } from "lucide-react";
import { openWalletPicker, walletSnapshot } from "@/lib/wallet/client";
import { signInWallet, walletErrorCode } from "@/lib/wallet/login";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { usePartnerEligible } from "@/hooks/usePartnerEligible";
import { ALLOCATION } from "@/lib/partners/allocation";

type Tranche = { tranche: number; due: string | null; amountArvo: string; status: "sent" | "due" | "upcoming" | "unscheduled"; txHash: string | null; sentAt: string | null };
type Allocation = { found: false } | { found: true; name: string; wallet: string; totalArvo: string; releasedArvo: string; remainingArvo: string; tge: string | null; lockEnds: string | null; tranches: Tranche[]; next: Tranche | null };

const arvo = (v: string) => BigInt(v).toLocaleString("en-GB");
const day = (v: string | null) => v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "To be confirmed";
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function PartnerAllocation() {
  const wallet = useWalletConnection();
  const eligible = usePartnerEligible(wallet.account);
  const [signed, setSigned] = useState<string | null>(null), [data, setData] = useState<Allocation | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const version = useRef(0);
  const authenticated = Boolean(wallet.account && signed === wallet.account.toLowerCase());

  useEffect(() => {
    const controller = new AbortController(); version.current++;
    queueMicrotask(() => { if (!controller.signal.aborted) { setSigned(null); setData(null); setError(""); } });
    if (wallet.account) void fetch("/app/wallet/session", { cache: "no-store", signal: controller.signal }).then(r => r.json()).then(d => {
      if (!controller.signal.aborted && d.session?.address === wallet.account!.toLowerCase() && d.session?.chainId === wallet.chainId) setSigned(d.session.address);
    }).catch(() => {});
    return () => controller.abort();
  }, [wallet.account, wallet.chainId]);

  useEffect(() => {
    if (!authenticated || !wallet.account) return;
    const controller = new AbortController(), generation = version.current, address = wallet.account;
    queueMicrotask(() => { if (!controller.signal.aborted) { setBusy(true); setError(""); } });
    void fetch("/app/allocation/me", { cache: "no-store", headers: { "x-arvo-wallet": address, "x-arvo-chain": String(wallet.chainId) }, signal: controller.signal })
      .then(async r => { const v = await r.json(); if (!r.ok) throw new Error(v.error || "Unable to load your allocation."); return v as Allocation; })
      .then(v => { if (generation === version.current && walletSnapshot().account?.toLowerCase() === address.toLowerCase()) setData(v); })
      .catch(e => { if (!controller.signal.aborted && generation === version.current) setError(e instanceof Error ? e.message : "Unable to load your allocation."); })
      .finally(() => { if (!controller.signal.aborted && generation === version.current) setBusy(false); });
    return () => controller.abort();
  }, [authenticated, wallet.account, wallet.chainId]);

  async function signIn() {
    if (busy) return;
    const controller = new AbortController(), generation = version.current, timer = setTimeout(() => controller.abort(), 180000);
    setBusy(true); setError("");
    try { const result = await signInWallet(controller.signal); if (generation === version.current) setSigned(result.address); }
    catch (e) { if (generation === version.current) setError(controller.signal.aborted ? "Sign-in cancelled or timed out. Try again." : signInMessage(e)); }
    finally { clearTimeout(timer); if (generation === version.current) setBusy(false); }
  }

  const found = Boolean(data && data.found);
  return <div className={`mt-8 grid gap-6 ${found ? "xl:grid-cols-[minmax(0,1fr)_400px]" : "max-w-2xl"}`}>
    <div className="min-w-0 space-y-6">
      {!wallet.account ? <Gate icon={<Wallet size={20} />} title="Strategic Partners only" copy="This page is for Arvo Strategic Partners. Connect the wallet you registered with Arvo to see your allocation and release schedule." action={<button onClick={openWalletPicker} className="rounded-xl bg-[#07090b] px-5 py-3 text-sm font-semibold text-white">Connect wallet</button>} />
        : eligible === false && !(data && data.found) ? <Gate icon={<Wallet size={20} />} title="No allocation for this wallet" copy={`There’s no Strategic Partner allocation linked to ${short(wallet.account)}. If you’re a partner, connect the wallet you registered with Arvo, or contact the team through Support.`} />
        : eligible === null && !authenticated ? <div className="rounded-[22px] border border-black/[.07] bg-white p-8 text-sm text-black/50">Checking your wallet…</div>
        : !authenticated ? <Gate icon={<LockKeyhole size={20} />} title="Sign in to view your allocation" copy={`Connected as ${short(wallet.account)}. Sign a message to prove it’s your wallet. Signing is free and doesn’t send a transaction.`} action={<button onClick={() => void signIn()} disabled={busy} className="rounded-xl bg-[#07090b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Check your wallet…" : "Sign in with wallet"}</button>} />
        : busy && !data ? <div className="rounded-[22px] border border-black/[.07] bg-white p-8 text-sm text-black/50">Loading your allocation…</div>
        : data && !data.found ? <Gate icon={<Wallet size={20} />} title="No allocation for this wallet" copy={`There’s no Strategic Partner allocation linked to ${short(wallet.account)}. If you’re a partner, connect the wallet you registered with Arvo, or contact the team through Support.`} />
        : data && data.found ? <Found data={data} /> : null}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    </div>
    {found && <Explainer />}
  </div>;
}

// Wallets reject with plain objects ({ code, message }) rather than Error instances.
function signInMessage(e: unknown) {
  const code = walletErrorCode(e);
  if (code === 4001 || code === "ACTION_REJECTED") return "The signature request was declined in your wallet. Press Sign in with wallet to try again.";
  let message = typeof e === "object" && e && "message" in e && typeof (e as { message: unknown }).message === "string" ? (e as { message: string }).message : "";
  try { const inner = JSON.parse(message) as { message?: unknown }; if (typeof inner.message === "string") message = inner.message; } catch {}
  if (code === -32602 || /must provide an ethereum address/i.test(message)) return "Your wallet didn’t recognise this account for signing. In your wallet app, select the account you connected with, then try again. If you’re connected by phone, disconnect and reconnect.";
  if (/reject|denied|cancel/i.test(message)) return "The signature request was declined in your wallet. Press Sign in with wallet to try again.";
  return message ? `Unable to sign in: ${message}` : "Unable to sign in. Check your wallet app for a signature request and try again.";
}

function Gate({ icon, title, copy, action }: { icon: React.ReactNode; title: string; copy: string; action?: React.ReactNode }) {
  return <div className="rounded-[22px] border border-black/[.07] bg-white p-6 md:p-8">
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8ede6] text-[#ad7058]">{icon}</span>
    <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em]">{title}</h2>
    <p className="mt-2 max-w-xl text-sm leading-6 text-black/55">{copy}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>;
}

function Found({ data }: { data: Extract<Allocation, { found: true }> }) {
  const done = BigInt(data.releasedArvo), total = BigInt(data.totalArvo), width = total ? Number((done * 1000n) / total) / 10 : 0;
  return <>
    <div className="relative overflow-hidden rounded-[26px] bg-[#07090b] p-6 text-white md:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#c9846a]/25 blur-3xl" />
      <p className="relative text-[11px] font-semibold uppercase tracking-[.16em] text-[#e2a98e]">{data.name ? `${data.name}’s allocation` : "Your allocation"}</p>
      <p className="relative mt-3 text-4xl font-semibold tracking-[-0.04em] tabular-nums md:text-5xl">{arvo(data.totalArvo)} <span className="text-2xl text-[#e2a98e]">ARVO</span></p>
      <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[linear-gradient(90deg,#b9775d,#f0d2b0)]" style={{ width: `${width}%` }} /></div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Released" value={`${arvo(data.releasedArvo)} ARVO`} />
        <Stat label="Still to come" value={`${arvo(data.remainingArvo)} ARVO`} />
        <Stat label="Next release" value={data.next ? `${day(data.next.due)}` : "All released"} detail={data.next ? `${arvo(data.next.amountArvo)} ARVO` : undefined} />
      </div>
      <p className="relative mt-5 text-xs text-white/45">Sent to {short(data.wallet)} · Lock ends {day(data.lockEnds)}</p>
    </div>
    <div className="rounded-[22px] border border-black/[.07] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-black/[.07] px-5 py-4 md:px-6"><h2 className="font-semibold">Release schedule</h2><span className="text-xs text-black/45">12 monthly releases</span></div>
      <ul className="divide-y divide-black/[.06]">{data.tranches.map(t => <li key={t.tranche} className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-x-3 gap-y-0.5 px-5 py-3.5 sm:grid-cols-[1.75rem_8rem_1fr_auto] md:px-6">
        <span className="text-xs font-semibold text-black/35">{String(t.tranche).padStart(2, "0")}</span>
        <span className="text-sm">{day(t.due)}</span>
        <span className="col-start-2 row-start-2 text-sm font-semibold tabular-nums sm:col-start-3 sm:row-start-1">{arvo(t.amountArvo)} ARVO</span>
        <span className="col-start-3 row-start-1 justify-self-end sm:col-start-4"><TrancheStatus t={t} /></span>
      </li>)}</ul>
    </div>
  </>;
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="rounded-2xl bg-white/[.05] p-4"><p className="text-[11px] text-white/45">{label}</p><p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>{detail && <p className="mt-0.5 text-xs text-white/50 tabular-nums">{detail}</p>}</div>;
}

function TrancheStatus({ t }: { t: Tranche }) {
  if (t.status === "sent") return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"><CheckCircle2 size={12} />Sent{t.txHash && <a href={`https://robinscan.io/tx/${t.txHash}`} target="_blank" rel="noopener noreferrer" aria-label="View transaction" className="ml-0.5 text-emerald-700 hover:text-emerald-950"><ExternalLink size={11} /></a>}</span>;
  if (t.status === "due") return <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c9846a]/12 px-2.5 py-1 text-[11px] font-semibold text-[#a9654f]"><Clock3 size={12} />Being sent</span>;
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[.04] px-2.5 py-1 text-[11px] font-semibold text-black/45"><CalendarClock size={12} />{t.status === "upcoming" ? "Scheduled" : "Date to be confirmed"}</span>;
}

function Explainer() {
  return <aside className="h-fit rounded-[22px] border border-black/[.07] bg-white p-6 xl:sticky xl:top-28">
    <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#ad7058]">How your allocation is worked out</p>
    <ol className="mt-4 space-y-5 text-sm leading-6 text-black/60">
      <li><span className="block font-semibold text-[#07090b]">1. Set at the graduation price</span>Your agreed amount converts to ARVO at the <strong className="text-[#07090b]">ARVO graduation price of ${ALLOCATION.priceUsd}</strong>: the price ARVO opened at on 25 September 2026, when it graduated and first became available to trade. Every partner converts at this same price, and your ARVO amount is fixed. It isn’t re-priced later.</li>
      <li><span className="block font-semibold text-[#07090b]">2. It comes from an existing allocation</span>Your ARVO comes from the Strategic Partners &amp; Advisors allocation in ARVO’s published tokenomics. No new tokens are created.</li>
      <li><span className="block font-semibold text-[#07090b]">3. It follows that allocation’s vesting</span>Locked for {ALLOCATION.cliffMonths} months from the token generation event (TGE), then released in {ALLOCATION.releaseMonths} equal monthly instalments, so the full amount arrives over a year.</li>
      <li><span className="block font-semibold text-[#07090b]">4. Releases go to your registered wallet</span>The Arvo team sends each instalment to the wallet you confirmed. Sent releases show here with a link to the transaction.</li>
    </ol>
    <p className="mt-5 rounded-xl bg-[#f8f2ed] p-3.5 text-xs leading-5 text-black/50">Amounts are rounded down to whole ARVO. The final instalment includes any remainder, so the total always adds up.</p>
  </aside>;
}
