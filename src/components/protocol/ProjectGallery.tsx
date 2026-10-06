"use client";
import {useState} from "react";
import {ChevronLeft,ChevronRight} from "lucide-react";
import {ProjectVisual,type Project} from "./ProjectUI";

export function ProjectGallery({project}:{project:Project}) {
 const images=[...new Set([project.image,...project.presentation?.gallery??[]].filter((p):p is string=>Boolean(p)))];
 const [selected,setSelected]=useState(0);
 const index=Math.min(selected,Math.max(0,images.length-1));
 return <div className="min-w-0 xl:absolute xl:inset-0 xl:flex xl:flex-col" aria-label={`${project.title} image gallery`}>
  <div className="relative h-[220px] overflow-hidden rounded-[24px] bg-[#07090b] sm:h-[320px] xl:h-auto xl:min-h-0 xl:flex-1">
   {images.length ? <img src={images[index]} alt={`${project.title} — image ${index+1} of ${images.length}`} className="absolute inset-0 h-full w-full object-cover"/> : <ProjectVisual project={project}/>}
   {images.length>1 && <>
    <div className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white" aria-live="polite">{index+1} / {images.length}</div>
    <button type="button" aria-label="Previous project image" onClick={()=>setSelected((index-1+images.length)%images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 p-2.5 text-white transition hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><ChevronLeft size={18}/></button>
    <button type="button" aria-label="Next project image" onClick={()=>setSelected((index+1)%images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 p-2.5 text-white transition hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><ChevronRight size={18}/></button>
   </>}
  </div>
  {images.length>0 && <div className="mt-3 flex shrink-0 gap-2.5 overflow-x-auto pb-1" aria-label="Project image thumbnails">
   {images.map((src,i)=><button key={src} type="button" aria-label={`Show project image ${i+1}`} aria-pressed={i===index} onClick={()=>setSelected(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9846a] ${i===index?"border-[#c9846a]":"border-transparent opacity-65 hover:opacity-100"}`}><img src={src} alt="" loading="lazy" className="h-full w-full object-cover"/></button>)}
  </div>}
 </div>;
}
