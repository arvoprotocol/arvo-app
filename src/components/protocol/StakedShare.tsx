"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, Share2, X } from "lucide-react";
import { appUrl } from "@/lib/protocol/app-url";
import { sharePercent, shareTerm, vaultShareUrl } from "@/lib/staking/vault-share";

export type StakedInfo = {
  title: string;
  /** Readable public page exists for vaults with a saved name. */
  named: boolean;
  anchor: string;
  days: number;
  rate: number;
  asset: "ARVO" | "USDG";
  bonusPct?: number;
  amountLabel: string;
};

/** Shown after a stake confirms: a short celebration and one-tap sharing. The amount is only shared if the user chooses. */
export function StakedShare({ info, onClose }: { info: StakedInfo; onClose: () => void }) {
  const [withAmount, setWithAmount] = useState(false), [copied, setCopied] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);
  const url = info.named ? vaultShareUrl(info.title) : `${appUrl("/app/stake")}#${encodeURIComponent(info.anchor)}`;
  const terms = `${sharePercent(info.rate)} fixed ${info.asset} reward over ${shareTerm(info.days)}${info.bonusPct ? ` plus a share of the ${sharePercent(info.bonusPct)} bonus pot` : ""}`;
  const text = `I’ve just staked ${withAmount ? `${info.amountLabel} ` : ""}in ${info.title} on Arvo: ${terms}, backed by real land sales.`;
  const share = { x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` };
  const canNative = typeof navigator !== "undefined" && typeof navigator.share === "function";
  async function copy() { try { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* the text is visible to copy by hand */ } }
  async function native() { try { await navigator.share({ title: `${info.title} on Arvo`, text, url }); } catch { /* cancelled */ } }
  const button = "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition";

  return createPortal(<div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-6">
    <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
    <div role="dialog" aria-modal="true" aria-labelledby="staked-title" className="arvo-fade relative w-full max-w-md max-h-[92dvh] overflow-y-auto overflow-hidden rounded-t-[26px] bg-[#0b0a09] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,.45)] sm:rounded-[26px] sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#c9846a]/30 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#b9775d,#f0d2b0)] text-[#07090b]"><Check size={20} strokeWidth={2.5} /></span>
        <button ref={close} type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white"><X size={16} /></button>
      </div>
      <h2 id="staked-title" className="relative mt-4 text-2xl font-semibold tracking-[-0.03em]">You’re staked.</h2>
      <p className="relative mt-2 text-sm leading-6 text-white/75">{info.amountLabel} in <span className="font-semibold text-white">{info.title}</span>. Your reward is fixed: {terms}. You can follow it in Portfolio.</p>

      <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e2a98e]">Share your position</p>
        <p className="mt-2 text-sm leading-6 text-white/85">“{text}”</p>
        <label className="mt-3 flex items-center gap-2 text-xs text-white/65"><input type="checkbox" checked={withAmount} onChange={e => setWithAmount(e.target.checked)} className="accent-[#c9846a]" />Include the amount I staked</label>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2">
        <a href={share.x} target="_blank" rel="noopener noreferrer" className={`${button} bg-white text-[#07090b] hover:bg-[#f8f2ed]`}>Share on X</a>
        <a href={share.telegram} target="_blank" rel="noopener noreferrer" className={`${button} bg-white text-[#07090b] hover:bg-[#f8f2ed]`}>Telegram</a>
        <button type="button" onClick={() => void copy()} className={`${button} border border-white/15 text-white hover:border-white/35`}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</button>
        {canNative ? <button type="button" onClick={() => void native()} className={`${button} border border-white/15 text-white hover:border-white/35`}><Share2 size={15} />More</button>
          : <a href={appUrl("/app/portfolio")} className={`${button} border border-white/15 text-white hover:border-white/35`}>Portfolio</a>}
      </div>
      <p className="relative mt-4 text-[11px] leading-5 text-white/45">The link shows the vault’s public page and preview image. Your wallet address is never included.</p>
    </div>
  </div>, document.body);
}
