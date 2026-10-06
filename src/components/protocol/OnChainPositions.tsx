"use client";
import {tokenDisplay} from "@/lib/staking/presentation";
import {MaturityActions} from "./MaturityActions";
import {useState} from "react";
import {formatUnits,type Hash} from "viem";
import {PageTitle,Panel,PanelHeader,StatCard,StatusPill} from "./ProtocolUI";
import {useStakingData} from "@/hooks/useStakingData";
import {connectStakingWallet,transact} from "@/lib/staking/user-transactions";
const amount=(n:bigint,d:number)=>tokenDisplay(n,d);
export function OnChainPositions({mode="portfolio"}:{mode?:"portfolio"|"rewards"|"activity"}){
 const state=useStakingData(),[busy,setBusy]=useState(false),[hash,setHash]=useState<Hash|null>(null),[error,setError]=useState("");
 async function claim(id:bigint){if(busy||hash)return;setBusy(true);setError("");try{await transact("claim",[id],setHash,undefined,undefined,state.account??undefined);setHash(null);state.refresh();}catch(e){setError(e instanceof Error?e.message:"Claim failed.");}finally{setBusy(false);}}
 const rows=state.data?.positions??[];const active=rows.filter(p=>!p.settled);const matured=active.filter(p=>p.maturesAt<=(state.data?.now??BigInt(0)));
 return <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11"><PageTitle eyebrow={mode} title={mode==="rewards"?"Your rewards.":mode==="activity"?"Your staking activity.":"Your staking positions."} copy="Balances and payouts read from your staking contract."/>
 <div className="mt-6 flex flex-wrap items-center gap-3"><button onClick={()=>connectStakingWallet().catch(e=>setError(String(e.message)))} className="rounded-xl bg-[#07090b] px-4 py-3 text-sm font-semibold text-white">{state.account?`${state.account.slice(0,6)}…${state.account.slice(-4)}`:"Connect wallet"}</button><button onClick={state.refresh} className="rounded-xl border border-black/10 px-4 py-3 text-sm">Refresh</button></div>
 {(state.error||error)&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{state.error||error}</p>}
 {hash&&<p role="status" className="mt-4 break-all text-xs">Submitted transaction: {hash}. If confirmation is delayed, check this hash in your wallet before trying again.</p>}
 <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Available in wallet" value={state.data?amount(state.data.arvoBalance,18):"—"} detail="ARVO · excludes locked stakes and future rewards"/><StatCard label="ARVO in positions" value={state.data?amount(active.reduce((n,p)=>n+p.arvoPrincipal,BigInt(0)),18):"—"} detail="In contract · includes matured positions shown"/><StatCard label="Claimable ARVO reward" value={state.data?amount(matured.reduce((n,p)=>n+p.arvoReward,BigInt(0)),18):"—"} detail="Matured positions shown"/><StatCard label="Claimable USDC reward" value={state.data?amount(matured.reduce((n,p)=>n+p.usdcReward,BigInt(0)),6):"—"} detail="Matured positions shown"/></section>
 <section className="mt-6"><Panel><PanelHeader eyebrow="On-chain" title={mode==="activity"?"Position history":"Positions and fixed rewards"}/><div className="p-5">
 {!state.configured?<p>Staking connection is not configured yet.</p>:!state.account?<p>Connect your wallet to see your positions.</p>:state.loading?<p role="status">Loading positions…</p>:state.data&&rows.length===0?<p>No staking positions for this wallet.</p>:null}
 {state.data&&state.data.totalPositions>100&&<p className="mb-4 text-xs text-black/50">Showing the latest 100 of {state.data.totalPositions} positions. Totals above cover the positions shown.</p>}
 <div className="space-y-3">{rows.map(p=><div key={String(p.id)} className="rounded-xl border border-black/10 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">Position #{String(p.id)} · Pool #{p.vaultId}</p><StatusPill>{p.settled?p.emergencyExit?"Emergency exit":"Settled":p.maturesAt<=(state.data?.now??BigInt(0))?"Matured":"Locked"}</StatusPill></div><p className="mt-3 text-sm">Principal: {amount(p.arvoPrincipal,18)} ARVO · {amount(p.usdcPrincipal,6)} USDC</p><p className="mt-1 text-sm">Fixed reward: {amount(p.arvoReward,18)} ARVO · {amount(p.usdcReward,6)} USDC</p><p className="mt-1 text-xs text-black/50">Opened {new Date(Number(p.openedAt)*1000).toLocaleString()} · Matures {new Date(Number(p.maturesAt)*1000).toLocaleString()}</p>{!p.settled&&p.maturesAt<=(state.data?.now??BigInt(0))&&<button disabled={busy||Boolean(hash)||!state.network} onClick={()=>claim(p.id)} className="mt-4 rounded-lg bg-[#07090b] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">Claim principal and rewards</button>}{!p.settled&&p.maturesAt<=(state.data?.now??BigInt(0))&&<MaturityActions position={p} onRefresh={state.refresh}/>}</div>)}</div>
 </div></Panel></section></div>;
}
