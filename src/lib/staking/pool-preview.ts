import {formatUnits} from "viem";
import type {PoolRow} from "@/hooks/useStakingData";
import type {DraftPreview} from "./vault-draft";
import {enabledProducts} from "./capacity";
import {productLabels,type Products} from "./pool-form";
export function poolPreview(row:PoolRow,title:string):DraftPreview{
 const ids=enabledProducts(row), keys=Object.keys(productLabels) as (keyof Products)[];
 const products=Object.fromEntries(keys.map((key,i)=>[key,ids.includes(i)])) as Products;
 const date=(n:bigint)=>n===0n?null:new Date(Number(n)*1000).toISOString();
 return {id:row.id,title,days:row.vault.duration/86400,arvoRate:String(row.vault.arvoRewardBps/100),usdcRate:String(row.vault.usdcRewardBps/100),minArvo:formatUnits(row.vault.minArvo,18),minArvoUsdc:formatUnits(row.crossMinimum,18),minUsdc:formatUnits(row.vault.minUsdc,6),products,dualBoost:String(row.vault.dualBoostBps/100),boostCap:String(row.vault.combinedBoostCapBps/100),opensAt:date(row.pool.opensAt),closesAt:date(row.pool.closesAt),maxArvo:formatUnits(row.pool.maxArvoPrincipal,18),maxUsdc:formatUnits(row.pool.maxUsdcPrincipal,6),mixedShare:String(row.vault.mixedArvoShareBps/100),acquisition:Boolean(row.acquisition)};
}
