"use client";
import type {PoolRow} from "@/hooks/useStakingData";
import {useVaultClock} from "./VaultTiming";
import {assetCapacity, vaultAvailability} from "@/lib/staking/capacity";
import {tokenDisplay} from "@/lib/staking/presentation";
import {CommittedCapacity} from "./CommittedCapacity";
import {InfoTip} from "./InfoTip";
export function VaultCapacity({row,bare=false}:{row:PoolRow;bare?:boolean}) {
 const now=useVaultClock();
 const scheduled=now!==null&&BigInt(Math.floor(now/1000))<row.pool.opensAt;
 const assets = [{name:"ARVO",used:row.arvoPrincipal,allocated:row.pool.protocolArvoAllocation,cap:row.pool.maxArvoPrincipal,decimals:18,enabled:row.vault.arvoStakeEnabled||row.vault.dualStakeEnabled},{name:"USDG",used:row.usdcPrincipal,allocated:row.pool.protocolUsdcAllocation,cap:row.pool.maxUsdcPrincipal,decimals:6,enabled:row.vault.usdcStakeEnabled||row.vault.dualStakeEnabled}].filter(x => x.enabled);
 const availability = vaultAvailability(row);
 return <div className={bare?"space-y-3":"mt-5 space-y-3 border-t border-white/10 pt-4"}>{assets.map(asset => {
  const capacity = assetCapacity(asset.used,asset.cap,asset.allocated);
  if (asset.allocated > 0n && asset.cap > 0n) return <div key={asset.name}><CommittedCapacity bare asset={asset.name} cap={asset.cap} committed={asset.allocated} deposited={asset.used} decimals={asset.decimals} committedLabel={asset.name==="USDG"?"committed outside the app":"allocated by the protocol"}/></div>;
  return <div key={asset.name}><div className="flex items-center justify-between gap-3 text-[11px]"><span className="flex items-center gap-1 font-semibold uppercase tracking-[0.14em] text-white/60">Vault filled<InfoTip dark label="About vault size">This vault can hold {asset.cap > 0n ? `${tokenDisplay(asset.cap,asset.decimals)} ${asset.name}` : `any amount of ${asset.name}`}. When it is full it stops taking new deposits; everyone already in keeps their terms.</InfoTip></span><span className="tabular-nums text-white/60">{capacity.percent === null ? "No limit" : `${(Math.floor(capacity.percent*10)/10).toFixed(1)}%`}</span></div>
   {capacity.percent !== null && <div role="progressbar" aria-label={`${asset.name} vault filled`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={capacity.percent} aria-valuetext={`${tokenDisplay(asset.used+asset.allocated,asset.decimals)} of ${tokenDisplay(asset.cap,asset.decimals)} ${asset.name}`} className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="arvo-bar h-full rounded-full bg-[linear-gradient(90deg,#c9846a,#e2a98e)]" style={{width:`${Math.max(capacity.percent, asset.used > 0n ? 1.5 : 0)}%`}} /></div>}
   <p className="mt-2 flex justify-between gap-3 text-[11px] tabular-nums text-white/60"><span>{tokenDisplay(asset.used+asset.allocated,asset.decimals)}{asset.cap > 0n ? ` of ${tokenDisplay(asset.cap,asset.decimals)}` : ""} {asset.name}</span>{capacity.remaining !== null && capacity.remaining > 0n && <span>{tokenDisplay(capacity.remaining,asset.decimals)} left</span>}</p>
  </div>;
 })}{!availability.available && <p role="status" className="text-[11px] leading-5 text-[#e2a98e]">{availability.reason === "Vault full" ? "This vault is full. Everyone already in keeps their agreed terms." : scheduled ? "Rewards for this vault are still being funded. Deposits open once they are in place." : "All rewards for this vault have been allocated, so it can't take new deposits. Everyone already in keeps their fixed rewards."}</p>}</div>;
}
