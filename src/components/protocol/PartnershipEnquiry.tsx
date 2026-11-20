"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import { appPath } from "@/lib/protocol/app-url";
import { PARTNER_INTERESTS, PARTNER_SIZES, PARTNER_TYPES } from "@/lib/partnerships";

const input = "mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#e2a98e]/70";
const label = "block text-xs font-medium text-white/65";

/** Card at the foot of the vault list pointing to the Private Partnerships enquiry page. */
export function PrivatePartnershipsCard() {
  return <Link href={appPath("/app/partnerships")} className="group mt-6 flex flex-col gap-5 rounded-[22px] border border-[#c9846a]/30 bg-[#07090b] p-6 text-white transition hover:border-[#e2a98e]/60 md:flex-row md:items-center md:gap-6 md:p-7">
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#e2a98e]/35 bg-[#c9846a]/15 text-[#f0c2aa]"><LockKeyhole size={20} /></span>
    <span className="min-w-0 flex-1">
      <span className="flex flex-wrap items-center gap-2.5"><span className="text-lg font-semibold tracking-[-0.02em]">Private Partnerships</span><span className="rounded-full border border-[#e2a98e]/40 bg-[#c9846a]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#ffd2bb]">Enquiry only</span></span>
      <span className="mt-1.5 block max-w-2xl text-sm leading-6 text-white/60">Full-site acquisitions, co-development and land partnerships with the Arvo operating team, arranged privately for family offices, institutions, developers and landowners.</span>
    </span>
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#b9775d_0%,#e2a98e_45%,#f0d2b0_100%)] px-5 py-3 text-sm font-semibold text-[#07090b]">Make an enquiry <ArrowRight size={15} className="transition group-hover:translate-x-0.5" /></span>
  </Link>;
}

export function PartnershipEnquiryForm() {
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [sent, setSent] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    const data = new FormData(e.currentTarget), text = (k: string) => String(data.get(k) || "");
    setBusy(true); setError("");
    try {
      const response = await fetch(appPath("/app/partnership-enquiry"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: text("name"), email: text("email"), organisation: text("organisation"), country: text("country"), type: text("type"), interest: text("interest"),
        size: text("size"), message: text("message"), website: text("website"), consent: data.get("consent") === "on",
      }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn’t send your enquiry. Please try again.");
      setSent(true);
    } catch (err) { setError(err instanceof Error ? err.message : "We couldn’t send your enquiry. Please try again."); }
    finally { setBusy(false); }
  }

  return <div className="relative overflow-hidden rounded-[26px] bg-[#0b0a09] p-6 text-white shadow-[0_30px_80px_rgba(7,9,11,.18)] sm:p-8">
    <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#c9846a]/25 blur-3xl" />
    {sent ? <div className="relative py-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e2a98e]/15 text-[#e2a98e]"><Check size={22} /></div>
      <h2 className="mt-4 text-xl font-semibold">Thank you, your enquiry has been sent.</h2>
      <p className="mt-2 text-sm leading-6 text-white/70">A member of the Arvo team will reply by email. Sending an enquiry doesn’t commit you or Arvo to anything.</p>
    </div> : <form onSubmit={submit} className="relative">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e2a98e]">Enquiry</p>
      <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em]">Start a conversation</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className={label}>Your name *<input name="name" required maxLength={120} autoComplete="name" className={input} /></label>
        <label className={label}>Email *<input name="email" type="email" required maxLength={254} autoComplete="email" className={input} /></label>
        <label className={label}>Organisation<input name="organisation" maxLength={160} autoComplete="organization" className={input} /></label>
        <label className={label}>Country of residence *<input name="country" required maxLength={80} autoComplete="country-name" className={input} /></label>
        <label className={label}>You are *<select name="type" required defaultValue="" className={`${input} [&>option]:bg-[#0b0a09]`}><option value="" disabled>Choose…</option>{PARTNER_TYPES.map(s => <option key={s}>{s}</option>)}</select></label>
        <label className={label}>Interested in *<select name="interest" required defaultValue="" className={`${input} [&>option]:bg-[#0b0a09]`}><option value="" disabled>Choose…</option>{PARTNER_INTERESTS.map(s => <option key={s}>{s}</option>)}</select></label>
        <label className={`${label} sm:col-span-2`}>Indicative size *<select name="size" required defaultValue="" className={`${input} [&>option]:bg-[#0b0a09]`}><option value="" disabled>Choose…</option>{PARTNER_SIZES.map(s => <option key={s}>{s}</option>)}</select></label>
        <label className={`${label} sm:col-span-2`}>Message *<textarea name="message" required maxLength={4000} rows={5} placeholder="What you’re looking for, any sites or regions of interest, and the best way to reach you." className={`${input} resize-y`} /></label>
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="mt-4 flex items-start gap-2.5 text-xs leading-5 text-white/60"><input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#e2a98e]" /><span>Arvo can contact me about this enquiry. My details are handled under the <a href="https://arvoprotocol.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-white/85 underline decoration-white/30">privacy policy</a>.</span></label>
      {error && <p role="alert" className="mt-4 rounded-xl border border-[#e8907a]/30 bg-[#e8907a]/10 px-3.5 py-2.5 text-sm text-[#f3b4a4]">{error}</p>}
      <button type="submit" disabled={busy} className="mt-5 flex w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#a98bf0_135%)] px-4 py-3.5 text-sm font-semibold text-[#07090b] disabled:opacity-60">{busy ? "Sending…" : "Send enquiry"}</button>
    </form>}
  </div>;
}
