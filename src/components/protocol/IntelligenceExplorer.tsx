"use client";
import { useState } from "react";
import { ArrowRight, ThumbsDown, ThumbsUp } from "lucide-react";
import { appPath } from "@/lib/protocol/app-url";
import type { IntelligenceProjectSummary } from "@/lib/intelligence/data";
import type { IntelligenceAnswer, SourceRef } from "@/lib/intelligence/core";

const TOPICS = [
  { key: "title", title: "Title & documents", copy: "Review the supporting evidence.", question: "What do the title and legal documents say about tenure, restrictions, covenants and rights affecting this land?" },
  { key: "access", title: "Access & utilities", copy: "Examine practical site factors.", question: "What do the documents say about access, rights of way, boundaries and utilities for this site?" },
  { key: "comparables", title: "Comparable sales", copy: "Explore relevant land sales.", question: "What comparable land sales or valuation evidence do the documents include?" },
  { key: "location", title: "Location data", copy: "Understand the surrounding area.", question: "What do the documents say about the location, surroundings and any planning context?" },
] as const;

function PlotShape() {
  return <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
    <polygon points="38,40 152,10 196,78 168,168 64,180 20,110" fill="#dba98e" stroke="#b9775d" strokeWidth="1.5" />
    <g stroke="#b9775d" strokeWidth="1" opacity=".7"><line x1="38" y1="40" x2="168" y2="168" /><line x1="152" y1="10" x2="64" y2="180" /><line x1="196" y1="78" x2="20" y2="110" /></g>
  </svg>;
}

function Citation({ s }: { s: SourceRef }) {
  return <span className="inline-flex items-center rounded-full border border-[#c9846a]/30 bg-[#f8f2ed] px-2 py-0.5 text-[10px] font-semibold text-[#ad7058]">
    {s.label}{s.page ? ` · p.${s.page}` : ""}{s.date ? ` · ${s.date}` : ""}
  </span>;
}

