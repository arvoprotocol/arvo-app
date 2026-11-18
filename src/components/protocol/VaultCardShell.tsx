"use client";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, MapPin, Sparkles } from "lucide-react";
import { InfoTip } from "./InfoTip";
import { appPath } from "@/lib/protocol/app-url";
import type { VaultProject } from "@/lib/staking/vault-draft";

/**
 * Full-width vault card. Three columns on large screens (terms · details · timing and action),
 * stacked on smaller ones, so cards of different depths still line up neatly.
 */
export function VaultCardShell({ id, order, ribbon, terms, details, action, highlighted = false }: {
  id: string; order: number; ribbon?: ReactNode; terms: ReactNode; details: ReactNode; action: ReactNode; highlighted?: boolean;
}) {
  const style: CSSProperties = { order };
  return <article id={id} style={style} className={`relative scroll-mt-28 overflow-hidden rounded-[28px] border bg-[#07090b] text-white transition-[border-color,box-shadow] duration-300 ${highlighted ? "border-[#c9846a]/60 shadow-[0_0_0_1px_rgba(201,132,106,.35),0_24px_60px_rgba(7,9,11,.25)]" : "border-white/10"}`}>
    {ribbon}
    <div className="grid divide-y divide-white/10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,.9fr)] lg:divide-x lg:divide-y-0">
      <div className="min-w-0 p-6 md:p-8">{terms}</div>
      <div className="min-w-0 p-6 md:p-8">{details}</div>
      <div className={`flex min-w-0 flex-col p-6 md:p-8 ${ribbon ? "lg:pt-14" : ""}`}>{action}</div>
    </div>
  </article>;
}

/** Corner strip for vaults with a shared bonus pot. */
export function BonusRibbon({ label, tip }: { label: string; tip: ReactNode }) {
  return <div className="absolute right-0 top-0 z-10 flex items-center gap-1.5 rounded-bl-2xl bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.4),transparent_35%),linear-gradient(135deg,#b9775d_0%,#e2a98e_45%,#f0d2b0_70%,#a98bf0_140%)] py-2 pl-4 pr-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#07090b] shadow-[0_8px_24px_rgba(201,132,106,.25)]">
    <Sparkles size={13} />{label}
    <InfoTip label="About the bonus" align="right" size={12}>{tip}</InfoTip>
  </div>;
}

/** "What am I staking in?": the land model in plain words, plus the linked project when there is one. */
export function StakingIn({ asset, project, acquisition = false }: { asset: string; project?: VaultProject | null; acquisition?: boolean }) {
  return <details className="group mt-5 rounded-2xl border border-white/10 bg-white/[0.03]">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-white/85 [&::-webkit-details-marker]:hidden">
      <span className="flex min-w-0 items-center gap-3">
        {project ? project.image ? <img src={project.image} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#c9846a]/15 text-[#e2a98e]"><MapPin size={15} /></span> : null}
        <span className="min-w-0"><span className="block">What am I staking in?</span>{project && <span className="block truncate text-[11px] font-normal text-white/45">{project.title} · {project.location}</span>}</span>
      </span>
      <ChevronDown size={14} className="shrink-0 text-white/45 transition-transform duration-200 group-open:rotate-180" />
    </summary>
    <div className="space-y-2.5 border-t border-white/10 px-4 py-4 text-xs leading-5 text-white/60">
      {acquisition
        ? <p>Your {asset} deposit helps fund the purchase of the site below. It is repaid to you, with the fixed reward, at the end of the term, once the vault has been repaid.</p>
        : <p>Your {asset} stays in the audited staking contract for the whole term and comes back to you at the end. It is not spent on land.</p>}
      <p>Rewards come from Arvo’s land model: we buy land, divide it into plots and sell them, mostly at auction. Part of the profit from those sales funds the rewards paid to stakers.</p>
      {project && <Link href={appPath(`/app/projects/${project.slug}`)} className="flex items-center gap-3 rounded-xl border border-white/10 p-2.5 text-white/80 hover:border-[#c9846a]/40 hover:bg-white/[0.04]">
        {project.image ? <img src={project.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#c9846a]/15 text-[#e2a98e]"><MapPin size={16} /></span>}
        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-white">{project.title}</span><span className="block truncate text-[11px] text-white/45">{project.location}{project.stage ? ` · ${project.stage}` : ""}</span></span>
        <ArrowUpRight size={15} className="shrink-0 text-[#e2a98e]" />
      </Link>}
      <p className="text-[11px] text-white/40">Staking does not give you ownership of any land or project.</p>
    </div>
  </details>;
}

/** Card order: live vaults before planned ones at the same position; the review panel sits right after its vault. */
export const cardOrder = (sortOrder: number, id: number, planned: boolean) => sortOrder * 1000 + (planned ? 500 : 0) + (id % 120) * 4;
