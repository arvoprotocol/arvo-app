"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowUpRight,Clock3,Layers3} from "lucide-react";
import {readPool} from "@/hooks/useStakingData";
import {stakingConnection,stakingAbi} from "@/lib/staking/pool-transactions";
import {poolPreview} from "@/lib/staking/pool-preview";
import {vaultAvailability,vaultName} from "@/lib/staking/capacity";
import {productLabels,type Products} from "@/lib/staking/pool-form";
import type {DraftPreview} from "@/lib/staking/vault-draft";
import {AnnualReward} from "./AnnualReward";
import {DiscoveryCarousel} from "./DiscoveryCarousel";
import {availabilityLabel} from "@/lib/staking/presentation";
type Card={key:string;terms:DraftPreview;status:string;href:string};
export function OverviewVaults(){
 const [cards,setCards]=useState<Card[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{const controller=new AbortController();
  async function load(){
   if(!controller.signal.aborted)setError("");
   const previews=await fetch("/app/vault-previews",{cache:"no-store",signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error("Vault previews are unavailable.");return r.json() as Promise<{previews:DraftPreview[];poolTitles:{poolId:number;title:string;sortOrder?:number;bonusPct?:string;appHidden?:boolean}[]}>;});
   const metadata=new Map(previews.poolTitles.map(row=>[row.poolId,row]));
   const live:Card[]=[];const c=stakingConnection();
   if(c){try{if(await c.publicClient.getChainId()!==c.chain.id)throw new Error("Network mismatch.");const block=await c.publicClient.getBlock();const count=Number(await c.publicClient.readContract({address:c.address,abi:stakingAbi,functionName:"nextVaultId",blockTag:"latest"}));if(!Number.isSafeInteger(count)||count>1000)throw new Error("Too many pools.");
    for(let end=count;end>0&&live.length<6;end-=20){const rows=await Promise.all(Array.from({length:Math.min(20,end)},(_,i)=>readPool(end-1-i)));for(const row of rows.filter(p=>p.visibility!==0&&!metadata.get(p.id)?.appHidden)){
     const closed=!row.pool.enabled||row.pool.finalized||(row.pool.closesAt!==0n&&block.timestamp>=row.pool.closesAt),availability=vaultAvailability(row);
     const status=row.visibility===1?"Opens soon":closed?"Deposits closed":block.timestamp<row.pool.opensAt?"Opens soon":availability.available?"Open now":availabilityLabel(availability.reason,false);
     live.push({key:`pool-${row.id}`,terms:{...poolPreview(row,metadata.get(row.id)?.title??`${vaultName(row)} #${row.id}`),sortOrder:metadata.get(row.id)?.sortOrder??0,bonusPct:metadata.get(row.id)?.bonusPct??"0"},status,href:`/app/stake#vault-pool-${row.id}`});
    }}
   }catch{if(!controller.signal.aborted)setError("Live vault status is unavailable. Preview terms are shown below.");}}
   if(!controller.signal.aborted){setCards([...live.slice(0,6),...previews.previews.map(terms=>({key:`preview-${terms.id}`,terms,status:"Coming soon",href:`/app/stake#vault-preview-${terms.id}`}))].sort((a,b)=>(a.terms.sortOrder??0)-(b.terms.sortOrder??0)).slice(0,12));setLoading(false);}
  }
  const refresh=()=>{if(document.visibilityState!=="hidden")void load().catch(()=>{if(!controller.signal.aborted){setError("Vault information is temporarily unavailable. View all vaults to retry.");setLoading(false);}});};refresh();const timer=setInterval(refresh,60000);document.addEventListener("visibilitychange",refresh);return()=>{controller.abort();clearInterval(timer);document.removeEventListener("visibilitychange",refresh);};
 },[]);
 return <DiscoveryCarousel title="Explore vaults" eyebrow="Your next stake" href="/app/stake" linkLabel="View all">
  {cards.map(({key,terms,status,href})=>{const enabled=(Object.keys(productLabels) as (keyof Products)[]).filter(k=>terms.products[k]);const first=enabled[0];const mixed=first==="dualMixed",arvo=first==="arvoArvo"||first==="dualArvo",rate=Number(arvo?terms.arvoRate:terms.usdcRate),bonus=Number(terms.bonusPct||0);
   return <article data-discovery-card key={key} className="relative flex min-h-[265px] flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#07090b] p-5 text-white"><div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-[#c9846a]/15 blur-3xl"/><div className="relative flex items-center justify-between gap-3"><p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#e2a98e]">{status}</p>{bonus>0?<span className="shrink-0 rounded-full bg-[linear-gradient(135deg,#b9775d_0%,#e2a98e_45%,#f0d2b0_75%)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.08em] text-[#07090b]">+{bonus}% bonus</span>:<Layers3 size={17} className="shrink-0 text-[#e2a98e]/60"/>}</div><h3 className="relative mt-4 line-clamp-2 text-xl font-semibold tracking-tight">{terms.title}</h3><p className="mt-1.5 text-xs text-white/60">{first?productLabels[first]:"Review vault terms"}{enabled.length>1?` · +${enabled.length-1} options`:""}</p>
    <div className="my-3">{mixed?<><p className="text-lg font-semibold">ARVO + USDG rewards</p><p className="mt-1 text-xs text-white/60">{terms.arvoRate}% / {terms.usdcRate}% fixed rewards · {terms.mixedShare??"50"}% ARVO weighting</p></>:first?<><AnnualReward percent={rate} days={terms.days} dark prominent/><p className="mt-2 text-xs text-white/60">{rate}% fixed reward{bonus>0?<span className="font-semibold text-[#e2a98e]"> + bonus</span>:null}{first.startsWith("dual")?" · before uplift":""}</p></>:null}</div>
    <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-3"><p className="flex items-center gap-1.5 text-xs text-white/60"><Clock3 size={12}/>Locked {terms.days===365?"12 months":`${terms.days} days`}</p><Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-[#e2a98e]">View vault<ArrowUpRight size={14}/><span className="sr-only"> {terms.title}</span></Link></div>
   </article>;
  })}
  {loading&&!cards.length&&[0,1,2].map(i=><div key={`skeleton-${i}`} data-discovery-card aria-hidden={i>0} role={i===0?"status":undefined} aria-label={i===0?"Loading vaults":undefined} className="flex min-h-[265px] flex-col rounded-[22px] border border-white/10 bg-[#07090b] p-5"><div className="arvo-skeleton-dark h-3 w-24"/><div className="arvo-skeleton-dark mt-4 h-6 w-40"/><div className="arvo-skeleton-dark mt-6 h-10 w-36"/><div className="arvo-skeleton-dark mt-3 h-3 w-44"/><div className="arvo-skeleton-dark mt-auto h-4 w-full"/></div>)}
  {!loading&&!cards.length&&<div data-discovery-card className="rounded-[22px] border border-black/10 bg-white/70 p-6"><p className="font-semibold">New vaults coming soon.</p><p className="mt-2 text-xs leading-5 text-black/55">Published vaults and planned terms will appear here.</p><Link href="/app/stake" className="mt-4 inline-block text-xs font-semibold text-[#ad7058]">Explore staking →</Link></div>}
  {error&&<p data-discovery-card role="alert" className="rounded-[22px] border border-black/10 p-5 text-xs leading-5 text-black/60">{error}</p>}
 </DiscoveryCarousel>;
}
