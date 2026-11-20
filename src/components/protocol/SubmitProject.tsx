"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Check, Plus, X } from "lucide-react";
import { appPath } from "@/lib/protocol/app-url";
import { PROJECT_SEEKING, PROJECT_STAGES } from "@/lib/projects/submission";

/** Dashed "+" tile at the end of the projects grid. Opens a short form that emails the team. */
export function SubmitProjectTile() {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} className="group flex min-h-[320px] w-full flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-[#c9846a]/45 bg-[#f8ede6]/50 px-8 py-10 text-center transition hover:border-[#c9846a] hover:bg-[#f8ede6]">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#b9775d_0%,#e2a98e_45%,#f0d2b0_100%)] text-[#07090b] shadow-[0_10px_30px_rgba(185,119,93,.35)] transition group-hover:scale-105"><Plus size={26} strokeWidth={2.2} /></span>
      <span className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[#07090b]">Bring your land project to Arvo</span>
      <span className="mt-2 max-w-xs text-sm leading-6 text-black/55">Own or developing a site? Tell us about it. We review every submission; nothing is listed without due diligence.</span>
      <span className="mt-5 text-sm font-semibold text-[#ad7058]">Submit a project →</span>
    </button>
    {open && <SubmitProjectDialog onClose={() => setOpen(false)} />}
  </>;
}

const input = "mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#e2a98e]/70";
const label = "block text-xs font-medium text-white/65";

function SubmitProjectDialog({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [sent, setSent] = useState(false);
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    first.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    const overflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", key); document.body.style.overflow = overflow; };
  }, [onClose]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    const data = new FormData(e.currentTarget), text = (k: string) => String(data.get(k) || "");
    setBusy(true); setError("");
    try {
      const response = await fetch(appPath("/app/project-submission"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: text("name"), email: text("email"), company: text("company"), location: text("location"), stage: text("stage"), size: text("size"),
        seeking: text("seeking"), value: text("value"), link: text("link"), description: text("description"), website: text("website"), consent: data.get("consent") === "on",
      }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn’t send your project. Please try again.");
      setSent(true);
    } catch (err) { setError(err instanceof Error ? err.message : "We couldn’t send your project. Please try again."); }
    finally { setBusy(false); }
  }

  return createPortal(<div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-6">
    <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
    <div role="dialog" aria-modal="true" aria-labelledby="submit-project-title" className="arvo-fade relative w-full max-w-xl max-h-[92dvh] overflow-y-auto overflow-x-hidden rounded-t-[26px] bg-[#0b0a09] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,.45)] sm:rounded-[26px] sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#c9846a]/25 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e2a98e]">Projects</p><h2 id="submit-project-title" className="mt-1.5 text-2xl font-semibold tracking-[-0.03em]">Bring your land project to Arvo</h2></div>
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white"><X size={16} /></button>
      </div>
      {sent ? <div className="relative mt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e2a98e]/15 text-[#e2a98e]"><Check size={22} /></div>
        <h3 className="mt-4 text-lg font-semibold">Thanks, we’ve received your project.</h3>
        <p className="mt-2 text-sm leading-6 text-white/70">The Arvo team reviews every submission and will reply by email if it’s a fit. Submitting doesn’t mean a project will be listed or funded.</p>
        <button type="button" onClick={onClose} className="mt-6 w-full rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold hover:border-white/35">Close</button>
      </div> : <form onSubmit={submit} className="relative mt-3">
        <p className="text-sm leading-6 text-white/70">Tell us about a site you own or are developing. We review every submission; nothing is listed without due diligence.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className={label}>Your name *<input ref={first} name="name" required maxLength={120} autoComplete="name" className={input} /></label>
          <label className={label}>Email *<input name="email" type="email" required maxLength={254} autoComplete="email" className={input} /></label>
          <label className={label}>Company<input name="company" maxLength={160} autoComplete="organization" className={input} /></label>
          <label className={label}>Site location *<input name="location" required maxLength={160} placeholder="Town, region, country" className={input} /></label>
          <label className={label}>Stage *<select name="stage" required defaultValue="" className={`${input} [&>option]:bg-[#0b0a09]`}><option value="" disabled>Choose…</option>{PROJECT_STAGES.map(s => <option key={s}>{s}</option>)}</select></label>
          <label className={label}>Site size<input name="size" maxLength={80} placeholder="e.g. 4 acres, 12 plots" className={input} /></label>
          <label className={label}>Looking for *<select name="seeking" required defaultValue="" className={`${input} [&>option]:bg-[#0b0a09]`}><option value="" disabled>Choose…</option>{PROJECT_SEEKING.map(s => <option key={s}>{s}</option>)}</select></label>
          <label className={label}>Rough value or amount needed<input name="value" maxLength={80} placeholder="e.g. £250k" className={input} /></label>
          <label className={`${label} sm:col-span-2`}>Website or document link<input name="link" type="url" maxLength={500} placeholder="https://" className={input} /></label>
          <label className={`${label} sm:col-span-2`}>About the project *<textarea name="description" required maxLength={4000} rows={4} placeholder="What the site is, where it’s up to and what you’d like to do with Arvo." className={`${input} resize-y`} /></label>
        </div>
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="mt-4 flex items-start gap-2.5 text-xs leading-5 text-white/60"><input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#e2a98e]" /><span>Arvo can contact me about this project. My details are handled under the <a href="https://arvoprotocol.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-white/85 underline decoration-white/30">privacy policy</a>.</span></label>
        {error && <p role="alert" className="mt-4 rounded-xl border border-[#e8907a]/30 bg-[#e8907a]/10 px-3.5 py-2.5 text-sm text-[#f3b4a4]">{error}</p>}
        <button type="submit" disabled={busy} className="mt-5 flex w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#a98bf0_135%)] px-4 py-3.5 text-sm font-semibold text-[#07090b] disabled:opacity-60">{busy ? "Sending…" : "Submit project"}</button>
        <p className="mt-3 text-[11px] leading-5 text-white/45">Submitting doesn’t mean a project will be listed, funded or linked to a vault.</p>
      </form>}
    </div>
  </div>, document.body);
}
