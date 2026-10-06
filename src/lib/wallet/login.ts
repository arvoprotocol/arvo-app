"use client";
import {stringToHex} from "viem";
import {waitForLogin} from "@/lib/admin/wallet-login";
import {getWalletProvider,walletSnapshot} from "./client";
export async function signInWallet(signal:AbortSignal){
 const provider=getWalletProvider(),wallet=walletSnapshot();if(!provider||!wallet.account||!wallet.chainId)throw new Error("Connect your wallet first.");
 async function check(){const accounts=await provider!.request({method:"eth_accounts"}) as string[],chain=await provider!.request({method:"eth_chainId"});if(signal.aborted||getWalletProvider()!==provider||accounts[0]?.toLowerCase()!==wallet.account!.toLowerCase()||Number(chain)!==wallet.chainId)throw new Error("Wallet changed. Please sign in again.");}
 const response=await fetch("/app/wallet/challenge",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({address:wallet.account,chainId:wallet.chainId}),signal});
 const challenge=await response.json();if(!response.ok||!challenge.message||challenge.address?.toLowerCase()!==wallet.account.toLowerCase())throw new Error(challenge.error||"Unable to start wallet login.");
 await check();const signature=await waitForLogin(provider.request({method:"personal_sign",params:[stringToHex(challenge.message),challenge.address]}),signal);await check();
 const verified=await fetch("/app/wallet/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:challenge.message,signature}),signal});const result=await verified.json();if(!verified.ok)throw new Error(result.error||"Wallet login failed.");await check();return result as {address:string;chainId:number};
}
