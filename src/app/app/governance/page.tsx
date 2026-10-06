import Link from "next/link";
import {ArrowRight,Vote,MessageSquareText,FileText,Scale} from "lucide-react";
import {PageTitle} from "@/components/protocol/ProtocolUI";
const reports=[
 {title:"Proposals",icon:MessageSquareText,copy:"Review published proposals, their rationale and the decisions they put forward when governance opens."},
 {title:"Voting",icon:Vote,copy:"Eligibility, voting power and participation rules will be published before voting becomes available."},
 {title:"Decisions & updates",icon:FileText,copy:"Follow published outcomes and updates on the actions agreed through governance."},
];
export default function GovernancePage(){return <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
 <PageTitle eyebrow="Governance" title="Arvo Governance." copy="Proposals, participation and protocol decisions."/>
 <section aria-labelledby="governance-intro-title" className="relative mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[#07090b] p-6 text-white md:p-9 lg:p-12">
  <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#c9846a]/15 blur-3xl"/>
  <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#e2a98e,transparent)]"/>
  <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
   <div><div className="inline-flex items-center gap-2 rounded-full border border-[#c9846a]/25 bg-[#c9846a]/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#e2a98e]"><FileText size={12}/>Governance coming soon</div>
    <h2 id="governance-intro-title" className="mt-6 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.045em] md:text-4xl lg:text-5xl">Protocol decisions,<br className="hidden sm:block"/> in one place.</h2>
    <p className="mt-5 max-w-lg text-sm leading-7 text-white/60">Governance will be introduced in a later phase. This page will bring together published proposals, participation rules and decision updates.</p>
    <div className="mt-7 flex flex-wrap items-center gap-5"><Link href="/app" className="inline-flex items-center gap-3 rounded-xl bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.35),transparent_28%),linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#8b5cf6_135%)] px-5 py-3.5 text-sm font-semibold text-[#07090b] transition hover:-translate-y-0.5">Explore the platform<ArrowRight size={15}/></Link><Link href="/app/treasury" className="text-xs font-semibold text-white/55 hover:text-white">Treasury reporting</Link></div>
   </div>
   <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 md:p-7"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c9846a]/20 bg-[#c9846a]/10 text-[#e2a98e]"><Scale size={23}/></div><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e2a98e]">What to expect</p><div className="mt-4 divide-y divide-white/10">{["Proposal scope","Voting eligibility","Decision records"].map(label=><p key={label} className="flex items-center gap-3 py-3 text-sm text-white/75"><span className="h-1 w-1 rounded-full bg-[#e2a98e]"/>{label}</p>)}</div><p className="mt-4 text-xs leading-6 text-white/40">Governance scope and participation rules will be published before proposals and voting open.</p></div>
  </div>
 </section>
 <section aria-label="Governance areas" className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reports.map(({title,icon:Icon,copy})=><article key={title} className="rounded-2xl border border-black/[0.08] bg-white/70 p-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9846a]/10 text-[#a9654f]"><Icon size={19}/></div><h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-black/50">{copy}</p></article>)}</section>
 </div>;}
