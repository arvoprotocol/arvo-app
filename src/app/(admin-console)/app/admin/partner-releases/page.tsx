import Link from "next/link";
import { AlertTriangle, CalendarPlus, Coins, PieChart, Users } from "lucide-react";
import { getAdminSession } from "@/lib/admin/session";
import { appPath } from "@/lib/protocol/app-url";
import { prisma } from "@/lib/prisma";
import { PageTitle, Panel, PanelHeader, StatCard } from "@/components/protocol/ProtocolUI";
import { formatArvo, ALLOCATION, lockEnds, tgeDate } from "@/lib/partners/allocation";
import { partnerView, programSummary } from "@/lib/partners/allocation-server";
import { AllocationInput, CopyWallet, ReleaseAction } from "./ReleaseControls";

export const dynamic = "force-dynamic";

const day = (v: string | Date | null) => v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "TGE not set";

export default async function PartnerReleasesPage() {
  if (!await getAdminSession()) return null;
  const [partners, summary] = await Promise.all([
    prisma.strategicPartner.findMany({ orderBy: { name: "asc" }, include: { releases: true } }),
    programSummary(),
  ]);
  const tge = tgeDate();
  const rows = partners.map(p => ({ p, view: partnerView(p) }));
  const calendar = new Map<string, { id: number; name: string; wallet: string | null; tranche: number; amount: string; status: string; txHash: string | null }[]>();
  for (const { p, view } of rows) if (view) for (const t of view.tranches) {
    const key = t.due ? t.due.slice(0, 10) : `unscheduled-${t.tranche}`;
    calendar.set(key, [...(calendar.get(key) ?? []), { id: p.id, name: p.name, wallet: p.registeredWallet, tranche: t.tranche, amount: t.amountArvo, status: t.status, txHash: t.txHash }]);
  }
  const dates = [...calendar.entries()].sort(([a], [b]) => a.localeCompare(b));
  const firstOpen = dates.findIndex(([, list]) => list.some(r => r.status !== "sent"));

  return <div className="space-y-8 px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
    <PageTitle eyebrow="Strategic Partners" title="Partner releases" copy={`Enter each partner’s agreed amount in USD. It’s converted once at $${ALLOCATION.priceUsd} and the ARVO amount is locked in, so later price moves don’t change it. It’s released in ${ALLOCATION.releaseMonths} monthly instalments after a ${ALLOCATION.cliffMonths}-month lock. You send each release from your own wallet, then record it here.`} />

    {!tge && <div className="flex gap-3 rounded-2xl border border-amber-500/25 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><p><strong>Release dates aren’t set.</strong> The TGE date is invalid. Check <code className="rounded bg-white/70 px-1">ARVO_TGE_DATE</code> on the server.</p></div>}

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Partner allocations" value={`${formatArvo(summary.totalArvo)} ARVO`} detail={`$${Number(summary.usd).toLocaleString("en-GB", { minimumFractionDigits: 2 })} across ${summary.count} partners`} accent icon={<Coins size={16} />} />
      <StatCard label="Of available Strategic Partners" value={`${summary.ofAvailable}%`} detail={`of ${formatArvo(ALLOCATION.availableArvo)} ARVO still available`} icon={<PieChart size={16} />} />
      <StatCard label="Of total supply" value={`${summary.ofSupply}%`} detail={`${summary.ofBucket}% of the full 10% allocation`} icon={<PieChart size={16} />} />
      <StatCard label="Left in Strategic Partners" value={`${formatArvo(summary.availableAfter)} ARVO`} detail={`TGE ${day(tge)} · lock ends ${day(lockEnds(tge))}`} icon={<Users size={16} />} />
    </div>

    <Panel>
      <PanelHeader eyebrow="Step 1" title="Amounts owed" />
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm">
        <thead><tr className="border-b border-black/[.07] text-left text-[11px] uppercase tracking-[.12em] text-black/40"><th className="px-5 py-3 font-semibold md:px-6">Partner</th><th className="px-3 py-3 font-semibold">Wallet</th><th className="px-3 py-3 font-semibold">Owed (USD)</th><th className="px-3 py-3 font-semibold">ARVO</th><th className="px-5 py-3 font-semibold md:px-6">Released</th></tr></thead>
        <tbody className="divide-y divide-black/[.06]">{rows.map(({ p, view }) => <tr key={p.id}>
          <td className="px-5 py-3.5 md:px-6"><Link href={appPath(`/app/admin/partners/${p.id}`)} className="font-semibold hover:text-[#ad7058]">{p.name}</Link><p className="text-xs text-black/45">{p.email}</p></td>
          <td className="px-3 py-3.5">{p.registeredWallet ? <CopyWallet wallet={p.registeredWallet} /> : <span className="text-xs text-black/40">Not registered</span>}{p.status !== "confirmed" && <p className="mt-1 text-[11px] font-semibold text-amber-700">Wallet not confirmed: can’t see allocation yet</p>}</td>
          <td className="px-3 py-3.5"><AllocationInput id={p.id} usd={p.allocationUsd} locked={p.releases.length > 0} /></td>
          <td className="px-3 py-3.5 tabular-nums">{p.allocationArvo ? <><span className="font-semibold">{formatArvo(p.allocationArvo)}</span><p className="text-[11px] text-black/40">Locked at ${p.allocationPrice}</p></> : "–"}</td>
          <td className="px-5 py-3.5 text-xs text-black/55 tabular-nums md:px-6">{view ? `${view.tranches.filter(t => t.status === "sent").length} of ${ALLOCATION.releaseMonths}` : "–"}</td>
        </tr>)}</tbody>
      </table></div>
      {!rows.length && <p className="px-6 py-8 text-sm text-black/50">No Strategic Partners yet. Add them under Partners.</p>}
    </Panel>

    <Panel>
      <PanelHeader eyebrow="Step 2" title="Release calendar" action={tge ? <a href="/api/admin/partner-releases/calendar" className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3.5 py-2 text-xs font-semibold hover:border-black/30"><CalendarPlus size={14} />Add reminders to my calendar</a> : undefined} />
      {!dates.length ? <p className="px-6 py-8 text-sm text-black/50">Enter amounts above to build the calendar.</p> : <div className="divide-y divide-black/[.07]">{dates.map(([key, list], i) => {
        const total = list.reduce((a, r) => a + BigInt(r.amount), 0n), allSent = list.every(r => r.status === "sent"), due = list.some(r => r.status === "due");
        return <details key={key} open={i === firstOpen || due} className="group">
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 md:px-6">
            <span className="w-32 font-semibold">{key.startsWith("unscheduled") ? `Release ${list[0].tranche}` : day(key)}</span>
            <span className="flex-1 text-sm tabular-nums text-black/60">{formatArvo(total)} ARVO · {list.length} partners</span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${allSent ? "bg-emerald-50 text-emerald-800" : due ? "bg-[#c9846a]/15 text-[#a9654f]" : "bg-black/[.04] text-black/45"}`}>{allSent ? "All sent" : due ? "Due now" : "Upcoming"}</span>
          </summary>
          <ul className="border-t border-black/[.05] bg-[#fbf8f6]">{list.map(r => <li key={`${r.id}-${r.tranche}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 md:px-6">
            <span className="w-44 text-sm font-medium">{r.name}</span>
            <span className="w-40">{r.wallet ? <CopyWallet wallet={r.wallet} /> : <span className="text-xs text-black/40">No wallet</span>}</span>
            <span className="w-36 text-sm font-semibold tabular-nums">{formatArvo(r.amount)} ARVO</span>
            <span className="flex-1"><ReleaseAction id={r.id} tranche={r.tranche} sent={r.status === "sent"} txHash={r.txHash} due={r.status === "due"} /></span>
          </li>)}</ul>
        </details>;
      })}</div>}
    </Panel>
  </div>;
}
