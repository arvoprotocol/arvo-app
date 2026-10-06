import {getWalletProvider,openWalletPicker} from "@/lib/wallet/client";
import {createWalletClient,custom,erc20Abi,isAddress,type Abi,type Address,type EIP1193Provider,type Hash} from "viem";
import {stakingConnection,stakingAbi} from "./pool-transactions";
let transactionPending: Hash | null = null;
let requestingTransaction = false;
export async function connectStakingWallet(){openWalletPicker();}
export async function transact(functionName:string,args:readonly unknown[],onHash:(hash:Hash)=>void,role?:string,token?:Address,expectedAccount?:Address) {
 const c=stakingConnection(),provider=getWalletProvider();if(!c||!provider)throw new Error("Staking connection or wallet is unavailable.");
 if(requestingTransaction)throw new Error("Another wallet transaction is being processed.");
 if(transactionPending){try{await c.publicClient.getTransactionReceipt({hash:transactionPending});transactionPending=null;}catch{throw new Error(`Wait for the pending transaction ${transactionPending} before sending another.`);}}
 requestingTransaction=true;
 try {
 if(await c.publicClient.getChainId()!==c.chain.id)throw new Error("RPC chain mismatch.");
 const accounts=await provider.request({method:"eth_requestAccounts"}) as string[];
 if(!accounts[0]||!isAddress(accounts[0]))throw new Error("Choose a wallet account.");
 const account=accounts[0] as Address;
 if(expectedAccount&&account.toLowerCase()!==expectedAccount.toLowerCase())throw new Error("Wallet account changed. Review and retry.");
 async function check(){const xs=await provider!.request({method:"eth_accounts"}) as string[];const chain=await provider!.request({method:"eth_chainId"}) as string;if(getWalletProvider()!==provider||xs[0]?.toLowerCase()!==account.toLowerCase()||Number(BigInt(chain))!==c!.chain.id)throw new Error("Wallet account or network changed. Review and retry.");}
 await check();
 if(role){const id=await c.publicClient.readContract({address:c.address,abi:stakingAbi,functionName:role});if(await c.publicClient.readContract({address:c.address,abi:stakingAbi,functionName:"hasRole",args:[id,account]})!==true)throw new Error("This wallet does not have the required contract role.");}
 const {request}=await c.publicClient.simulateContract({address:token??c.address,abi:token?erc20Abi as Abi:stakingAbi,functionName,args,account});
 await check();const wallet=createWalletClient({account,chain:c.chain,transport:custom(provider as EIP1193Provider)});
 const hash=await wallet.writeContract(request);transactionPending=hash;onHash(hash);
 const receipt=await c.publicClient.waitForTransactionReceipt({hash});transactionPending=null;if(receipt.status!=="success")throw new Error("Transaction reverted.");
 window.dispatchEvent(new Event("arvo-wallet-refresh"));return receipt;
 } finally {requestingTransaction=false;}
}
export async function approveStakeToken(token:Address,amount:bigint,onHash:(hash:Hash)=>void,expectedAccount?:Address){
 const c=stakingConnection();if(!c)throw new Error("Staking unavailable.");
 const accounts=await getWalletProvider()?.request({method:"eth_accounts"}) as string[]|undefined;
 if(!accounts?.[0]||!isAddress(accounts[0]))throw new Error("Connect your wallet first.");
 const allowance=await c.publicClient.readContract({address:token,abi:erc20Abi,functionName:"allowance",args:[accounts[0] as Address,c.address]});
 if(allowance>=amount)return;
 if(allowance>BigInt(0))await transact("approve",[c.address,BigInt(0)],onHash,undefined,token,expectedAccount);
 await transact("approve",[c.address,amount],onHash,undefined,token,expectedAccount);
}
