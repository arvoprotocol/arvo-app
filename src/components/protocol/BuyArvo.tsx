"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Check, Copy, ShoppingBag, X } from "lucide-react";
import { ARVO_TOKEN } from "@/lib/protocol/links";
import { InfoTip } from "@/components/protocol/InfoTip";

// Opens Uniswap with ARVO already selected. Uniswap routes the swap through the ARVO/VIRTUAL
// pool for you, so buyers don't need to buy VIRTUAL first. Override with NEXT_PUBLIC_BUY_ARVO_URL.
export const buyArvoUrl = process.env.NEXT_PUBLIC_BUY_ARVO_URL
  || `https://app.uniswap.org/swap?chain=robinhood&inputCurrency=ETH&outputCurrency=${ARVO_TOKEN}`;

/** "Buy ARVO" button plus a short guide. Arvo doesn't sell ARVO; this hands off to Uniswap. */
export function BuyArvoButton({ className = "", label = "Buy ARVO" }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} className={className}><ShoppingBag size={15} />{label}</button>
    {open && <BuyArvoDialog onClose={() => setOpen(false)} />}
  </>;
}

function BuyArvoDialog({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const first = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    first.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    const overflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", key); document.body.style.overflow = overflow; };
  }, [onClose]);
  const copy = () => { void navigator.clipboard?.writeText(ARVO_TOKEN).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  return createPortal(<div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-6">
    <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
    <div role="dialog" aria-modal="true" aria-labelledby="buy-arvo-title" className="arvo-fade relative w-full max-w-lg max-h-[92dvh] overflow-y-auto overflow-x-hidden rounded-t-[26px] bg-[#0b0a09] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,.45)] sm:rounded-[26px] sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#c9846a]/25 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e2a98e]">Robinhood Chain</p><h2 id="buy-arvo-title" className="mt-1.5 text-2xl font-semibold tracking-[-0.03em]">Buy ARVO</h2></div>
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white"><X size={16} /></button>
      </div>
      <p className="relative mt-3 text-sm leading-6 text-white/75">Swap ETH straight into ARVO on Uniswap in one step. Uniswap routes it for you, so there’s no need to buy VIRTUAL first.</p>
      <ol className="relative mt-5 space-y-3 text-sm">
        {["Have some ETH on Robinhood Chain in your wallet (it also pays the network fee).", "Open Uniswap: ARVO is already selected.", "Enter an amount, check the price, and swap."].map((step, i) =>
          <li key={step} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-[#e2a98e]">{i + 1}</span><span className="pt-0.5 leading-5 text-white/85">{step}</span></li>)}
      </ol>
      <a ref={first} href={buyArvoUrl} target="_blank" rel="noopener noreferrer" className="relative mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#a98bf0_135%)] px-4 py-3.5 text-sm font-semibold text-[#07090b]">Swap on Uniswap<ArrowUpRight size={16} /></a>
      <div className="relative mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
        <div className="min-w-0 flex-1"><p className="text-[11px] text-white/55">Official ARVO contract (check it matches in Uniswap)</p><p className="mt-0.5 truncate font-mono text-xs text-white/85">{ARVO_TOKEN}</p></div>
        <button type="button" onClick={copy} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-semibold hover:border-white/35">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}</button>
      </div>
      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs"><span className="text-white/75">Pay with pounds, dollars or euros</span><FiatSoon dark /></div>
      <p className="relative mt-4 text-[11px] leading-5 text-white/50">Uniswap is an independent exchange; Arvo doesn’t sell ARVO. Prices move, so check the amount and slippage before you confirm. Need funds on Robinhood Chain first? Move ETH there with a bridge or from an exchange that supports the network.</p>
    </div>
  </div>, document.body);
}

const fiatNote = "We’re working on letting you take part with pounds, dollars and euros, not just crypto. It isn’t available yet: how it works, who it’s open to and the terms will be published before it launches.";

/** "GBP · USD · EUR coming soon" pill. Announcement only: nothing is accepted in fiat yet. */
export function FiatSoon({ dark = false }: { dark?: boolean }) {
  return <span className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold ${dark ? "border-white/15 text-white/80" : "border-[#c9846a]/35 bg-[#f8ede6] text-[#7a4a36]"}`}>
    <span className="tracking-[0.06em]">GBP · USD · EUR</span><span className={dark ? "text-white/55" : "text-[#ad7058]"}>coming soon</span>
    <InfoTip dark={dark} size={12} label="About GBP, USD and EUR">{fiatNote}</InfoTip>
  </span>;
}
