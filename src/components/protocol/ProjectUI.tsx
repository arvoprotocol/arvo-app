import {defaultPresentation,milestoneLabels,type ProjectPresentation} from "@/lib/projects/presentation";
import type {PlotStatus} from "@/lib/projects/plots";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
} from "lucide-react";

export type ProjectStatus = "upcoming" | "active" | "auction" | "completed";

export type Project = {
  acquisitionProjectHash?: string;
  presentation?: ProjectPresentation;
  projectOrigin: "arvo" | "team_track_record";
  slug: string;
  title: string;
  location: string;
  titleNumber: string;
  image?: string;
  status: ProjectStatus;
  statusLabel: string;
  stage: string;
  acres: string;
  plots: number;
  acquisitionPrice: string;
  guideValue: string;
  soldValue?: string;
  acquisitionDate?: string;
  trackPlots: boolean;
  plotsCompleted?: number;
  completedSaleValue?: string;
  plotDetails: {label:string;status:PlotStatus;salePrice?:string}[];
  plotsSold?: number;
  description: string;
};

// Solid pills with dark text so the status reads on any photo.
function statusStyles(status: ProjectStatus) {
  switch (status) {
    case "completed":
      return "bg-[#cfe48a] text-[#1d2808] border-[#cfe48a]";
    case "auction":
      return "bg-[linear-gradient(135deg,#d9967a,#f0d2b0)] text-[#07090b] border-[#f0d2b0]";
    case "active":
      return "bg-[#ffd772] text-[#2a1d00] border-[#ffd772]";
    default:
      return "bg-[#f8f2ed] text-[#07090b] border-[#f8f2ed]";
  }
}

/** The project status pill used on project cards and the Overview. */
export function ProjectStatusPill({ status, label, className = "" }: { status: ProjectStatus; label: string; className?: string }) {
  return <span className={`inline-flex max-w-full truncate rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.1em] shadow-[0_4px_14px_rgba(7,9,11,.28)] ${statusStyles(status)} ${className}`}>{label}</span>;
}

