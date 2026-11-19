import Link from "next/link";
import { Sparkles } from "lucide-react";

const button = "inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(110deg,#c9846a,#f0d2b0,#bba0ce)] px-5 py-3 text-sm font-semibold text-[#07090b] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4";

/** "Explore linked vaults": goes to the vaults for this project, or, when none exist yet, shows the project's planned-vault note. */
export function LinkedVaults({ slug, hash, count, title, note }: { slug: string; hash?: string; count: number; title: string; note?: string }) {
  const info = <details className="group relative"><summary aria-label="About project vaults" className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-full border border-black/15 text-sm font-semibold text-black/60 [&::-webkit-details-marker]:hidden">i</summary><p className="absolute right-0 top-10 z-20 w-64 rounded-2xl border border-black/10 bg-white p-4 text-xs leading-5 shadow-lg">Stake in a vault linked to this project, when available. Each vault has its own deposit terms and rewards. This does not grant ownership of the project.</p></details>;
  if (count > 0 || !note) {
    const href = `/app/stake?project=${encodeURIComponent(slug)}${hash ? `&hash=${hash}` : ""}`;
    return <div className="flex items-center gap-3"><Link href={href} className={button}>Explore linked vaults →</Link>{info}</div>;
  }
  return <details className="group relative">
    <summary className={`${button} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>Explore linked vaults →</summary>
    <div role="dialog" aria-label={`Vaults for ${title}`} className="absolute right-0 top-14 z-30 w-[min(26rem,calc(100vw-3rem))] overflow-hidden rounded-[22px] border border-[#c9846a]/30 bg-[#0b0a09] p-6 text-white shadow-[0_24px_70px_rgba(7,9,11,.35)]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#c9846a]/20 blur-3xl" />
      <p className="relative flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e2a98e]"><Sparkles size={13} />Vault coming soon</p>
      <p className="relative mt-3 text-lg font-semibold tracking-[-0.02em]">{title}</p>
      <div className="relative mt-3 space-y-3 text-sm leading-6 text-white/75">{note.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}</div>
      <p className="relative mt-5 border-t border-white/10 pt-3 text-[11px] leading-5 text-white/50">Plans can change before a vault opens. Staking does not give ownership of the project.</p>
    </div>
  </details>;
}
