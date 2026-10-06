import type { Metadata } from "next";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Coins,
  Landmark,
  Repeat,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Treasury",
  description:
    "Explore how the Arvo Treasury supports operating businesses, future acquisitions, liquidity, staking rewards and long-term protocol growth.",
  alternates: {
    canonical: "/treasury",
  },
  openGraph: {
    type: "website",
    url: "/treasury",
    siteName: "Arvo",
    title: "Treasury | Arvo",
    description:
      "Explore how the Arvo Treasury supports operating businesses, future acquisitions, liquidity, staking rewards and long-term protocol growth.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Arvo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Treasury | Arvo",
    description:
      "Explore how the Arvo Treasury supports operating businesses, future acquisitions, liquidity, staking rewards and long-term protocol growth.",
    images: ["/og-image.jpg"],
  },
};

const flow = [
  ["Operating Businesses", "Generate distributable profits"],
  ["Arvo Treasury", "Receives business contributions"],
  ["Capital Allocation", "Funds growth, liquidity, staking and buybacks"],
];

const allocations = [
  {
    title: "Future Investments",
    text: "Acquire or invest in additional operating businesses.",
    icon: Building2,
  },
  {
    title: "Existing Businesses",
    text: "Support growth across the operating portfolio.",
    icon: BarChart3,
  },
  {
    title: "Treasury Reserve",
    text: "Maintain capital strength and strategic flexibility.",
    icon: ShieldCheck,
  },
  {
    title: "Liquidity",
    text: "Support protocol market depth and trading infrastructure.",
    icon: Landmark,
  },
  {
    title: "Staking Rewards",
    text: "Fund reward programmes as the Treasury matures.",
    icon: Coins,
  },
  {
    title: "Buybacks",
    text: "Governance-approved ARVO buyback programmes where appropriate.",
    icon: Repeat,
  },
];

const reporting = [
  ["Monthly", "Operational updates"],
  ["Quarterly", "Treasury & NAV reports"],
  ["Annually", "Strategic review"],
];

export default function TreasuryPage() {
  return (
    <main>
      <div className="noise" />
      <Header />

      <section className="relative overflow-hidden bg-[#07090b] pt-56 pb-28 text-white md:pt-64 md:pb-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(201,143,115,.20),transparent_34%),radial-gradient(circle_at_22%_36%,rgba(139,92,246,.12),transparent_30%),linear-gradient(to_bottom,#07090b,#090d12_60%,#0c1016)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:80px_80px]" />

        <Container className="relative z-10">
          <div className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="mb-7 text-sm font-semibold uppercase tracking-[0.24em] text-[#e2a98e]">
                Arvo Treasury
              </p>

              <h1 className="text-balance text-6xl font-semibold leading-[0.92] tracking-[-0.05em] md:text-[6.25rem]">
                Capital allocated with purpose.
              </h1>

              <p className="mt-8 max-w-2xl text-xl leading-8 text-white/64">
                Operating businesses generate profits. Those profits strengthen
                the Treasury and can fund future investments, liquidity, staking
                rewards and governance-approved buybacks.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button href="https://arvo.gitbook.io/arvo">Read whitepaper</Button>
                <Button href="/vaults" variant="secondary">
                  Explore staking
                </Button>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.035] p-10 backdrop-blur-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/40">
                General Contribution Policy
              </p>

              <div className="mt-6 text-[6.6rem] font-semibold leading-none tracking-[-0.065em] text-[#e2a98e]">
                50%
              </div>

              <p className="mt-6 max-w-md text-lg leading-8 text-white/60">
                Arvo expects operating businesses to contribute approximately
                50% of distributable profits to the Treasury, while retaining
                the balance for operating needs and growth.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#fbf4ef] py-28 text-[#07090b] md:py-36">
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
              Treasury Model
            </p>

            <h2 className="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.045em] md:text-7xl">
              From business profits to capital allocation.
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-7xl gap-6 md:grid-cols-3">
            {flow.map(([title, text], index) => (
              <div
                key={title}
                className="relative min-h-[260px] border border-black/10 bg-white/70 p-10 backdrop-blur"
              >
                <div className="mb-12 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/35">
                    Step {index + 1}
                  </p>

                  {index < flow.length - 1 && (
                    <ArrowRight
                      size={28}
                      strokeWidth={1.5}
                      className="hidden text-[#c9846a] md:block"
                    />
                  )}
                </div>

                <h3 className="max-w-xs text-4xl font-semibold tracking-[-0.045em]">
                  {title}
                </h3>

                <p className="mt-6 text-lg leading-8 text-black/58">{text}</p>
              </div>
            ))}
          </div>

          
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#fcfaf8] py-28 text-[#07090b] md:py-36">
        <Container>
          <div className="mb-16 max-w-4xl">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
              Capital Allocation
            </p>

            <h2 className="text-balance text-4xl font-semibold leading-[1] tracking-[-0.045em] md:text-6xl">
              Treasury capital is allocated across six areas.
            </h2>
          </div>

          <div className="relative overflow-hidden rounded-[36px] border border-black/10 bg-[#07090b] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(201,143,115,.13),transparent_36%),radial-gradient(circle_at_18%_82%,rgba(139,92,246,.10),transparent_34%)]" />

            <div className="relative">
              {allocations.map(({ title, text, icon: Icon }, index) => (
                <div
                  key={title}
                  className="group grid gap-6 border-b border-white/10 p-7 transition-colors duration-300 last:border-b-0 hover:bg-white/[0.035] md:grid-cols-[0.12fr_0.3fr_0.58fr] md:items-center md:p-9"
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e2a98e]">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#e2a98e]/25 bg-[#e2a98e]/10 transition-colors duration-300 group-hover:bg-[#e2a98e]/16">
                      <Icon
                        size={22}
                        strokeWidth={1.45}
                        className="text-[#e2a98e]"
                      />
                    </div>

                    <h3 className="text-2xl font-semibold tracking-[-0.035em]">
                      {title}
                    </h3>
                  </div>

                  <p className="text-base leading-7 text-white/55">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#07090b] py-28 text-white md:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_42%,rgba(201,143,115,.15),transparent_34%),linear-gradient(to_bottom,#07090b,#0c1016)]" />

        <Container className="relative z-10">
          <div className="grid gap-16 lg:grid-cols-[0.42fr_0.58fr]">
            <div>
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-[#e2a98e]">
                Reporting
              </p>

              <h2 className="text-balance text-4xl font-semibold leading-[1] tracking-[-0.045em] md:text-6xl">
                Reporting designed for visibility.
              </h2>

              <p className="mt-7 text-lg leading-8 text-white/60">
                Arvo intends to provide structured reporting across Treasury
                activity, business progress, NAV, capital allocation and
                strategic development.
              </p>
            </div>

            <div className="grid gap-4">
              {reporting.map(([frequency, title]) => (
                <div
                  key={frequency}
                  className="grid gap-6 border border-white/10 bg-white/[0.035] p-7 md:grid-cols-[0.34fr_0.66fr] md:items-center"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/40">
                    {frequency}
                  </p>

                  <p className="text-3xl font-semibold tracking-[-0.04em]">
                    {title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}