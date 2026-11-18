"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const field = "mt-2 w-full rounded-xl border border-black/10 bg-[#fbfaf9] px-4 py-3 text-sm outline-none focus:border-black/30";
const button = "rounded-xl bg-[#07090b] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40";

async function post(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/invitations", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({})) as { error?: string; codes?: string[] };
  if (!response.ok) throw new Error(result.error || "Request failed.");
  return result;
}

export function InvitationTools() {
  const router = useRouter();
  const [count, setCount] = useState("10");
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState("1");
  const [codes, setCodes] = useState<string[]>([]);
  const [toggle, setToggle] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function run(action: () => Promise<void>) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); router.refresh(); } catch (e) { setError(e instanceof Error ? e.message : "Request failed."); }
    finally { setBusy(false); }
  }

  return <section className="mt-8 grid gap-5 xl:grid-cols-2">
    <div className="rounded-2xl border border-black/[0.08] bg-white p-5 md:p-6">
      <h2 className="text-lg font-semibold">Generate codes</h2>
      <p className="mt-2 text-xs leading-5 text-black/50">Each code opens the app during early access. Waitlist emails can also create one personal code per recipient automatically with [Invite code].</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-semibold text-black/60">Number<input value={count} onChange={e => setCount(e.target.value)} inputMode="numeric" className={field} /></label>
        <label className="text-xs font-semibold text-black/60">Uses per code<input value={maxUses} onChange={e => setMaxUses(e.target.value)} inputMode="numeric" className={field} /></label>
        <label className="text-xs font-semibold text-black/60">Label (optional)<input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Telegram batch" className={field} /></label>
      </div>
      <button disabled={busy} className={`${button} mt-4`} onClick={() => run(async () => {
        const result = await post({ action: "create", count: Number(count), maxUses: Number(maxUses), label });
        setCodes(result.codes ?? []); setMessage(`${result.codes?.length ?? 0} code(s) created.`);
      })}>Generate</button>
      {codes.length > 0 && <div className="mt-4">
        <textarea readOnly value={codes.join("\n")} rows={Math.min(codes.length, 10)} className={`${field} font-mono`} />
        <button type="button" className="mt-2 text-xs font-semibold underline" onClick={() => navigator.clipboard?.writeText(codes.join("\n"))}>Copy all</button>
      </div>}
    </div>
    <div className="rounded-2xl border border-black/[0.08] bg-white p-5 md:p-6">
      <h2 className="text-lg font-semibold">Switch a code on or off</h2>
      <p className="mt-2 text-xs leading-5 text-black/50">A deactivated code can no longer be used to enter the app or join the waitlist. Sessions already opened with it end within 7 days.</p>
      <label className="mt-4 block text-xs font-semibold text-black/60">Invitation code<input value={toggle} onChange={e => setToggle(e.target.value)} placeholder="ARVO-XXXXX-XXXXX" className={`${field} font-mono`} /></label>
      <div className="mt-4 flex gap-2">
        <button disabled={busy || !toggle.trim()} className={button} onClick={() => run(async () => { await post({ action: "deactivate", code: toggle }); setMessage("Code deactivated."); })}>Deactivate</button>
        <button disabled={busy || !toggle.trim()} className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold disabled:opacity-40" onClick={() => run(async () => { await post({ action: "activate", code: toggle }); setMessage("Code activated."); })}>Activate</button>
      </div>
    </div>
    {(message || error) && <p role={error ? "alert" : "status"} className={`xl:col-span-2 rounded-xl p-4 text-sm ${error ? "bg-red-50 text-red-800" : "bg-[#f8f2ed]"}`}>{error || message}</p>}
  </section>;
}
