import {mixedRewards} from "./acquisition-math";
import type {PoolRow} from "@/hooks/useStakingData";
export function assetCapacity(used: bigint, cap: bigint, allocated: bigint = 0n) {
 const filled = used + allocated;
 const remaining = cap > 0n ? (filled >= cap ? 0n : cap - filled) : null;
 const basisPoints = cap > 0n ? Number(filled >= cap ? 10000n : filled * 10000n / cap) : null;
 return {remaining, percent: basisPoints === null ? null : basisPoints / 100};
}
export function enabledProducts(row: PoolRow): number[] {
 if (row.products) return [0,1,2,3,4,5].filter(i => (row.products & 2 ** i) !== 0);
 const c = row.vault;
 return [0,2,3,4].filter(i => i === 0 ? c.arvoStakeEnabled && c.arvoRewardEnabled : i === 2 ? c.usdcStakeEnabled && c.usdcRewardEnabled : c.dualStakeEnabled && (i === 3 ? c.arvoRewardEnabled : c.usdcRewardEnabled));
}
export function productAvailability(row: PoolRow, product: number): {available:boolean; reason:string} {
 if (!enabledProducts(row).includes(product)) return {available:false,reason:"Product unavailable"};
 const arvo = assetCapacity(row.arvoPrincipal, row.pool.maxArvoPrincipal, row.pool.protocolArvoAllocation), usdc = assetCapacity(row.usdcPrincipal, row.pool.maxUsdcPrincipal, row.pool.protocolUsdcAllocation);
 const minArvo = product === 1 ? row.crossMinimum : row.vault.minArvo;
 if ((product !== 2 && arvo.remaining !== null && arvo.remaining < minArvo) || (product >= 2 && usdc.remaining !== null && usdc.remaining < row.vault.minUsdc)) return {available:false,reason:"Vault full"};
 if(product===5){const reward=mixedRewards(minArvo,row.vault.minUsdc,row.vault.arvoRewardBps,row.vault.usdcRewardBps,Math.min(row.vault.dualBoostBps,row.vault.combinedBoostCapBps),row.vault.mixedArvoShareBps);return row.pool.arvoRewardBudgetRemaining>=reward.arvo&&row.pool.usdcRewardBudgetRemaining>=reward.usdc&&reward.arvo>0n&&reward.usdc>0n?{available:true,reason:"Available"}:{available:false,reason:"Reward allocation unavailable"};}
 const arvoReward = product === 0 || product === 3;
 const budget = arvoReward ? row.pool.arvoRewardBudgetRemaining : row.pool.usdcRewardBudgetRemaining;
 // Cross rewards require the live oracle quote; do not substitute a display price.
 let required = product === 1 ? 1n : (arvoReward ? minArvo : row.vault.minUsdc) * BigInt(arvoReward ? row.vault.arvoRewardBps : row.vault.usdcRewardBps) / 10000n;
 if (product >= 3) required += required * BigInt(Math.min(row.vault.dualBoostBps, row.vault.combinedBoostCapBps)) / 10000n;
 if (budget === 0n || budget < required) return {available:false,reason:"Reward allocation unavailable"};
 return {available:true,reason:"Available"};
}
export function vaultAvailability(row: PoolRow) {
 const choices = enabledProducts(row).map(product => productAvailability(row,product));
 if (choices.some(x => x.available)) return {available:true,reason:"Available"};
 return {available:false,reason:choices.some(x => x.reason === "Reward allocation unavailable") ? "Reward allocation unavailable" : "Vault full"};
}
export function vaultName(row: PoolRow): string {
 const names = ["Build", "Advance", "Compound", "Foundation"];
 if (row.pool.kind < 4) return names[row.pool.kind] || "Vault";
 // Standard admin templates are custom on-chain to support adjustable minima.
 const days = [60,90,180,365], arvo = [300,400,1000,2200], usdc = [200,300,650,1400];
 const preset = days.findIndex((d,i) => row.vault.duration === d*86400 && row.vault.arvoRewardBps === arvo[i] && row.vault.usdcRewardBps === usdc[i]);
 return preset >= 0 ? names[preset] : "Vault";
}
