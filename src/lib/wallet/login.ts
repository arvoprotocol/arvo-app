"use client";
import {stringToHex} from "viem";
import {waitForLogin} from "@/lib/admin/wallet-login";
import {getWalletProvider,walletSnapshot} from "./client";
export async function signInWallet(signal:AbortSignal){
 const provider=getWalletProvider(),wallet=walletSnapshot();if(!provider||!wallet.account||!wallet.chainId)throw new Error("Connect your wallet first.");
 async function check(){const accounts=await provider!.request({method:"eth_accounts"}) as string[],chain=await provider!.request({method:"eth_chainId"});if(signal.aborted||getWalletProvider()!==provider||accounts[0]?.toLowerCase()!==wallet.account!.toLowerCase()||Number(chain)!==wallet.chainId)throw new Error("Wallet changed. Please sign in again.");}
 const response=await fetch("/app/wallet/challenge",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({address:wallet.account,chainId:wallet.chainId}),signal});
 const challenge=await response.json();if(!response.ok||!challenge.message||challenge.address?.toLowerCase()!==wallet.account.toLowerCase())throw new Error(challenge.error||"Unable to start wallet login.");
 await check();const signature=await waitForLogin(personalSign(provider,stringToHex(challenge.message),challenge.address),signal);await check();
 const verified=await fetch("/app/wallet/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:challenge.message,signature}),signal});const result=await verified.json();if(!verified.ok)throw new Error(result.error||"Wallet login failed.");await check();return result as {address:string;chainId:number};
}

// Wallet errors arrive as { code, message } objects, or (over WalletConnect) as an Error whose message is that JSON.
export function walletErrorCode(error:unknown):unknown{
 if(typeof error!=="object"||!error)return undefined;
 if("code" in error&&(error as {code:unknown}).code!==undefined)return (error as {code:unknown}).code;
 const message="message" in error?(error as {message:unknown}).message:undefined;
 if(typeof message==="string"&&message.trim().startsWith("{")){try{return (JSON.parse(message) as {code?:unknown}).code;}catch{}}
 return undefined;
}
type Signer={request(args:{method:string;params?:unknown[]},chain?:string):Promise<unknown>};
// personal_sign is [message, address]. Some wallets reject the request with -32602 ("must provide an Ethereum
// address") when they don't recognise the account on the current network, e.g. a phone wallet over WalletConnect
// that hasn't added the Robinhood network. The signature doesn't depend on the network, so retry: over
// WalletConnect on Ethereum mainnet (approved in the session), otherwise with the older [address, message] order.
async function personalSign(provider:{request(args:{method:string;params?:unknown[]}):Promise<unknown>},message:string,address:string){
 const account=address.toLowerCase();
 try{return await provider.request({method:"personal_sign",params:[message,account]});}
 catch(error){
  if(walletErrorCode(error)!==-32602)throw error;
  const signer=(provider as {signer?:Signer}).signer;
  if(signer&&(provider as {session?:unknown}).session)return signer.request({method:"personal_sign",params:[message,account]},"eip155:1");
  return provider.request({method:"personal_sign",params:[account,message]});
 }
}
