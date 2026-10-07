"use client";
import {useEffect,useRef,useState,type ReactNode} from "react";
import Link from "next/link";
import {ArrowRight,ChevronLeft,ChevronRight,Pause,Play} from "lucide-react";

export function DiscoveryCarousel({title,eyebrow,href,linkLabel,children}:{title:string;eyebrow:string;href:string;linkLabel:string;children:ReactNode}){
 const rail=useRef<HTMLDivElement>(null),section=useRef<HTMLElement>(null),hovered=useRef(false),focused=useRef(false),visible=useRef(false),interacted=useRef(0);
 const [edges,setEdges]=useState({start:true,end:true}),[overflow,setOverflow]=useState(false),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(true);
 useEffect(()=>{const el=rail.current;if(!el)return;const update=()=>{setEdges({start:el.scrollLeft<=2,end:el.scrollLeft+el.clientWidth>=el.scrollWidth-2});setOverflow(el.scrollWidth>el.clientWidth+2);};update();el.addEventListener("scroll",update,{passive:true});const resize=new ResizeObserver(update);resize.observe(el);const changes=new MutationObserver(update);changes.observe(el,{childList:true,subtree:true});return()=>{el.removeEventListener("scroll",update);resize.disconnect();changes.disconnect();};},[]);
 useEffect(()=>{const media=window.matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setReduced(media.matches);update();media.addEventListener("change",update);const observer=new IntersectionObserver(entries=>{visible.current=entries[0]?.isIntersecting??false;},{threshold:.25});if(section.current)observer.observe(section.current);return()=>{media.removeEventListener("change",update);observer.disconnect();};},[]);
 useEffect(()=>{if(paused||reduced||!overflow)return;const timer=setInterval(()=>{const el=rail.current;if(!el||!visible.current||document.visibilityState!=="visible"||hovered.current||focused.current||Date.now()-interacted.current<20000)return;const card=el.querySelector<HTMLElement>("[data-discovery-card]");if(!card)return;el.scrollTo({left:el.scrollLeft+el.clientWidth>=el.scrollWidth-3?0:el.scrollLeft+card.offsetWidth+16,behavior:"smooth"});},6500);return()=>clearInterval(timer);},[paused,reduced,overflow]);
 function interact(){interacted.current=Date.now();}
 function move(direction:number){interact();const el=rail.current;if(!el)return;const card=el.querySelector<HTMLElement>("[data-discovery-card]");el.scrollBy({left:direction*(card?card.offsetWidth+16:el.clientWidth*.85),behavior:reduced?"auto":"smooth"});}
 return <section ref={section} className="arvo-discovery mt-7 min-w-0" aria-label={title} onPointerEnter={e=>{if(e.pointerType!=="touch")hovered.current=true;}} onPointerLeave={()=>{hovered.current=false;}} onFocusCapture={()=>{focused.current=true;}} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))focused.current=false;}} onPointerDown={interact} onWheel={interact} onKeyDown={interact}>
  <div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#ad7058]">{eyebrow}</p><h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2></div><div className="flex shrink-0 items-center gap-2"><Link href={href} className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-black/60">{linkLabel}<ArrowRight size={13}/></Link><button type="button" aria-label={`Previous ${title.toLowerCase()}`} disabled={edges.start} onClick={()=>move(-1)} className="hidden rounded-full border border-black/10 p-2 hover:bg-white disabled:opacity-25 sm:block"><ChevronLeft size={15}/></button><button type="button" aria-label={`Next ${title.toLowerCase()}`} disabled={edges.end} onClick={()=>move(1)} className="hidden rounded-full border border-black/10 p-2 hover:bg-white disabled:opacity-25 sm:block"><ChevronRight size={15}/></button></div></div>
  {overflow&&!reduced&&<button type="button" onClick={()=>setPaused(p=>!p)} aria-label={`${paused?"Resume":"Pause"} ${title.toLowerCase()} automatic movement`} className="mb-2 ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] text-black/50 hover:bg-black/5">{paused?<Play size={11}/>:<Pause size={11}/>} {paused?"Resume":"Pause"}</button>}
  <div ref={rail} tabIndex={0} role="region" aria-label={`${title} — scroll to explore`} className="arvo-discovery-rail flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ad7058] [&>[data-discovery-card]]:w-[82%] [&>[data-discovery-card]]:max-w-[320px] [&>[data-discovery-card]]:shrink-0 [&>[data-discovery-card]]:snap-start sm:[&>[data-discovery-card]]:w-[300px] xl:[&>[data-discovery-card]]:w-[calc((100%-2rem)/3)]">{children}</div>
  <style jsx global>{`
   .arvo-discovery-rail::-webkit-scrollbar { display: none; width: 0; height: 0; }
   @keyframes arvoDiscoveryReveal { from { opacity: .35; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
   .arvo-discovery [data-discovery-card] { animation: arvoDiscoveryReveal .65s ease-out both; }
   .arvo-discovery [data-discovery-card]:nth-child(2) { animation-delay: .07s; }
   .arvo-discovery [data-discovery-card]:nth-child(3) { animation-delay: .14s; }
   .arvo-discovery [data-discovery-card]:nth-child(n+4) { animation-delay: .21s; }
   @media (prefers-reduced-motion: reduce) { .arvo-discovery [data-discovery-card] { animation: none; } }
  `}</style>
 </section>;
}
