import type { Metadata } from "next";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";
import {
  ArrowRight,
  Building2,
  FileText,
  Landmark,
  Layers3,
  LineChart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Explore the Arvo roadmap from protocol foundation and the first operating business through Treasury growth, portfolio expansion and protocol maturity.",
  alternates: {
    canonical: "/roadmap",
  },
  openGraph: {
    type: "website",
    url: "/roadmap",
    siteName: "Arvo",
    title: "Roadmap | Arvo",
    description:
      "Explore the Arvo roadmap from protocol foundation and the first operating business through Treasury growth, portfolio expansion and protocol maturity.",
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
    title: "Roadmap | Arvo",
    description:
      "Explore the Arvo roadmap from protocol foundation and the first operating business through Treasury growth, portfolio expansion and protocol maturity.",
    images: ["/og-image.jpg"],
  },
};

const phases = [
  {
    number: "01",
    phase: "Phase One",
    title: "Foundation",
    text: "Establish the legal, operational and technical foundations required to launch the Arvo protocol.",
    icon: FileText,
    items: [
      "Corporate structure",
      "Legal and governance documentation",
      "Whitepaper and website",
      "ARVO token deployment",
      "Initial Treasury framework",
      "Liquidity and staking preparation",
    ],
  },
  {
    number: "02",
    phase: "Phase Two",
    title: "First Operating Business",
    text: "Deploy capital into the first land-focused operating model and begin recycling capital through completed transactions.",
    icon: Building2,
    items: [
      "Initial land acquisitions",
      "Subdivision and positioning",
      "Auction-led land sales",
      "First Treasury contributions",
      "Treasury and NAV reporting",
    ],
  },
  {
    number: "03",
    phase: "Phase Three",
    title: "Treasury Growth",
    text: "Strengthen the Treasury so it can support future investments, liquidity, staking rewards and protocol growth.",
    icon: Landmark,
    items: [
      "Grow Treasury assets",
      "Increase liquidity",
      "Expand staking rewards",
      "Introduce Treasury-funded rewards",
      "Evaluate further investment opportunities",
    ],
  },
  {
    number: "04",
    phase: "Phase Four",
    title: "Portfolio Expansion",
    text: "Expand beyond the first operating model into additional sectors where the team has experience or strategic advantage.",
    icon: Layers3,
    items: [
      "Software businesses",
      "Artificial intelligence",
      "Digital infrastructure",
      "Ecommerce",
      "Established private businesses",
    ],
  },
  {
    number: "05",
    phase: "Phase Five",
    title: "Protocol Maturity",
    text: "Build a diversified operating portfolio supported by a stronger Treasury, reporting structure and governance model.",
    icon: LineChart,
    items: [
      "Multiple operating sectors",
      "Recurring operating profits",
      "Expanded governance",
      "Stronger staking programmes",
      "Ongoing capital allocation",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <main>
      <div className="noise" />
      <Header />

      <section className="relative overflow-hidden bg-[#07090b] pt-56 pb-28 text-white md:pt-64 md:pb-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(201,143,115,.20),transparent_34%),radial-gradient(circle_at_22%_36%,rgba(139,92,246,.12),transparent_30%),linear-gradient(to_bottom,#07090b,#090d12_60%,#0c1016)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:80px_80px]" />

        <Container className="relative z-10">
          <div className="max-w-6xl">
            <p className="mb-7 text-sm font-semibold uppercase tracking-[0.24em] text-[#e2a98e]">
              Growth Roadmap
            </p>

            <h1 className="text-balance text-6xl font-semibold leading-[0.92] tracking-[-0.05em] md:text-[6.25rem]">
              A staged path to Treasury growth.
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-8 text-white/64">
              Arvo moves from legal and technical foundation, to the first
              operating business, to Treasury growth and future portfolio
              expansion.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button href="https://arvo.gitbook.io/arvo">Read whitepaper</Button>
              <Button href="/treasury" variant="secondary">
                View treasury
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#fbf4ef] py-28 text-[#07090b] md:py-36">
        <Container>
          <div className="relative mx-auto max-w-6xl">
            <div className="absolute left-[22px] top-8 hidden h-[calc(100%-64px)] w-px bg-black/10 lg:block" />

            <div className="space-y-14">
              {phases.map((phase, index) => {
                const Icon = phase.icon;
                const isDark = index === 1 || index === 3;

                return (
                  <div
                    key={phase.title}
                    className={`relative grid gap-10 overflow-hidden border p-8 md:p-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-start ${
                      isDark
                        ? "border-black/10 bg-[#07090b] text-white"
                        : "border-black/10 bg-white/65"
                    }`}
                  >
                    {isDark && (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_36%,rgba(201,143,115,.14),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(139,92,246,.10),transparent_35%)]" />
                    )}

                    <div className="relative z-10">
                      <div className="mb-8 flex items-center gap-5">
                        <div
                          className={`flex h-11 w-11 items-center justify-center border ${
                            isDark
                              ? "border-[#e2a98e]/25 bg-[#e2a98e]/10"
                              : "border-[#c9846a]/25 bg-[#c9846a]/10"
                          }`}
                        >
                          <Icon
                            size={22}
                            strokeWidth={1.45}
                            className={
                              isDark ? "text-[#e2a98e]" : "text-[#c9846a]"
                            }
                          />
                        </div>

                        <p
                          className={`text-sm font-semibold uppercase tracking-[0.24em] ${
                            isDark ? "text-[#e2a98e]" : "text-black/45"
                          }`}
                        >
                          {phase.phase}
                        </p>
                      </div>

                      <div
                        className={`text-[5.2rem] font-semibold leading-none tracking-[-0.065em] ${
                          isDark ? "text-white/10" : "text-black/10"
                        }`}
                      >
                        {phase.number}
                      </div>

                      <h2 className="mt-5 text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-7xl">
                        {phase.title}
                      </h2>

                      <p
                        className={`mt-7 max-w-xl text-xl leading-8 ${
                          isDark ? "text-white/62" : "text-black/62"
                        }`}
                      >
                        {phase.text}
                      </p>
                    </div>

                    <div className="relative z-10">
                      <div
                        className={`border-y ${
                          isDark ? "border-white/10" : "border-black/10"
                        }`}
                      >
                        {phase.items.map((item, itemIndex) => (
                          <div
                            key={item}
                            className={`grid gap-5 border-b py-5 last:border-b-0 md:grid-cols-[0.16fr_0.84fr] md:items-center ${
                              isDark ? "border-white/10" : "border-black/10"
                            }`}
                          >
                            <p
                              className={`text-sm font-semibold uppercase tracking-[0.2em] ${
                                isDark ? "text-white/35" : "text-black/35"
                              }`}
                            >
                              {String(itemIndex + 1).padStart(2, "0")}
                            </p>

                            <p
                              className={`text-lg leading-7 ${
                                isDark ? "text-white/68" : "text-black/65"
                              }`}
                            >
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#fbf4ef] py-28 text-[#07090b] md:py-36">
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
              Beyond the roadmap
            </p>

            <h2 className="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-7xl">
              Each phase is designed to increase Treasury capacity.
            </h2>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-black/62">
              As operating businesses contribute to the Treasury, Arvo increases
              its ability to support future investments, staking rewards,
              liquidity and long-term portfolio growth.
            </p>
          </div>
        </Container>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}