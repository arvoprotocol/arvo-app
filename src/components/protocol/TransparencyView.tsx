import { formatUnits } from "viem";
import { SokenLogo } from "@/components/protocol/SokenBadge";
import type { Transparency } from "@/lib/protocol/transparency";
import { ADDITIONAL_REVIEWS, AUDITS, GITHUB, SAFEGUARDS } from "@/lib/protocol/security";

const fmt = (value: bigint, decimals: number) => Number(formatUnits(value, decimals)).toLocaleString("en-GB", { maximumFractionDigits: decimals === 6 ? 2 : 0 });
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/** Shared transparency content for the public page and the in-app page. Dark theme. */
export function TransparencyView({ t, inner }: { t: Transparency; inner: string }) {
  const link = (address: string) => t.explorer ? `${t.explorer.url}/address/${address}` : undefined;
  const live = t.live;
  return <>
    <section id="security" className="scroll-mt-24 border-t border-white/10 py-16">
      <div className={inner}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e2a98e]">Security</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Audited by <span className="sr-only">Soken</span></h2></div>
          <SokenLogo className="h-10 w-auto text-white" />
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">{AUDITS.map(a => <article key={a.scope} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#e2a98e]">{a.auditor} · {a.date}</p>
          <h3 className="mt-3 text-2xl font-semibold">{a.scope}</h3>
          <p className="mt-3 text-sm leading-6 text-white/55">{a.detail}</p>
          <p className="mt-4 text-sm leading-6 text-white/80">{a.result}</p>
          <p className="mt-4 text-xs text-white/40">Reviewed code: {a.reviewed}</p>
          <a href={a.href} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-semibold text-[#e2a98e] underline underline-offset-4">View Soken’s audit index</a>
        </article>)}</div>
        <div className="mt-5 grid gap-5">{ADDITIONAL_REVIEWS.map(r => <article key={r.title} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <h3 className="text-xl font-semibold">{r.title}</h3>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/60">{r.body}</p>
          <a href={r.href} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-[#e2a98e] underline underline-offset-4">{r.link}</a>
        </article>)}</div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">{SAFEGUARDS.map(s => <div key={s.title} className="bg-[#07090b] p-6"><h3 className="font-semibold">{s.title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{s.body}</p></div>)}</div>
        <p className="mt-6 text-sm text-white/45">Source code: <a className="underline" href={GITHUB.contracts} target="_blank" rel="noreferrer">contracts</a> · <a className="underline" href={GITHUB.app} target="_blank" rel="noreferrer">app</a>. Audits reduce risk but do not remove it; smart contracts and tokens carry technical and market risk.</p>
      </div>
    </section>

    <section id="reserves" className="scroll-mt-24 border-t border-white/10 py-16">
      <div className={inner}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e2a98e]">Live reserves</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">What the contract holds and owes.</h2>
        {live ? <>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["ARVO staked", `${fmt(live.arvoStaked, 18)} ARVO`],
              ["ARVO rewards owed", `${fmt(live.arvoRewardsOwed, 18)} ARVO`],
              ["ARVO reward budgets reserved", `${fmt(live.arvoRewardsReserved, 18)} ARVO`],
              ["ARVO held by the contract", `${fmt(live.arvoHeld, 18)} ARVO`],
              ["USDG staked", `${fmt(live.usdcStaked, 6)} USDG`],
              ["USDG rewards owed", `${fmt(live.usdcRewardsOwed, 6)} USDG`],
              ["Positions opened", live.positions.toLocaleString("en-GB")],
              ["Vaults created", live.vaults.toLocaleString("en-GB")],
            ].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs text-white/45">{label}</p><p className="mt-2 text-xl font-semibold tabular-nums">{value}</p></div>)}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className={`rounded-full border px-4 py-2 ${live.arvoSolvent && live.usdcSolvent ? "border-emerald-400/30 text-emerald-300" : "border-red-400/40 text-red-300"}`}>{live.arvoSolvent && live.usdcSolvent ? "✓ Contract solvent: holdings cover principal and rewards owed" : "Solvency check failed — see explorer"}</span>
            <span className={`rounded-full border px-4 py-2 ${live.paused ? "border-amber-400/40 text-amber-300" : "border-white/15 text-white/70"}`}>{live.paused ? "Deposits paused" : "Deposits not paused"}</span>
          </div>
          <p className="mt-4 text-xs text-white/40">Read at {new Date(t.readAt).toUTCString()} · refreshed every minute.</p>
        </> : <p className="mt-8 text-white/55">{t.error}</p>}
      </div>
    </section>

    <section id="governance" className="scroll-mt-24 border-t border-white/10 py-16">
      <div className={inner}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e2a98e]">Governance</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Who controls what — verified onchain.</h2>
        {t.roles.length ? <div className="mt-8 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-white/10 text-xs text-white/45"><th className="py-3 pr-4">Role</th><th className="px-4">Held by</th><th className="px-4">Can</th><th className="pl-4">Onchain check</th></tr></thead><tbody>
          {t.roles.map(r => <tr key={r.role} className="border-b border-white/[0.06]"><td className="py-4 pr-4 font-semibold">{r.role}</td><td className="px-4"><a className="underline decoration-white/20 underline-offset-4" href={link(r.address)} target="_blank" rel="noreferrer">{r.holder} · {short(r.address)}</a></td><td className="px-4 text-white/60">{r.powers}</td><td className="pl-4">{r.verified === true ? <span className="text-emerald-300">✓ Verified</span> : r.verified === false ? <span className="text-red-300">✗ Not held</span> : <span className="text-white/40">Unavailable</span>}</td></tr>)}
        </tbody></table></div> : <p className="mt-8 text-white/55">Governance addresses will be published here at deployment.</p>}
      </div>
    </section>

    <section id="contracts" className="scroll-mt-24 border-t border-white/10 py-16">
      <div className={inner}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e2a98e]">Contracts</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Addresses on {t.network}.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">Only interact with these addresses. Arvo will never ask you to send tokens to any other address or share your seed phrase.</p>
        {t.addresses.length ? <div className="mt-8 divide-y divide-white/[0.06] rounded-[24px] border border-white/10">{t.addresses.map(a => <div key={a.label + a.address} className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div><p className="font-semibold">{a.label}</p>{a.note && <p className="mt-1 text-xs text-white/45">{a.note}</p>}</div>
          <a href={link(a.address)} target="_blank" rel="noreferrer" className="break-all font-mono text-xs text-[#e2a98e] underline decoration-[#e2a98e]/30 underline-offset-4">{a.address}</a>
        </div>)}</div> : <p className="mt-8 text-white/55">{t.error}</p>}
      </div>
    </section>
  </>;
}
