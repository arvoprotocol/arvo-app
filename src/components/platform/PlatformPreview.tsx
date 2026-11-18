"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Coins,
  FolderKanban,
  Gift,
  Landmark,
  LayoutDashboard,
  LockKeyhole,
  PieChart,
  Wallet,
  WalletCards,
} from "lucide-react";

const screens = ["Overview", "Vaults", "Treasury", "Projects"] as const;
type Screen = (typeof screens)[number];

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Vaults", icon: Coins },
  { label: "Portfolio", icon: PieChart },
  { label: "Projects", icon: FolderKanban },
  { label: "Rewards", icon: Gift },
  { label: "Treasury", icon: Landmark },
  { label: "Governance", icon: BarChart3 },
  { label: "Activity", icon: Activity },
];

const vaults = [
  {
    number: "01",
    name: "Build",
    days: 60,
    rewardType: "ARVO",
    tag: "Flexible",
  },
  {
    number: "02",
    name: "Advance",
    days: 90,
    rewardType: "USDG",
    tag: "Balanced",
  },
  {
    number: "03",
    name: "Compound",
    days: 180,
    rewardType: "DUAL",
    tag: "Dual rewards",
  },
  {
    number: "04",
    name: "Foundation",
    days: 365,
    rewardType: "USDG",
    tag: "Extended",
    featured: true,
  },
];

function Summary({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center px-3 py-4">
      <div className="mb-1.5 flex items-center gap-1.5 text-black/40">
        {icon}
        <span className="text-[6px] font-bold uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>

      <div className="truncate text-[12px] font-semibold tracking-[-0.025em] text-[#07090b]">
        {value}
      </div>

      <div className="mt-0.5 text-[6px] font-medium uppercase tracking-[0.12em] text-black/30">
        ARVO
      </div>
    </div>
  );
}

