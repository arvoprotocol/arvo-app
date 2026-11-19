"use client";
import { useEffect, useState, type ReactNode } from "react";

/** Simple tab strip for long admin pages. Remembers the tab in the address (#live, #planned…). */
export function AdminTabs({ tabs }: { tabs: { id: string; label: string; hint?: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  useEffect(() => {
    const fromHash = () => { const h = window.location.hash.slice(1); if (tabs.some(t => t.id === h)) setActive(h); };
    fromHash(); window.addEventListener("hashchange", fromHash); return () => window.removeEventListener("hashchange", fromHash);
  }, [tabs]);
  return <div className="mt-8">
    <div role="tablist" aria-label="Sections" className="flex flex-wrap gap-1 rounded-2xl border border-black/[0.08] bg-white p-1.5">
      {tabs.map(t => <button key={t.id} role="tab" type="button" aria-selected={active === t.id} aria-controls={`tab-${t.id}`} onClick={() => { setActive(t.id); window.history.replaceState(null, "", `#${t.id}`); }}
        className={`rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition ${active === t.id ? "bg-[#07090b] text-white" : "text-black/65 hover:bg-black/[0.04] hover:text-black"}`}>
        {t.label}{t.hint && <span className={`ml-2 text-xs font-normal ${active === t.id ? "text-white/60" : "text-black/50"}`}>{t.hint}</span>}
      </button>)}
    </div>
    {tabs.map(t => <div key={t.id} id={`tab-${t.id}`} role="tabpanel" hidden={active !== t.id} className="[&>*:first-child]:mt-6">{t.content}</div>)}
  </div>;
}
