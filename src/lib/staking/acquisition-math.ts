import {keccak256,toBytes,type Hash} from "viem";
import type {AcquisitionState} from "./acquisition";
export function projectHash(id:number):Hash {
 if(!Number.isSafeInteger(id)||id<=0)throw new Error("Invalid project record.");
 return keccak256(toBytes(`arvo-project:${id}`));
}
export function releasable(a:AcquisitionState){const liquid=a.principal-a.outstandingPrincipal;return a.cash<liquid?a.cash:liquid;}
export function acquisitionClaimReady(a:AcquisitionState,principal:bigint,reward:bigint){return principal<=a.principal&&principal+reward<=a.cash&&a.outstandingPrincipal<=a.principal-principal;}
export function mixedRewards(arvo:bigint,usdc:bigint,arvoBps:number,usdcBps:number,boost:number,share:number){
 const multiplier=BigInt(10000+boost),s=BigInt(share);
 return {arvo:arvo*BigInt(arvoBps)*multiplier*s/1000000000000n,usdc:usdc*BigInt(usdcBps)*multiplier*(10000n-s)/1000000000000n};
}
