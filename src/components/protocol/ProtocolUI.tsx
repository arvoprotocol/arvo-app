import Link from "next/link";
import { ArrowRight, Check, Clock3, Sparkles } from "lucide-react";

export const VAULTS = [
  { name: "Build", days: 60, reward: 3, min: 100000, tag: "Flexible", blurb: "A shorter commitment with a defined 60-day cycle." },
  { name: "Advance", days: 90, reward: 4, min: 100000, tag: "Balanced", blurb: "A balanced step up in commitment and target reward." },
  { name: "Compound", days: 180, reward: 10, min: 100000, tag: "Long term", blurb: "A six-month commitment for participants taking a longer view." },
  { name: "Foundation", days: 365, reward: 22, min: 100000, tag: "Highest reward", blurb: "The longest commitment with the highest target ARVO reward." },
] as const;

export type Vault = (typeof VAULTS)[number];

export function PageTitle({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy?: string; action?: { label: string; href: string } }) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ad7058]">{eyebrow}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">{title}</h1>
        {copy && <p className="mt-3 max-w-2xl text-[15px] leading-6 text-black/48">{copy}</p>}
      </div>
      {action && <Link href={action.href} className="inline-flex items-center gap-2 self-start rounded-xl bg-[#07090b] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(7,9,11,.14)] transition hover:-translate-y-0.5">{action.label}<ArrowRight size={15}/></Link>}
    </div>
  );
}