function PositionRow({
  name,
  amount,
  reward,
  progress,
  remaining,
  claimable = false,
}: {
  name: string;
  amount: string;
  reward: string;
  progress: number;
  remaining: string;
  claimable?: boolean;
}) {
  return (
    <div className="grid grid-cols-[.9fr_.9fr_1.25fr_.85fr] items-center gap-3 py-3">
      <div>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              claimable ? "bg-[#c9846a]" : "bg-emerald-600"
            }`}
          />
          <p className="text-[8px] font-semibold text-[#07090b]">{name}</p>
        </div>

        <p className="mt-1 pl-3 text-[5px] font-bold uppercase tracking-[0.12em] text-black/28">
          {claimable ? "Ready to claim" : "Active vault"}
        </p>
      </div>

      <div>
        <p className="text-[5px] font-bold uppercase tracking-[0.12em] text-black/28">
          Staked
        </p>
        <p className="mt-1 text-[7px] font-semibold text-[#07090b]">
          {amount}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-[5px] font-bold uppercase tracking-[0.12em] text-black/28">
            Progress
          </p>
          <p className="text-[5px] font-semibold text-black/35">
            {progress}%
          </p>
        </div>

        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#b9775d,#e2a98e)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-1 text-[5px] text-black/32">{remaining}</p>
      </div>

      <div className="text-right">
        <p className="text-[5px] font-bold uppercase tracking-[0.12em] text-black/28">
          Reward
        </p>
        <p
          className={`mt-1 text-[7px] font-semibold ${
            claimable ? "text-[#a9654f]" : "text-[#07090b]"
          }`}
        >
          {reward}
        </p>
      </div>
    </div>
  );
}

function MiniVaultCard({
  vault,
}: {
  vault: (typeof vaults)[number];
}) {
  return (
    <div
      className={`relative flex min-h-[182px] overflow-hidden rounded-xl border bg-[#07090b] text-white ${
        vault.featured
          ? "border-[#c9846a]/80 shadow-[0_12px_30px_rgba(185,119,93,.14)]"
          : "border-black/20"
      }`}
    >
      <div
        className={`absolute left-0 right-0 top-0 h-[2px] ${
          vault.featured
            ? "bg-[linear-gradient(90deg,#9f6049,#e7ad92,#9f6049)]"
            : "bg-[linear-gradient(90deg,transparent,#c9846a,transparent)]"
        }`}
      />

      <div className="pointer-events-none absolute -right-5 top-10 text-[72px] font-semibold leading-none tracking-[-0.08em] text-white/[0.025]">
        {vault.number}
      </div>

      <div className="relative flex w-full flex-col p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[5px] font-bold tracking-[0.18em] text-white/25">
            {vault.number}
          </span>

          <span
            className={`rounded-full border px-2 py-1 text-[5px] font-bold uppercase tracking-[0.11em] ${
              vault.featured
                ? "border-[#c9846a]/30 bg-[#c9846a]/15 text-[#efbda6]"
                : "border-white/10 bg-white/[0.05] text-white/40"
            }`}
          >
            {vault.tag}
          </span>
        </div>

        <div className="mt-3">
          <p className="text-[5px] font-bold uppercase tracking-[0.15em] text-[#d9997b]">
            {vault.days} day vault
          </p>

          <h4 className="mt-1 text-[13px] font-semibold tracking-[-0.04em]">
            {vault.name}
          </h4>
        </div>

        <div className="mt-4">
          <p className="text-[5px] font-bold uppercase tracking-[0.14em] text-white/25">
            Rewards
          </p>

          <div className="mt-1 flex items-end gap-1.5">
            <span
              className={`text-[27px] font-semibold leading-none tracking-[-0.06em] ${
                vault.featured ? "text-[#efb99f]" : "text-white"
              }`}
            >
              {vault.rewardType}
            </span>
          </div>

          <p className="mt-1.5 text-[5px] leading-3 text-white/28">
            {vault.rewardType === "DUAL"
              ? "ARVO + USDG rewards"
              : `Rewards distributed in ${vault.rewardType}`}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-white/[0.08] pt-3">
          <div>
            <p className="text-[5px] font-bold uppercase tracking-[0.1em] text-white/22">
              Stake asset
            </p>
            <p className="mt-0.5 text-[6px] font-semibold text-white/70">
              ARVO
            </p>
          </div>

          <div className="text-right">
            <p className="text-[5px] font-bold uppercase tracking-[0.1em] text-white/22">
              Lock period
            </p>
            <p className="mt-0.5 text-[6px] font-semibold text-white/70">
              {vault.days} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewScreen() {
  return (
    <div className="text-[#07090b]">
      <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#ad7058]">
        Overview
      </p>

      <h3 className="mt-1 text-[24px] font-semibold tracking-[-0.05em] text-[#07090b]">
        Your Arvo.
      </h3>

      <p className="mt-1 text-[8px] leading-4 text-black/48">
        Your balance, active positions and available vaults.
      </p>

      <section className="mt-4 overflow-hidden rounded-xl border border-black/[0.08] bg-white/75">
        <div className="grid grid-cols-[1.25fr_1fr]">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/[0.045] text-black/45">
                <WalletCards size={11} />
              </div>

              <p className="text-[6px] font-bold uppercase tracking-[0.16em] text-black/35">
                Total ARVO
              </p>
            </div>

            <div className="mt-4 flex items-end gap-2">
              <p className="text-[29px] font-semibold tracking-[-0.06em] text-[#07090b]">
                226,734
              </p>
              <p className="pb-1 text-[7px] font-semibold text-black/30">
                ARVO
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 border-l border-black/[0.07]">
            <Summary
              icon={<WalletCards size={9} />}
              label="Available"
              value="84,294"
            />
            <Summary
              icon={<LockKeyhole size={9} />}
              label="Staked"
              value="142,440"
            />
            <Summary
              icon={<Coins size={9} />}
              label="Rewards"
              value="2,842"
            />
          </div>
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-2.5 flex items-end justify-between">
          <div>
            <p className="text-[6px] font-bold uppercase tracking-[0.15em] text-[#ad7058]">
              Staking vaults
            </p>
            <h4 className="mt-0.5 text-[12px] font-semibold tracking-[-0.03em] text-[#07090b]">
              Choose your vault.
            </h4>
          </div>

          <span className="text-[6px] font-semibold text-black/40">
            Compare vaults
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {vaults.map((vault) => (
            <div
              key={vault.name}
              className="rounded-lg bg-[#07090b] px-2.5 py-2.5 text-white"
            >
              <p className="text-[4px] font-bold uppercase tracking-[0.12em] text-[#d9997b]">
                {vault.days} days
              </p>
              <p className="mt-1 text-[7px] font-semibold">{vault.name}</p>
              <p className="mt-2 text-[12px] font-semibold tracking-[-0.04em]">
                {vault.rewardType}
              </p>
              <p className="text-[4px] text-white/28">rewards</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-xl border border-black/[0.08] bg-white/70">
        <div className="flex items-center justify-between border-b border-black/[0.07] px-4 py-2.5">
          <div>
            <p className="text-[5px] font-bold uppercase tracking-[0.15em] text-[#ad7058]">
              Your stakes
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-[#07090b]">
              Active positions
            </p>
          </div>

          <span className="text-[5px] font-semibold text-black/40">
            View portfolio
          </span>
        </div>

        <div className="divide-y divide-black/[0.06] px-4">
          <PositionRow
            name="Foundation"
            amount="84,000 ARVO"
            reward="25,200 ARVO"
            progress={77}
            remaining="84 days remaining"
          />

          <PositionRow
            name="Compound"
            amount="42,500 ARVO"
            reward="5,950 ARVO"
            progress={82}
            remaining="32 days remaining"
          />
        </div>
      </section>
    </div>
  );
}

function VaultsScreen() {
  return (
    <div className="text-[#07090b]">
      <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#ad7058]">
        Vaults
      </p>

      <h3 className="mt-1 text-[24px] font-semibold tracking-[-0.05em] text-[#07090b]">
        Choose your vault.
      </h3>

      <p className="mt-1 text-[8px] leading-4 text-black/48">
        Stake ARVO across defined lock periods, with ARVO, USDG and dual reward structures.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {vaults.map((vault) => (
          <MiniVaultCard key={vault.name} vault={vault} />
        ))}
      </div>
    </div>
  );
}

function TreasuryScreen() {
  const allocation = [
    { label: "Acquisitions", value: "38%", width: 38 },
    { label: "Growth capital", value: "26%", width: 26 },
    { label: "Reserves", value: "21%", width: 21 },
    { label: "Protocol", value: "15%", width: 15 },
  ];

  return (
    <div className="text-[#07090b]">
      <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#ad7058]">
        Treasury
      </p>

      <h3 className="mt-1 text-[24px] font-semibold tracking-[-0.05em] text-[#07090b]">
        Treasury overview.
      </h3>

      <p className="mt-1 text-[8px] leading-4 text-black/48">
        Published capital allocation and protocol activity.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          ["Treasury value", "$18.4M", "Published value"],
          ["Businesses", "5", "Operating assets"],
          ["Reporting", "Live", "Protocol visibility"],
        ].map(([label, value, detail]) => (
          <div
            key={label}
            className="rounded-xl border border-black/[0.08] bg-white/75 p-4"
          >
            <p className="text-[5px] font-bold uppercase tracking-[0.14em] text-black/35">
              {label}
            </p>
            <p className="mt-3 text-[20px] font-semibold tracking-[-0.05em] text-[#07090b]">
              {value}
            </p>
            <p className="mt-1 text-[6px] text-black/38">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-[1.2fr_.8fr] gap-3">
        <div className="rounded-xl border border-black/[0.08] bg-white/75 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[5px] font-bold uppercase tracking-[0.15em] text-[#ad7058]">
                Treasury
              </p>
              <p className="mt-1 text-[11px] font-semibold text-[#07090b]">
                Capital allocation
              </p>
            </div>

            <Landmark size={12} className="text-black/30" />
          </div>

          <div className="mt-5 space-y-3">
            {allocation.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between">
                  <span className="text-[6px] font-medium text-black/45">
                    {item.label}
                  </span>
                  <span className="text-[6px] font-semibold text-[#07090b]">
                    {item.value}
                  </span>
                </div>

                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#b9775d,#e2a98e)]"
                    style={{ width: `${item.width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#07090b] p-4 text-white">
          <Activity size={13} className="text-[#e2a98e]" />

          <p className="mt-5 text-[5px] font-bold uppercase tracking-[0.15em] text-white/28">
            Reporting
          </p>

          <p className="mt-1 text-[12px] font-semibold text-white">
            Treasury activity
          </p>

          <p className="mt-2 text-[7px] leading-4 text-white/38">
            Follow published capital deployment, reserves and protocol
            activity.
          </p>

          <div className="mt-6 flex items-center gap-1.5 text-[6px] font-semibold text-[#e2a98e]">
            View activity
            <ArrowRight size={8} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsScreen() {
  const projects = [
    {
      title: "Land development 01",
      status: "Auction",
      detail: "6.2 acres · 13 plots",
      progress: "4 / 13 sold",
    },
    {
      title: "Land development 02",
      status: "Active",
      detail: "4.8 acres · 9 plots",
      progress: "Subdivision",
    },
  ];

  return (
    <div className="text-[#07090b]">
      <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#ad7058]">
        Live projects
      </p>

      <h3 className="mt-1 text-[24px] font-semibold tracking-[-0.05em] text-[#07090b]">
        Treasury capital at work.
      </h3>

      <p className="mt-1 text-[8px] leading-4 text-black/48">
        Follow acquisitions, subdivisions and auction activity across Arvo
        operating projects.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {projects.map((project, index) => (
          <div
            key={project.title}
            className="overflow-hidden rounded-xl border border-black/[0.08] bg-white/75"
          >
            <div className="relative h-[112px] overflow-hidden bg-[linear-gradient(145deg,#e9e1db,#d8cec7)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(201,132,106,.18),transparent_30%)]" />

              <div className="absolute left-[18%] top-[18%] h-[62px] w-[130px] rotate-[-5deg] border border-black/10" />
              <div className="absolute left-[40%] top-[31%] h-[54px] w-[105px] rotate-[9deg] border border-[#a9654f]/20" />

              <span className="absolute left-3 top-3 rounded-full bg-white/80 px-2 py-1 text-[5px] font-bold uppercase tracking-[0.12em] text-[#96553e]">
                {project.status}
              </span>

              <span className="absolute bottom-3 right-3 text-[28px] font-semibold tracking-[-0.06em] text-black/[0.055]">
                0{index + 1}
              </span>
            </div>

            <div className="p-4">
              <p className="text-[11px] font-semibold text-[#07090b]">
                {project.title}
              </p>

              <p className="mt-1 text-[6px] text-black/38">
                South East, United Kingdom
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-black/[0.06] pt-3">
                <div>
                  <p className="text-[5px] font-bold uppercase tracking-[0.11em] text-black/28">
                    Site
                  </p>
                  <p className="mt-1 text-[7px] font-semibold text-[#07090b]">
                    {project.detail}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[5px] font-bold uppercase tracking-[0.11em] text-black/28">
                    Progress
                  </p>
                  <p className="mt-1 text-[7px] font-semibold text-[#07090b]">
                    {project.progress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-black/[0.06] bg-black/[0.025] px-3.5 py-3">
        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9846a]" />
        <p className="text-[6px] leading-3 text-black/38">
          Project information provides visibility into Arvo operating activity.
        </p>
      </div>
    </div>
  );
}

function ScreenContent({ screen }: { screen: Screen }) {
  if (screen === "Vaults") return <VaultsScreen />;
  if (screen === "Treasury") return <TreasuryScreen />;
  if (screen === "Projects") return <ProjectsScreen />;

  return <OverviewScreen />;
}

export function PlatformPreview() {
  const [screenIndex, setScreenIndex] = useState(0);
  const screen = screens[screenIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setScreenIndex((current) => (current + 1) % screens.length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[1080px]">
      <div className="pointer-events-none absolute -inset-16 bg-[radial-gradient(circle_at_50%_45%,rgba(201,132,106,.12),transparent_48%)] blur-2xl" />

      <div className="relative overflow-hidden rounded-[18px] border border-white/[0.14] bg-[#f8f2ed] shadow-[0_50px_120px_rgba(0,0,0,.48)]">
        <div className="flex h-[560px] md:h-[600px]">
          <aside className="hidden w-[176px] shrink-0 bg-[#07090b] p-4 text-white sm:block">
            <div className="relative h-7 w-[82px]">
              <Image
                src="/arvo-white.svg"
                alt="Arvo"
                fill
                sizes="82px"
                className="object-contain object-left"
              />
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[5px] font-bold uppercase tracking-[0.18em] text-white/30">
                Protocol app
              </span>
            </div>

            <nav className="mt-7">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = item.label === screen;
                const index = screens.indexOf(item.label as Screen);

                return (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => {
                      if (index >= 0) setScreenIndex(index);
                    }}
                    className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[8px] font-semibold transition ${
                      active
                        ? "bg-white text-[#07090b]"
                        : "text-white/38 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <Icon size={10} strokeWidth={1.8} />
                    {item.label}

                    {active && (
                      <span className="ml-auto h-1 w-1 rounded-full bg-[#c9846a]" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-white/[0.07] pt-4">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
                <Landmark size={10} className="text-[#e2a98e]" />

                <p className="mt-3 text-[5px] font-bold uppercase tracking-[0.15em] text-white/25">
                  Treasury
                </p>

                <p className="mt-1 text-[14px] font-semibold text-white">
                  $18.4M
                </p>

                <p className="mt-1 text-[6px] text-white/25">
                  5 operating businesses
                </p>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1 bg-[#f8f2ed] text-[#07090b]">
            <div className="flex h-14 items-center justify-between border-b border-black/[0.06] bg-[#f8f2ed] px-4 md:px-5">
              <div className="h-6 w-[70px] sm:hidden">
                <img
                  src="/arvo-logo-mobile.svg"
                  alt="Arvo"
                  className="block h-6 w-[70px] object-contain object-left"
                />
              </div>

              <p className="hidden text-[6px] font-bold uppercase tracking-[0.15em] text-black/25 sm:block">
                Arvo protocol
              </p>

              <div className="flex items-center gap-2">
                <span className="hidden rounded-lg bg-[linear-gradient(135deg,#b9775d,#e2a98e,#f0d2b0)] px-3 py-2 text-[7px] font-semibold text-[#07090b] md:block">
                  Stake ARVO
                </span>

                <span className="flex items-center gap-1.5 rounded-lg bg-[#07090b] px-3 py-2 text-[7px] font-semibold text-white">
                  <Wallet size={9} />
                  Connect wallet
                </span>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <div className="mb-3 flex justify-end gap-1.5">
                {screens.map((item, index) => (
                  <button
                    type="button"
                    aria-label={`Show ${item}`}
                    key={item}
                    onClick={() => setScreenIndex(index)}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      index === screenIndex
                        ? "w-6 bg-[#c9846a]"
                        : "w-2 bg-black/10"
                    }`}
                  />
                ))}
              </div>

              <div key={screen} className="platform-screen-enter">
                <ScreenContent screen={screen} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
