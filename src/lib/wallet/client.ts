"use client";
import {isAddress,type Address} from "viem";
import {waitForLogin,type LoginProvider} from "@/lib/admin/wallet-login";
export type WalletProvider=LoginProvider&{on?:(event:string,listener:(...args:unknown[])=>void)=>unknown;removeListener?:(event:string,listener:(...args:unknown[])=>void)=>unknown;disconnect?:()=>Promise<void>;session?:unknown};
export type BrowserWallet={id:string;name:string;icon?:string;provider:WalletProvider};
type Snapshot={account:Address|null;chainId:number|null;connected:boolean};
const empty:Snapshot={account:null,chainId:null,connected:false};
let snapshot=empty,provider:WalletProvider|null=null,phone:WalletProvider|null=null,phoneInit:Promise<WalletProvider>|null=null,initializing:Promise<void>|null=null,selection=0;
const listeners=new Set<()=>void>(),browserWallets=new Map<string,BrowserWallet>();
const storage="arvo-public-wallet-choice";
let discoverStarted=false,removeProviderListeners=()=>{};
function emit(){for(const listener of listeners)listener();if(typeof window!=="undefined")window.dispatchEvent(new Event("arvo-wallet-refresh"));}
export function subscribeWallet(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function walletSnapshot(){return snapshot;}
export function walletServerSnapshot(){return empty;}
export function getWalletProvider(){return provider;}
function remember(choice:string){try{localStorage.setItem(storage,choice);}catch{}}
async function clearLogin(){try{await fetch("/app/wallet/session",{method:"DELETE"});}catch{}window.dispatchEvent(new Event("arvo-wallet-session-change"));}
async function update(p:WalletProvider,version:number){
 const accounts=await p.request({method:"eth_accounts"}) as string[],chain=await p.request({method:"eth_chainId"}) as string;
 if(version!==selection||p!==provider)return;
 const account=accounts?.[0]&&isAddress(accounts[0])?accounts[0] as Address:null,chainId=Number(chain);
 if(account!==snapshot.account||chainId!==snapshot.chainId){snapshot={account,chainId:Number.isSafeInteger(chainId)&&chainId>0?chainId:null,connected:Boolean(account)};emit();}
}
function attach(p:WalletProvider,choice:string){
 removeProviderListeners();provider=p;const version=++selection;remember(choice);snapshot=empty;emit();
 const changed=()=>{snapshot=empty;emit();void clearLogin();void update(p,version).catch(()=>{});};
 const disconnected=()=>{if(provider!==p)return;removeProviderListeners();provider=null;selection++;remember("disconnected");snapshot=empty;emit();void clearLogin();};
 p.on?.("accountsChanged",changed);p.on?.("chainChanged",changed);p.on?.("disconnect",disconnected);
 removeProviderListeners=()=>{p.removeListener?.("accountsChanged",changed);p.removeListener?.("chainChanged",changed);p.removeListener?.("disconnect",disconnected);};
 return update(p,version);
}
export function discoverWallets(){
 if(typeof window==="undefined")return [];
 if(!discoverStarted){discoverStarted=true;window.addEventListener("eip6963:announceProvider",event=>{
  const detail=(event as CustomEvent<{info?:{uuid?:string;name?:string;icon?:string};provider?:WalletProvider}>).detail;
  if(!detail?.info?.uuid||!detail.provider?.request)return;
  browserWallets.set(detail.info.uuid,{id:detail.info.uuid,name:detail.info.name?.slice(0,60)||"Browser wallet",icon:detail.info.icon?.startsWith("data:image/")?detail.info.icon:undefined,provider:detail.provider});
  window.dispatchEvent(new Event("arvo-browser-wallets"));
 });window.dispatchEvent(new Event("eip6963:requestProvider"));}
 const injected=window.ethereum as WalletProvider|undefined;
 if(injected&&!Array.from(browserWallets.values()).some(w=>w.provider===injected))browserWallets.set("injected",{id:"injected",name:"Browser wallet",provider:injected});
 return Array.from(browserWallets.values());
}
async function phoneProvider(){
 if(phone)return phone;if(phoneInit)return phoneInit;
 const projectId=process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim()||"";
 if(!/^[a-f0-9]{32}$/i.test(projectId))throw new Error("Phone wallet connection is not configured yet.");
 phoneInit=(async()=>{const {EthereumProvider}=await import("@walletconnect/ethereum-provider");
  const id=Number(process.env.NEXT_PUBLIC_STAKING_CHAIN_ID),rpc=process.env.NEXT_PUBLIC_STAKING_RPC_URL,valid=Number.isSafeInteger(id)&&id>0;
  const optionalChains=valid&&id!==1?[id,1]:[1];
  const p=await EthereumProvider.init({projectId,optionalChains:optionalChains as [number,...number[]],optionalMethods:["personal_sign","eth_sendTransaction","wallet_switchEthereumChain","wallet_addEthereumChain"],optionalEvents:["accountsChanged","chainChanged"],showQrModal:true,customStoragePrefix:"arvo-public-wallet",rpcMap:valid&&rpc?{[id]:rpc}:undefined,metadata:{name:"Arvo",description:"Connect to Arvo staking and support.",url:location.origin,icons:[new URL("/icon.png",location.origin).href]},qrModalOptions:{themeMode:"light",themeVariables:{"--wcm-accent-color":"#ad7058","--wcm-z-index":"120"}}});
  phone=p as unknown as WalletProvider;return phone;
 })().catch(error=>{phoneInit=null;throw error;});return phoneInit;
}
export async function initializeWallet(){
 if(typeof window==="undefined"||initializing)return initializing;
 initializing=(async()=>{const bootVersion=selection;const found=discoverWallets();let choice="";try{choice=localStorage.getItem(storage)||"";}catch{}
  if(choice==="disconnected")return;
  if(choice==="walletconnect"){const p=await phoneProvider();if(p.session&&bootVersion===selection)await attach(p,choice);return;}
  const selected=found.find(w=>w.id===choice)||(!choice?found.find(w=>w.id==="injected"):undefined);
  if(selected&&bootVersion===selection)await attach(selected.provider,selected.id);
 })().catch(()=>{});return initializing;
}
export async function connectBrowserWallet(wallet:BrowserWallet,signal?:AbortSignal){const request=wallet.provider.request({method:"eth_requestAccounts"});await (signal?waitForLogin(request,signal):request);if(signal?.aborted)return;await clearLogin();signal?.throwIfAborted();await attach(wallet.provider,wallet.id);if(!snapshot.account)throw new Error("Choose a wallet account.");}
export async function connectPhoneWallet(signal?:AbortSignal){const init=phoneProvider();const p=await (signal?waitForLogin(init,signal):init);if(!p.session){const request=(p as WalletProvider&{connect():Promise<void>}).connect();await (signal?waitForLogin(request,signal):request);}if(signal?.aborted)return;await clearLogin();signal?.throwIfAborted();await attach(p,"walletconnect");if(!snapshot.account)throw new Error("No wallet account was selected.");}
export async function disconnectWallet(){const p=provider;removeProviderListeners();provider=null;selection++;snapshot=empty;remember("disconnected");emit();await clearLogin();if(p?.session)await p.disconnect?.().catch(()=>{});}
export function openWalletPicker(){window.dispatchEvent(new Event("arvo-open-wallet-picker"));}
