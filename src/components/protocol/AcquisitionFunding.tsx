"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import type {AcquisitionState} from "@/lib/staking/acquisition";
import {tokenDisplay} from "@/lib/staking/presentation";
export function AcquisitionFunding({state,dark=false}:{state:AcquisitionState|null;dark?:boolean}){
 const [project,setProject]=useState<{title:string;slug:string}|null>(null);
 useEffect(()=>{setProject(null);if(!state||/^0x0+$/.test(state.projectId))return;let cancelled=false;fetch("/api/projects/acquisition-links",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(!cancelled)setProject(d.projects.find((p:{hash:string})=>p.hash.toLowerCase()===state.projectId.toLowerCase())??null);}).catch(()=>{});return()=>{cancelled=true;};},[state?.projectId]);
 if(!state)return null;
 return <div className={`mt-4 rounded-xl border p-4 text-xs leading-5 ${dark?"border-white/10 text-white/60":"border-black/10 text-black/60"}`}><p className={`font-semibold ${dark?"text-[#e2a98e]":"text-[#ad7058]"}`}>Acquisition vault{project?` · ${project.title}`:""}</p>{project&&<Link href={`/app/projects/${project.slug}`} className="underline">View project updates</Link>}<p className="mt-2">USDC deposits may be transferred to Treasury for acquisitions. Your original maturity date and fixed reward remain due. Payment requires this pool to have enough cash.</p><p className="mt-2">Pool cash: {tokenDisplay(state.cash,6)} USDC · Principal held by Treasury: {tokenDisplay(state.outstandingPrincipal,6)} USDC</p><p className="mt-2">Cash is shared by this pool’s positions. It is not a reservation for your individual payout. Project links do not grant ownership or verify how Treasury spends funds.</p></div>;
}