export function ProjectVisual({ project }: { project: Project }) {
  if (project.image) {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${project.image})` }}
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#111416]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(201,132,106,.24),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(240,210,176,.10),transparent_30%)]" />

      <div className="absolute left-[8%] top-[18%] h-[58%] w-[34%] rotate-[-8deg] rounded-[32px] border border-white/10 bg-white/[.025]" />
      <div className="absolute right-[9%] top-[12%] h-[36%] w-[35%] rotate-[9deg] rounded-[28px] border border-[#c9846a]/20 bg-[#c9846a]/[.04]" />
      <div className="absolute bottom-[10%] right-[16%] h-[31%] w-[48%] rotate-[-3deg] rounded-[26px] border border-white/10 bg-white/[.02]" />

      <div className="absolute bottom-5 left-5 flex items-center gap-2 text-xs text-white/45">
        <MapPin size={13} />
        Project imagery
      </div>
    </div>
  );
}

export function ProjectOriginNote({project}:{project:Project}) {
 return <div className="mt-4 text-xs leading-5"><span className="font-semibold text-[#a9654f]">{project.projectOrigin==="team_track_record"?"Team track record":"Arvo project"}</span>{project.projectOrigin==="team_track_record"&&<p className="mt-1 text-black/50">Completed by the operating team before Arvo launched. Proceeds did not contribute to the Arvo Treasury.</p>}</div>;
}

export function ProjectCard({project,compact=false}:{project:Project;compact?:boolean}) {
 const presentation=project.presentation??defaultPresentation;
 const isPlots=presentation.kind==="plots";
 const metrics=projectCardMetrics(project);
 const sold=project.plotsSold??0;
 const progress=project.plots?Math.min(100,Math.round(sold/project.plots*100)):0;
 return <Link href={`/app/projects/${project.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-black/[.08] bg-white shadow-[0_8px_28px_rgba(7,9,11,.045)] transition duration-300 hover:-translate-y-1 hover:border-[#c9846a]/30 hover:shadow-[0_16px_40px_rgba(7,9,11,.09)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9846a] motion-reduce:transform-none motion-reduce:transition-none">
  <div className={`relative shrink-0 overflow-hidden ${compact?"h-[190px]":"h-[220px] 2xl:h-[240px]"}`}>
   <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none"><ProjectVisual project={project}/></div>
   <div className="absolute inset-0" style={{backgroundImage:"linear-gradient(to top, rgba(7,9,11,.98) 0%, rgba(7,9,11,.82) 28%, rgba(7,9,11,.35) 58%, rgba(7,9,11,0) 85%)"}}/>
   <ProjectStatusPill status={project.status} label={project.statusLabel} className="absolute left-5 top-5 max-w-[calc(100%-2.5rem)]"/>
   <div className="absolute inset-x-5 bottom-5" style={{textShadow:"0 1px 3px rgba(0,0,0,.6)"}}><h3 className="mt-1.5 line-clamp-2 text-xl font-semibold leading-tight tracking-[-.025em] text-white">{project.title}</h3><p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-white/70"><MapPin size={13} className="mt-0.5 shrink-0"/><span className="line-clamp-2">{project.location}</span></p>{project.titleNumber.trim()&&<div className="mt-2.5"><ProjectTitleBadge titleNumber={project.titleNumber} onImage/></div>}</div>
  </div>
  <div className="flex flex-1 flex-col p-5 sm:p-6">
   <div className="grid grid-cols-3 gap-3 border-b border-black/[.07] pb-5">{metrics.map((metric,index)=><CardMetric key={index} {...metric}/>)}</div>
   {presentation.showFinancials&&<div className="grid grid-cols-2 gap-4 py-5"><CardMetric label={project.status==="upcoming"?"Indicative acquisition":"Acquisition"} value={project.acquisitionPrice} financial/><CardMetric label={project.soldValue?(project.trackPlots?"Agreed sale value":"Total sale proceeds"):"Guide value"} value={project.soldValue??project.guideValue} financial/></div>}
   {isPlots&&project.plots>0&&(project.trackPlots||project.status==="auction"||project.status==="completed")&&<div className="mb-5"><div className="mb-2.5 flex items-center justify-between gap-3 text-xs"><span className="text-black/45">Plots sold</span><span className="font-semibold tabular-nums">{sold.toLocaleString("en-GB")} / {project.plots.toLocaleString("en-GB")}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-black/[.06]"><div className="h-full rounded-full bg-[#c9846a]" style={{width:`${progress}%`}}/></div>{project.trackPlots&&<p className="mt-2.5 text-xs text-black/45">{sold.toLocaleString("en-GB")} sold · {(project.plotsCompleted??0).toLocaleString("en-GB")} completed</p>}</div>}
   {presentation.showMilestones&&presentation.milestones.length>0&&<div className="py-5"><ProjectMilestones project={project} compact/></div>}
   <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/[.07] pt-4"><div className="flex min-w-0 items-start gap-1.5 text-[11px] leading-5 text-black/45">{project.status==="completed"?<CheckCircle2 size={13} className="mt-0.5 shrink-0"/>:project.acquisitionDate?<CalendarDays size={13} className="mt-0.5 shrink-0"/>:<Clock3 size={13} className="mt-0.5 shrink-0"/>}<span>{project.status==="completed"?"Project completed":project.acquisitionDate?`Acquired ${project.acquisitionDate}`:project.status==="upcoming"?"Under review":project.stage}</span></div><span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold">View project<ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"/></span></div>
  </div>
 </Link>;
}
function CardMetric({label,value,financial=false}:{label:string;value:string;financial?:boolean}) {
 return <div className="min-w-0"><p className="min-h-8 text-[9px] font-semibold uppercase leading-4 tracking-[.08em] text-black/40">{label}</p><p className={financial?"break-words text-lg font-semibold leading-6 tracking-[-.025em] text-[#07090b] tabular-nums 2xl:text-xl":"break-words text-xs font-semibold leading-5 text-[#07090b]"}>{value}</p></div>;
}

export function ProjectMetric({
  label,
  value,
  large = false,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 text-[11px] uppercase tracking-[.1em] text-black/40">
        {label}
      </div>
      <div
        className={
          large
            ? "text-xl font-semibold tracking-[-.02em] text-[#07090b]"
            : "text-sm font-semibold text-[#07090b]"
        }
      >
        {value}
      </div>
    </div>
  );
}

export function ProjectTitleBadge({titleNumber,onImage=false}:{titleNumber:string;onImage?:boolean}) {
 if(!titleNumber.trim())return null;
 return <span className={`inline-flex max-w-full flex-wrap items-center gap-x-2 text-[11px] font-semibold leading-5 ${onImage?"text-white/90":"text-[#07090b]"}`}><span className={`text-[9px] uppercase tracking-[.12em] ${onImage?"text-white/60":"text-black/45"}`}>Title</span><span className="break-all tracking-[.08em]">{titleNumber}</span></span>;
}
export function projectCardMetrics(project:Project) {
 const p=project.presentation??defaultPresentation;
 if(p.metrics.length)return p.metrics;
 return p.kind==="plots"?[{label:"Site",value:project.acres},{label:"Plots",value:project.plots.toLocaleString("en-GB")},{label:"Stage",value:project.stage}]:[{label:"Project",value:p.kind==="development"?"Development":"Operating project"},{label:"Site",value:project.acres},{label:"Stage",value:project.stage}];
}
function milestoneDate(value:string){const [y,mo,d]=value.split("-").map(Number);const date=new Date(Date.UTC(y,(mo||1)-1,d||1));return new Intl.DateTimeFormat("en-GB",{timeZone:"UTC",month:"short",year:"numeric",...(d?{day:"numeric"}:{})}).format(date);}
export function ProjectMilestones({project,compact=false}:{project:Project;compact?:boolean}) {
 const presentation=project.presentation??defaultPresentation;
 const milestones=presentation.milestones;
 if(!presentation.showMilestones||!milestones.length)return null;
 if(compact){const current=milestones.find(m=>m.status==="in_progress")??milestones.find(m=>m.status==="planned")??milestones[milestones.length-1];return <div className="rounded-xl bg-[#fbf6f2] p-3"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-black/40">{milestoneLabels[current.status]}</p><p className="mt-1 text-xs font-semibold leading-5">{current.label}</p><p className="mt-1 text-[11px] text-black/45">{milestones.filter(m=>m.status==="completed").length} of {milestones.length} milestones completed</p></div>;}
 return <ol className="space-y-0">{milestones.map((m,index)=><li key={index} className="relative flex items-start gap-4 pb-6 last:pb-0"><span aria-hidden="true" className="absolute bottom-0 left-3.5 top-7 w-px bg-black/10" style={{display:index===milestones.length-1?"none":undefined}}/><span className={`relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${m.status==="completed"?"bg-emerald-50 text-emerald-700":m.status==="in_progress"?"bg-[#c9846a]/15 text-[#a9654f]":"bg-black/5 text-black/40"}`}>{m.status==="completed"?<CheckCircle2 size={15}/>:index+1}</span><div><p className="text-sm font-semibold">{m.label}</p><p className="mt-1 text-xs text-black/45">{milestoneLabels[m.status]}{m.date?` · ${milestoneDate(m.date)}`:""}</p>{m.note&&<p className="mt-1.5 max-w-xl text-sm leading-6 text-black/65">{m.note}</p>}</div></li>)}</ol>;
}
