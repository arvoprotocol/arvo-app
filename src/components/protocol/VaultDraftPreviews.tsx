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
import { InfoTip } from "./InfoTip";
import { LockLine, RewardLine, TermStats, compactNumber } from "./VaultCopy";
import { CardList, CardStatus, CardTitle, EstimateButton, PlannedActivity, PlannedCapacity, StakingIn, VaultCardShell, cardOrder } from "./VaultCardShell";
import { VaultGridSkeleton } from "./VaultSkeleton";

function draftUnits(raw: string | undefined, decimals: number) { try { return tokenAmount(raw || "0", decimals, "Amount"); } catch { return 0n; } }

export function VaultDraftPreviews({ compact = false, refreshKey = 0, children, hideDrafts=false, pending=false, onlyProject, emptyMessage }: { hideDrafts?: boolean; compact?: boolean; refreshKey?: number; children?: ReactNode; pending?: boolean; onlyProject?: string; emptyMessage?: string }) {
  const [rows, setRows] = useState<DraftPreview[]>([]), [error, setError] = useState(""), [loading, setLoading] = useState(true), [selectedId, setSelectedId] = useState<number | null>(null), [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError("");if(hideDrafts)setRows([]);
    fetch("/app/vault-previews", { cache: "no-store", signal: controller.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Vault previews are unavailable.");
      if (!controller.signal.aborted) setRows(hideDrafts ? [] : onlyProject ? (data.previews as DraftPreview[]).filter(p => p.projectSlug === onlyProject) : data.previews);
    }).catch(e => { if (!controller.signal.aborted) setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refreshKey, retry, hideDrafts, onlyProject]);
  useEffect(()=>{if(!rows.length)return;const hash=window.location.hash.slice(1);if(/^vault-preview-\d+$/.test(hash))document.getElementById(hash)?.scrollIntoView({block:"center"});},[rows]);
  const selected = rows.find(row => row.id === selectedId);
  if (error && !Children.count(children)) return <div role="alert" className="mt-4 rounded-2xl border border-black/10 p-5 text-sm"><p>{error}</p><button onClick={() => setRetry(n => n + 1)} className="mt-3 inline-flex items-center gap-2 font-semibold"><RefreshCw size={14} />Retry previews</button></div>;
  // Hold the whole grid until live vaults and planned vaults are both known, so cards never reshuffle.
  if (pending || (loading && !rows.length)) return <VaultGridSkeleton count={Math.max(2, Math.min(4, Children.count(children)))} />;
  if (!rows.length && !Children.count(children)) return emptyMessage ? <p className="mt-6 rounded-2xl border border-black/10 bg-white p-5 text-sm text-black/60">{emptyMessage}</p> : null;
  return <section className="arvo-fade mt-8" aria-label="Vaults">
      {error && <p role="alert" className="mb-4 text-xs text-red-700">{error}</p>}
      <div className="grid items-stretch gap-5 lg:grid-cols-2">{children}{(compact ? rows.slice(0, 3) : rows).map(row => { const bonus = Number(row.bonusPct || 0); const pays = (key: keyof Products) => key === "arvoArvo" || key === "dualArvo" ? "ARVO" : "USDG"; const enabled = (Object.keys(productLabels) as (keyof Products)[]).filter(key => row.products[key]); const first = enabled[0];
        const minimum = row.products.arvoArvo ? { n: Number(row.minArvo), unit: "ARVO", usd: Number(row.minArvo) } : row.products.arvoUsdc ? { n: Number(row.minArvoUsdc), unit: "ARVO", usd: Number(row.minArvoUsdc) } : row.products.usdcUsdc ? { n: Number(row.minUsdc), unit: "USDG", usd: undefined } : { n: Number(row.minArvo), unit: "ARVO + USDG", usd: undefined };
        const arvoSize = !/^0+(?:\.0+)?$/.test(row.maxArvo) ? `${formatAmount(row.maxArvo)} ARVO` : null, usdgSize = !/^0+(?:\.0+)?$/.test(row.maxUsdc) ? `${formatAmount(row.maxUsdc)} USDG` : null;
        const usdgOnlyDraft = row.products.usdcUsdc && !row.products.arvoArvo && !row.products.arvoUsdc; const size = usdgOnlyDraft ? usdgSize : arvoSize; const sizeN = size ? Number(usdgOnlyDraft ? row.maxUsdc : row.maxArvo) : 0, sizeUnit = usdgOnlyDraft ? "USDG" : "ARVO";
        const committed = draftUnits(row.committedUsdc, 6);
        return <VaultCardShell key={row.id} id={`vault-preview-${row.id}`} order={cardOrder(row.sortOrder ?? 0, row.id, true)}
>
          <CardStatus dot="bg-[#e2a98e]/70" label="Coming soon" tip="A preview of a planned vault. Deposits are not open yet, and the terms shown may still change before it opens." bonus={bonus > 0 ? { label: `+${bonus}% bonus`, tip: <>On top of the fixed reward, a bonus pot is shared between everyone in this vault by how much they stake. If the vault fills up, the bonus works out at about {bonus}% extra; if it is less full, each share is bigger. Planned figure: it is confirmed when the vault opens.</> } : null} />
          <CardTitle title={row.title} share={<VaultShare title={row.title} days={row.days} anchor={`vault-preview-${row.id}`} preview dark/>} />
          <LockLine days={row.days} className="mt-1" />
          <div className="mt-5">
            <div>{enabled.map(key => <div key={key}>
              <p className="text-xs leading-5 text-white/70">{productLabels[key]}</p>{key==="dualMixed"?<MixedRewardRates arvoRate={Number(row.arvoRate)} usdcRate={Number(row.usdcRate)} share={Number(row.mixedShare??"50")} days={row.days} dark/>:<><AnnualReward percent={Number(pays(key) === "ARVO" ? row.arvoRate : row.usdcRate)} days={row.days} dark prominent/>
              <RewardLine percent={Number(pays(key) === "ARVO" ? row.arvoRate : row.usdcRate)} days={row.days} asset={pays(key)} bonus={bonus > 0} note={key.startsWith("dual") ? "before dual uplift" : undefined} /></>}
            </div>)}</div>
          </div>
          <div className="mt-5"><TermStats items={[
            { label: "Minimum", value: compactNumber(minimum.n), unit: minimum.unit, tip: first === "arvoUsdc" ? "Rewards are paid in USDG, worked out from the ARVO price fixed when you deposit." : undefined },
            { label: "Vault size", value: sizeN ? compactNumber(sizeN) : "No limit", unit: sizeN ? sizeUnit : undefined, tip: "The most this vault can hold. Once it is full, it stops taking new deposits." },
            { label: "Reward in", value: first ? pays(first) : "–" },
          ]} /></div>
          <div className="mt-5 border-t border-white/10 pt-4">{committed > 0n ? <CommittedCapacity bare preview asset="USDG" cap={draftUnits(row.maxUsdc, 6)} committed={committed} deposited={0n} decimals={6} committedLabel="committed outside the app" /> : <PlannedCapacity size={size} />}</div>
          <CardList><PlannedActivity bare /><StakingIn bare asset={row.products.usdcUsdc && !row.products.arvoArvo && !row.products.arvoUsdc ? "USDG" : "ARVO"} project={row.project} kind={row.explainer} /><EstimateButton bare onClick={() => setSelectedId(row.id)} /></CardList>
          <div className="mt-auto space-y-2.5 pt-4">
            <VaultTiming opensAt={row.opensAt} closesAt={row.closesAt} preview dark inline />
            <p className="text-right text-xs text-white/55">Deposits are not open yet</p>
          </div>
        </VaultCardShell>; })}</div>
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
    <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#ad7058]">Estimate your reward{preview ? " · planned terms" : ""}</p><h2 id={titleId} className="mt-2 text-xl font-semibold">{row.title}</h2></div><button autoFocus type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-black/5"><X size={18}/></button></div>
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
    let cancelled=false;const controller=new AbortController();setEntryReward(null);setPrice("");setPriceStatus(preview?"Getting the current ARVO price…":"Getting a quote from the contract…");
    const timer=setTimeout(async()=>{try{
      if(preview){const response=await fetch("/app/market-price",{cache:"no-store",signal:controller.signal});const data=await response.json();if(!response.ok||typeof data.priceUsd!=="string"||!/^\d+(?:\.\d+)?$/.test(data.priceUsd)||Number(data.priceUsd)<=0||!Number.isFinite(data.fetchedAt)||Date.now()-data.fetchedAt>120000)throw new Error("The current ARVO price isn’t available right now. Please try again in a moment.");if(!cancelled){setPrice(data.priceUsd);setPriceStatus("Current market price, for illustration. Your actual reward uses the contract’s verified price when you deposit.");}}
      else{const connection=stakingConnection();if(!connection)throw new Error("Staking unavailable.");if(await connection.publicClient.getChainId()!==connection.chain.id)throw new Error("Network mismatch.");const amount=tokenAmount(arvo,18,"ARVO deposit");const result=await connection.publicClient.readContract({address:connection.address,abi:stakingAbi,functionName:"quoteArvoForUsdc",args:[row.id,amount],blockTag:"latest"});if(!cancelled){setEntryReward(result as bigint);setPriceStatus("Verified contract quote using the current oracle price. The final reward is fixed when your deposit confirms.");}}
    }catch(error){if(!cancelled)setPriceStatus(error instanceof Error?error.message:"We couldn’t work out an estimate. Please try again.");}},preview?0:300);
    return()=>{cancelled=true;controller.abort();clearTimeout(timer);};
  },[cross,preview,row.id,preview?"":arvo]);
  let mixed:{arvo:bigint;usdc:bigint}|null=null;let reward: bigint | null = null, principal = 0n, minArvo = 0n, minUsdc = 0n, a = 0n, u = 0n, invalid = "", eligibility = "";
  try {
    minArvo = tokenAmount(cross ? row.minArvoUsdc : row.minArvo, 18, "Minimum ARVO"); minUsdc = tokenAmount(row.minUsdc, 6, "Minimum USDG");
    a = needsArvo ? tokenAmount(arvo, 18, "ARVO amount") : 0n; u = needsUsdc ? tokenAmount(usdc, 6, "USDG amount") : 0n;
    const boost = dual ? Number(tokenAmount(row.dualBoost, 2, "Dual uplift")) : 0, cap = Number(tokenAmount(row.boostCap, 2, "Uplift cap"));
    const rate = Number(tokenAmount(paysArvo ? row.arvoRate : row.usdcRate, 2, "Reward rate"));
    principal = paysArvo ? a : u;
    reward = cross ? !preview ? entryReward : price ? a * tokenAmount(price, 18, "ARVO price used for this estimate") * BigInt(rate) / (10n ** 30n * 10000n) : null : cycleReward(principal, rate, Math.min(boost, cap));
    if (cross && price && tokenAmount(price, 18, "ARVO price used for this estimate") === 0n) throw new Error("Illustrative ARVO price must be greater than zero.");
    if(product==="dualMixed")mixed=mixedRewards(a,u,Number(tokenAmount(row.arvoRate,2,"ARVO cycle rate")),Number(tokenAmount(row.usdcRate,2,"USDG cycle rate")),Math.min(boost,cap),Number(tokenAmount(row.mixedShare??"50",2,"ARVO share")));
    const gaps = [];
    if (needsArvo && a < minArvo) gaps.push(`${tokenDisplay(minArvo - a, 18)} ARVO`);
    if (needsUsdc && u < minUsdc) gaps.push(`${tokenDisplay(minUsdc - u, 6)} USDG`);
    if (gaps.length) eligibility = `Add ${gaps.join(" and ")} to reach this product’s minimum.`;
    if (needsArvo && tokenAmount(row.maxArvo, 18, "Capacity") > 0n && a > tokenAmount(row.maxArvo, 18, "Capacity")) eligibility = "That is more than this vault can hold.";
    if (needsUsdc && tokenAmount(row.maxUsdc, 6, "Capacity") > 0n && u > tokenAmount(row.maxUsdc, 6, "Capacity")) eligibility = "That is more than this vault can hold.";
  } catch (e) { invalid = e instanceof Error ? e.message : "Enter a valid amount."; reward = null; }
  function choose(next: keyof Products) { setProduct(next); setArvo(next === "arvoUsdc" ? row.minArvoUsdc : row.minArvo); setUsdc(row.minUsdc); }
  return <div aria-label="Reward estimate">
    <p className="mt-2 text-xs text-black/50">{row.days}-day lock · rewards for one complete cycle</p>
    <label className="mt-4 block text-xs font-semibold">What you deposit and earn<select aria-label="What you deposit and earn" value={product} onChange={e => choose(e.target.value as keyof Products)} className="mt-2 w-full rounded-xl border border-black/10 bg-white p-3 text-sm font-normal">{enabled.map(key => <option key={key} value={key}>{productLabels[key]}</option>)}</select></label>
    {needsArvo && <label className="mt-4 block text-xs font-semibold">ARVO deposit<TokenAmountInput label="Preview ARVO deposit" value={arvo} onChange={setArvo} /><RewardAmountSlider label="ARVO deposit slider" value={arvo} minimum={cross ? row.minArvoUsdc : row.minArvo} capacity={row.maxArvo} decimals={18} asset="ARVO" onChange={setArvo}/></label>}
    {needsUsdc && <label className="mt-4 block text-xs font-semibold">USDG deposit<TokenAmountInput label="Preview USDG deposit" value={usdc} onChange={setUsdc} /><RewardAmountSlider label="USDG deposit slider" value={usdc} minimum={row.minUsdc} capacity={row.maxUsdc} decimals={6} asset="USDG" onChange={setUsdc}/></label>}
    <div className="mt-3 flex gap-2">{[1, 2, 5].map(multiplier => <button type="button" key={multiplier} onClick={() => { if (needsArvo) setArvo(tokenDisplay(minArvo * BigInt(multiplier), 18).replaceAll(",", "")); if (needsUsdc) setUsdc(tokenDisplay(minUsdc * BigInt(multiplier), 6).replaceAll(",", "")); }} className="rounded-lg border border-black/10 px-3 py-2 text-[11px] font-semibold">{multiplier === 1 ? "Minimum" : `${multiplier}× min`}</button>)}</div>
    {cross && <div role="status" className="mt-4 rounded-xl bg-black/[.03] p-3 text-xs leading-5">{preview&&price&&<p className="font-semibold">ARVO market price: ${price}</p>}<p className="text-black/55">{priceStatus}</p></div>}
    <div className="mt-4 rounded-2xl bg-[#f8f4ef] p-5"><p className="text-[10px] font-semibold uppercase tracking-widest text-black/45">{cross ? preview ? "Estimated USDG reward" : "Current contract USDG quote" : "Your fixed reward"}</p><p className="mt-3 break-words text-2xl font-semibold tabular-nums">{product==="dualMixed"?(mixed?`${tokenDisplay(mixed.arvo,18)} ARVO + ${tokenDisplay(mixed.usdc,6)} USDG`:"–"):reward === null ? "–" : tokenDisplay(reward, paysArvo ? 18 : 6)} <span className="text-sm text-black/45">{product==="dualMixed"?"":paysArvo ? "ARVO" : "USDG"}</span></p><p className="mt-2 text-xs text-black/50">{product==="dualMixed"?`${row.mixedShare??"50"}% ARVO / ${100-Number(row.mixedShare??"50")}% USDG weighting · `:""}{paysArvo ? row.arvoRate : row.usdcRate}% for {row.days} days{dual ? ` · ${row.dualBoost}% dual uplift, capped at ${row.boostCap}%` : ""}</p>
      {!invalid && !cross && product!=="dualMixed" && reward !== null && <p className="mt-4 border-t border-black/10 pt-3 text-xs leading-5 text-black/55">You get back: <strong>{tokenDisplay(principal + reward, paysArvo ? 18 : 6)} {paysArvo ? "ARVO" : "USDG"}</strong>{dual ? `. Your ${paysArvo ? `${tokenDisplay(u, 6)} USDG` : `${tokenDisplay(a, 18)} ARVO`} principal is returned separately.` : "."}</p>}
    </div>
    {!dual && !cross && <AnnualReward percent={Number(paysArvo ? row.arvoRate : row.usdcRate)} days={row.days}/>}
    {(invalid || eligibility) && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{invalid || eligibility}</p>}
    <p className="mt-4 text-[11px] leading-5 text-black/45">{cross ? "USDG payouts require a verified entry price and reserved rewards." : preview ? "Based on the planned terms, which may still change before the vault opens." : "Based on this vault’s current terms. Any shared bonus is shown separately on the vault card."} {row.acquisition?"Acquisition rewards are fixed commitments, paid when the pool has sufficient repayment cash. ":""}Estimates only. Availability is checked separately. Your lock starts at deposit.</p>
  </div>;
}
