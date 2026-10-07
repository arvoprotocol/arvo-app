import {encodeFunctionData,erc20Abi,isAddress,keccak256,toBytes,zeroAddress,type Abi,type Address,type Hash} from "viem";
import escrowArtifact from "./ArvoAcquisitionEscrow.abi.json";
import {stakingAbi,stakingConnection} from "./pool-transactions";
import {transact} from "./user-transactions";
import {getWalletProvider} from "@/lib/wallet/client";
export const escrowAbi=escrowArtifact as Abi;
export type AcquisitionState={escrow:Address;token:Address;treasury:Address;opensAt:bigint;firstMaturity:bigint;finalized:boolean;cash:bigint;principal:bigint;outstandingPrincipal:bigint;activePositions:bigint;projectId:Hash};
export {projectHash,releasable,acquisitionClaimReady,mixedRewards} from "./acquisition-math";
export async function acquisitionConnection(blockNumber?:bigint){
 const c=stakingConnection();if(!c)throw new Error("Staking is not configured.");
 if(await c.publicClient.getChainId()!==c.chain.id)throw new Error("Staking RPC chain mismatch.");
 const read=(name:string)=>c.publicClient.readContract({address:c.address,abi:stakingAbi,functionName:name,blockNumber});
 const [escrow,token]=await Promise.all([read("acquisitionEscrow"),read("usdc")]) as [Address,Address];
 if(!isAddress(escrow)||escrow===zeroAddress)throw new Error("Acquisition custody is not configured.");
 const [controller,actualToken,code]=await Promise.all([
  c.publicClient.readContract({address:escrow,abi:escrowAbi,functionName:"controller",blockNumber}),
  c.publicClient.readContract({address:escrow,abi:escrowAbi,functionName:"usdc",blockNumber}),
  c.publicClient.getCode({address:escrow,blockNumber})]);
 if(!code||code==="0x"||String(controller).toLowerCase()!==c.address.toLowerCase()||String(actualToken).toLowerCase()!==token.toLowerCase())throw new Error("Acquisition custody binding does not match this staking proxy/token.");
 return {...c,escrow,token};
}
export async function readAcquisition(poolId:number,blockNumber?:bigint):Promise<AcquisitionState|null>{
 const c=stakingConnection();if(!c)throw new Error("Staking is not configured.");
 const enabled=await c.publicClient.readContract({address:c.address,abi:stakingAbi,functionName:"acquisitionPools",args:[poolId],blockNumber});
 if(!enabled)return null;
 const module=await acquisitionConnection(blockNumber);
 const row=await c.publicClient.readContract({address:module.escrow,abi:escrowAbi,functionName:"accounts",args:[poolId],blockNumber}) as readonly [Address,bigint,bigint,boolean,bigint,bigint,bigint,bigint,Hash];
 return {escrow:module.escrow,token:module.token,treasury:row[0],opensAt:row[1],firstMaturity:row[2],finalized:row[3],cash:row[4],principal:row[5],outstandingPrincipal:row[6],activePositions:row[7],projectId:row[8]};
}
export async function escrowTransaction(name:string,args:readonly unknown[],onHash:(h:Hash)=>void,role?:string){
 const c=await acquisitionConnection();return transact(name,args,onHash,role,undefined,undefined,{address:c.escrow,abi:escrowAbi});
}
export async function repayFromWallet(poolId:number,amount:bigint,onHash:(h:Hash)=>void){
 if(amount<=0n)throw new Error("Enter a positive repayment.");
 const c=await acquisitionConnection();if(!await readAcquisition(poolId))throw new Error("Pool is not configured for acquisition custody.");
 const provider=getWalletProvider();if(!provider)throw new Error("Connect the repayment wallet.");
 const accounts=await provider.request({method:"eth_requestAccounts"}) as string[];
 if(!accounts[0]||!isAddress(accounts[0]))throw new Error("Choose the repayment wallet.");
 const account=accounts[0] as Address;
 const allowance=await c.publicClient.readContract({address:c.token,abi:erc20Abi,functionName:"allowance",args:[account,c.escrow]});
 if(allowance<amount){
  if(allowance>0n)await transact("approve",[c.escrow,0n],onHash,undefined,c.token,account);
  await transact("approve",[c.escrow,amount],onHash,undefined,c.token,account);
 }
 return transact("repay",[poolId,amount],onHash,undefined,undefined,account,{address:c.escrow,abi:escrowAbi});
}
export type SafeTx={to:Address;value:"0";data:Hash;contractMethod:null;contractInputsValues:null};
export function safeTransaction(to:Address,abi:Abi,functionName:string,args:readonly unknown[]):SafeTx{return{to,value:"0",data:encodeFunctionData({abi,functionName,args}),contractMethod:null,contractInputsValues:null};}
export function downloadSafeBatch(chainId:number,safe:Address,name:string,transactions:SafeTx[]){
 const payload={version:"1.0",chainId:String(chainId),createdAt:Date.now(),meta:{name,description:"Review addresses and amounts in Safe before signing.",txBuilderVersion:"1.16.5",createdFromSafeAddress:safe,createdFromOwnerAddress:""},transactions};
 const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
 const a=document.createElement("a");a.href=url;a.download="arvo-treasury-transactions.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
