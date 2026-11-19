"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BrainCircuit, ChevronRight, FileText, MapPin, Send, X } from "lucide-react";
import { appPath } from "@/lib/protocol/app-url";
import type { IntelligenceAnswer } from "@/lib/intelligence/core";

type Project = { slug: string; title: string; location: string; image: string | null; stage: string; acres: string; plots: number; documents: number };
type Turn = { question: string; answer?: IntelligenceAnswer; error?: string };

const THINKING = ["Searching the documents…", "Reading the relevant pages…", "Checking each fact against its source…", "Writing your answer…"];

const STARTERS = [
  "How do you get onto the site?",
  "Are there any restrictions on what can be built?",
  "What have similar plots sold for?",
  "What is the planning position?",
];

/** Floating "Ask Arvo" assistant: pick a project, then ask questions about its documents. */
export function IntelligenceWidget({ hidden = false }: { hidden?: boolean }) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null), field = useRef<HTMLInputElement>(null), panel = useRef<HTMLDivElement>(null);
  const [teaser, setTeaser] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  // A gentle nudge once per visit: after a few seconds, the assistant offers a question about a real project.
  useEffect(() => {
    if (hidden || open) return;
    let seen = false; try { seen = sessionStorage.getItem("arvo-ask-teaser") === "1"; } catch { /* storage unavailable */ }
    if (seen) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(appPath("/app/intelligence/projects"), { cache: "no-store" });
        const body = await r.json();
        const list: Project[] = body.projects ?? [];
        if (cancelled || !list.length) return;
        const pick = list[Math.floor(Math.random() * list.length)];
        const prompts = [`Ask me how to get onto ${pick.title}.`, `Curious what plots near ${pick.title} sell for?`, `I’ve read ${pick.documents} documents on ${pick.title}. Ask me anything.`];
        setProjects(list);
        setTeaser(prompts[Math.floor(Math.random() * prompts.length)]);
        try { sessionStorage.setItem("arvo-ask-teaser", "1"); } catch { /* storage unavailable */ }
      } catch { /* teaser is optional */ }
    }, 7000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [hidden, open]);
  useEffect(() => { if (!teaser) return; const t = setTimeout(() => setTeaser(null), 12000); return () => clearTimeout(t); }, [teaser]);

  // While an answer is being prepared, show what the assistant is doing rather than a bare spinner.
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setStep(n => n + 1), 1400);
    return () => { clearInterval(t); setStep(0); };
  }, [busy]);

  useEffect(() => {
    if (!open || projects) return;
    let cancelled = false;
    fetch(appPath("/app/intelligence/projects"), { cache: "no-store" }).then(async r => {
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.error || "Projects are unavailable right now.");
      if (!cancelled) setProjects(body.projects ?? []);
    }).catch(e => { if (!cancelled) setLoadError(e.message); });
    return () => { cancelled = true; };
  }, [open, projects]);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [turns, busy]);
  useEffect(() => { if (project) field.current?.focus(); }, [project]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  async function ask(text: string) {
    const q = text.trim();
    if (!project || busy || q.length < 3) return;
    setInput(""); setBusy(true); setTurns(t => [...t, { question: q }]);
    try {
      const r = await fetch(appPath("/app/intelligence/ask"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: project.slug, question: q }) });
      const body = await r.json().catch(() => ({})) as { answer?: IntelligenceAnswer; error?: string };
      if (!r.ok || !body.answer) throw new Error(body.error || "Arvo Intelligence couldn’t answer just now. Please try again.");
      setTurns(t => t.map((x, i) => i === t.length - 1 ? { ...x, answer: body.answer } : x));
    } catch (e) {
      setTurns(t => t.map((x, i) => i === t.length - 1 ? { ...x, error: (e as Error).message } : x));
    } finally { setBusy(false); }
  }

  if (hidden) return null;
  return <>
    {open && <div ref={panel} role="dialog" aria-modal="false" aria-label="Arvo Intelligence"
      className="arvo-widget fixed bottom-[calc(env(safe-area-inset-bottom)+88px)] right-4 z-[70] flex h-[min(600px,calc(100dvh-120px))] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#0b0d10] text-white shadow-[0_30px_80px_rgba(7,9,11,.45)] md:right-6">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
        {project ? <button type="button" onClick={() => { setProject(null); setTurns([]); }} aria-label="Choose another project" className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"><ArrowLeft size={16} /></button>
          : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#b9775d,#f0d2b0)] text-[#07090b]"><BrainCircuit size={15} /></span>}
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{project ? project.title : "Arvo Intelligence"}</p><p className="flex items-center gap-1.5 truncate text-[11px] text-white/45"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e2a98e]/60" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#e2a98e]" /></span>{busy ? "Reading…" : project ? `Online · ${project.documents} document${project.documents === 1 ? "" : "s"} read` : "Online · beta"}</p></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close Arvo Intelligence" className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"><X size={16} /></button>
      </header>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {!project ? <>
          <p className="text-lg font-semibold leading-snug">Which project would you like to explore?</p>
          <p className="mt-1 text-xs leading-5 text-white/50">Ask about access, restrictions, planning or what similar land has sold for. Answers come from the project’s documents, with sources.</p>
          <div className="mt-4 space-y-2">
            {loadError ? <p className="rounded-2xl bg-white/[0.04] p-4 text-xs text-white/60">{loadError}</p>
              : !projects ? [0, 1].map(i => <div key={i} className="arvo-skeleton-dark h-[68px] rounded-2xl" />)
              : !projects.length ? <p className="rounded-2xl bg-white/[0.04] p-4 text-xs leading-5 text-white/60">No projects are available to explore yet. New projects appear here as their documents are added.</p>
              : projects.map(p => <button key={p.slug} type="button" onClick={() => setProject(p)} className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 text-left hover:border-[#c9846a]/40 hover:bg-white/[0.06]">
                  {p.image ? <img src={p.image} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c9846a]/15 text-[#e2a98e]"><MapPin size={18} /></span>}
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.title}</span><span className="block truncate text-[11px] text-white/45">{p.location}{p.acres ? ` · ${p.acres} acres` : ""}</span></span>
                  <ChevronRight size={16} className="shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70" />
                </button>)}
          </div>
        </> : <>
          {turns.length === 0 && <div className="arvo-fade">
            <p className="text-sm leading-6 text-white/75">Ask anything about <span className="font-semibold text-white">{project.title}</span>. I’ll answer from its documents and show where each fact comes from.</p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Try asking</p>
            <div className="mt-2 flex flex-col gap-2">{STARTERS.map(s => <button key={s} type="button" onClick={() => ask(s)} className="rounded-xl border border-white/10 px-3 py-2.5 text-left text-xs text-white/80 hover:border-[#c9846a]/40 hover:bg-white/[0.05]">{s}</button>)}</div>
          </div>}
          <div className="space-y-4">{turns.map((t, i) => <div key={i} className="space-y-2">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[#c9846a]/20 px-3.5 py-2.5 text-[13px] leading-5">{t.question}</p>
            {t.error ? <p className="w-fit max-w-[92%] rounded-2xl rounded-bl-md bg-red-500/10 px-3.5 py-2.5 text-xs leading-5 text-red-200">{t.error}</p>
              : !t.answer ? <div className="flex w-fit items-center gap-2.5 rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3" role="status"><span className="flex gap-1"><span className="arvo-dot" /><span className="arvo-dot [animation-delay:120ms]" /><span className="arvo-dot [animation-delay:240ms]" /></span><span key={step} className="arvo-fade text-xs text-white/55">{THINKING[step % THINKING.length]}</span></div>
              : <Answer answer={t.answer} />}
          </div>)}</div>
        </>}
      </div>

      {project && <form onSubmit={e => { e.preventDefault(); void ask(input); }} className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] pl-3.5 focus-within:border-[#c9846a]/50">
          <input ref={field} value={input} onChange={e => setInput(e.target.value)} maxLength={500} placeholder="Ask about this project…" aria-label="Your question" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-white/30" />
          <button type="submit" data-sound="confirm" disabled={busy || input.trim().length < 3} aria-label="Send question" className="m-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#e2a98e] text-[#07090b] disabled:opacity-30"><Send size={15} /></button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 px-1 text-[10px] text-white/35"><span>Not legal or financial advice. Names and personal details are never shared.</span><Link href={appPath(`/app/intelligence?project=${encodeURIComponent(project.slug)}`)} onClick={() => setOpen(false)} className="inline-flex shrink-0 items-center gap-0.5 text-white/50 hover:text-white">Full view<ArrowUpRight size={11} /></Link></div>
      </form>}
    </div>}

    {teaser && !open && <button type="button" onClick={() => { setTeaser(null); setOpen(true); }} className="arvo-widget fixed bottom-[calc(env(safe-area-inset-bottom)+88px)] right-4 z-[70] max-w-[260px] rounded-2xl rounded-br-md border border-black/[0.06] bg-white px-4 py-3 text-left text-[13px] leading-5 text-[#07090b] shadow-[0_18px_40px_rgba(7,9,11,.18)] md:right-6">
      <span className="mb-0.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ad7058]"><BrainCircuit size={11} />Arvo Intelligence</span>{teaser}
      <span role="button" tabIndex={0} aria-label="Dismiss" onClick={e => { e.stopPropagation(); setTeaser(null); }} onKeyDown={e => { if (e.key === "Enter") { e.stopPropagation(); setTeaser(null); } }} className="absolute right-2 top-2 rounded-full p-1 text-black/35 hover:bg-black/5 hover:text-black/70"><X size={12} /></span>
    </button>}
    <button type="button" data-sound="soft" onClick={() => { setTeaser(null); setOpen(o => !o); }} aria-expanded={open} aria-label={open ? "Close Arvo Intelligence" : "Ask Arvo Intelligence about a project"}
      className={`fixed bottom-[calc(env(safe-area-inset-bottom)+20px)] right-4 z-[70] flex h-14 w-14 items-center justify-center gap-2.5 rounded-full text-sm sm:w-auto sm:pl-4 sm:pr-5 font-semibold shadow-[0_16px_40px_rgba(7,9,11,.28)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 md:right-6 ${open ? "" : "arvo-breathe "}${open ? "bg-[#07090b] text-white" : "bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.35),transparent_28%),linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#8b5cf6_135%)] text-[#07090b]"}`}>
      {open ? <X size={18} /> : <BrainCircuit size={19} />}<span className="sr-only sm:not-sr-only">{open ? "Close" : "Ask Arvo Intelligence"}</span>
    </button>
  </>;
}

/** Reveals text word by word, so the answer reads as if it is being written. Instant with reduced motion. */
function Typed({ text, onDone }: { text: string; onDone: () => void }) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const [count, setCount] = useState(() => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? words.length : 0);
  useEffect(() => {
    if (count >= words.length) { onDone(); return; }
    const t = setTimeout(() => setCount(c => Math.min(words.length, c + 2)), 28);
    return () => clearTimeout(t);
  }, [count, words, onDone]);
  return <>{words.slice(0, count).join("")}{count < words.length && <span className="arvo-caret" aria-hidden />}</>;
}

