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

export function IntelligenceExplorer({ projects }: { projects: IntelligenceProjectSummary[] }) {
  const [slug, setSlug] = useState(projects[0]?.slug ?? "");
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
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0a09] p-6 text-white md:p-9 lg:p-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#c9846a]/15 blur-3xl" />
      <div className="relative grid items-start gap-10 xl:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e2a98e]">Arvo Intelligence</p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] md:text-5xl lg:text-6xl">Know the land.<br />Understand the model.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-white/60">Explore the evidence behind Arvo’s land projects. Answers come only from Arvo’s project records and documents, with sources.</p>
          <div className="mt-8 h-px w-16 bg-[#c9846a]" />
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e2a98e]">Beta preview</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/50">Answers can be incomplete. They are not legal, survey, planning or investment advice, and staking does not give ownership of land.</p>
        </div>

        <div className="rounded-[24px] border border-[#c9846a]/30 bg-[#f6f2ec] p-5 text-[#07090b] md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ad7058]">Arvo Intelligence</p>
            <span className="rounded-full border border-[#c9846a]/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#ad7058]">Beta preview</span>
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">Explore each plot.</h2>
          {projects.length > 1 && <div className="mt-5 flex flex-wrap gap-2">{projects.map(p => <button key={p.slug} type="button" onClick={() => { setSlug(p.slug); setResult(null); }} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${p.slug === project?.slug ? "border-[#07090b] bg-[#07090b] text-white" : "border-black/15 hover:border-black/40"}`}>{p.title}</button>)}</div>}

          {project ? <>
            <div className="mt-6 grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-2xl border border-black/[0.06] bg-[#eee6de] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#ad7058]">Plot overview</p>
                <div className="mx-auto mt-3 aspect-square max-w-[220px]">{project.image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={project.image} alt="" className="h-full w-full rounded-xl object-cover" />
                  : <PlotShape />}</div>
                <dl className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between gap-3"><dt className="text-black/45">Project</dt><dd className="text-right font-semibold">{project.title}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-black/45">Location</dt><dd className="text-right font-semibold">{project.location}</dd></div>
                  {project.titleNumber.trim() && <div className="flex justify-between gap-3"><dt className="text-black/45">Title number</dt><dd className="font-semibold">{project.titleNumber}</dd></div>}
                  <div className="flex justify-between gap-3"><dt className="text-black/45">Area</dt><dd className="font-semibold">{project.acres} acres</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-black/45">Plots</dt><dd className="font-semibold">{project.plotsSold} of {project.plots} sold</dd></div>
                </dl>
              </div>
              <ul className="divide-y divide-black/10">{TOPICS.map(t => {
                const count = project.topics[t.key];
                return <li key={t.key}>
                  <button type="button" disabled={busy} onClick={() => { setQuestion(t.question); ask(t.question); }} className="group w-full py-4 text-left disabled:opacity-50">
                    <span className="flex items-center justify-between gap-3"><span className="text-xl font-semibold tracking-[-0.02em]">{t.title}</span><ArrowRight size={16} className="text-[#ad7058] opacity-0 transition group-hover:opacity-100" /></span>
                    <span className="mt-1 block text-sm text-black/55">{t.copy}</span>
                    <span className="mt-1 block text-[11px] text-black/40">{count ? `${count} source document${count === 1 ? "" : "s"}` : "No source documents yet"}</span>
                  </button>
                </li>;
              })}</ul>
            </div>
            <form className="mt-6" onSubmit={e => { e.preventDefault(); ask(question); }}>
              <label htmlFor="intelligence-question" className="sr-only">Ask about this plot</label>
              <div className="flex items-center gap-3 rounded-full bg-[#121212] py-2 pl-6 pr-2 text-white">
                <input id="intelligence-question" value={question} onChange={e => setQuestion(e.target.value)} maxLength={500} placeholder="Ask Arvo Intelligence about this plot" className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-white/70" />
                <button type="submit" disabled={busy || question.trim().length < 3} aria-label="Ask" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#e2a98e] transition hover:bg-white/10 disabled:opacity-40">{busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#e2a98e] border-t-transparent" /> : <ArrowRight size={20} />}</button>
              </div>
            </form>
            {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
          </> : <p className="mt-6 text-sm text-black/55">Projects will appear here when they are ready for the beta.</p>}
        </div>
      </div>
    </section>

    {result && <section id="intelligence-answer" className="scroll-mt-6 rounded-[24px] border border-black/[0.08] bg-[#f6f2ec] p-6 md:p-8">
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
  </div>;
}
