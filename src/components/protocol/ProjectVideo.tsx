"use client";
import {useState} from "react";
import {Play} from "lucide-react";
import {projectVideoSource} from "@/lib/projects/media";

/** One or two project videos. Two sit side by side from tablet width up. */
export function ProjectVideos({urls,title,poster}:{urls:string[];title:string;poster?:string}){
 const valid=urls.filter(u=>{try{return Boolean(projectVideoSource(u));}catch{return false;}});
 if(!valid.length)return null;
 return <section className="mt-6 rounded-[24px] border border-black/[.07] bg-white p-6 md:p-8"><p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#b9775d]">Project media</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">{valid.length>1?"Project videos":"Project video"}</h2>
  <div className={`mt-5 grid gap-4 ${valid.length>1?"md:grid-cols-2":""}`}>{valid.map((url,i)=><VideoTile key={url} url={url} label={valid.length>1?`${title} project video ${i+1}`:`${title} project video`} poster={poster}/>)}</div>
 </section>;
}

// Cover frame for self-hosted videos: the browser shows the frame at this second (opening frames are often black).
const coverSecond=1;

function VideoTile({url,label}:{url:string;label:string;poster?:string}){
 const [playing,setPlaying]=useState(false),[error,setError]=useState(false),[started,setStarted]=useState(false);const source=projectVideoSource(url);if(!source)return null;
 // Each video uses its own cover: a frame from the file, or YouTube's own thumbnail.
 const youtubeCover=source.kind==="youtube"?`https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`:undefined;
 return <div><div className="relative aspect-video overflow-hidden rounded-2xl bg-[#07090b]">{source.kind==="file"?<video controls playsInline preload="metadata" src={`${source.url}#t=${coverSecond}`} onPlay={e=>{if(!started){setStarted(true);if(e.currentTarget.currentTime<=coverSecond+0.05)e.currentTarget.currentTime=0;}}} onError={()=>setError(true)} className="h-full w-full" aria-label={label}>Your browser does not support this video.</video>:playing?<iframe title={label} src={`https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&rel=0`} className="h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<button type="button" onClick={()=>setPlaying(true)} className="relative flex h-full w-full flex-col items-center justify-center gap-3 text-white" aria-label={`Play ${label}`}>{youtubeCover&&(
  // eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail behind the play button
  <img src={youtubeCover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60"/>
 )}<span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#c9846a]"><Play size={22}/></span><span className="relative text-sm font-semibold">Watch video</span><span className="relative text-xs text-white/70">Plays from YouTube</span></button>}</div>{error&&<p role="alert" className="mt-3 text-xs text-red-700">Unable to load this video. Check the video link in admin.</p>}</div>;
}

/** @deprecated use ProjectVideos */
export function ProjectVideo({url,title,poster}:{url:string;title:string;poster?:string}){return <ProjectVideos urls={[url]} title={title} poster={poster}/>;}