export function StatCard({ label, value, detail, accent = false, icon }: { label: string; value: string; detail?: string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border p-5 md:p-6 ${accent ? "border-[#c9846a]/30 bg-[linear-gradient(145deg,#fff9f5,#f4ded3)]" : "border-black/[0.08] bg-white/70"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">{label}</p>
        {icon && <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ? "bg-[#c9846a]/12 text-[#9e5e47]" : "bg-black/[0.045] text-black/45"}`}>{icon}</div>}
      </div>
      <p className={`mt-5 font-semibold tracking-[-0.04em] ${value.length > 14 ? "text-xl leading-snug md:text-2xl" : "text-3xl md:text-4xl"}`}>{value}</p>
      {detail && <p className="mt-1.5 text-sm text-black/55">{detail}</p>}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-black/[0.08] bg-white/70 ${className}`}>{children}</div>;
}

export function PanelHeader({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-b border-black/[0.07] px-5 py-5 md:px-6"><div>{eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ad7058]">{eyebrow}</p>}<h2 className="text-xl font-semibold tracking-[-0.03em]">{title}</h2></div>{action}</div>;
}

export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warm" }) {
  const classes = tone === "good" ? "bg-emerald-700/10 text-emerald-800" : tone === "warm" ? "bg-[#c9846a]/13 text-[#96553e]" : "bg-black/[0.055] text-black/55";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] ${classes}`}>{children}</span>;
}

export function VaultProductCard({ vault, onSelect, compact = false }: { vault: Vault; onSelect?: (vault: Vault) => void; compact?: boolean }) {
  const featured = vault.name === "Foundation";

  const number =
    vault.name === "Build"
      ? "01"
      : vault.name === "Advance"
      ? "02"
      : vault.name === "Compound"
      ? "03"
      : "04";

  return (
    <div
      {...(onSelect
        ? {
            onClick: () => onSelect(vault),
            role: "button",
            tabIndex: 0,
          }
        : {})}
      className={`group relative flex min-h-[390px] overflow-hidden rounded-[22px] border bg-[#07090b] text-left text-white transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(7,9,11,.28)] ${
        onSelect ? "cursor-pointer" : ""
      } ${
        featured
          ? "border-[#c9846a]/80 shadow-[0_18px_50px_rgba(185,119,93,.16)]"
          : "border-black/20 shadow-[0_16px_40px_rgba(7,9,11,.14)]"
      }`}
    >
      {/* Strong product accent */}
      <div
        className={`absolute left-0 right-0 top-0 h-[3px] ${
          featured
            ? "bg-[linear-gradient(90deg,#9f6049,#e7ad92,#9f6049)]"
            : "bg-[linear-gradient(90deg,transparent,#c9846a,transparent)]"
        }`}
      />

      {/* Background graphics */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl ${
            featured ? "bg-[#c9846a]/26" : "bg-[#c9846a]/08"
          }`}
        />

        <div className="absolute -right-8 top-20 text-[150px] font-semibold leading-none tracking-[-0.08em] text-white/[0.025]">
          {number}
        </div>

        <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full border border-white/[0.045]" />
        <div className="absolute -bottom-14 -right-6 h-44 w-44 rounded-full border border-[#c9846a]/[0.07]" />
      </div>

      <div className="relative flex w-full flex-col p-6 md:p-7">
        {/* Product number + tag */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold tracking-[0.2em] text-white/25">
            {number}
          </span>

          <span
            className={`rounded-full border px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] ${
              featured
                ? "border-[#c9846a]/30 bg-[#c9846a]/15 text-[#efbda6]"
                : "border-white/10 bg-white/[0.05] text-white/40"
            }`}
          >
            {featured ? "Highest reward" : vault.tag}
          </span>
        </div>

        {/* Vault identity */}
        <div className="mt-7">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d9997b]">
            {vault.days} day vault
          </p>

          <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em] md:text-[34px]">
            {vault.name}
          </h3>

          {!compact && (
            <p className="mt-3 max-w-[280px] text-sm leading-6 text-white/38">
              {vault.blurb}
            </p>
          )}
        </div>

        {/* Reward */}
        <div className="mt-8">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">
            Target reward
          </p>

          <div className="mt-1 flex items-end gap-2">
            <span
              className={`text-[64px] font-semibold leading-none tracking-[-0.075em] ${
                featured ? "text-[#efb99f]" : "text-white"
              }`}
            >
              {vault.reward}%
            </span>

            <span className="pb-1.5 text-[11px] text-white/28">
              per cycle
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8">
          <div className="mb-4 flex items-center justify-between border-t border-white/[0.09] pt-4">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/22">
                Lock period
              </p>
              <p className="mt-1 text-sm font-semibold text-white/75">
                {vault.days} days
              </p>
            </div>

            <div className="text-right">
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/22">
                Minimum
              </p>
              <p className="mt-1 text-sm font-semibold text-white/75">
                {vault.min.toLocaleString()} ARVO
              </p>
            </div>
          </div>

          <div
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
              featured
                ? "bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.35),transparent_28%),linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#8b5cf6_135%)] text-[#07090b] shadow-[inset_0_1px_0_rgba(255,255,255,.34),0_16px_40px_rgba(201,132,106,.22)]"
                : "border border-white/[0.11] bg-white/[0.07] text-white group-hover:border-[#c9846a]/40 group-hover:bg-[#c9846a]/12"
            }`}
          >
            <span>Stake in {vault.name}</span>
            <ArrowRight
              size={15}
              className="transition group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PositionCard({ name, amount, reward, daysRemaining, progress, claimable = false }: { name: string; amount: string; reward: string; daysRemaining: number; progress: number; claimable?: boolean }) {
  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white/75 p-5 md:p-6">
      <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#ad7058]">{name} vault</p><p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{amount}</p></div><StatusPill tone={claimable ? "warm" : "good"}>{claimable ? "Ready" : "Active"}</StatusPill></div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-black/[0.06]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#b9775d,#e2a98e)]" style={{ width: `${progress}%` }} /></div>
      <div className="mt-3 flex justify-between text-xs text-black/38"><span>{progress}% complete</span><span>{claimable ? "Cycle complete" : `${daysRemaining} days remaining`}</span></div>
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-black/[0.07] pt-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/28">Reward</p><p className="mt-1 font-semibold">{reward}</p></div><div className="text-right"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/28">Status</p><p className="mt-1 font-semibold">{claimable ? "Claim available" : "Locked"}</p></div></div>
    </div>
  );
}

export function Benefit({ children }: { children: React.ReactNode }) { return <div className="flex items-center gap-2 text-sm text-black/48"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c9846a]/10 text-[#a9654f]"><Check size={12}/></span>{children}</div>; }