function Answer({ answer }: { answer: IntelligenceAnswer }) {
  const [typed, setTyped] = useState(!answer.summary);
  const done = useCallback(() => setTyped(true), []);
  return <div className="arvo-fade max-w-[94%] rounded-2xl rounded-bl-md bg-white/[0.06] px-3.5 py-3 text-[13px] leading-5 text-white/85" aria-live="polite">
    {answer.summary && <p><Typed text={answer.summary} onDone={done} /></p>}
    {!typed ? null : <div className="arvo-stagger">
    {answer.facts.length > 0 && <ul className="mt-2.5 space-y-2">{answer.facts.slice(0, 5).map((f, i) => <li key={i} className="border-l-2 border-[#c9846a]/50 pl-2.5">
      <p>{f.text}</p>
      {f.sources.length > 0 && <p className="mt-1 flex flex-wrap gap-1">{f.sources.slice(0, 3).map((s, j) => <span key={j} className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/55"><FileText size={10} />{s.label.replace(/\s*\(.*\)$/, "")}{s.page ? ` · p${s.page}` : ""}</span>)}</p>}
    </li>)}</ul>}
    {answer.checks.length > 0 && <p className="mt-2.5 text-[11px] leading-4 text-white/50"><span className="font-semibold text-white/65">Worth checking: </span>{answer.checks.slice(0, 2).join(" ")}</p>}
    {answer.notFound.length > 0 && !answer.facts.length && <p className="mt-2 text-[11px] text-white/50">{answer.notFound[0]}</p>}
    </div>}
  </div>;
}
