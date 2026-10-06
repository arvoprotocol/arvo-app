"use client";
import {VaultCapacity} from "./VaultCapacity";
import {vaultAvailability,vaultName} from "@/lib/staking/capacity";
import {VaultShare} from "@/components/protocol/VaultShare";
import {AnnualReward} from "./AnnualReward";
import {VaultDraftPreviews} from "./VaultDraftPreviews";
import {VaultTiming,useVaultClock} from "./VaultTiming";
import {useEffect,useState} from "react";
import Link from "next/link";
import {readPool,type PoolRow} from "@/hooks/useStakingData";
import {stakingConnection,stakingAbi} from "@/lib/staking/pool-transactions";
import {productLabels,type Products} from "@/lib/staking/pool-form";
function dateFor(value:bigint){if(value===0n)return null;const date=new Date(Number(value)*1000);return Number.isFinite(date.getTime())?date.toISOString():null;}
function LivePublishedVaults(){
 const [rows,setRows]=useState<PoolRow[]|null>(null),[error,setError]=useState("");const now=useVaultClock();const [revision,setRevision]=useState(0);
 useEffect(()=>{const refresh=()=>{if(document.visibilityState!=="hidden")setRevision(n=>n+1);};const timer=setInterval(refresh,60000);document.addEventListener("visibilitychange",refresh);return()=>{clearInterval(timer);document.removeEventListener("visibilitychange",refresh);};},[]);
 useEffect(()=>{let cancelled=false;async function load(){const c=stakingConnection();if(!c)return;if(await c.publicClient.getChainId()!==c.chain.id)throw new Error("Staking RPC chain mismatch.");const block=await c.publicClient.getBlock();const count=Number(await c.publicClient.readContract({address:c.address,abi:stakingAbi,functionName:"nextVaultId",blockNumber:block.number}));if(!Number.isSafeInteger(count)||count>1000)throw new Error("Pool pagination is required.");const shown:PoolRow[]=[];for(let end=count;end>0&&shown.length<3;end-=20){const batch=await Promise.all(Array.from({length:Math.min(20,end)},(_,i)=>readPool(end-1-i,block.number)));shown.push(...batch.filter(p=>p.visibility!==0));}if(!cancelled){setRows(shown.slice(0,3));setError("");}}load().catch(e=>{if(!cancelled)setError(e.message);});return()=>{cancelled=true;};},[revision]);
 if(error)return <p role="alert" className="mt-4 text-sm text-black/50">Vault data is unavailable. Open the Stake page to retry.</p>;if(!rows?.length)return null;
 return <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map(p=>{
  const seconds=now===null?null:BigInt(Math.floor(now/1000));
  const closed=!p.pool.enabled||p.pool.finalized||(seconds!==null&&p.pool.closesAt!==0n&&seconds>=p.pool.closesAt);
  const status=p.visibility===1?"Opening soon":closed?"Deposits closed":!vaultAvailability(p).available?vaultAvailability(p).reason:seconds===null?"Review schedule":seconds<p.pool.opensAt?"Opening soon":"Entry window open";
  return <article key={p.id} className="flex flex-col rounded-[24px] border border-white/10 bg-[#07090b] p-6 text-white"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#e2a98e]">{status}</p><VaultShare title={`${vaultName(p)} #${p.id}`} days={p.vault.duration/86400} anchor={`vault-pool-${p.id}`} dark/></div><h3 className="mt-5 text-2xl font-semibold tracking-tight">{vaultName(p)} #{p.id}</h3><p className="mt-2 text-sm text-white/50">{p.vault.duration/86400}-day lock from your deposit</p><div className="mt-5 space-y-3">{(Object.keys(productLabels) as (keyof Products)[]).filter((_,i)=>(p.products&2**i)!==0).map(key=><div key={key}><p className="text-xs leading-5 text-white/60">{productLabels[key]}</p><p className="mt-1 text-3xl font-semibold tracking-tight">{(key==="arvoArvo"||key==="dualArvo"?p.vault.arvoRewardBps:p.vault.usdcRewardBps)/100}% <span className="text-xs font-normal tracking-normal text-white/40">cycle reward{key.startsWith("dual")?" before uplift":""}</span></p>{(key==="arvoArvo"||key==="usdcUsdc")&&<AnnualReward percent={(key==="arvoArvo"?p.vault.arvoRewardBps:p.vault.usdcRewardBps)/100} days={p.vault.duration/86400} dark/>}</div>)}{!p.products&&<p className="text-xs text-white/50">Review deposit and reward terms</p>}</div><VaultCapacity row={p}/><VaultTiming opensAt={dateFor(p.pool.opensAt)} closesAt={dateFor(p.pool.closesAt)} dark compact/><Link href="/app/stake" className="mt-auto pt-5 text-xs font-semibold text-[#e2a98e]">Review vault →</Link></article>;
 })}</div>;
}
export function PublishedVaults(){return <><VaultDraftPreviews compact/><LivePublishedVaults/></>;}
