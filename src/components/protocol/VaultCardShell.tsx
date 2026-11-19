"use client";
import { useLayoutEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Calculator, ChevronDown, MapPin } from "lucide-react";
import { InfoTip } from "./InfoTip";
import { appPath } from "@/lib/protocol/app-url";
import type { VaultProject } from "@/lib/staking/vault-draft";

/**
 * Column vault card. Every card has the same sections in the same order, each with a fixed height,
 * so cards side by side line up section by section and the button always sits at the bottom.
 */
export function VaultCardShell({ id, order, ribbon, highlighted = false, children }: {
  id: string; order: number; ribbon?: ReactNode; highlighted?: boolean; children: ReactNode;
}) {
  return <article id={id} data-vault-card data-order={order} style={{ order }} className={`relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-[26px] border bg-[#07090b] p-6 text-white transition-[border-color,box-shadow] duration-300 ${highlighted ? "border-[#c9846a]/60 shadow-[0_0_0_1px_rgba(201,132,106,.35),0_24px_60px_rgba(7,9,11,.22)]" : "border-white/10"}`}>
    {ribbon}
    {children}
  </article>;
}

/** Status line at the top of a card. Leaves room for the bonus strip. */
export function CardStatus({ dot, label, tip, hasRibbon }: { dot: string; label: string; tip?: ReactNode; hasRibbon?: boolean }) {
  return <p className={`flex h-5 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#e2a98e] ${hasRibbon ? "pr-40" : ""}`}><span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{label}{tip && <InfoTip dark label="About this status">{tip}</InfoTip>}</p>;
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
    <div className="flex items-center justify-between gap-3 text-[11px]"><span className="font-semibold uppercase tracking-[0.14em] text-white/45">Vault filled</span><span className="tabular-nums text-white/45">{size ? "0%" : "No limit"}</span></div>
    <div className="mt-2 h-1.5 rounded-full bg-white/10" />
    <p className="mt-2 text-[11px] text-white/45">{size ? `0 of ${size} · fills once deposits open` : "Fills once deposits open"}</p>
  </div>;
}

/** One-line activity row for planned vaults (same height as live activity). */
export function PlannedActivity() {
  return <div className="flex h-11 items-center rounded-2xl border border-white/10 px-4 text-xs text-white/45">No deposits yet · opens soon</div>;
}

/** Corner strip for vaults with a shared bonus pot. */
export function BonusRibbon({ label, tip }: { label: string; tip: ReactNode }) {
  // Sits over the card's corner (-1px) so no border line shows around it.
  return <div className="absolute -right-px -top-px z-10 flex items-center gap-1.5 rounded-bl-2xl rounded-tr-[26px] bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.4),transparent_35%),linear-gradient(135deg,#b9775d_0%,#e2a98e_45%,#f0d2b0_70%,#a98bf0_140%)] py-2 pl-4 pr-4 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#07090b]">
    {label}
    <InfoTip ink label="About the bonus" align="right" size={13}>{tip}</InfoTip>
  </div>;
}

/** "What am I staking in?": the land model in plain words, plus the linked project when there is one. */
export function StakingIn({ asset, project, acquisition = false }: { asset: string; project?: VaultProject | null; acquisition?: boolean }) {
  return <details className="group rounded-2xl border border-white/10 bg-white/[0.03]">
    <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-xs font-semibold text-white/85 [&::-webkit-details-marker]:hidden">
      <span className="flex min-w-0 items-center gap-3">
        {project && (project.image ? <img src={project.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" /> : <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c9846a]/15 text-[#e2a98e]"><MapPin size={14} /></span>)}
        <span className="min-w-0"><span className="block">What am I staking in?</span>{project && <span className="block truncate text-[11px] font-normal text-white/45">{project.title}</span>}</span>
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
export function EstimateButton({ onClick }: { onClick: () => void }) {
  return <button type="button" aria-haspopup="dialog" onClick={onClick} className={estimateStyle}><span className="inline-flex items-center gap-2"><Calculator size={14} />Estimate my reward</span><ChevronDown size={14} className="-rotate-90" /></button>;
}
