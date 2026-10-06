"use client";
import type {PoolRow} from "@/hooks/useStakingData";
import {assetCapacity, vaultAvailability} from "@/lib/staking/capacity";
import {tokenDisplay} from "@/lib/staking/presentation";
export function VaultCapacity({row}:{row:PoolRow}) {
 const assets = [{name:"ARVO",used:row.arvoPrincipal,allocated:row.pool.protocolArvoAllocation,cap:row.pool.maxArvoPrincipal,decimals:18,enabled:row.vault.arvoStakeEnabled||row.vault.dualStakeEnabled},{name:"USDC",used:row.usdcPrincipal,allocated:row.pool.protocolUsdcAllocation,cap:row.pool.maxUsdcPrincipal,decimals:6,enabled:row.vault.usdcStakeEnabled||row.vault.dualStakeEnabled}].filter(x => x.enabled);
 const availability = vaultAvailability(row);
 return <div className="mt-5 space-y-3 border-t border-white/10 pt-4">{assets.map(asset => {
  const capacity = assetCapacity(asset.used,asset.cap,asset.allocated);
  return <div key={asset.name}><div className="flex items-center justify-between gap-3 text-[11px] text-white/60"><span>{asset.name} capacity</span><span className="tabular-nums">{capacity.percent === null ? "Uncapped" : `${(Math.floor(capacity.percent*10)/10).toFixed(1)}% filled`}</span></div>
   {capacity.percent !== null && <div role="progressbar" aria-label={`${asset.name} vault capacity`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={capacity.percent} aria-valuetext={`${tokenDisplay(asset.used+asset.allocated,asset.decimals)} of ${tokenDisplay(asset.cap,asset.decimals)} ${asset.name} filled`} className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#c9846a] transition-[width] duration-500" style={{width:`${capacity.percent}%`}} /></div>}
   <p className="mt-2 text-[11px] tabular-nums text-white/45">{tokenDisplay(asset.used+asset.allocated,asset.decimals)}{asset.cap > 0n ? ` / ${tokenDisplay(asset.cap,asset.decimals)}` : ""} {asset.name}</p>
   {asset.allocated > 0n && <p className="mt-1 text-[11px] text-white/45">{tokenDisplay(asset.used,asset.decimals)} staked · {tokenDisplay(asset.allocated,asset.decimals)} allocated</p>}
   {capacity.remaining !== null && capacity.remaining > 0n && <p className="mt-1 text-[11px] text-white/45">{tokenDisplay(capacity.remaining,asset.decimals)} {asset.name} capacity remaining</p>}
  </div>;
 })}{!availability.available && <p role="status" className="text-[11px] leading-5 text-[#e2a98e]">{availability.reason === "Vault full" ? "Remaining capacity cannot accept another minimum stake. Existing positions continue on their agreed terms." : "No remaining reward allocation is available for another minimum stake. Existing rewards stay reserved."}</p>}</div>;
}
