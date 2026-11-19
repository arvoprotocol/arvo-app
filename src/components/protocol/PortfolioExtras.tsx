"use client";
import { useEffect, useState } from "react";
import { CalendarPlus, Mail } from "lucide-react";
import { appPath, appUrl } from "@/lib/protocol/app-url";

type Pos = { id: bigint; maturesAt: bigint; settled: boolean; vaultId: number };
const when = (s: bigint) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(Number(s) * 1000)) + " UTC";
const ics = (s: bigint) => new Date(Number(s) * 1000).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Builds an .ics with one event per position at maturity, with a 1-day alert. */
export function calendarFile(positions: Pos[]) {
  const stamp = ics(BigInt(Math.floor(Date.now() / 1000)));
  const url = appUrl("/app/portfolio");
  const events = positions.map(p => [
    "BEGIN:VEVENT", `UID:arvo-position-${p.id}@arvoprotocol.com`, `DTSTAMP:${stamp}`, `DTSTART:${ics(p.maturesAt)}`, `DTEND:${ics(p.maturesAt + 1800n)}`,
    `SUMMARY:Arvo position #${p.id} matures`, `DESCRIPTION:Claim your ARVO principal and reward (and any shared bonus) at ${url}`, `URL:${url}`,
    "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:Arvo position #${p.id} matures tomorrow`, "END:VALARM", "END:VEVENT",
  ].join("\r\n"));
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Arvo Protocol//Maturity reminders//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\r\n");
}

function download(positions: Pos[], name: string) {
  const blob = new Blob([calendarFile(positions)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Portfolio panel: upcoming maturities, add-to-calendar and opt-in email reminders. */
export function MaturityReminders({ positions, account }: { positions: Pos[]; account: string | null }) {
  const upcoming = positions.filter(p => !p.settled).sort((a, b) => (a.maturesAt < b.maturesAt ? -1 : 1));
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"" | "busy" | "sent" | "active">("");
  const [error, setError] = useState("");
  if (!upcoming.length) return null;

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!account) return;
    setState("busy"); setError("");
    try {
      const r = await fetch(appPath("/app/reminders"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, wallet: account }) });
      const body = await r.json().catch(() => ({})) as { error?: string; status?: string };
      if (!r.ok) throw new Error(body.error || "Could not set up reminders.");
      setState(body.status === "active" ? "active" : "sent");
    } catch (err) { setState(""); setError(err instanceof Error ? err.message : "Could not set up reminders."); }
  }

  return <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
    <div className="rounded-[24px] border border-black/[0.08] bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#ad7058]">Coming up</p><h2 className="mt-1 text-xl font-semibold">Unlock dates</h2></div>
        {upcoming.length > 1 && <button type="button" onClick={() => download(upcoming, "arvo-maturities.ics")} className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold"><CalendarPlus size={14} />Add all to calendar</button>}
      </div>
      <ul className="mt-4 divide-y divide-black/[0.06]">{upcoming.slice(0, 6).map(p => <li key={p.id.toString()} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
        <span><span className="font-semibold">Position #{p.id.toString()}</span><span className="ml-2 text-black/50">{when(p.maturesAt)}</span></span>
        <button type="button" onClick={() => download([p], `arvo-position-${p.id}.ics`)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ad7058]"><CalendarPlus size={13} />Add to calendar</button>
      </li>)}</ul>
    </div>
    <form onSubmit={subscribe} className="rounded-[24px] bg-[#07090b] p-5 text-white md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e2a98e]">Never miss a claim</p>
      <h2 className="mt-1 text-xl font-semibold">Email me before it unlocks</h2>
      <p className="mt-2 text-xs leading-5 text-white/55">One email 3 days before each position matures and one when it’s ready to claim. Confirm by email; stop any time.</p>
      {state === "sent" ? <p className="mt-4 rounded-xl bg-white/10 p-3 text-sm">Check your inbox to confirm.</p>
        : state === "active" ? <p className="mt-4 rounded-xl bg-white/10 p-3 text-sm">Reminders are already on for this wallet.</p>
        : <div className="mt-4 flex gap-2">
          <label className="sr-only" htmlFor="reminder-email">Email</label>
          <input id="reminder-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[#c9846a]" />
          <button disabled={state === "busy" || !account} className="inline-flex items-center gap-2 rounded-xl bg-[#f8f2ed] px-4 text-sm font-semibold text-[#07090b] disabled:opacity-40"><Mail size={14} />{state === "busy" ? "…" : "Remind me"}</button>
        </div>}
      {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
    </form>
  </section>;
}

/** "Founding staker" badge for wallets that joined the First Edition vault. */
export function FoundingStakerBadge({ account }: { account: string | null }) {
  const [info, setInfo] = useState<{ founding: boolean; rank: number | null } | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!account) return;
    fetch(appPath(`/app/vault-activity?founding=1&wallet=${account}`)).then(r => r.ok ? r.json() : null).then(d => { if (!cancelled && d) setInfo({ founding: Boolean(d.founding), rank: d.rank ?? null }); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [account]);
  if (!account || !info?.founding) return null;
  const share = `I'm a founding staker in the Arvo First Edition vault, staking connected to real land projects. ${appUrl("/app/stake")}`;
  return <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#c9846a]/40 bg-gradient-to-r from-[#07090b] to-[#2a1d17] p-5 text-white md:p-6">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e2a98e]">Founding staker{info.rank ? ` · #${info.rank}` : ""}</p>
      <p className="mt-1 text-lg font-semibold">You joined Arvo’s First Edition.</p>
      <p className="mt-1 text-xs text-white/55">Founding stakers are recorded from onchain deposits. Any future benefits will be announced with their terms.</p>
    </div>
    <a href={`https://x.com/intent/post?text=${encodeURIComponent(share)}`} target="_blank" rel="noreferrer" className="rounded-xl bg-[#f8f2ed] px-4 py-2.5 text-xs font-semibold text-[#07090b]">Share on X</a>
  </section>;
}
