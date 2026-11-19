"use client";
import {useEffect,useRef,useState} from "react";
import {Play} from "lucide-react";
import {projectVideoSource} from "@/lib/projects/media";

/** One or two project videos. Two sit side by side from tablet width up. */
export function ProjectVideos({urls,covers=[],title}:{urls:string[];covers?:(number|undefined)[];title:string;poster?:string}){
 const valid=urls.filter(u=>{try{return Boolean(projectVideoSource(u));}catch{return false;}});
 if(!valid.length)return null;
 return <section className="mt-6 rounded-[24px] border border-black/[.07] bg-white p-6 md:p-8"><p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#b9775d]">Project media</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">{valid.length>1?"Project videos":"Project video"}</h2>
  <div className={`mt-5 grid gap-4 ${valid.length>1?"md:grid-cols-2":""}`}>{valid.map((url,i)=><VideoTile key={url} url={url} cover={covers[urls.indexOf(url)]} label={valid.length>1?`${title} project video ${i+1}`:`${title} project video`}/>)}</div>
 </section>;
}

// Cover frame for self-hosted videos: the chosen second, or a fifth of the way through but at least 5s (or halfway for short clips), past most intros.
function coverTime(duration:number,chosen?:number){
 if(!Number.isFinite(duration)||duration<=0)return 0;
 if(chosen!==undefined)return Math.min(Math.max(chosen,0),Math.max(duration-0.1,0));
 return Math.min(Math.max(duration*0.2,Math.min(5,duration*0.5)),Math.max(duration-0.1,0));
}

function VideoTile({url,label,cover}:{url:string;label:string;cover?:number}){
 const [playing,setPlaying]=useState(false),[error,setError]=useState(false);const started=useRef(false),video=useRef<HTMLVideoElement>(null);
 // Seek to the cover frame once the video's length is known (it may already be known before the page is interactive).
 useEffect(()=>{const v=video.current;if(!v)return;const seek=()=>{if(!started.current)v.currentTime=coverTime(v.duration,cover);};if(v.readyState>=1)seek();v.addEventListener("loadedmetadata",seek);return()=>v.removeEventListener("loadedmetadata",seek);},[cover,url]);
 const source=projectVideoSource(url);if(!source)return null;
 // Each video uses its own cover: a frame from the file, or YouTube's own thumbnail.
 const youtubeCover=source.kind==="youtube"?`https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`:undefined;
 return <div><div className="relative aspect-video overflow-hidden rounded-2xl bg-[#07090b]">{source.kind==="file"?<video controls playsInline preload="metadata" ref={video} src={source.url} onPlay={e=>{if(!started.current){started.current=true;e.currentTarget.currentTime=0;}}} onError={()=>setError(true)} className="h-full w-full" aria-label={label}>Your browser does not support this video.</video>:playing?<iframe title={label} src={`https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&rel=0`} className="h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<button type="button" onClick={()=>setPlaying(true)} className="relative flex h-full w-full flex-col items-center justify-center gap-3 text-white" aria-label={`Play ${label}`}>{youtubeCover&&(
  // eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail behind the play button
  <img src={youtubeCover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60"/>
 )}<span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#c9846a]"><Play size={22}/></span><span className="relative text-sm font-semibold">Watch video</span><span className="relative text-xs text-white/70">Plays from YouTube</span></button>}</div>{error&&<p role="alert" className="mt-3 text-xs text-red-700">Unable to load this video. Check the video link in admin.</p>}</div>;
}

/** @deprecated use ProjectVideos */
export function ProjectVideo({url,title,poster}:{url:string;title:string;poster?:string}){return <ProjectVideos urls={[url]} title={title} poster={poster}/>;}
