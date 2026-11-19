"use client";
import { useLayoutEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Calculator, ChevronDown, MapPin } from "lucide-react";
import { InfoTip } from "./InfoTip";
import { appPath } from "@/lib/protocol/app-url";
import type { VaultProject } from "@/lib/staking/vault-draft";

/**
 * Vault card (one per row). Every card has the same sections in the same order.
 */
export function VaultCardShell({ id, order, highlighted = false, children }: {
  id: string; order: number; highlighted?: boolean; children: ReactNode;
}) {
  return <article id={id} data-vault-card data-order={order} style={{ order }} className={`relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-[26px] border bg-[#07090b] p-6 text-white md:p-8 transition-[border-color,box-shadow] duration-300 ${highlighted ? "border-[#c9846a]/60 shadow-[0_0_0_1px_rgba(201,132,106,.35),0_24px_60px_rgba(7,9,11,.22)]" : "border-white/10"}`}>
    {children}
  </article>;
}

/** Status line at the top of a card, with the bonus badge (if any) on the right. */
export function CardStatus({ dot, label, tip, bonus }: { dot: string; label: string; tip?: ReactNode; bonus?: { label: string; tip: ReactNode } | null }) {
  return <div className="flex h-6 items-center justify-between gap-3">
    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#e2a98e]"><span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{label}{tip && <InfoTip dark label="About this status">{tip}</InfoTip>}</p>
    {bonus && <BonusBadge label={bonus.label} tip={bonus.tip} />}
  </div>;
}

