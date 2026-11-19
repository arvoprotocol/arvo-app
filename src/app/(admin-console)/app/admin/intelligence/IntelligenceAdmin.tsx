"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitle, Panel, PanelHeader, StatCard, StatusPill } from "@/components/protocol/ProtocolUI";
import { appPath } from "@/lib/protocol/app-url";

const DOC_TYPES: Record<string, string> = {
  title_register: "Title register", title_plan: "Title plan", legal_pack: "Auction legal pack", planning: "Planning document",
  survey: "Survey or report", comparables: "Comparable sales", location: "Location information", other: "Other document",
};
type Project = { id: number; title: string; publishStatus: string; enabled: boolean };
type Doc = { id: number; projectId: number; title: string; docType: string; source: string | null; pages: number; status: string; chunks: number; documentDate: string | null; createdAt: string };
type Question = { id: number; projectId: number; question: string; summary: string; rating: number | null; feedback: string | null; createdAt: string };

const field = "mt-2 w-full rounded-xl border border-black/10 bg-[#fbfaf9] px-4 py-3 text-sm outline-none focus:border-black/30";
const when = (iso: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(new Date(iso));

export function IntelligenceAdmin({ configured, model, projects, documents, questions, usage }: { configured: boolean; model: string; projects: Project[]; documents: Doc[]; questions: Question[]; usage: { questions: number; inputTokens: number; outputTokens: number } }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const titles = new Map(projects.map(p => [p.id, p.title]));

  async function run(action: () => Promise<string>) {
    setBusy(true); setError(""); setMessage("");
    try { setMessage(await action()); router.refresh(); } catch (e) { setError(e instanceof Error ? e.message : "Request failed."); }
    finally { setBusy(false); }
  }
  async function json(payload: Record<string, unknown>) {
    const r = await fetch("/api/admin/intelligence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const body = await r.json().catch(() => ({})) as { error?: string };
    if (!r.ok) throw new Error(body.error || "Request failed.");
  }

  return <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
    <PageTitle eyebrow="Beta" title="Arvo Intelligence." copy="Choose projects, add their documents and review questions. Only text extracted from PDFs is stored; original files are not kept or shown to users." />
    {!configured && <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">ANTHROPIC_API_KEY is not set on this server, so users cannot ask questions yet. Add it to .env.local and restart.</p>}
    <section className="mt-7 grid gap-4 sm:grid-cols-3">
      <StatCard label="Questions (30 days)" value={usage.questions.toLocaleString()} />
      <StatCard label="Tokens in / out (30 days)" value={`${usage.inputTokens.toLocaleString()} / ${usage.outputTokens.toLocaleString()}`} detail={`Model ${model}`} />
      <StatCard label="Projects enabled" value={String(projects.filter(p => p.enabled).length)} detail="Only published projects are shown to users" />
    </section>
    <p className="mt-3 text-xs"><a className="font-semibold underline" href={appPath("/app/intelligence")}>Open the user view</a></p>
    {(message || error) && <p role={error ? "alert" : "status"} className={`mt-6 rounded-xl p-4 text-sm ${error ? "bg-red-50 text-red-800" : "bg-[#f8f2ed]"}`}>{error || message}</p>}

    <Panel className="mt-8"><PanelHeader eyebrow="Step 1" title="Projects in the beta" /><div className="divide-y divide-black/[0.06] px-5 md:px-6">
      {projects.length === 0 && <p className="py-5 text-sm text-black/50">No projects yet. Create one under Projects.</p>}
      {projects.map(p => <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div><p className="text-sm font-semibold">{p.title}</p><p className="text-xs text-black/45">{p.publishStatus === "published" ? "Published" : "Not published: hidden from users even if enabled"} · {documents.filter(d => d.projectId === p.id && d.status === "ready").length} ready document(s)</p></div>
        <button disabled={busy} onClick={() => run(async () => { await json({ action: "enable", projectId: p.id, enabled: !p.enabled }); return p.enabled ? "Project removed from the beta." : "Project added to the beta."; })} className={`rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-40 ${p.enabled ? "bg-[#07090b] text-white" : "border border-black/15"}`}>{p.enabled ? "Enabled · turn off" : "Enable"}</button>
      </div>)}
    </div></Panel>

    <Panel className="mt-8"><PanelHeader eyebrow="Step 2" title="Add a document (PDF, up to 20 MB)" /><form ref={form} className="grid gap-4 p-5 md:grid-cols-2 md:p-6" onSubmit={e => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      run(async () => {
        const r = await fetch("/api/admin/intelligence", { method: "POST", body: data });
        const body = await r.json().catch(() => ({})) as { error?: string; document?: { status: string; pages: number; chunks: number } };
        if (!r.ok || !body.document) throw new Error(body.error || "Upload failed.");
        form.current?.reset();
        return body.document.status === "ready" ? `Added: ${body.document.pages} pages, ${body.document.chunks} passages indexed.` : "Added, but no text was found. It looks like a scanned PDF; upload a text-searchable version.";
      });
    }}>
      <label className="text-xs font-semibold text-black/60">Project<select name="projectId" required className={field}>{projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
      <label className="text-xs font-semibold text-black/60">Document type<select name="docType" required className={field}>{Object.entries(DOC_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label className="text-xs font-semibold text-black/60">Title shown with citations<input name="title" required maxLength={160} placeholder="e.g. Official copy of register" className={field} /></label>
      <label className="text-xs font-semibold text-black/60">Document date<input name="documentDate" type="date" className={field} /></label>
      <label className="text-xs font-semibold text-black/60 md:col-span-2">Source (optional, not shown to users)<input name="source" maxLength={300} placeholder="e.g. HM Land Registry, auction house legal pack" className={field} /></label>
      <label className="text-xs font-semibold text-black/60 md:col-span-2">PDF<input name="file" type="file" accept="application/pdf" required className={field} /></label>
      <p className="text-xs leading-5 text-black/45 md:col-span-2">Users never see or download the file. Answers quote facts with the title, page and date above, and personal details (names, addresses, contact details of private individuals) are withheld.</p>
      <button disabled={busy} className="w-fit rounded-xl bg-[#07090b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy ? "Working…" : "Upload and index"}</button>
    </form></Panel>

    <Panel className="mt-8"><PanelHeader eyebrow="Library" title="Documents" action={<StatusPill>{documents.length} total</StatusPill>} /><div className="overflow-x-auto px-5 pb-4 md:px-6">
      {documents.length === 0 ? <p className="py-5 text-sm text-black/50">No documents yet.</p> : <table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-black/10 text-xs text-black/45"><th className="py-3 pr-3">Project</th><th className="px-3">Title</th><th className="px-3">Type</th><th className="px-3">Date</th><th className="px-3">Pages</th><th className="px-3">Status</th><th className="pl-3" /></tr></thead><tbody>
        {documents.map(d => <tr key={d.id} className="border-b border-black/[0.06]"><td className="py-3 pr-3 text-xs">{titles.get(d.projectId) ?? `#${d.projectId}`}</td><td className="px-3 font-medium">{d.title}</td><td className="px-3 text-xs">{DOC_TYPES[d.docType] ?? d.docType}</td><td className="px-3 text-xs">{d.documentDate ?? "–"}</td><td className="px-3 text-xs">{d.pages}</td><td className="px-3 text-xs">{d.status === "ready" ? `Ready · ${d.chunks} passages` : "No text found"}</td>
          <td className="pl-3"><button disabled={busy} onClick={() => { if (window.confirm(`Delete “${d.title}” and its indexed text?`)) run(async () => { await json({ action: "delete", documentId: d.id }); return "Document deleted."; }); }} className="text-xs font-semibold text-red-700 disabled:opacity-40">Delete</button></td></tr>)}
      </tbody></table>}
    </div></Panel>

    <Panel className="mt-8"><PanelHeader eyebrow="Review" title="Recent questions" /><div className="divide-y divide-black/[0.06] px-5 md:px-6">
      {questions.length === 0 && <p className="py-5 text-sm text-black/50">No questions yet.</p>}
      {questions.map(q => <div key={q.id} className="py-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{q.question}</p><span className="text-xs text-black/45">{titles.get(q.projectId) ?? `#${q.projectId}`} · {when(q.createdAt)}{q.rating === 1 ? " · 👍" : q.rating === -1 ? " · 👎" : ""}</span></div>
        <p className="mt-1 text-sm text-black/60">{q.summary}</p>
        {q.feedback && <p className="mt-1 text-xs text-amber-800">Feedback: {q.feedback}</p>}
      </div>)}
    </div></Panel>
  </div>;
}
