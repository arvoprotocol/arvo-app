"use client";
import {useEffect,useState} from "react";
import {erc20Abi,formatUnits,isAddress,zeroAddress,type Address} from "viem";
import {stakingAbi,stakingConnection} from "@/lib/staking/pool-transactions";
type Asset={token:Address;decimals:number;balance:bigint;principal:bigint;committed:bigint;reserved:bigint;available:bigint;solvent:boolean};
export type AdminContractData={chainId:number;proxy:Address;implementation:Address;block:bigint;paused:boolean;nextVaultId:number;nextPositionId:bigint;enabledPools:number|null;oracle:Address;ARVO:Asset;USDG:Asset};
export function displayAmount(value:bigint,decimals:number){const [whole,fraction]=formatUnits(value,decimals).split(".");return whole.replace(/\B(?=(\d{3})+(?!\d))/g,",")+(fraction?"."+fraction:"");}
export async function readAdminContractData():Promise<AdminContractData>{
 const config=stakingConnection();if(!config)throw new Error("Staking connection settings are missing or invalid.");const c=config;
 const chainId=await c.publicClient.getChainId();if(chainId!==c.chain.id)throw new Error("RPC chain does not match the configured staking network.");
 const block=await c.publicClient.getBlock();const blockNumber=block.number;
 const code=await c.publicClient.getCode({address:c.address,blockNumber});if(!code||code==="0x")throw new Error("No contract code at the configured staking proxy.");
 const storage=await c.publicClient.getStorageAt({address:c.address,slot:"0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",blockNumber});
 const implementation=("0x"+(storage??"").slice(-40)) as Address;
 if(!isAddress(implementation)||implementation.toLowerCase()===zeroAddress)throw new Error("Unable to resolve the proxy implementation.");
 const implementationCode=await c.publicClient.getCode({address:implementation,blockNumber});if(!implementationCode||implementationCode==="0x")throw new Error("Proxy implementation has no contract code.");
 const read=(functionName:string,args:readonly unknown[]=[])=>c.publicClient.readContract({address:c.address,abi:stakingAbi,functionName,args,blockNumber});
 async function asset(prefix:"arvo"|"usdc"):Promise<Asset>{
  const token=await read(prefix) as Address;const expected=prefix==="arvo"?18:6;const title=prefix==="arvo"?"Arvo":"Usdc";
  if(!isAddress(token)||token.toLowerCase()===zeroAddress)throw new Error("Invalid token address returned by staking contract.");
  const decimals=await c.publicClient.readContract({address:token,abi:erc20Abi,functionName:"decimals",blockNumber});if(decimals!==expected)throw new Error(`${prefix.toUpperCase()} token decimals do not match staking requirements.`);
  const [balance,principal,committed,reserved,available,solvent]=await Promise.all([c.publicClient.readContract({address:token,abi:erc20Abi,functionName:"balanceOf",args:[c.address],blockNumber}),read(prefix+"PrincipalLiability"),read(prefix+"RewardLiability"),read(prefix+"RewardBudgetReserved"),read("available"+title+"RewardCapacity"),read("is"+title+"Solvent")]);
  return{token,decimals,balance,principal:principal as bigint,committed:committed as bigint,reserved:reserved as bigint,available:available as bigint,solvent:solvent===true};
 }
 const [ARVO,USDG,paused,nextId,nextPositionId,oracle]=await Promise.all([asset("arvo"),asset("usdc"),read("paused"),read("nextVaultId"),read("nextPositionId"),read("priceOracle")]);
 if(ARVO.token.toLowerCase()===USDG.token.toLowerCase())throw new Error("Staking token addresses must differ.");
 const nextVaultId=Number(nextId);let enabledPools:number|null=null;
 // Bound the overview scan. Never show a partial count as a complete total.
 if(nextVaultId<=1000){enabledPools=0;for(let start=0;start<nextVaultId;start+=20){const results=await Promise.all(Array.from({length:Math.min(20,nextVaultId-start)},async(_,offset)=>{const id=start+offset;if(await read("poolExists",[id])!==true)return false;const pool=await read("pool",[id]) as {enabled:boolean;finalized:boolean};return pool.enabled&&!pool.finalized;}));enabledPools+=results.filter(Boolean).length;}}
 return{chainId,proxy:c.address,implementation,block:blockNumber,paused:paused===true,nextVaultId,nextPositionId:nextPositionId as bigint,enabledPools,oracle:oracle as Address,ARVO,USDG};
}
export function useAdminContractData(){const [data,setData]=useState<AdminContractData|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0);
 useEffect(()=>{let cancelled=false;setLoading(true);setError("");setData(null);readAdminContractData().then(value=>{if(!cancelled)setData(value);}).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:"Unable to read staking contract.");}).finally(()=>{if(!cancelled)setLoading(false);});return()=>{cancelled=true;};},[revision]);
 return{data,error,loading,refresh:()=>setRevision(x=>x+1)};
}
