"use client";
import {useState} from "react";
import type {Hash} from "viem";
import type {Position} from "@/hooks/useStakingData";
import type {AcquisitionState} from "@/lib/staking/acquisition";
import {acquisitionClaimReady} from "@/lib/staking/acquisition-math";
import {tokenDisplay} from "@/lib/staking/presentation";
import {transact} from "@/lib/staking/user-transactions";

export function EmergencyActions({position:p, paused, now, acquisition, network, onRefresh}:{
  position:Position&{id:bigint};paused:boolean;now:bigint;acquisition:AcquisitionState|null;
  network:boolean;onRefresh:()=>void;
}) {
  const [busy,setBusy]=useState(false),[hash,setHash]=useState<Hash|null>(null),[error,setError]=useState("");
  const pending=p.pendingEmergencyUsdc??0n;
  const canExit=paused&&!p.settled&&p.maturesAt>now;
  if(!canExit&&pending===0n)return null;
  const ready=Boolean(acquisition&&acquisitionClaimReady(acquisition,pending,0n));
  async function send(deferred:boolean){
    if(busy||hash)return;
    if(!deferred&&!window.confirm("Exit early and permanently forfeit this position's rewards? Acquisition USDC is collected separately once the pool can pay."))return;
    setBusy(true);setError("");
    try{await transact(deferred?"claimEmergencyUsdc":"emergencyExit",[p.id],setHash,undefined,undefined,p.owner);setHash(null);onRefresh();}
    catch(e){setError(e instanceof Error?e.message:"Emergency withdrawal failed.");}
    finally{setBusy(false);}
  }
  return <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm">
    {pending>0n?<>
      <p>ARVO principal returned. {tokenDisplay(pending,6)} USDC principal remains unpaid. Rewards were forfeited.</p>
      <button disabled={busy||Boolean(hash)||!network||!ready} onClick={()=>send(true)} className="mt-3 rounded-lg bg-[#07090b] px-4 py-2 text-xs text-white disabled:opacity-40">Claim returned USDC principal</button>
      {!ready&&<p className="mt-2 text-xs">Awaiting this vault's principal repayment. Your USDC claim is preserved.</p>}
    </>:<>
      <p>Emergency exit is available while staking is paused. You will forfeit all rewards. For dual acquisition stakes, ARVO returns now and USDC is collected separately subject to pool funding.</p>
      <button disabled={busy||Boolean(hash)||!network} onClick={()=>send(false)} className="mt-3 rounded-lg border border-amber-800 px-4 py-2 text-xs disabled:opacity-40">Exit early · forfeit rewards</button>
    </>}
    {hash&&<p className="mt-2 break-all text-xs">Submitted: {hash}. Check confirmation before retrying.</p>}
    {error&&<p role="alert" className="mt-2 text-xs text-red-800">{error}</p>}
  </div>;
}
