import type {Position} from "@/hooks/useStakingData";
import {tokenDisplay} from "./presentation";
export function rewardDate(value:bigint){
 const date=new Date(Number(value)*1000);
 return Number.isFinite(date.getTime())?new Intl.DateTimeFormat("en-GB",{timeZone:"UTC",dateStyle:"medium",timeStyle:"short"}).format(date)+" UTC":"Date unavailable";
}
export function rewardSchedule(rows:(Position&{id:bigint})[],now:bigint){
 const positions=rows.filter(p=>!p.settled&&(p.arvoReward>0n||p.usdcReward>0n)).sort((a,b)=>a.maturesAt<b.maturesAt?-1:a.maturesAt>b.maturesAt?1:a.id<b.id?-1:1);
 function asset(field:"arvoReward"|"usdcReward",decimals:number){
  const paying=positions.filter(p=>p[field]>0n),total=paying.reduce((n,p)=>n+p[field],0n),dueNow=paying.filter(p=>p.maturesAt<=now).reduce((n,p)=>n+p[field],0n),next=paying.find(p=>p.maturesAt>now)?.maturesAt??null;
  const detail=dueNow>0n?`${tokenDisplay(dueNow,decimals)} ready to claim${next!==null?` · next ${rewardDate(next)}`:""}`:next!==null?`Next unlocks ${rewardDate(next)}`:"Nothing due yet";
  return {total,dueNow,next,detail};
 }
 return {positions,arvo:asset("arvoReward",18),usdc:asset("usdcReward",6)};
}
