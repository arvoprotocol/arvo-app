import Link from "next/link";
import {ArrowRight,Building2,ChartPie,FileText,Landmark} from "lucide-react";
import {PageTitle} from "@/components/protocol/ProtocolUI";
const reports=[
 {title:"Capital allocation",icon:ChartPie,copy:"A view of how treasury capital is allocated across operating projects, reserves and protocol activity."},
 {title:"Operating projects",icon:Building2,copy:"Follow published project details, milestones and operating progress through the projects section."},
 {title:"Treasury updates",icon:FileText,copy:"Published reports will bring together capital movements, operating contributions and treasury decisions."},
];
export default function TreasuryPage(){return <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
 <PageTitle eyebrow="Treasury" title="Arvo Treasury." copy="Capital allocation, operating activity and treasury reporting."/>
 <section aria-labelledby="treasury-reporting-title" className="relative mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[#07090b] p-6 text-white md:p-9 lg:p-12">
  <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#c9846a]/15 blur-3xl"/>
  <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#e2a98e,transparent)]"/>
  <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
   <div><div className="inline-flex items-center gap-2 rounded-full border border-[#c9846a]/25 bg-[#c9846a]/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#e2a98e]"><FileText size={12}/>Reporting coming soon</div>
    <h2 id="treasury-reporting-title" className="mt-6 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.045em] md:text-4xl lg:text-5xl">A clearer view of<br className="hidden sm:block"/> Arvo capital.</h2>
    <p className="mt-5 max-w-lg text-sm leading-7 text-white/60">This will be the home of Arvo treasury reporting: how capital is allocated, where it is deployed and the operating activity behind it.</p>
    <div className="mt-7 flex flex-wrap items-center gap-5"><Link href="/app/projects" className="inline-flex items-center gap-3 rounded-xl bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.35),transparent_28%),linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#8b5cf6_135%)] px-5 py-3.5 text-sm font-semibold text-[#07090b] transition hover:-translate-y-0.5">Explore Arvo projects<ArrowRight size={15}/></Link><Link href="/app" className="text-xs font-semibold text-white/55 hover:text-white">Back to overview</Link></div>
   </div>
   <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 md:p-7"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c9846a]/20 bg-[#c9846a]/10 text-[#e2a98e]"><Landmark size={23}/></div><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e2a98e]">What to expect</p><div className="mt-4 divide-y divide-white/10">{["Capital allocation","Operating contributions","Treasury movements"].map(label=><p key={label} className="flex items-center gap-3 py-3 text-sm text-white/75"><span className="h-1 w-1 rounded-full bg-[#e2a98e]"/>{label}</p>)}</div><p className="mt-4 text-xs leading-6 text-white/40">Figures and activity will appear once verified treasury reports are published.</p></div>
  </div>
 </section>
 <section aria-label="Treasury reporting areas" className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reports.map(({title,icon:Icon,copy})=><article key={title} className="rounded-2xl border border-black/[0.08] bg-white/70 p-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9846a]/10 text-[#a9654f]"><Icon size={19}/></div><h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-black/50">{copy}</p>{title==="Operating projects"&&<Link href="/app/projects" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#ad7058]">View projects<ArrowRight size={13}/></Link>}</article>)}</section>
 </div>;}
