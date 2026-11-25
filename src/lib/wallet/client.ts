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
/** Thrown when Arvo's saved WalletConnect data is stale; the picker resets it and reloads the page. */
export class PhoneResetError extends Error{constructor(){super("The wallet connection needed a reset.");this.name="PhoneResetError";}}
/** Clears Arvo's saved WalletConnect data in this browser (the cause of blank or frozen connect windows). */
export async function resetPhoneConnection(){
 try{for(const key of Object.keys(localStorage))if(key.startsWith("arvo-public-wallet")||key.startsWith("wc@2")||key.startsWith("WCM_")||key.startsWith("WALLETCONNECT"))localStorage.removeItem(key);}catch{}
 await new Promise<void>(resolve=>{try{const request=indexedDB.deleteDatabase("WALLET_CONNECT_V2_INDEXED_DB");request.onsuccess=request.onerror=request.onblocked=()=>resolve();setTimeout(resolve,1500);}catch{resolve();}});
}
function within<T>(promise:Promise<T>,ms:number):Promise<T>{return new Promise<T>((resolve,reject)=>{const timer=setTimeout(()=>reject(new PhoneResetError()),ms);promise.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});}
function emit(){for(const listener of listeners)listener();if(typeof window!=="undefined")window.dispatchEvent(new Event("arvo-wallet-refresh"));}
export function subscribeWallet(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function walletSnapshot(){return snapshot;}
export function walletServerSnapshot(){return empty;}
export function getWalletProvider(){return provider;}
function remember(choice:string){try{localStorage.setItem(storage,choice);}catch{}}
async function clearLogin(){try{await fetch("/app/wallet/session",{method:"DELETE",signal:AbortSignal.timeout(5000)});}catch{}window.dispatchEvent(new Event("arvo-wallet-session-change"));}
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
  const requiredChain=valid?id:1;const optionalChains=requiredChain!==1?[1]:[];
  const p=await EthereumProvider.init({projectId,chains:[requiredChain],optionalChains,optionalMethods:["personal_sign","eth_sendTransaction","wallet_switchEthereumChain","wallet_addEthereumChain"],optionalEvents:["accountsChanged","chainChanged"],showQrModal:true,customStoragePrefix:"arvo-public-wallet",rpcMap:valid&&rpc?{[id]:rpc}:undefined,metadata:{name:"Arvo",description:"Connect to Arvo staking and support.",url:location.origin,icons:[new URL("/icon.png",location.origin).href]},qrModalOptions:{themeMode:"light",themeVariables:{"--wcm-accent-color":"#ad7058","--wcm-z-index":"120"}}});
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
async function waitForPhoneAccount(p:WalletProvider,signal?:AbortSignal){
 const version=selection,deadline=Date.now()+15000;
 while(true){
  signal?.throwIfAborted();
  if(provider!==p||selection!==version)throw new Error("Wallet connection changed. Please reconnect.");
  if(snapshot.account)return;
  if(Date.now()>=deadline)throw new Error("No wallet account was selected. Please reconnect and approve an account.");
  await new Promise<void>(resolve=>setTimeout(resolve,250));
  signal?.throwIfAborted();
  if(provider!==p||selection!==version)throw new Error("Wallet connection changed. Please reconnect.");
  await update(p,version);
 }
}
export async function connectPhoneWallet(signal?:AbortSignal){
 const init=within(phoneProvider(),20000);const p=await (signal?waitForLogin(init,signal):init);
 const id=Number(process.env.NEXT_PUBLIC_STAKING_CHAIN_ID),chainId=Number.isSafeInteger(id)&&id>0?id:1;
 const wait=<T,>(promise:Promise<T>)=>signal?waitForLogin(promise,signal):promise;
 // A saved session that no longer answers (e.g. removed in MetaMask) would hang every request.
 if(p.session){try{await wait(within(p.request({method:"eth_chainId"}),10000));}catch(error){if(error instanceof PhoneResetError)await p.disconnect?.().catch(()=>{});throw error;}}
 if(!p.session)await wait((p as WalletProvider&{connect(options:{chains:number[]}):Promise<void>}).connect({chains:[chainId]}));
 signal?.throwIfAborted();
 const chain=await wait(p.request({method:"eth_chainId"}));
 if(Number(chain)!==chainId){await wait(p.request({method:"wallet_switchEthereumChain",params:[{chainId:`0x${chainId.toString(16)}`}]}));const current=await wait(p.request({method:"eth_chainId"}));if(Number(current)!==chainId)throw new Error(`WalletConnect is on chain ${Number(current)}; select chain ${chainId} in MetaMask.`);}
 await wait(clearLogin());signal?.throwIfAborted();await wait(attach(p,"walletconnect"));signal?.throwIfAborted();
 await wait(waitForPhoneAccount(p,signal));
}
// Keep the WalletConnect provider after disconnecting: initialising a second one in the same page
// leaves two clients listening, so the next approval in MetaMask never reaches the page.
export async function disconnectWallet(){const p=provider;removeProviderListeners();provider=null;selection++;snapshot=empty;remember("disconnected");emit();await clearLogin();if(p?.session){await p.disconnect?.().catch(()=>{});}}
export function openWalletPicker(){window.dispatchEvent(new Event("arvo-open-wallet-picker"));}