/** The bonus lozenge (same as the overview cards), with an explanation. */
export function BonusBadge({ label, tip }: { label: string; tip: ReactNode }) {
  return <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[linear-gradient(135deg,#b9775d_0%,#e2a98e_45%,#f0d2b0_75%)] py-1 pl-3 pr-1.5 text-[10px] font-extrabold uppercase tracking-[.08em] text-[#07090b]">{label}<InfoTip ink size={12} align="right" label="About the bonus">{tip}</InfoTip></span>;
}

/** Title row with the share control on the right. */
export function CardTitle({ title, share }: { title: string; share: ReactNode }) {
  return <div className="mt-4 flex min-w-0 items-center justify-between gap-3"><h3 className="truncate text-2xl font-semibold leading-tight tracking-tight" title={title}>{title}</h3><div className="shrink-0">{share}</div></div>;
}

/** Fixed-height section so the same part of every card lines up across a row. */
export function CardSection({ children, min, divider = false }: { children: ReactNode; min: string; divider?: boolean }) {
  return <div className={`${min} ${divider ? "mt-5 border-t border-white/10 pt-4" : "mt-4"}`}>{children}</div>;
}

/** Placeholder in the capacity slot for vaults that are not live yet. */
export function PlannedCapacity({ size }: { size: string | null }) {
  return <div>
    <div className="flex items-center justify-between gap-3 text-[11px]"><span className="font-semibold uppercase tracking-[0.14em] text-white/60">Vault filled</span><span className="tabular-nums text-white/60">{size ? "0%" : "No limit"}</span></div>
    <div className="mt-2 h-1.5 rounded-full bg-white/10" />
    <p className="mt-2 text-[11px] text-white/60">{size ? `0 of ${size} · fills once deposits open` : "Fills once deposits open"}</p>
  </div>;
}

/** One-line activity row for planned vaults (same height as live activity). */
export function PlannedActivity({ bare = false }: { bare?: boolean }) {
  return <div className={`flex h-11 items-center px-4 text-xs text-white/65 ${bare ? "" : "rounded-2xl border border-white/10"}`}>No deposits yet · opens soon</div>;
}

/** "What am I staking in?": the land model in plain words, plus the linked project when there is one. */
export function StakingIn({ asset, project, acquisition = false, bare = false, kind = "" }: { asset: string; project?: VaultProject | null; acquisition?: boolean; bare?: boolean; kind?: string }) {
  const site = project?.title ?? "the linked project";
  return <details className={`group ${bare ? "" : "rounded-2xl border border-white/10 bg-white/[0.03]"}`}>
    <summary className="flex min-h-[2.75rem] cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-xs font-semibold text-white/85 [&::-webkit-details-marker]:hidden">
      <span className="flex min-w-0 items-center gap-3">
        {project && (project.image ? <img src={project.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" /> : <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c9846a]/15 text-[#e2a98e]"><MapPin size={14} /></span>)}
        <span className="min-w-0"><span className="block">What am I staking in?</span>{project && <span className="block truncate text-[11px] font-normal text-white/60">{project.title}</span>}</span>
      </span>
      <ChevronDown size={14} className="shrink-0 text-white/45 transition-transform duration-200 group-open:rotate-180" />
    </summary>
    <div className="space-y-2.5 border-t border-white/10 px-4 py-4 text-xs leading-5 text-white/70">
      {kind === "fullSite" ? <>
        <p>You are staking in the purchase of a whole site. Your {asset} goes towards buying the land. Arvo then divides it into around 20 plots and sells them at auction, and the proceeds repay your deposit and pay your reward.</p>
        <p>Your deposit is locked for the full term, with no early withdrawal. Land sales can take longer or achieve less than planned.</p>
        <div className="rounded-xl border border-[#c9846a]/30 bg-[#c9846a]/[0.08] px-3 py-2.5 text-white/80"><p className="font-semibold text-[#e2a98e]">Full details come when this vault opens onchain</p><p className="mt-1">The site, purchase price, timeline and payment schedule are published before deposits open. On deals like this, rewards are usually locked for the first 3 months while the site is prepared, with returns starting from month 4.</p></div>
      </> : kind === "plotSale" ? <>
        <p>Your {asset} stays in the audited staking contract for the whole term and comes back to you at the end. It is not spent on land.</p>
        <p>Rewards for this vault come from selling one plot at {site}. Deposits open only once that sale has funded the rewards, so the fixed reward is already in place when you stake.</p>
      </> : <>
        {acquisition
          ? <p>Your {asset} deposit helps fund the purchase of the site below. It is repaid to you, with the fixed reward, at the end of the term, once the vault has been repaid.</p>
          : <p>Your {asset} stays in the audited staking contract for the whole term and comes back to you at the end. It is not spent on land.</p>}
        <p>Rewards come from Arvo’s land model: we buy land, divide it into plots and sell them, mostly at auction. Part of the profit from those sales funds the rewards paid to stakers.</p>
      </>}
      {project && <Link href={appPath(`/app/projects/${project.slug}`)} className="flex items-center gap-3 rounded-xl border border-white/10 p-2.5 text-white/80 hover:border-[#c9846a]/40 hover:bg-white/[0.04]">
        {project.image ? <img src={project.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#c9846a]/15 text-[#e2a98e]"><MapPin size={16} /></span>}
        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-white">{project.title}</span><span className="block truncate text-[11px] text-white/45">{project.location}{project.stage ? ` · ${project.stage}` : ""}</span></span>
        <ArrowUpRight size={15} className="shrink-0 text-[#e2a98e]" />
      </Link>}
      <p className="text-[11px] text-white/55">Staking does not give you ownership of any land or project.</p>
    </div>
  </details>;
}

/** Card order: live vaults before planned ones at the same position. */
export const cardOrder = (sortOrder: number, id: number, planned: boolean) => sortOrder * 1000 + (planned ? 500 : 0) + (id % 120) * 4;

/**
 * Order value that places a full-width panel right after the row containing the given card,
 * whatever the number of columns. Re-measured on resize.
 */
export function useRowEndOrder(cardId: string | null): number | null {
  const [value, setValue] = useState<number | null>(null);
  useLayoutEffect(() => {
    // Measuring layout after render is the purpose of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!cardId) { setValue(null); return; }
    const measure = () => {
      const card = document.getElementById(cardId);
      const grid = card?.parentElement;
      if (!card || !grid) return;
      // Columns from the grid itself, so the panel's own position never affects the answer.
      const columns = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length);
      const cards = [...grid.querySelectorAll<HTMLElement>(":scope > [data-vault-card]")].sort((a, b) => (Number(a.dataset.order) || 0) - (Number(b.dataset.order) || 0));
      const index = cards.indexOf(card);
      if (index < 0) return;
      const rowEnd = cards[Math.min(cards.length - 1, Math.floor(index / columns) * columns + columns - 1)];
      setValue((Number(rowEnd.dataset.order) || 0) + 1);
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [cardId]);
  return value;
}

/** The one style for "Estimate my reward" everywhere (matches the inline estimator). */
export const estimateStyle = "flex w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-[#e2a98e] hover:border-[#c9846a]/40 hover:bg-white/[0.05]";
export function EstimateButton({ onClick, bare = false }: { onClick: () => void; bare?: boolean }) {
  return <button type="button" aria-haspopup="dialog" onClick={onClick} className={bare ? "flex w-full items-center justify-between gap-2 px-4 py-3 text-xs font-semibold text-[#e2a98e] hover:bg-white/[0.04]" : estimateStyle}><span className="inline-flex items-center gap-2"><Calculator size={14} />Estimate my reward</span><ChevronDown size={14} className="-rotate-90" /></button>;
}

/** Groups the card's list rows (activity, "What am I staking in?", estimate) in one quiet box. */
export function CardList({ children }: { children: ReactNode }) {
  return <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">{children}</div>;
}
