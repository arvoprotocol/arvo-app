import type { Metadata } from "next";
import {
  Activity,
  BarChart3,
  Coins,
  FolderKanban,
  Gift,
  Landmark,
  PieChart,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/navigation/Header";
import { PlatformPreview } from "@/components/platform/PlatformPreview";
import { PlatformNotifyForm } from "@/components/platform/PlatformNotifyForm";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://arvoprotocol.com"
  ),
  title: "App | Vaults, Treasury & Portfolio",
  description:
    "Access Arvo vaults, manage positions and follow rewards, Treasury activity, operating projects and protocol activity through the Arvo app.",
  alternates: {
    canonical: "/platform",
  },
  openGraph: {
    title: "Arvo App | Vaults, Treasury & Portfolio",
    description:
      "Vaults, portfolio, rewards, Treasury reporting and operating projects in one place.",
    url: "/platform",
    type: "website",
    images: [
      {
        url: "/platform-og.jpg",
        width: 1200,
        height: 630,
        alt: "Arvo App | Vaults, Treasury & Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arvo App | Vaults, Treasury & Portfolio",
    description:
      "Vaults, portfolio, rewards, Treasury reporting and operating projects in one place.",
    images: ["/platform-og.jpg"],
  },
};

const features = [
  {
    icon: Coins,
    title: "Vaults",
    copy: "Access fixed-term ARVO, USDC and Dual vaults.",
  },
  {
    icon: PieChart,
    title: "Portfolio",
    copy: "Track active positions, commitments and maturity dates.",
  },
  {
    icon: FolderKanban,
    title: "Projects",
    copy: "Follow published projects, milestones and operating progress.",
  },
  {
    icon: Gift,
    title: "Rewards",
    copy: "View rewards, claims, restakes and position history.",
  },
  {
    icon: Landmark,
    title: "Treasury",
    copy: "Follow published allocations, reserves and capital deployment.",
  },
  {
    icon: BarChart3,
    title: "Governance",
    copy: "View proposals and protocol governance activity.",
  },
  {
    icon: Activity,
    title: "Activity",
    copy: "Review protocol activity and your account history.",
  },
];

export default function PlatformPage() {
  return (
    <>
      <Header />

      <main className="overflow-hidden bg-[#07090b] text-white">
        <section className="relative overflow-hidden pb-24 pt-36 md:pb-32 md:pt-44">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[10%] top-[6%] h-[480px] w-[480px] rounded-full bg-[#c9846a]/[0.07] blur-[120px]" />
            <div className="absolute right-[-8%] top-[18%] h-[520px] w-[520px] rounded-full bg-[#8b5cf6]/[0.04] blur-[140px]" />
            <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,transparent,#0b0d10)]" />
          </div>

          <div className="relative mx-auto max-w-[1440px] px-5 md:px-8 lg:px-12">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9846a]/25 bg-[#c9846a]/[0.08] px-4 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e2a98e]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#e2a98e]">
                  Arvo app · Vaults in preparation
                </span>
              </div>

              <h1 className="mt-8 pb-6 text-balance text-[clamp(3.4rem,7.2vw,7.2rem)] font-semibold leading-[1.02] tracking-[-0.055em]">
                Everything Arvo
                <span className="block text-vibrant-metal">in one place.</span>
              </h1>

              <p className="mx-auto mt-7 max-w-2xl text-[17px] leading-7 text-white/45 md:text-xl md:leading-8">
                Access vaults, manage positions and follow rewards, Treasury activity
                and operating projects through the Arvo app.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-[1120px] md:mt-20">
              <PlatformPreview />
            </div>

            <div
              id="platform-notify"
              className="mx-auto mt-16 max-w-[920px] border-t border-white/[0.08] pt-16 text-center md:mt-20 md:pt-20"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d9997b]">
                App access
              </p>

              <h2 className="mx-auto mt-5 text-balance text-4xl font-semibold leading-[1] tracking-[-0.04em] md:text-6xl">
                Join the Arvo waitlist.
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/45 md:text-lg md:leading-8">
                Join the waitlist for Arvo app updates as access begins to
                open. Invitation holders will receive early access ahead of the
                wider release.
              </p>

              <PlatformNotifyForm />
            </div>
          </div>
        </section>

        <section className="relative border-y border-white/[0.07] bg-[#0a0c0f] py-24 md:py-32">
          <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d9997b]">
                  What&apos;s inside
                </p>

                <h2 className="mt-6 max-w-lg text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl">
                  The protocol in one view.
                </h2>

                <p className="mt-7 max-w-lg text-lg leading-8 text-white/50 md:text-xl">
                  Your positions and activity alongside published information
                  from across the Arvo protocol.
                </p>
              </div>

              <div className="grid sm:grid-cols-2">
                {features.map((feature, index) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className={`group border-white/[0.07] py-6 sm:px-6 ${
                        index % 2 === 0 ? "sm:border-r" : ""
                      } ${index < features.length - 2 ? "border-b" : ""}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c9846a]/15 bg-[#c9846a]/[0.07] text-[#e2a98e]">
                          <Icon size={16} strokeWidth={1.7} />
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold tracking-[-0.03em]">
                            {feature.title}
                          </h3>
                          <p className="mt-2 max-w-[280px] text-base leading-7 text-white/45">
                            {feature.copy}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-5 py-24 md:px-8 md:py-32 lg:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c9846a]/[0.055] blur-[150px]" />
          </div>

          <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] border border-[#c9846a]/20 bg-[#0d0d0e] shadow-[0_40px_100px_rgba(0,0,0,.28)]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,132,106,.18),transparent_42%)]" />
              <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-[#c9846a]/[0.06] blur-[110px]" />
              <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] bg-[size:48px_48px]" />
            </div>

            <div className="relative mx-auto max-w-4xl px-6 py-20 text-center md:px-12 md:py-28">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d9997b]">
                Launch status
              </p>

              <h2 className="mx-auto mt-6 text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:whitespace-nowrap md:text-6xl lg:text-7xl">
                Preparing the Arvo vaults.
              </h2>

              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/50 md:text-xl">
                The Arvo app is being prepared for launch, bringing vaults, portfolio management, rewards, Treasury reporting and operating projects into one place, with everything accessible through a single interface.
              </p>

              <div className="mx-auto mt-12 max-w-xl">
                <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-3 md:gap-5">
                  <div className="flex flex-col items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#e2a98e] shadow-[0_0_16px_rgba(226,169,142,.45)]" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/60">
                      Vaults
                    </span>
                  </div>

                  <div className="relative mb-[25px] h-px overflow-hidden bg-white/10">
                    <div className="platform-progress-line absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(90deg,transparent,#e2a98e,transparent)]" />
                  </div>

                  <div className="flex flex-col items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e2a98e] opacity-30" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#e2a98e] shadow-[0_0_18px_rgba(226,169,142,.5)]" />
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#e2a98e]">
                      Testnet
                    </span>
                  </div>

                  <div className="relative mb-[25px] h-px overflow-hidden bg-white/10">
                    <div className="platform-progress-line platform-progress-line-delay absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(90deg,transparent,#e2a98e,transparent)]" />
                  </div>

                  <div className="flex flex-col items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-white/20 bg-white/[0.04]" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
                      Live
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-center text-xs text-white/35">
                  Preparing for testnet deployment
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes platformProgress {
          0% {
            transform: translateX(-120%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateX(240%);
            opacity: 0;
          }
        }

        .platform-progress-line {
          animation: platformProgress 2.8s ease-in-out infinite;
        }

        .platform-progress-line-delay {
          animation-delay: 1.4s;
        }

        @media (prefers-reduced-motion: reduce) {
          .platform-progress-line {
            animation: none;
            opacity: 0.55;
            transform: translateX(50%);
          }
        }
      `}</style>

      <Footer />
    </>
  );
}
