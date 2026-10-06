"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {usePathname,useSearchParams} from "next/navigation";
import {Bell,ArrowUpRight} from "lucide-react";
import {useWalletConnection} from "@/hooks/useWalletConnection";
type Updates={total:number;tickets:{id:string;subject:string;updatedAt:string}[]};
const empty:Updates={total:0,tickets:[]};
export function SupportNotifications(){
 const wallet=useWalletConnection(),pathname=usePathname(),params=useSearchParams(),details=useRef<HTMLDetailsElement>(null);
 const [updates,setUpdates]=useState<Updates>(empty),[signedFor,setSignedFor]=useState(""),[unavailable,setUnavailable]=useState(false);
 useEffect(()=>{if(details.current)details.current.open=false;},[pathname,params]);
 useEffect(()=>{
  setUpdates(empty);setSignedFor("");setUnavailable(false);if(!wallet.account||!wallet.chainId)return;
  let stopped=false,active:AbortController|null=null;
  async function load(){if(document.visibilityState==="hidden")return;active?.abort();const controller=new AbortController();active=controller;
   try{const result=await fetch("/app/support/notifications",{cache:"no-store",headers:{"x-arvo-wallet":wallet.account!,"x-arvo-chain":String(wallet.chainId)},signal:controller.signal});
    if(stopped||controller.signal.aborted)return;
    if(result.status===401){setUpdates(empty);setSignedFor("");setUnavailable(false);return;}
    if(!result.ok)throw new Error("Unavailable");const value=await result.json();if(stopped||controller.signal.aborted)return;
    setUpdates(value);setSignedFor(`${wallet.account}:${wallet.chainId}`);setUnavailable(false);
   }catch{if(!stopped&&!controller.signal.aborted){setUpdates(empty);setUnavailable(true);}}
  }
  const refresh=()=>void load();const invalidate=()=>{active?.abort();setUpdates(empty);setSignedFor("");setUnavailable(false);};
  void load();const timer=setInterval(refresh,60000);
  window.addEventListener("arvo-support-updated",refresh);window.addEventListener("focus",refresh);document.addEventListener("visibilitychange",refresh);window.addEventListener("arvo-wallet-session-change",invalidate);
  return()=>{stopped=true;active?.abort();clearInterval(timer);window.removeEventListener("arvo-support-updated",refresh);window.removeEventListener("focus",refresh);document.removeEventListener("visibilitychange",refresh);window.removeEventListener("arvo-wallet-session-change",invalidate);};
 },[wallet.account,wallet.chainId]);
 useEffect(()=>{const close=(event:PointerEvent)=>{if(details.current&&!details.current.contains(event.target as Node))details.current.open=false;};const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"&&details.current)details.current.open=false;};document.addEventListener("pointerdown",close);document.addEventListener("keydown",escape);return()=>{document.removeEventListener("pointerdown",close);document.removeEventListener("keydown",escape);};},[]);
 const signed=signedFor===`${wallet.account}:${wallet.chainId}`,visible=signed?updates:empty;
 if(!wallet.account)return null;
 return <details ref={details} className="relative shrink-0"><summary aria-label={visible.total?`${visible.total} tickets with unread support replies`:"Support notifications"} title="Support notifications" className="relative flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-xl border border-white/20 text-white/75 hover:bg-white/10 lg:border-black/10 lg:text-black/50 lg:hover:bg-black/5 [&::-webkit-details-marker]:hidden"><Bell size={17}/>{visible.total>0&&<span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-[#c9846a] px-1 text-[9px] font-bold leading-4 text-[#07090b]">{visible.total>99?"99+":visible.total}</span>}</summary><div className="fixed inset-x-4 top-20 z-50 max-h-[calc(100dvh-100px)] overflow-y-auto lg:absolute lg:inset-x-auto lg:right-0 lg:top-12 lg:w-[280px] rounded-2xl border border-black/10 bg-[#fffdfa] p-4 text-[#07090b] shadow-xl"><p className="text-[10px] font-bold uppercase tracking-widest text-[#ad7058]">Support replies</p>{unavailable?<p role="status" className="mt-3 text-xs leading-5 text-black/50">Updates are temporarily unavailable. Open Support to check your tickets.</p>:!signed?<p className="mt-3 text-xs leading-5 text-black/50">Sign in to Support to check replies for this wallet.</p>:!visible.total?<p className="mt-3 text-xs text-black/50">You’re up to date. No unread replies.</p>:<div className="mt-2 divide-y divide-black/5">{visible.tickets.map(ticket=><Link key={ticket.id} href={`/app/support?ticket=${encodeURIComponent(ticket.id)}`} className="block py-3 text-xs font-semibold hover:text-[#ad7058]"><span className="block break-words">{ticket.subject}</span><span className="mt-1 block text-[10px] font-normal text-black/40">New reply · #{ticket.id.slice(0,8).toUpperCase()}</span></Link>)}</div>}<Link href="/app/support" className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-xs font-semibold text-[#ad7058]">Open Support<ArrowUpRight size={13}/></Link></div></details>;
}
