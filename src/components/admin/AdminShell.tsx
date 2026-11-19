"use client";
import {internalAppPath, appPath} from "@/lib/protocol/app-url";

import {WalletPicker} from "@/components/protocol/WalletPicker";
import {useWalletConnection} from "@/hooks/useWalletConnection";
import {openWalletPicker} from "@/lib/wallet/client";
import {stakingNetwork} from "@/lib/protocol/links";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Boxes,
  BrainCircuit,
  Coins,
  FolderKanban,
  Gift,
  Handshake,
  KeyRound,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Menu,
  Send,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  LogOut,
  X,
} from "lucide-react";

type AdminNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

type AdminNavGroup = { label: string | null; items: readonly AdminNavItem[] };

// Grouped by job, so the console reads like the app: people, vaults, content, then protocol safety.
const groups: readonly AdminNavGroup[] = [
  { label: null, items: [{ label: "Overview", href: "/app/admin", icon: LayoutDashboard }] },
  { label: "People & access", items: [
    { label: "Waitlist & invites", href: "/app/admin/waitlist", icon: Users },
    { label: "Invite codes", href: "/app/admin/invitations", icon: KeyRound },
    { label: "Partners", href: "/app/admin/partners", icon: Handshake },
    { label: "Emails", href: "/app/admin/emails", icon: Send },
    { label: "Support", href: "/app/admin/support", icon: LifeBuoy },
  ] },
  { label: "Vaults & rewards", items: [
    { label: "Vaults", href: "/app/admin/pools", icon: Boxes },
    { label: "Rewards", href: "/app/admin/rewards", icon: Coins },
    { label: "Shared bonus", href: "/app/admin/bonus", icon: Gift },
    { label: "Protocol allocation", href: "/app/admin/allocation", icon: Landmark },
    { label: "Positions", href: "/app/admin/positions", icon: ListChecks },
  ] },
  { label: "Content", items: [
    { label: "Projects", href: "/app/admin/projects", icon: FolderKanban },
    { label: "Intelligence", href: "/app/admin/intelligence", icon: BrainCircuit },
  ] },
  { label: "Protocol safety", items: [
    { label: "Governance", href: "/app/admin/governance", icon: ShieldCheck },
    { label: "Emergency", href: "/app/admin/emergency", icon: AlertTriangle },
    { label: "Activity", href: "/app/admin/activity", icon: Activity },
    { label: "System", href: "/app/admin/system", icon: Settings },
  ] },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = internalAppPath(usePathname());
  const [signingOut,setSigningOut]=useState(false),[logoutError,setLogoutError]=useState("");
  async function signOut(){if(signingOut)return;setSigningOut(true);setLogoutError("");try{const response=await fetch("/api/admin/auth/session",{method:"DELETE"});if(!response.ok)throw new Error("Unable to sign out. Try again.");window.location.assign("/app/admin");}catch(error){setLogoutError(error instanceof Error?error.message:"Unable to sign out.");setSigningOut(false);}}
  const wallet = useWalletConnection();
  const chainId=Number(process.env.NEXT_PUBLIC_STAKING_CHAIN_ID);
  const network=stakingNetwork(Number.isSafeInteger(chainId)&&chainId>0?chainId:null);
  const configured=Boolean(process.env.NEXT_PUBLIC_STAKING_PROXY_ADDRESS&&process.env.NEXT_PUBLIC_STAKING_RPC_URL&&network.label!=="Preview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderGroups = () => groups.map(group => <div key={group.label ?? "top"} className={group.label ? "mt-4" : ""}>
    {group.label && <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">{group.label}</p>}
    {renderNav(group.items)}
  </div>);

  const renderNav = (items: readonly AdminNavItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      const active =
        item.href === "/app/admin"
          ? pathname === item.href
          : pathname.startsWith(item.href);

      return (
        <Link
          key={item.href}
          href={appPath(item.href)}
          onClick={() => setMobileOpen(false)}
          aria-current={active ? "page" : undefined}
          className={`mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition ${
            active
              ? "bg-white font-semibold text-[#07090b] shadow-sm"
              : "text-white/70 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <Icon size={16} strokeWidth={1.8} />
          <span>{item.label}</span>

          {active && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c9846a]" />
          )}
        </Link>
      );
    });

  return (
    <div className="min-h-screen bg-[#f8f2ed] text-[#07090b]">
      <div className="noise" /><WalletPicker/>

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[264px] overflow-y-auto border-r border-white/10 bg-[#07090b] text-white lg:flex lg:flex-col">
        <div className="px-6 pb-5 pt-7">
          <Link href="https://arvoprotocol.com/" className="inline-flex">
            <Image
              src="/arvo_logo.svg"
              alt="Arvo Protocol"
              width={160}
              height={34}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#c9846a]/25 bg-[#c9846a]/10 px-3 py-1.5">
            <ShieldCheck size={12} className="text-[#e2a98e]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e2a98e]">
              Admin console
            </span>
          </div>
        </div>

        <nav aria-label="Admin" className="px-3 pb-2">{renderGroups()}</nav>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${configured ? "bg-emerald-400" : "bg-amber-400"}`} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                Contract status
              </p>
            </div>

            <p className="mt-3 text-sm font-semibold">{configured?"Connection configured":"Not configured"}</p>
            <p className="mt-1 text-[11px] leading-5 text-white/55">
              {configured?`${network.label} · verify deployment in System.`:"Awaiting staking deployment configuration."}
            </p>
          </div>

          <Link
            href="/app"
            className="mt-4 flex items-center gap-2 px-2 text-xs font-medium text-white/55 transition hover:text-white"
          >
            <ArrowLeft size={13} />
            User app
          </Link>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-40 border-b border-black/[0.07] bg-[#f8f2ed]/90 backdrop-blur-xl">
          <div className="flex min-h-[72px] items-center justify-between gap-5 px-4 md:px-7 lg:px-9 xl:px-11">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open admin navigation"
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white lg:hidden"
              >
                <Menu size={19} />
              </button>

              <span className="hidden items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-black/70 md:inline-flex">
                <span className={`h-1.5 w-1.5 rounded-full ${configured ? "bg-emerald-500" : "bg-amber-500"}`} />
                {network.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" disabled={signingOut} onClick={()=>void signOut()} title="Sign out of admin" className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-black/70 hover:border-black/25 disabled:opacity-40"><LogOut size={15}/><span className="hidden sm:inline">Sign out</span></button>

              <button
                type="button"
                onClick={openWalletPicker}
                title="The wallet used to approve contract changes. Signing in to admin does not connect it."
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#07090b] px-3 text-xs font-semibold text-white sm:px-4"
              >
                <Wallet size={16} />
                {wallet.account?`${wallet.account.slice(0,6)}…${wallet.account.slice(-4)}`:"Connect transaction wallet"}
              </button>
            </div>
          </div>
        </header>

        {logoutError&&<p role="alert" className="px-5 py-3 text-xs text-red-800">{logoutError}</p>}
        <main>{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] bg-[#07090b] text-white lg:hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div>
              <Image
                src="/arvo_logo.svg"
                alt="Arvo Protocol"
                width={155}
                height={32}
                className="h-8 w-auto"
              />
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e2a98e]">
                Admin console
              </p>
            </div>

            <button
              aria-label="Close admin navigation"
              onClick={() => setMobileOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15"
            >
              <X size={19} />
            </button>
          </div>

          <div className="overflow-y-auto px-4 py-5">
            <nav aria-label="Admin">{renderGroups()}</nav>
          </div>
        </div>
      )}
    </div>
  );
}
