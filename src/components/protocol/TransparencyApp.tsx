import { formatUnits } from "viem";
import { ArrowUpRight, Check, Coins, FileCheck2, Landmark, Lock, ShieldCheck, X } from "lucide-react";
import { SokenLogo } from "@/components/protocol/SokenBadge";
import { Panel, PanelHeader } from "@/components/protocol/ProtocolUI";
import type { Transparency } from "@/lib/protocol/transparency";
import { ADDITIONAL_REVIEWS, AUDITS, GITHUB, SAFEGUARDS } from "@/lib/protocol/security";

const fmt = (value: bigint, decimals: number) => Number(formatUnits(value, decimals)).toLocaleString("en-GB", { maximumFractionDigits: decimals === 6 ? 2 : 0 });
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/** In-app transparency: a dark security card, then light cards in the style of the Governance page. */
export function TransparencyApp({ t }: { t: Transparency }) {
  const link = (address: string) => t.explorer ? `${t.explorer.url}/address/${address}` : undefined;
  const live = t.live;
  return <>
    <section id="security" aria-labelledby="security-title" className="relative mt-8 scroll-mt-24 overflow-hidden rounded-[28px] border border-white/10 bg-[#07090b] p-6 text-white md:p-9 lg:p-12">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#c9846a]/15 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2a98e]">Security</p><h2 id="security-title" className="mt-3 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">Audited by <span className="sr-only">Soken</span></h2></div>
        <SokenLogo className="h-9 w-auto text-white" />
      </div>
      <div className="relative mt-8 grid gap-4 lg:grid-cols-2">{AUDITS.map(a => <article key={a.scope} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e2a98e]">{a.auditor} · {a.date}</p>
        <h3 className="mt-3 text-xl font-semibold">{a.scope}</h3>
        <p className="mt-3 text-sm leading-6 text-white/55">{a.detail}</p>
        <p className="mt-3 text-sm leading-6 text-white/80">{a.result}</p>
        <p className="mt-3 text-xs text-white/40">Reviewed code: {a.reviewed}</p>
        <a href={a.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#e2a98e] hover:text-white">View Soken’s audit index<ArrowUpRight size={14} /></a>
      </article>)}
      {ADDITIONAL_REVIEWS.map(r => <article key={r.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e2a98e]">Additional review</p>
        <h3 className="mt-3 text-xl font-semibold">{r.title}</h3>
        <p className="mt-3 text-sm leading-6 text-white/60">{r.body}</p>
        <a href={r.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#e2a98e] hover:text-white">{r.link}<ArrowUpRight size={14} /></a>
      </article>)}</div>
    </section>

    <section aria-label="Safeguards" className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{SAFEGUARDS.map(s => <article key={s.title} className="rounded-2xl border border-black/[0.08] bg-white/70 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9846a]/10 text-[#a9654f]"><ShieldCheck size={19} /></div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{s.title}</h3>
      <p className="mt-3 text-sm leading-6 text-black/50">{s.body}</p>
    </article>)}</section>
    <p className="mt-4 text-xs leading-5 text-black/45">Source code: <a className="font-semibold text-[#ad7058] hover:text-black" href={GITHUB.contracts} target="_blank" rel="noreferrer">contracts</a> · <a className="font-semibold text-[#ad7058] hover:text-black" href={GITHUB.app} target="_blank" rel="noreferrer">app</a>. Audits reduce risk but do not remove it; smart contracts and tokens carry technical and market risk.</p>

    <section id="reserves" className="mt-8 scroll-mt-24"><Panel>
      <PanelHeader eyebrow="Live reserves" title="What the contract holds and owes" action={live ? <div className="flex flex-wrap gap-2 text-xs">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold ${live.arvoSolvent && live.usdcSolvent ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{live.arvoSolvent && live.usdcSolvent ? <Check size={13} /> : <X size={13} />}{live.arvoSolvent && live.usdcSolvent ? "Fully covers what it owes" : "Solvency check failed"}</span>
        <span className={`rounded-full px-3 py-1.5 font-semibold ${live.paused ? "bg-amber-50 text-amber-800" : "bg-black/[0.04] text-black/60"}`}>{live.paused ? "Deposits paused" : "Deposits not paused"}</span>
      </div> : undefined} />
      {live ? <div className="p-5 md:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{([
          [Coins, "ARVO staked", `${fmt(live.arvoStaked, 18)} ARVO`],
          [Coins, "ARVO rewards owed", `${fmt(live.arvoRewardsOwed, 18)} ARVO`],
          [Lock, "ARVO reward budgets reserved", `${fmt(live.arvoRewardsReserved, 18)} ARVO`],
          [Landmark, "ARVO held by the contract", `${fmt(live.arvoHeld, 18)} ARVO`],
          [Coins, "USDG staked", `${fmt(live.usdcStaked, 6)} USDG`],
          [Coins, "USDG rewards owed", `${fmt(live.usdcRewardsOwed, 6)} USDG`],
          [FileCheck2, "Positions opened", live.positions.toLocaleString("en-GB")],
          [FileCheck2, "Vaults created", live.vaults.toLocaleString("en-GB")],
        ] as const).map(([Icon, label, value]) => <div key={label} className="rounded-2xl border border-black/[0.07] bg-[#fbf8f5] p-5">
          <p className="flex items-center gap-2 text-xs text-black/50"><Icon size={14} className="text-[#ad7058]" />{label}</p>
          <p className="mt-2 text-lg font-semibold tabular-nums">{value}</p>
        </div>)}</div>
        <p className="mt-4 text-xs text-black/40">Read from the contract at {new Date(t.readAt).toUTCString()}; refreshed every minute.</p>
      </div> : <p className="p-6 text-sm text-black/55">{t.error}</p>}
    </Panel></section>

    <section id="governance" className="mt-6 scroll-mt-24"><Panel>
      <PanelHeader eyebrow="Governance" title="Who controls what, verified onchain" />
      {t.roles.length ? <div className="divide-y divide-black/[0.06]">{t.roles.map(r => <div key={r.role} className="grid gap-2 px-5 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.6fr)_auto] md:items-center md:gap-4 md:px-6">
        <p className="font-semibold">{r.role}</p>
        <a className="font-mono text-xs text-[#ad7058] hover:text-black" href={link(r.address)} target="_blank" rel="noreferrer">{r.holder} · {short(r.address)}</a>
        <p className="text-sm text-black/55">{r.powers}</p>
        <p className="text-xs font-semibold">{r.verified === true ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"><Check size={12} />Verified</span> : r.verified === false ? <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-red-700"><X size={12} />Not held</span> : <span className="text-black/40">Unavailable</span>}</p>
      </div>)}</div> : <p className="p-6 text-sm text-black/55">Governance addresses will be published here at deployment.</p>}
    </Panel></section>

    <section id="contracts" className="mt-6 scroll-mt-24"><Panel>
      <PanelHeader eyebrow="Contracts" title={`Addresses on ${t.network}`} />
      <p className="border-b border-black/[0.06] px-5 py-4 text-sm leading-6 text-black/55 md:px-6">Only interact with these addresses. Arvo will never ask you to send tokens to any other address or to share your seed phrase.</p>
      {t.addresses.length ? <div className="divide-y divide-black/[0.06]">{t.addresses.map(a => <div key={a.label + a.address} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-6">
        <div><p className="font-semibold">{a.label}</p>{a.note && <p className="mt-1 text-xs text-black/45">{a.note}</p>}</div>
        <a href={link(a.address)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all font-mono text-xs text-[#ad7058] hover:text-black">{a.address}<ArrowUpRight size={12} className="shrink-0" /></a>
      </div>)}</div> : <p className="p-6 text-sm text-black/55">{t.error}</p>}
    </Panel></section>
  </>;
}
