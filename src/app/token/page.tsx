import type { Metadata } from "next";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";
import {
  Coins,
  LockKeyhole,
  PieChart,
  Repeat,
  ShieldCheck,
  Vote,
} from "lucide-react";

export const metadata: Metadata = {
  title: "$ARVO Token",
  description:
    "Explore the $ARVO token, including its fixed supply, allocation, utility, staking and role within the Arvo ecosystem.",
  alternates: {
    canonical: "/token",
  },
  openGraph: {
    type: "website",
    url: "/token",
    siteName: "Arvo",
    title: "$ARVO Token | Arvo",
    description:
      "Explore the $ARVO token, including its fixed supply, allocation, utility, staking and role within the Arvo ecosystem.",
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
    title: "$ARVO Token | Arvo",
    description:
      "Explore the $ARVO token, including its fixed supply, allocation, utility, staking and role within the Arvo ecosystem.",
    images: ["/og-image.jpg"],
  },
};

const allocations = [
  {
    label: "Business Growth & Acquisitions",
    value: 25,
    tokens: "250,000,000 ARVO",
    vesting: "Structured release",
    text: "Capital allocated for investment into operating businesses, acquisitions and the continued expansion of the Arvo ecosystem.",
  },
  {
    label: "Liquidity",
    value: 14.75,
    tokens: "147,500,000 ARVO",
    vesting: "Liquidity provision",
    text: "Dedicated allocation supporting protocol liquidity and market infrastructure.",
  },
  {
    label: "Treasury & Strategic Capital",
    value: 10,
    tokens: "100,000,000 ARVO",
    vesting: "Linear over 12 months",
    text: "Supports Treasury growth, protocol development, market infrastructure and other strategic initiatives.",
  },
  {
    label: "Staking Rewards",
    value: 8,
    tokens: "80,000,000 ARVO",
    vesting:
      "2-week cliff, then 25% unlock; remaining 75% linear over 24 months",
    text: "Dedicated ARVO allocation supporting staking participation and long-term reward programmes.",
  },
  {
    label: "Ecosystem Growth",
    value: 2,
    tokens: "20,000,000 ARVO",
    vesting: "Linear over 18 months",
    text: "Supports community growth, integrations, partnerships and initiatives designed to increase ecosystem participation.",
  },
  {
    label: "Protocol Reserve",
    value: 5,
    tokens: "50,000,000 ARVO",
    vesting: "6-month cliff, then linear over 24 months",
    text: "Long-term reserve providing flexibility for future protocol requirements and strategic opportunities.",
  },
  {
    label: "Strategic Partners & Advisors",
    value: 10,
    tokens: "100,000,000 ARVO",
    vesting: "3-month cliff, then linear over 12 months",
    text: "Reserved for selected strategic relationships, advisers, contributors and ecosystem partnerships.",
  },
  {
    label: "Team",
    value: 25,
    tokens: "250,000,000 ARVO",
    vesting: "12-month cliff, then linear over 6 months",
    text: "Fully locked for 12 months, followed by a structured 6-month linear release to support long-term team alignment.",
  },
  {
    label: "Community Distribution",
    value: 0.25,
    tokens: "2,500,000 ARVO",
    vesting: "Structured distribution",
    text: "Dedicated allocation supporting targeted community distribution and participation.",
  },
];

const utilities = [
  {
    title: "Staking",
    text: "Stake ARVO through the protocol's fixed-term vaults, with reward opportunities designed around different participation periods.",
    icon: LockKeyhole,
  },
  {
    title: "Reward Opportunities",
    text: "The staking platform supports ARVO and stablecoin reward opportunities, alongside additional participation structures as the ecosystem develops.",
    icon: Coins,
  },
  {
    title: "Access",
    text: "Access future protocol initiatives, exclusive products, preferential rewards and additional ecosystem benefits as they are introduced.",
    icon: ShieldCheck,
  },
  {
    title: "Governance",
    text: "Participate in defined protocol governance decisions, while core business and operating decisions remain with the Arvo team.",
    icon: Vote,
  },
];

const economics = [
  {
    title: "Fixed Supply",
    text: "1 billion maximum ARVO supply with no open-ended token creation.",
    icon: Coins,
  },
  {
    title: "Treasury Growth",
    text: "Operating business activity can contribute capital to the Treasury, supporting the continued development and expansion of the ecosystem.",
    icon: PieChart,
  },
  {
    title: "Business-Led Model",
    text: "Real operating businesses sit at the foundation of Arvo, creating a model designed around commercial activity rather than token issuance alone.",
    icon: Repeat,
  },
];

