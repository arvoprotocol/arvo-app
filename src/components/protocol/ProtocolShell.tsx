"use client";
import { GenesisNotice } from "@/components/protocol/GenesisNotice";
import { BuyArvoButton } from "@/components/protocol/BuyArvo";
import {internalAppPath, appPath} from "@/lib/protocol/app-url";

import {SupportNotifications} from "./SupportNotifications";
import {ProtocolHeaderInfo} from "./ProtocolHeaderInfo";
import {ProtocolSidebarFooter} from "./ProtocolSidebarFooter";
import {useWalletConnection} from "@/hooks/useWalletConnection";
import {WalletPicker} from "./WalletPicker";
import {connectStakingWallet} from "@/lib/staking/user-transactions";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuditedBySoken } from "@/components/protocol/SokenBadge";
import { SoundToggle, UiClickSounds } from "@/components/protocol/UiFeedback";
import { IntelligenceWidget } from "@/components/protocol/IntelligenceWidget";
import { Activity, BrainCircuit, ArrowRight, BarChart3, Coins, FolderKanban, Gift, Handshake, Landmark, LayoutDashboard, Menu, PieChart, ShieldCheck, Sparkles, Wallet, Users, X } from "lucide-react";

const nav = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Stake", href: "/app/stake", icon: Coins, featured: true },
  { label: "Portfolio", href: "/app/portfolio", icon: PieChart },
  { label: "Projects", href: "/app/projects", icon: FolderKanban },
  { label: "Intelligence", href: "/app/intelligence", icon: BrainCircuit },
  { label: "Rewards", href: "/app/rewards", icon: Gift },
  { label: "Treasury", href: "/app/treasury", icon: Landmark },
] as const;
const secondary = [
  { label: "Community", href: "/app/community", icon: Users },
  { label: "Governance", href: "/app/governance", icon: BarChart3 },
  { label: "Activity", href: "/app/activity", icon: Activity },
  { label: "Transparency", href: "/app/transparency", icon: ShieldCheck },
  { label: "Partner allocation", href: "/app/allocation", icon: Handshake },
] as const;

