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
type PhoneSession={namespaces?:Record<string,{accounts?:string[]}>};
const isBadAddress=(error:unknown)=>walletErrorCode(error)===-32602||/must provide an ethereum address/i.test(error instanceof Error?error.message:typeof error==="object"&&error&&"message" in error?String((error as {message:unknown}).message):"");
// personal_sign is [message, address]. Phone wallets over WalletConnect (MetaMask mobile) refuse to sign on a
// network they haven't added, such as Robinhood testnet, with -32602 "must provide an Ethereum address".
// The signature doesn't depend on the network, so for phone wallets sign on Ethereum mainnet when the session
// includes it (the admin login signs the same way). Browser wallets: lowercase address, then the older order.
async function personalSign(provider:{request(args:{method:string;params?:unknown[]}):Promise<unknown>},message:string,address:string){
 const account=address.toLowerCase(),args={method:"personal_sign",params:[message,account]};
 const signer=(provider as {signer?:Signer}).signer,session=(provider as {session?:PhoneSession}).session;
 if(signer&&session){
  const mainnet=(session.namespaces?.eip155?.accounts??[]).some(a=>a.toLowerCase()===`eip155:1:${account}`);
  if(mainnet)return signer.request(args,"eip155:1");
  return provider.request(args);
 }
 try{return await provider.request(args);}
 catch(error){if(!isBadAddress(error))throw error;return provider.request({method:"personal_sign",params:[account,message]});}
}
