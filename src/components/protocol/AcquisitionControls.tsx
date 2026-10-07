"use client";
import {useState} from "react";
import {erc20Abi,isAddress,parseAbi,type Address,type Hash} from "viem";
import {readPool,type PoolRow} from "@/hooks/useStakingData";
import {stakingAbi,stakingConnection} from "@/lib/staking/pool-transactions";
import {transact} from "@/lib/staking/user-transactions";
import {tokenAmount} from "@/lib/staking/pool-form";
import {tokenDisplay} from "@/lib/staking/presentation";
import {acquisitionConnection,escrowAbi,escrowTransaction,repayFromWallet,projectHash,releasable,safeTransaction,downloadSafeBatch} from "@/lib/staking/acquisition";
import {Panel,PanelHeader} from "./ProtocolUI";
type Project={id:number;title:string;publishStatus:string};
const safeAbi=parseAbi(["function getOwners() view returns (address[])","function getThreshold() view returns (uint256)"]);
export function AcquisitionControls({projects}:{projects:Project[]}){
 const [poolId,setPoolId]=useState(""),[row,setRow]=useState<PoolRow|null>(null),[treasury,setTreasury]=useState(""),[project,setProject]=useState(""),[amount,setAmount]=useState(""),[busy,setBusy]=useState(false),[hash,setHash]=useState<Hash|null>(null),[error,setError]=useState(""),[notice,setNotice]=useState("");
 function id(){if(!/^\d+$/.test(poolId))throw new Error("Enter a whole pool ID.");const n=Number(poolId);if(!Number.isSafeInteger(n)||n>4294967295)throw new Error("Invalid pool ID.");return n;}
 async function load(){const c=stakingConnection();if(!c)throw new Error("Staking is not configured.");await acquisitionConnection();const n=id(),count=Number(await c.publicClient.readContract({address:c.address,abi:stakingAbi,functionName:"nextVaultId"}));if(n>=count)throw new Error("Pool does not exist.");const current=await readPool(n);setRow(current);return current;}
 async function run(work:()=>Promise<unknown>){if(busy)return;setBusy(true);setError("");setNotice("");try{await work();}catch(e){setError(e instanceof Error?e.message:"Operation failed.");}finally{setBusy(false);}}
 async function checkPending(){const c=stakingConnection();if(!c||!hash)return;const receipt=await c.publicClient.getTransactionReceipt({hash});setHash(null);await load();setNotice(receipt.status==="success"?"Transaction confirmed. Review the refreshed pool before further actions.":"Transaction reverted.");}
 async function action(kind:"configure"|"project"|"limit"|"repay"){
  if(hash)throw new Error("Check the submitted transaction before another operation.");
  const current=await load();
  if(kind==="configure"){
   if(!isAddress(treasury))throw new Error("Enter the Treasury contract address.");
   const c=await acquisitionConnection(),code=await c.publicClient.getCode({address:treasury as Address});if(!code||code==="0x")throw new Error("Treasury must be a contract capable of calling the escrow, such as a Safe.");
   if(!window.confirm(`Permanently bind pool #${current.id} to Treasury ${treasury}? This Treasury cannot be changed.`))return;
   await transact("configureAcquisitionPool",[current.id,treasury],setHash,"DEFAULT_ADMIN_ROLE");
  }else if(kind==="project"){
   const chosen=projects.find(p=>String(p.id)===project);if(!chosen)throw new Error("Select a project record.");
   if(!window.confirm(`Permanently link pool #${current.id} to ${chosen.title}?`))return;
   await escrowTransaction("linkProject",[current.id,projectHash(chosen.id)],setHash,"DEFAULT_ADMIN_ROLE");
  }else{
   const n=tokenAmount(amount,6,"USDC amount");if(n===0n)throw new Error("Enter a positive USDC amount.");
   if(kind==="limit"){
    if(!window.confirm(`Add ${tokenDisplay(n,6)} USDC of future reward commitments to pool #${current.id}? This does not deposit or reserve cash.`))return;
    await transact("addAcquisitionRewardLimit",[current.id,n],setHash,"REWARD_MANAGER_ROLE");
   }else await repayFromWallet(current.id,n,setHash);
  }
  setHash(null);await load();setNotice("Transaction confirmed. Pool accounting refreshed.");
 }
 async function safeFile(kind:"release"|"excess"|"repay"){
  const current=await load(),a=current.acquisition;if(!a)throw new Error("Configure acquisition custody first.");
  const c=await acquisitionConnection(),n=tokenAmount(amount,6,"USDC amount");if(n===0n)throw new Error("Enter a positive amount.");
  const [owners,threshold]=await Promise.all([c.publicClient.readContract({address:a.treasury,abi:safeAbi,functionName:"getOwners"}),c.publicClient.readContract({address:a.treasury,abi:safeAbi,functionName:"getThreshold"})]);
  if(threshold===0n||threshold>BigInt(owners.length))throw new Error("Treasury is not a recognised Safe.");
  let transactions;
  if(kind==="repay"){
   const balance=await c.publicClient.readContract({address:c.token,abi:erc20Abi,functionName:"balanceOf",args:[a.treasury]});if(balance<n)throw new Error("Treasury does not have enough USDC for this repayment.");
   transactions=[safeTransaction(c.token,erc20Abi,"approve",[c.escrow,0n]),safeTransaction(c.token,erc20Abi,"approve",[c.escrow,n]),safeTransaction(c.escrow,escrowAbi,"repay",[current.id,n])];
  }else{
   if(kind==="release"&&n>releasable(a))throw new Error("Amount exceeds this pool’s releasable principal.");
   const name=kind==="release"?"releasePrincipal":"withdrawExcess";
   await c.publicClient.simulateContract({address:c.escrow,abi:escrowAbi,functionName:name,args:[current.id,n],account:a.treasury});
   transactions=[safeTransaction(c.escrow,escrowAbi,name,[current.id,n])];
  }
  downloadSafeBatch(c.chain.id,a.treasury,`ARVO pool #${current.id}: ${kind} ${tokenDisplay(n,6)} USDC`,transactions);
  setNotice(`Safe transaction file prepared for ${a.treasury}. Import it in this Treasury’s Safe Transaction Builder on chain ${c.chain.id}, review and execute. Refresh this pool after confirmation.`);
 }
 const a=row?.acquisition,locked=busy||Boolean(hash),future=row&&Number(row.pool.opensAt)>Date.now()/1000&&!row.pool.finalized;
 const field="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm",button="rounded-xl border border-black/10 px-4 py-3 text-xs font-semibold disabled:opacity-40";
 return <section id="acquisition-controls" className="px-4 pb-10 md:px-7 lg:px-9 xl:px-11"><Panel><PanelHeader eyebrow="Treasury operations" title="Acquisition vaults"/><div className="space-y-5 p-5 md:p-6">
 <p className="text-sm leading-6 text-black/60">Create a capped USDC or dual-deposit pool above with a future opening time. Keep it hidden while binding Treasury, linking a project and setting its future USDC reward limit. ARVO rewards remain funded through Reward funding.</p>
 <div className="flex items-end gap-3"><label className="text-xs">Pool ID<input value={poolId} onChange={e=>{setPoolId(e.target.value);setRow(null);}} disabled={locked} inputMode="numeric" className={field}/></label><button className={button} disabled={locked} onClick={()=>void run(load)}>Load pool</button></div>
 {hash&&<p className="break-all text-xs">Submitted: {hash} <button disabled={busy} onClick={()=>void run(checkPending)} className="underline">Check confirmation</button></p>}
 {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-xs text-red-800">{error}</p>}{notice&&<p role="status" className="rounded-xl bg-[#f8f2ed] p-4 text-xs leading-5">{notice}</p>}
 {row&&!a&&<div><label className="block text-xs">Treasury contract address<input value={treasury} onChange={e=>setTreasury(e.target.value)} disabled={locked} placeholder="0x…" className={field}/></label><p className="mt-2 text-xs text-black/50">Binding is permanent. Use a reviewed contract Treasury, such as your Safe, that can execute escrow withdrawals. A personal wallet address is rejected.</p><button disabled={locked||!future||row.pool.maxUsdcPrincipal===0n} className={`${button} mt-3`} onClick={()=>void run(()=>action("configure"))}>Bind Treasury permanently</button>{!future&&<p className="mt-2 text-xs">This pool has already opened or been finalized; create a new future-opening pool.</p>}</div>}
 {a&&<><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Pool cash",a.cash],["Unsettled principal",a.principal],["Principal held by Treasury",a.outstandingPrincipal],["Releasable principal",releasable(a)]].map(([title,value])=><div key={String(title)} className="rounded-xl bg-black/[0.025] p-4"><p className="text-xs text-black/50">{String(title)}</p><p className="mt-2 font-semibold">{tokenDisplay(value as bigint,6)} USDC</p></div>)}</div>
 <p className="break-all text-xs">Fixed Treasury: {a.treasury}<br/>Escrow: {a.escrow}<br/>Active positions: {String(a.activePositions)} · Remaining future USDC reward limit: {tokenDisplay(row.pool.usdcRewardBudgetRemaining,6)} USDC</p>
 <label className="block text-xs">Project<select value={project} onChange={e=>setProject(e.target.value)} disabled={locked||!future||!/^0x0+$/.test(a.projectId)} className={field}><option value="">Select project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.title}{p.publishStatus==="published"?"":" · draft"}</option>)}</select></label>
 {!/^0x0+$/.test(a.projectId)?<p className="text-xs">Project locked: {projects.find(p=>projectHash(p.id).toLowerCase()===a.projectId.toLowerCase())?.title??a.projectId}. Public project updates appear when that project is published.</p>:<button disabled={locked||!future||!project} className={button} onClick={()=>void run(()=>action("project"))}>Lock project link</button>}
 <label className="block text-xs">USDC amount<input value={amount} onChange={e=>setAmount(e.target.value)} disabled={locked} inputMode="decimal" className={field}/></label>
 <div className="flex flex-wrap gap-3"><button disabled={locked||!future} className={button} onClick={()=>void run(()=>action("limit"))}>Add future reward limit</button><button disabled={locked} className={button} onClick={()=>void run(()=>action("repay"))}>Repay from connected wallet</button><button disabled={locked} className={button} onClick={()=>void run(()=>safeFile("release"))}>Prepare Treasury withdrawal</button><button disabled={locked} className={button} onClick={()=>void run(()=>safeFile("repay"))}>Prepare Treasury repayment</button><button disabled={locked||!a.finalized||a.activePositions!==0n||a.outstandingPrincipal!==0n} className={button} onClick={()=>void run(()=>safeFile("excess"))}>Prepare excess withdrawal</button></div>
 <p className="text-xs leading-5 text-black/50">Withdrawals go only to the fixed Treasury. Principal can be released at any time when available, including after a position matures. User due dates stay unchanged; repayments must return through this pool’s escrow repayment function. A direct USDC transfer does not count as a repayment. Cash repayments reduce outstanding principal first, then add funding for rewards. Future reward limits are commitments, not cash reserves. Excess can leave only after finalization, all positions settling and all principal returning.</p></>}
 </div></Panel></section>;
}