export default function TokenPage() {
  return (
    <main>
      <div className="noise" />
      <Header />

      <section className="relative overflow-hidden bg-[#07090b] pt-56 pb-28 text-white md:pt-64 md:pb-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(201,143,115,.20),transparent_34%),radial-gradient(circle_at_22%_36%,rgba(139,92,246,.12),transparent_30%),linear-gradient(to_bottom,#07090b,#090d12_60%,#0c1016)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:80px_80px]" />

        <Container className="relative z-10">
          <div className="max-w-6xl">
            <div>
              <p className="mb-7 text-sm font-semibold uppercase tracking-[0.24em] text-[#e2a98e]">
                ARVO Token
              </p>

              <h1 className="text-balance text-6xl font-semibold leading-[0.92] tracking-[-0.05em] md:text-[6.25rem]">
                The participation layer of Arvo.
              </h1>

              <p className="mt-8 max-w-2xl text-xl leading-8 text-white/64">
                ARVO connects staking, holder utility and defined governance
                participation with a growing ecosystem built around real
                operating businesses.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button href="https://arvo.gitbook.io/arvo">
                  Read whitepaper
                </Button>
                <Button href="/vaults" variant="secondary">
                  View staking
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#fbf4ef] py-28 text-[#07090b] md:py-36">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.4fr_0.6fr] lg:items-start">
            <div>
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
                Token Allocation
              </p>

              <h2 className="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.045em] md:text-7xl">
                Structured for long-term participation and growth.
              </h2>

              <p className="mt-7 max-w-xl text-xl leading-8 text-black/60">
                ARVO has a fixed maximum supply of 1,000,000,000 tokens,
                allocated across business growth, liquidity, the Treasury,
                staking, strategic relationships and long-term ecosystem
                development.
              </p>
            </div>

            <div className="grid gap-4">
              {allocations.map((item) => (
                <div
                  key={item.label}
                  className="group grid gap-5 border border-black/10 bg-white/60 p-5 transition hover:bg-white md:grid-cols-[0.22fr_0.78fr] md:items-center"
                >
                  <div className="text-5xl font-semibold leading-none tracking-[-0.06em] text-[#c9846a]">
                    {item.value}%
                  </div>

                  <div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                      <h3 className="text-2xl font-semibold tracking-[-0.035em]">
                        {item.label}
                      </h3>

                      <span className="shrink-0 text-sm font-medium text-black/40">
                        {item.tokens}
                      </span>
                    </div>

                    <div className="mt-4 h-2 bg-black/10">
                      <div
                        className="h-full bg-[#c9846a]"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>

                    <p className="mt-4 text-base leading-7 text-black/56">
                      {item.text}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-black/42">
                      Release: {item.vesting}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#07090b] py-28 text-white md:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_44%,rgba(201,143,115,.16),transparent_34%),radial-gradient(circle_at_24%_50%,rgba(139,92,246,.12),transparent_32%),linear-gradient(to_bottom,#07090b,#0c1016)]" />

        <Container className="relative z-10">
          <div className="mb-16 max-w-4xl">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-[#e2a98e]">
              Token Utility
            </p>

            <h2 className="text-balance text-4xl font-semibold leading-[1] tracking-[-0.045em] md:text-6xl">
              A clear role within the Arvo ecosystem.
            </h2>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60">
              ARVO is the participation and utility layer of the protocol,
              connecting staking, holder benefits and defined governance
              participation with the wider Arvo ecosystem.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {utilities.map(({ title, text, icon: Icon }) => (
              <div
                key={title}
                className="border border-white/10 bg-white/[0.035] p-7"
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center border border-[#e2a98e]/25 bg-[#e2a98e]/10">
                  <Icon
                    size={24}
                    strokeWidth={1.45}
                    className="text-[#e2a98e]"
                  />
                </div>

                <h3 className="text-2xl font-semibold tracking-[-0.035em]">
                  {title}
                </h3>

                <p className="mt-5 text-base leading-7 text-white/55">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-white py-28 text-[#07090b] md:py-36">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[0.42fr_0.58fr]">
            <div>
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
                Economic Model
              </p>

              <h2 className="text-balance text-4xl font-semibold leading-[1] tracking-[-0.045em] md:text-6xl">
                Token economics connected to a business-led ecosystem.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {economics.map(({ title, text, icon: Icon }) => (
                <div key={title} className="border border-black/10 p-7">
                  <Icon
                    size={28}
                    strokeWidth={1.45}
                    className="text-[#c9846a]"
                  />

                  <h3 className="mt-8 text-2xl font-semibold tracking-[-0.035em]">
                    {title}
                  </h3>

                  <p className="mt-5 text-base leading-7 text-black/58">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#fbf4ef] py-28 text-[#07090b] md:py-36">
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
              Long-Term Alignment
            </p>

            <h2 className="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-7xl">
              The token enables participation. The businesses drive the model.
            </h2>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-black/62">
              Operating businesses can contribute to Treasury growth, Treasury
              capital can support further expansion, and ARVO provides the
              participation and utility layer around the wider ecosystem.
            </p>
          </div>
        </Container>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}