export function IntelligenceExplorer({ projects, initialSlug }: { projects: IntelligenceProjectSummary[]; initialSlug?: string }) {
  const [slug, setSlug] = useState(projects.find(p => p.slug === initialSlug)?.slug ?? projects[0]?.slug ?? "");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ id: number; question: string; answer: IntelligenceAnswer } | null>(null);
  const [rated, setRated] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const project = projects.find(p => p.slug === slug) ?? projects[0];

  async function ask(text: string) {
    const q = text.trim();
    if (busy || q.length < 3 || !project) return;
    setBusy(true); setError(""); setRated(null); setComment("");
    try {
      const response = await fetch(appPath("/app/intelligence/ask"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: project.slug, question: q }) });
      const body = await response.json().catch(() => ({})) as { id?: number; answer?: IntelligenceAnswer; error?: string };
      if (!response.ok || !body.answer || !body.id) throw new Error(body.error || "Arvo Intelligence could not answer right now.");
      setResult({ id: body.id, question: q, answer: body.answer });
      setTimeout(() => document.getElementById("intelligence-answer")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  async function rate(rating: 1 | -1) {
    if (!result) return;
    setRated(rating);
    await fetch(appPath("/app/intelligence/feedback"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: result.id, rating, comment }) }).catch(() => undefined);
  }

  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0b0a09] p-5 text-white sm:p-7 md:rounded-[28px] md:p-9 lg:p-11">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#c9846a]/15 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-12">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e2a98e]">Arvo Intelligence</p>
          <h1 className="mt-4 text-[2.15rem] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-5xl md:mt-5 lg:text-[3.6rem]">Know the land.<br />Understand the model.</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/75 md:mt-5 md:text-lg md:leading-8">Explore the evidence behind Arvo’s land projects. Answers come only from Arvo’s project records and documents, with sources.</p>
        </div>
        <div className="border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e2a98e]">Beta preview</p>
          <p className="mt-2 text-sm leading-6 text-white/80">In the beta you can analyse <span className="font-semibold text-white">Ripe</span>, the land behind the Genesis Pilot vault. Full access across every Arvo site is coming soon.</p>
          <p className="mt-3 text-xs leading-5 text-white/55">Answers can be incomplete. They are not legal, survey, planning or investment advice, and staking does not give ownership of land.</p>
        </div>
      </div>

      <div className="relative mt-7 rounded-[20px] border border-[#c9846a]/30 bg-[#f6f2ec] p-4 text-[#07090b] sm:p-6 md:mt-9 md:rounded-[24px] md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">Explore each plot.</h2>
          <span className="rounded-full border border-[#c9846a]/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#ad7058]">Beta preview</span>
        </div>
        {projects.length > 1 && <div className="mt-4 flex flex-wrap gap-2">{projects.map(p => <button key={p.slug} type="button" onClick={() => { setSlug(p.slug); setResult(null); }} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${p.slug === project?.slug ? "border-[#07090b] bg-[#07090b] text-white" : "border-black/15 hover:border-black/40"}`}>{p.title}</button>)}</div>}

        {project ? <>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
            <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-[#eee6de]">
              <div className="aspect-[16/10] w-full">{project.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={project.image} alt="" className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center p-6"><div className="aspect-square h-full"><PlotShape /></div></div>}</div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-sm sm:p-5">
                <div className="col-span-2"><dt className="text-[11px] text-black/55">Project</dt><dd className="mt-0.5 font-semibold">{project.title}</dd></div>
                <div className="col-span-2 sm:col-span-1"><dt className="text-[11px] text-black/55">Location</dt><dd className="mt-0.5 font-semibold">{project.location}</dd></div>
                {project.titleNumber.trim() && <div><dt className="text-[11px] text-black/55">Title number</dt><dd className="mt-0.5 font-semibold">{project.titleNumber}</dd></div>}
                <div><dt className="text-[11px] text-black/55">Area</dt><dd className="mt-0.5 font-semibold">{project.acres} acres</dd></div>
                <div><dt className="text-[11px] text-black/55">Plots</dt><dd className="mt-0.5 font-semibold">{project.plotsSold} of {project.plots} sold</dd></div>
              </dl>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ad7058]">Ask about</p>
              <ul className="mt-1 divide-y divide-black/10">{TOPICS.map(t => {
                const count = project.topics[t.key];
                return <li key={t.key}>
                  <button type="button" disabled={busy} onClick={() => { setQuestion(t.question); ask(t.question); }} className="group flex w-full items-center justify-between gap-4 py-3.5 text-left disabled:opacity-50 md:py-4">
                    <span className="min-w-0"><span className="block text-base font-semibold tracking-[-0.01em] md:text-lg">{t.title}</span><span className="mt-0.5 block text-sm text-black/60">{t.copy}</span><span className="mt-0.5 block text-[11px] text-black/50">{count ? `${count} source document${count === 1 ? "" : "s"}` : "No source documents yet"}</span></span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#ad7058] transition group-hover:border-[#ad7058] group-hover:bg-[#ad7058] group-hover:text-white"><ArrowRight size={15} /></span>
                  </button>
                </li>;
              })}</ul>
            </div>
          </div>
          <form className="mt-5 md:mt-6" onSubmit={e => { e.preventDefault(); ask(question); }}>
            <label htmlFor="intelligence-question" className="sr-only">Ask about this plot</label>
            <div className="flex items-center gap-2 rounded-full bg-[#121212] py-1.5 pl-5 pr-1.5 text-white md:py-2 md:pl-6 md:pr-2">
              <input id="intelligence-question" value={question} onChange={e => setQuestion(e.target.value)} maxLength={500} placeholder="Ask about this plot" className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-white/70" />
              <button type="submit" disabled={busy || question.trim().length < 3} aria-label="Ask" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c9846a] text-[#07090b] transition hover:bg-[#e2a98e] disabled:opacity-40">{busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#07090b] border-t-transparent" /> : <ArrowRight size={18} />}</button>
            </div>
          </form>
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        </> : <p className="mt-6 text-sm text-black/60">Projects will appear here when they are ready for the beta.</p>}
      </div>
    </section>

    {result && <section id="intelligence-answer" className="scroll-mt-6 rounded-[24px] border border-black/[0.08] bg-[#f6f2ec] p-5 sm:p-6 md:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#ad7058]">{project?.title}</p>
      <h3 className="mt-2 text-lg font-semibold">{result.question}</h3>
      <p className="mt-4 max-w-3xl text-[15px] leading-7">{result.answer.summary}</p>
      {result.answer.facts.length > 0 && <div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">From the sources</p><ul className="mt-3 space-y-3">{result.answer.facts.map((f, i) => <li key={i} className="text-sm leading-6"><span>{f.text}</span><span className="mt-1.5 flex flex-wrap gap-1.5">{f.sources.map(s => <Citation key={s.id} s={s} />)}</span></li>)}</ul></div>}
      {result.answer.inferences.length > 0 && <div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">Inference, not stated in the sources</p><ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-black/70">{result.answer.inferences.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
      {result.answer.checks.length > 0 && <div className="mt-6 rounded-2xl border border-[#c9846a]/30 bg-white/60 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#ad7058]">Check with a professional</p><ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">{result.answer.checks.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
      {result.answer.notFound.length > 0 && <div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">Not in the sources</p><ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-black/60">{result.answer.notFound.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-black/10 pt-5">
        <span className="text-xs text-black/50">Was this useful?</span>
        <button type="button" aria-label="Useful" onClick={() => rate(1)} className={`rounded-full border p-2 ${rated === 1 ? "border-[#07090b] bg-[#07090b] text-white" : "border-black/15"}`}><ThumbsUp size={14} /></button>
        <button type="button" aria-label="Not useful" onClick={() => rate(-1)} className={`rounded-full border p-2 ${rated === -1 ? "border-[#07090b] bg-[#07090b] text-white" : "border-black/15"}`}><ThumbsDown size={14} /></button>
        {rated === -1 && <input value={comment} onChange={e => setComment(e.target.value)} onBlur={() => rate(-1)} maxLength={1000} placeholder="What was wrong or missing? (optional)" className="min-w-[220px] flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-xs outline-none" />}
        {rated !== null && <span className="text-xs text-black/45">Thanks for the feedback.</span>}
      </div>
      <p className="mt-5 text-[11px] leading-5 text-black/45">Beta. Answers use only Arvo’s project records and documents, may be incomplete, and are not legal, survey, planning, valuation or investment advice. Personal details from documents are never shown. Staking ARVO does not give ownership of land.</p>
    </section>}

    <section aria-labelledby="intelligence-next" className="rounded-[24px] border border-black/[0.08] bg-white p-5 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="intelligence-next" className="text-xl font-semibold tracking-[-0.03em] md:text-2xl">Where Arvo Intelligence goes next</h2>
        <span className="rounded-full border border-[#c9846a]/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#ad7058]">Next release</span>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">The same source-backed answers, beyond Arvo’s own sites.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {nextUses.map(u => <div key={u.title} className="rounded-2xl border border-black/[0.07] bg-[#f6f2ec] p-5">
          <p className="text-sm font-semibold">{u.title}</p>
          <p className="mt-2 text-xs leading-5 text-black/65">{u.copy}</p>
        </div>)}
      </div>
    </section>
  </div>;
}

const nextUses = [
  { title: "Every Arvo site", copy: "Title, access, utilities, comparable sales and location for each Arvo project, as its documents are added." },
  { title: "Land outside Arvo", copy: "Bring a site you are looking at and get a cited summary of its documents, with the gaps to check clearly marked." },
  { title: "Other real-world projects", copy: "Source-cited summaries of other real-world-asset projects on Robinhood Chain, so Arvo is the place to check first." },
  { title: "Sales data and alerts", copy: "Comparable sales from open Land Registry data, plus updates when a project’s documents or milestones change." },
];