export function ProtocolShell({ children }: { children: React.ReactNode }) {
  const pathname = internalAppPath(usePathname());
  const [mobileOpen, setMobileOpen] = useState(false);
  const wallet = useWalletConnection();
  const connected = Boolean(wallet.account);
  const [walletError,setWalletError] = useState("");
  const renderNav = (items: readonly any[]) => items.map((item) => {
    const Icon = item.icon;
    const active = item.href === "/app" ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href+"/");
    return <Link key={item.href} href={appPath(item.href)} onClick={() => setMobileOpen(false)} className={`mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-semibold transition ${active ? "bg-white text-[#07090b] shadow-sm" : item.featured ? "bg-[#c9846a]/12 text-[#edb9a2] hover:bg-[#c9846a]/18" : "text-white/52 hover:bg-white/[0.055] hover:text-white"}`}><Icon size={17} strokeWidth={1.8}/><span>{item.label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c9846a]"/>}</Link>;
  });

  return (
    <div className="arvo-app min-h-screen bg-[#f8f2ed] text-[#07090b]">
      <div className="noise" /><WalletPicker/><UiClickSounds/><IntelligenceWidget hidden={pathname === "/app/intelligence" || pathname.startsWith("/app/intelligence/")}/>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[252px] border-r border-white/10 bg-[#07090b] text-white overflow-y-auto lg:flex lg:flex-col">
        <div className="px-6 pb-5 pt-7"><Link href="https://arvoprotocol.com/" className="inline-flex"><Image src="/arvo_logo.svg" alt="Arvo Protocol" width={160} height={34} className="h-8 w-auto" priority /></Link><div className="mt-3 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/><p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/32">Protocol app</p></div></div>
        <nav className="px-3 pt-3">{renderNav(nav)}</nav>
        <div className="mx-6 my-4 border-t border-white/8" />
        <p className="px-6 pb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/22">Protocol</p>
        <nav className="px-3">{renderNav(secondary)}</nav>
        <div className="mx-6 mt-5"><AuditedBySoken href={appPath("/app/transparency#security")} compact /></div>
        <div className="mx-5 mt-3"><SoundToggle className="text-white/40 hover:bg-white/[0.06] hover:text-white/80"/></div>
        <div className="mt-auto"><ProtocolSidebarFooter/></div>
      </aside>

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-40 border-b border-black/[0.07] bg-[#f8f2ed]/90 backdrop-blur-xl">
          <div className="flex min-h-[72px] bg-[#07090b] text-white lg:bg-transparent lg:text-[#07090b] items-center justify-between gap-3 px-4 md:px-7 lg:px-9 xl:px-11">
            <div className="flex min-w-0 flex-1 items-center gap-2 lg:hidden"><Image src="/arvo_logo.svg" alt="Arvo" width={160} height={34} className="h-8 w-[160px] min-w-0 object-contain object-left"/></div>
            <div className="hidden min-w-0 flex-1 lg:block"><ProtocolHeaderInfo/></div>
            <div className="flex items-center gap-2">
              <SupportNotifications/>
              <BuyArvoButton className="hidden items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#07090b] transition hover:-translate-y-0.5 hover:border-black/25 md:inline-flex"/>
              <Link
                href={appPath("/app/stake")}
                className="group hidden items-center justify-center rounded-xl bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.35),transparent_28%),linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#8b5cf6_135%)] px-4 py-3 text-sm font-semibold text-[#07090b] shadow-[inset_0_1px_0_rgba(255,255,255,.34),0_14px_35px_rgba(201,132,106,.20)] transition duration-300 hover:-translate-y-0.5 sm:inline-flex"
              >
                Stake ARVO
                <ArrowRight
                  size={14}
                  className="ml-2 transition group-hover:translate-x-0.5"
                />
              </Link>

              <button onClick={() => connectStakingWallet().catch(e => setWalletError(e.message))} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-3 text-xs sm:px-4 sm:text-sm font-semibold transition hover:-translate-y-0.5 ${connected ? "border border-black/[0.08] bg-white text-[#07090b]" : "border border-white/15 bg-[#07090b] text-white shadow-[0_10px_24px_rgba(7,9,11,.13)]"}`}><Wallet size={16} className="hidden sm:block"/>{wallet.account ? `${wallet.account.slice(0,6)}…${wallet.account.slice(-4)}` : "Connect wallet"}</button>
              <button aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 lg:hidden"><Menu size={19}/></button>
            </div>
          </div>
          <div className="border-t border-black/[0.04] px-4 py-2 lg:hidden"><ProtocolHeaderInfo/></div>
        </header>
        <GenesisNotice/>
        {walletError && <p role="alert" className="px-5 py-3 text-xs text-red-800">{walletError}</p>}
        <main className="pb-24">{children}</main>
      </div>

      {mobileOpen && <div className="fixed inset-0 z-[80] lg:hidden">
        <button aria-label="Close navigation backdrop" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/55 backdrop-blur-sm"/>
        <div role="dialog" aria-modal="true" aria-label="Navigation" onKeyDown={event => {if(event.key === "Escape") setMobileOpen(false);}} className="absolute inset-0 flex flex-col overflow-y-auto bg-[#07090b] text-white">
          <div className="flex min-h-[72px] items-center justify-between border-b border-white/10 px-4">
            <Image src="/arvo_logo.svg" alt="Arvo" width={160} height={34} className="h-8 w-[160px] min-w-0 object-contain object-left"/>
            <button autoFocus aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10"><X size={19}/></button>
          </div>
          <div className="grid grid-cols-2 gap-2 px-4 pt-5"><BuyArvoButton className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-sm font-semibold text-white"/><Link href={appPath("/app/stake")} onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#a98bf0_135%)] px-3 py-3 text-sm font-semibold text-[#07090b]">Stake ARVO<ArrowRight size={14}/></Link></div>
          <nav className="px-4 py-5">{renderNav(nav)}<div className="my-4 border-t border-white/10"/>{renderNav(secondary)}</nav>
          <div className="px-5 pb-3"><SoundToggle className="text-white/50 hover:bg-white/[0.06] hover:text-white/80"/></div>
          <div className="mt-auto"><ProtocolSidebarFooter onNavigate={()=>setMobileOpen(false)}/></div>
        </div>
      </div>}
    </div>
  );
}
