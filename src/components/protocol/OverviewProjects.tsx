import { ProjectStatusPill } from "@/components/protocol/ProjectUI";
import Link from "next/link";
import {ArrowUpRight,MapPin} from "lucide-react";
import {getPublishedProjects} from "@/lib/projects/data";
import {ProjectVisual,type Project} from "./ProjectUI";
import {DiscoveryCarousel} from "./DiscoveryCarousel";

export async function OverviewProjects(){
 let projects:Project[]=[];let unavailable=false;
 try{projects=(await getPublishedProjects()).slice(0,8);}catch{unavailable=true;}
 return <OverviewProjectCards projects={projects} unavailable={unavailable}/>;
}
export function OverviewProjectCards({projects,unavailable=false}:{projects:Project[];unavailable?:boolean}){
 return <DiscoveryCarousel title="Explore projects" eyebrow="Treasury at work" href="/app/projects" linkLabel="View all">
  {projects.map(project=><Link data-discovery-card key={project.slug} href={`/app/projects/${project.slug}`} className="group relative flex min-h-[240px] flex-col overflow-hidden rounded-[22px] bg-[#07090b] p-5 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ad7058]"><div aria-hidden="true" className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none"><ProjectVisual project={project}/></div><div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,11,0)_0%,rgba(7,9,11,.05)_28%,rgba(7,9,11,.55)_55%,rgba(7,9,11,.9)_100%)]"/><div className="relative flex items-center justify-between gap-2"><ProjectStatusPill status={project.status} label={project.statusLabel} className="!px-2.5 !py-1 !text-[10px]"/><ArrowUpRight size={17} className="text-[#e2a98e]"/></div><div className="relative mt-auto pt-12 [text-shadow:0_1px_4px_rgba(0,0,0,.7)]"><h3 className="mt-2 line-clamp-2 text-xl font-semibold leading-tight tracking-tight">{project.title}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-white/90"><MapPin size={12} className="shrink-0"/><span className="line-clamp-1">{project.location}</span></p><p className="mt-3 border-t border-white/15 pt-3 text-[11px] leading-4 text-white/85">{project.stage}</p></div></Link>)}
  {!projects.length&&<div data-discovery-card className="rounded-[22px] border border-black/10 bg-white/70 p-6"><p className="font-semibold">{unavailable?"Project updates are unavailable.":"Follow the next acquisition."}</p><p className="mt-2 text-xs leading-5 text-black/55">{unavailable?"Open Projects to try again.":"Published projects and operating updates will appear here."}</p><Link href="/app/projects" className="mt-4 inline-block text-xs font-semibold text-[#ad7058]">Explore projects →</Link></div>}
 </DiscoveryCarousel>;
}
