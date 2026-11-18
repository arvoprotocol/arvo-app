"use client";
import { useState, useSyncExternalStore } from "react";
import { JURISDICTION_NOTICE_VERSION, RESTRICTED_JURISDICTION_NAMES } from "@/lib/legal/jurisdictions";

const KEY = "arvo-jurisdiction-confirmed";
const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://arvoprotocol.com").replace(/\/+$/, "");

function confirmed() {
  try { return window.localStorage.getItem(KEY) === JURISDICTION_NOTICE_VERSION; } catch { return document.cookie.includes(`${KEY}=${JURISDICTION_NOTICE_VERSION}`); }
}

/** Blocking first-visit notice: users confirm they are not in a Restricted Jurisdiction. */
export function JurisdictionNotice() {
  // Server render: treated as confirmed (no flash); the browser then checks storage.
  const alreadyConfirmed = useSyncExternalStore(() => () => {}, confirmed, () => true);
  const [accepted, setAccepted] = useState(false);
  const [ticked, setTicked] = useState(false);
  if (alreadyConfirmed || accepted) return null;

  function accept() {
    try { window.localStorage.setItem(KEY, JURISDICTION_NOTICE_VERSION); } catch { /* private mode */ }
    document.cookie = `${KEY}=${JURISDICTION_NOTICE_VERSION}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
    setAccepted(true);
  }

  return <div role="dialog" aria-modal="true" aria-labelledby="jurisdiction-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] border border-[#c9846a]/30 bg-[#f6f2ec] p-6 text-[#07090b] shadow-2xl md:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ad7058]">Before you continue</p>
      <h2 id="jurisdiction-title" className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Not available in restricted jurisdictions</h2>
      <p className="mt-4 text-sm leading-6 text-black/65">Arvo products and services are not offered to persons located in, resident in or ordinarily resident in a Restricted Jurisdiction. The current Restricted Jurisdictions are:</p>
      <p className="mt-3 rounded-xl bg-white/70 p-4 text-xs leading-5 text-black/70">{RESTRICTED_JURISDICTION_NAMES.join(" · ")}</p>
      <p className="mt-3 text-xs leading-5 text-black/50">A jurisdiction not being listed does not mean participation is lawful there. You are responsible for checking the laws that apply to you. <a href={`${site}/legal`} target="_blank" rel="noreferrer" className="font-semibold underline">Read the legal information</a>.</p>
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6">
        <input type="checkbox" checked={ticked} onChange={e => setTicked(e.target.checked)} className="mt-1 h-4 w-4 accent-[#07090b]" />
        <span>I confirm I am not located in, resident in or ordinarily resident in a Restricted Jurisdiction, and I am permitted to use Arvo where I am.</span>
      </label>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" disabled={!ticked} onClick={accept} className="rounded-xl bg-[#07090b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">Confirm and continue</button>
        <a href={site} className="rounded-xl border border-black/15 px-5 py-3 text-sm font-semibold">Leave</a>
      </div>
    </div>
  </div>;
}

/** Shown instead of the app when location blocking is on and the visitor is in a restricted country. */
export function RestrictedRegion() {
  return <main className="flex min-h-screen items-center justify-center bg-[#07090b] p-6 text-white">
    <div className="max-w-lg text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e2a98e]">Arvo</p>
      <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em]">Not available in your region</h1>
      <p className="mt-4 text-sm leading-7 text-white/60">The Arvo app is not offered in your location. If you believe this is wrong, contact support from the main website.</p>
      <a href={`${site}/legal`} className="mt-6 inline-block text-sm font-semibold text-[#e2a98e] underline">Legal information</a>
    </div>
  </main>;
}
