"use client";
import {stakingConnection,stakingAbi} from "@/lib/staking/pool-transactions";
import {mixedRewards} from "@/lib/staking/acquisition-math";
import {MixedRewardRates} from "./MixedRewardRates";
import {VaultShare} from "@/components/protocol/VaultShare";
import { Children, useEffect, useRef, useId, useState, type ReactNode } from "react";
import { ArrowUpRight, Calculator, Clock3, RefreshCw, X } from "lucide-react";
import { productLabels, tokenAmount, type Products } from "@/lib/staking/pool-form";
import type { DraftPreview } from "@/lib/staking/vault-draft";
import { cycleReward, formatAmount, lockLabel, tokenDisplay } from "@/lib/staking/presentation";
import { AnnualReward } from "./AnnualReward";
import { VaultTiming } from "./VaultTiming";
import { RewardAmountSlider } from "./RewardAmountSlider";
import { TokenAmountInput } from "./TokenAmountInput";
import { CommittedCapacity } from "./CommittedCapacity";
import { VaultGridSkeleton } from "./VaultSkeleton";

function draftUnits(raw: string | undefined, decimals: number) { try { return tokenAmount(raw || "0", decimals, "Amount"); } catch { return 0n; } }

export function VaultDraftPreviews({ compact = false, refreshKey = 0, children, hideDrafts=false, pending=false }: { hideDrafts?: boolean; compact?: boolean; refreshKey?: number; children?: ReactNode; pending?: boolean }) {
  const [rows, setRows] = useState<DraftPreview[]>([]), [error, setError] = useState(""), [loading, setLoading] = useState(true), [selectedId, setSelectedId] = useState<number | null>(null), [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError("");if(hideDrafts)setRows([]);
    fetch("/app/vault-previews", { cache: "no-store", signal: controller.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Vault previews are unavailable.");
      if (!controller.signal.aborted) setRows(hideDrafts?[]:data.previews);
    }).catch(e => { if (!controller.signal.aborted) setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refreshKey, retry,hideDrafts]);
  useEffect(()=>{if(!rows.length)return;const hash=window.location.hash.slice(1);if(/^vault-preview-\d+$/.test(hash))document.getElementById(hash)?.scrollIntoView({block:"center"});},[rows]);
  const selected = rows.find(row => row.id === selectedId);
  if (error && !Children.count(children)) return <div role="alert" className="mt-4 rounded-2xl border border-black/10 p-5 text-sm"><p>{error}</p><button onClick={() => setRetry(n => n + 1)} className="mt-3 inline-flex items-center gap-2 font-semibold"><RefreshCw size={14} />Retry previews</button></div>;
  // Hold the whole grid until live vaults and planned vaults are both known, so cards never reshuffle.
  if (pending || (loading && !rows.length)) return <VaultGridSkeleton count={compact ? 3 : Math.max(3, Children.count(children))} />;
  if (!rows.length && !Children.count(children)) return null;
  return <section className="arvo-fade mt-8" aria-label="Vaults">
      {error && <p role="alert" className="mb-4 text-xs text-red-700">{error}</p>}
      <div className={`grid gap-4 ${compact ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-3"}`}>{children}{(compact ? rows.slice(0, 3) : rows).map(row => <article key={row.id} id={`vault-preview-${row.id}`} style={{order:row.sortOrder??0}} className="scroll-mt-32 flex flex-col rounded-[24px] border border-white/10 bg-[#07090b] p-6 text-white">
        <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#e2a98e]">Upcoming</p><VaultShare title={row.title} days={row.days} anchor={`vault-preview-${row.id}`} preview dark/></div>
        <h3 className={`mt-5 font-semibold tracking-tight ${compact ? "text-2xl" : "text-3xl"}`}>{row.title}</h3><p className="mt-2 text-sm text-white/50">{lockLabel(row.days)}</p>
        <div className="mt-5 space-y-3">{(Object.keys(productLabels) as (keyof Products)[]).filter(key => row.products[key]).map(key => <div key={key}>
          <p className="text-xs leading-5 text-white/60">{productLabels[key]}</p>{key==="dualMixed"?<MixedRewardRates arvoRate={Number(row.arvoRate)} usdcRate={Number(row.usdcRate)} share={Number(row.mixedShare??"50")} days={row.days} dark/>:<><AnnualReward percent={Number(key === "arvoArvo" || key === "dualArvo" ? row.arvoRate : row.usdcRate)} days={row.days} dark prominent/>
          <p className="mt-3 text-sm font-semibold text-white/80">{key === "arvoArvo" || key === "dualArvo" ? row.arvoRate : row.usdcRate}% <span className="font-normal text-white/50">cycle reward · {row.days} days{key.startsWith("dual") ? " · before uplift" : ""}</span></p></>}
        </div>)}</div>
        <VaultTiming opensAt={row.opensAt} closesAt={row.closesAt} preview dark compact />
        {!compact && <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs leading-5 text-white/55">
          {row.products.arvoArvo && <p>Minimum {formatAmount(row.minArvo)} ARVO to earn ARVO</p>}
          {row.products.arvoUsdc && <p>Minimum {formatAmount(row.minArvoUsdc)} ARVO to earn USDG</p>}
          {row.products.usdcUsdc && <p>Minimum {formatAmount(row.minUsdc)} USDG</p>}
          {(row.products.dualArvo || row.products.dualUsdc || row.products.dualMixed) && <p>Dual minimum {formatAmount(row.minArvo)} ARVO + {formatAmount(row.minUsdc)} USDG</p>}
          {!/^0+(?:\.0+)?$/.test(row.maxArvo) && <p>Planned ARVO capacity {formatAmount(row.maxArvo)}</p>}
          {!/^0+(?:\.0+)?$/.test(row.maxUsdc) && draftUnits(row.committedUsdc, 6) === 0n && (row.products.usdcUsdc || row.products.dualArvo || row.products.dualUsdc || row.products.dualMixed) && <p>Planned USDG capacity {formatAmount(row.maxUsdc)}</p>}
        </div>}
        {draftUnits(row.committedUsdc, 6) > 0n && <CommittedCapacity preview asset="USDG" cap={draftUnits(row.maxUsdc, 6)} committed={draftUnits(row.committedUsdc, 6)} deposited={0n} decimals={6} committedLabel="committed outside the app" />}
        {<button type="button" aria-haspopup="dialog" onClick={() => setSelectedId(row.id)} className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-semibold text-[#e2a98e] hover:text-white focus-visible:outline focus-visible:outline-offset-4"><Calculator size={14} />Calculate rewards</button>}
      </article>)}</div>
      {selected && <RewardDialog onClose={() => setSelectedId(null)} key={`${selected.id}-${selected.arvoRate}-${selected.usdcRate}-${selected.minArvo}-${selected.minArvoUsdc}-${JSON.stringify(selected.products)}`} row={selected} />}
  </section>;
}
export function RewardDialog({ row, onClose, preview = true }: { row: DraftPreview; onClose: () => void; preview?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null), titleId = useId();
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    dialog.current?.showModal(); document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={e => { e.preventDefault(); onClose(); }} onClose={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border border-black/10 bg-white p-6 text-[#07090b] shadow-2xl backdrop:bg-black/50">
    <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#ad7058]">Reward calculator{preview ? " · preview" : ""}</p><h2 id={titleId} className="mt-2 text-xl font-semibold">{row.title}</h2></div><button autoFocus type="button" onClick={onClose} aria-label="Close reward calculator" className="rounded-full p-2 hover:bg-black/5"><X size={18}/></button></div>
    <DraftCalculator row={row} preview={preview}/>
  </dialog>;
}
function DraftCalculator({ row, preview }: { row: DraftPreview; preview: boolean }) {
  const enabled = (Object.keys(productLabels) as (keyof Products)[]).filter(key => row.products[key]);
  const [product, setProduct] = useState<keyof Products>(enabled[0]), [arvo, setArvo] = useState(enabled[0] === "arvoUsdc" ? row.minArvoUsdc : row.minArvo), [usdc, setUsdc] = useState(row.minUsdc), [price, setPrice] = useState("");
  const [priceStatus,setPriceStatus]=useState(""),[entryReward,setEntryReward]=useState<bigint|null>(null);
  const dual = product.startsWith("dual"), cross = product === "arvoUsdc", paysArvo = product === "arvoArvo" || product === "dualArvo", needsArvo = product !== "usdcUsdc", needsUsdc = product === "usdcUsdc" || dual;
  useEffect(()=>{
    if(!cross)return;
    let cancelled=false;const controller=new AbortController();setEntryReward(null);setPrice("");setPriceStatus(preview?"Loading current market price…":"Loading verified contract quote…");
    const timer=setTimeout(async()=>{try{
      if(preview){const response=await fetch("/app/market-price",{cache:"no-store",signal:controller.signal});const data=await response.json();if(!response.ok||typeof data.priceUsd!=="string"||!/^\d+(?:\.\d+)?$/.test(data.priceUsd)||Number(data.priceUsd)<=0||!Number.isFinite(data.fetchedAt)||Date.now()-data.fetchedAt>120000)throw new Error("Current market price unavailable. Try reopening the calculator.");if(!cancelled){setPrice(data.priceUsd);setPriceStatus("Current market price · illustrative; the deposit uses the contract’s verified oracle price.");}}
      else{const connection=stakingConnection();if(!connection)throw new Error("Staking unavailable.");if(await connection.publicClient.getChainId()!==connection.chain.id)throw new Error("Network mismatch.");const amount=tokenAmount(arvo,18,"ARVO deposit");const result=await connection.publicClient.readContract({address:connection.address,abi:stakingAbi,functionName:"quoteArvoForUsdc",args:[row.id,amount],blockTag:"latest"});if(!cancelled){setEntryReward(result as bigint);setPriceStatus("Verified contract quote using the current oracle price. The final reward is fixed when your deposit confirms.");}}
    }catch(error){if(!cancelled)setPriceStatus(error instanceof Error?error.message:"Reward estimate unavailable.");}},preview?0:300);
    return()=>{cancelled=true;controller.abort();clearTimeout(timer);};
  },[cross,preview,row.id,preview?"":arvo]);
  let mixed:{arvo:bigint;usdc:bigint}|null=null;let reward: bigint | null = null, principal = 0n, minArvo = 0n, minUsdc = 0n, a = 0n, u = 0n, invalid = "", eligibility = "";
  try {
    minArvo = tokenAmount(cross ? row.minArvoUsdc : row.minArvo, 18, "Minimum ARVO"); minUsdc = tokenAmount(row.minUsdc, 6, "Minimum USDG");
    a = needsArvo ? tokenAmount(arvo, 18, "ARVO amount") : 0n; u = needsUsdc ? tokenAmount(usdc, 6, "USDG amount") : 0n;
    const boost = dual ? Number(tokenAmount(row.dualBoost, 2, "Dual uplift")) : 0, cap = Number(tokenAmount(row.boostCap, 2, "Uplift cap"));
    const rate = Number(tokenAmount(paysArvo ? row.arvoRate : row.usdcRate, 2, "Cycle rate"));
    principal = paysArvo ? a : u;
    reward = cross ? !preview ? entryReward : price ? a * tokenAmount(price, 18, "Illustrative ARVO price") * BigInt(rate) / (10n ** 30n * 10000n) : null : cycleReward(principal, rate, Math.min(boost, cap));
    if (cross && price && tokenAmount(price, 18, "Illustrative ARVO price") === 0n) throw new Error("Illustrative ARVO price must be greater than zero.");
    if(product==="dualMixed")mixed=mixedRewards(a,u,Number(tokenAmount(row.arvoRate,2,"ARVO cycle rate")),Number(tokenAmount(row.usdcRate,2,"USDG cycle rate")),Math.min(boost,cap),Number(tokenAmount(row.mixedShare??"50",2,"ARVO share")));
    const gaps = [];
    if (needsArvo && a < minArvo) gaps.push(`${tokenDisplay(minArvo - a, 18)} ARVO`);
    if (needsUsdc && u < minUsdc) gaps.push(`${tokenDisplay(minUsdc - u, 6)} USDG`);
    if (gaps.length) eligibility = `Add ${gaps.join(" and ")} to reach this product’s minimum.`;
    if (needsArvo && tokenAmount(row.maxArvo, 18, "Capacity") > 0n && a > tokenAmount(row.maxArvo, 18, "Capacity")) eligibility = "This amount exceeds the planned ARVO capacity.";
    if (needsUsdc && tokenAmount(row.maxUsdc, 6, "Capacity") > 0n && u > tokenAmount(row.maxUsdc, 6, "Capacity")) eligibility = "This amount exceeds the planned USDG capacity.";
  } catch (e) { invalid = e instanceof Error ? e.message : "Enter a valid amount."; reward = null; }
  function choose(next: keyof Products) { setProduct(next); setArvo(next === "arvoUsdc" ? row.minArvoUsdc : row.minArvo); setUsdc(row.minUsdc); }
  return <div aria-label="Planned reward calculator">
    <p className="mt-2 text-xs text-black/50">{row.days}-day lock · rewards for one complete cycle</p>
    <label className="mt-4 block text-xs font-semibold">Deposit and reward<select aria-label="Preview deposit and reward" value={product} onChange={e => choose(e.target.value as keyof Products)} className="mt-2 w-full rounded-xl border border-black/10 bg-white p-3 text-sm font-normal">{enabled.map(key => <option key={key} value={key}>{productLabels[key]}</option>)}</select></label>
    {needsArvo && <label className="mt-4 block text-xs font-semibold">ARVO deposit<TokenAmountInput label="Preview ARVO deposit" value={arvo} onChange={setArvo} /><RewardAmountSlider label="ARVO deposit slider" value={arvo} minimum={cross ? row.minArvoUsdc : row.minArvo} capacity={row.maxArvo} decimals={18} asset="ARVO" onChange={setArvo}/></label>}
    {needsUsdc && <label className="mt-4 block text-xs font-semibold">USDG deposit<TokenAmountInput label="Preview USDG deposit" value={usdc} onChange={setUsdc} /><RewardAmountSlider label="USDG deposit slider" value={usdc} minimum={row.minUsdc} capacity={row.maxUsdc} decimals={6} asset="USDG" onChange={setUsdc}/></label>}
    <div className="mt-3 flex gap-2">{[1, 2, 5].map(multiplier => <button type="button" key={multiplier} onClick={() => { if (needsArvo) setArvo(tokenDisplay(minArvo * BigInt(multiplier), 18).replaceAll(",", "")); if (needsUsdc) setUsdc(tokenDisplay(minUsdc * BigInt(multiplier), 6).replaceAll(",", "")); }} className="rounded-lg border border-black/10 px-3 py-2 text-[11px] font-semibold">{multiplier === 1 ? "Stake minimum" : `${multiplier}× min`}</button>)}</div>
    {cross && <div role="status" className="mt-4 rounded-xl bg-black/[.03] p-3 text-xs leading-5">{preview&&price&&<p className="font-semibold">ARVO market price: ${price}</p>}<p className="text-black/55">{priceStatus}</p></div>}
    <div className="mt-4 rounded-2xl bg-[#f8f4ef] p-5"><p className="text-[10px] font-semibold uppercase tracking-widest text-black/45">{cross ? preview ? "Illustrative USDG reward" : "Current contract USDG quote" : "Estimated cycle reward"}</p><p className="mt-3 break-words text-2xl font-semibold tabular-nums">{product==="dualMixed"?(mixed?`${tokenDisplay(mixed.arvo,18)} ARVO + ${tokenDisplay(mixed.usdc,6)} USDG`:"—"):reward === null ? "—" : tokenDisplay(reward, paysArvo ? 18 : 6)} <span className="text-sm text-black/45">{product==="dualMixed"?"":paysArvo ? "ARVO" : "USDG"}</span></p><p className="mt-2 text-xs text-black/50">{product==="dualMixed"?`${row.mixedShare??"50"}% ARVO / ${100-Number(row.mixedShare??"50")}% USDG weighting · `:""}{paysArvo ? row.arvoRate : row.usdcRate}% for {row.days} days{dual ? ` · ${row.dualBoost}% dual uplift, capped at ${row.boostCap}%` : ""}</p>
      {!invalid && !cross && product!=="dualMixed" && reward !== null && <p className="mt-4 border-t border-black/10 pt-3 text-xs leading-5 text-black/55">Principal + estimated reward: <strong>{tokenDisplay(principal + reward, paysArvo ? 18 : 6)} {paysArvo ? "ARVO" : "USDG"}</strong>{dual ? `. Your ${paysArvo ? `${tokenDisplay(u, 6)} USDG` : `${tokenDisplay(a, 18)} ARVO`} principal is returned separately.` : "."}</p>}
    </div>
    {!dual && !cross && <AnnualReward percent={Number(paysArvo ? row.arvoRate : row.usdcRate)} days={row.days}/>}
    {(invalid || eligibility) && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{invalid || eligibility}</p>}
    <p className="mt-4 text-[11px] leading-5 text-black/45">{cross ? "USDG payouts require a verified entry price and reserved rewards." : preview ? "Uses planned terms; individual restake bonuses are excluded." : "Uses current contract terms; individual restake bonuses are excluded."} {row.acquisition?"Acquisition rewards are fixed commitments, paid when the pool has sufficient repayment cash. ":""}Estimates only. Availability is checked separately. Your lock starts at deposit.</p>
  </div>;
}
