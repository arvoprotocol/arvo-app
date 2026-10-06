import type { Metadata } from "next";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Arvo, the $ARVO token, Treasury, vaults, governance, Robinhood Chain and the protocol's business-led model.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    type: "website",
    url: "/faq",
    siteName: "Arvo",
    title: "FAQ | Arvo",
    description:
      "Answers to common questions about Arvo, the $ARVO token, Treasury, vaults, governance, Robinhood Chain and the protocol's business-led model.",
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
    title: "FAQ | Arvo",
    description:
      "Answers to common questions about Arvo, the $ARVO token, Treasury, vaults, governance, Robinhood Chain and the protocol's business-led model.",
    images: ["/og-image.jpg"],
  },
};

const faqs = [
  {
    question: "What is Arvo?",
    answer:
      "Arvo is a business-led protocol designed to connect on-chain participation with established operating businesses. The goal is to grow the Treasury through operating profits, disciplined capital allocation and long-term business performance.",
  },
  {
    question: "Is Arvo just another crypto project?",
    answer:
      "No. Arvo does not begin with a token searching for utility. It begins with an operating model. ARVO acts as the coordination layer for governance, staking and participation around businesses designed to generate operating profits.",
  },
  {
    question: "Why does Arvo start with land?",
    answer:
      "Land is the first operating model because the founding team has direct experience in land and property transactions. Projects are typically sold through established auction channels, allowing capital to be recycled into the Treasury and future investments.",
  },
  {
    question: "Will Arvo only invest in land?",
    answer:
      "No. Land is the first operating model, not the destination. As the Treasury grows, Arvo intends to expand into additional sectors including software, AI, digital infrastructure, ecommerce and established private businesses that fit the investment framework.",
  },
  {
    question: "What does the Treasury do?",
    answer:
      "The Treasury is the capital base of the protocol. It can allocate capital into future investments, existing businesses, reserves, liquidity, staking rewards, strategic partnerships and governance-approved buybacks.",
  },
  {
    question: "How does staking work?",
    answer:
      "ARVO holders are expected to be able to stake tokens into fixed-term vaults, including 60-day, 90-day, 180-day and 365-day options. Longer lock periods are intended to receive higher target rewards, subject to Treasury policy and protocol conditions.",
  },
  {
    question: "Where do stablecoin rewards come from?",
    answer:
      "Stablecoin rewards are intended to become active as the Treasury grows and operating businesses generate distributable profits. Early staking rewards may rely more heavily on ARVO rewards, with Treasury-funded rewards expected to increase over time.",
  },
  {
    question: "Why is Arvo built on Robinhood Chain?",
    answer:
      "Robinhood Chain provides the infrastructure for ARVO's on-chain ecosystem, including token transfers, staking, governance and future protocol functionality. It provides a scalable environment designed to support Arvo as the ecosystem develops.",
  },
  {
    question: "Does holding ARVO mean owning the businesses?",
    answer:
      "No. Holding ARVO does not represent equity ownership, shares, legal ownership of land or a guaranteed entitlement to profits. ARVO is the native utility and governance token of the Arvo protocol.",
  },
  {
    question: "How will Arvo report progress?",
    answer:
      "Arvo intends to publish regular updates, including monthly operational updates, quarterly Treasury and NAV reports, and annual strategic reviews. The aim is to provide meaningful visibility into Treasury activity, business progress and long-term execution.",
  },
];

export default function FAQPage() {
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
              FAQ
            </p>

            <h1 className="text-balance text-6xl font-semibold leading-[0.92] tracking-[-0.05em] md:text-[6.25rem]">
              Understanding Arvo.
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-8 text-white/64">
              A clearer look at how Arvo works, why it starts with operating
              businesses, and how the Treasury, staking and governance model are
              expected to develop over time.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button href="https://arvo.gitbook.io/arvo">Read whitepaper</Button>
              <Button href="/contact" variant="secondary">
                Contact us
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#fbf4ef] py-28 text-[#07090b] md:py-36">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[0.34fr_0.66fr]">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
                The essentials
              </p>

              <h2 className="text-balance text-4xl font-semibold leading-[1] tracking-[-0.045em] md:text-6xl">
                A protocol built around operating businesses.
              </h2>

              <p className="mt-7 text-lg leading-8 text-black/60">
                The questions below explain Arvo in plain English: what it is,
                why the Treasury matters, how staking is intended to work and
                why the protocol begins with real operating businesses.
              </p>
            </div>

            <div className="divide-y divide-black/10 border-y border-black/10">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className="grid gap-6 py-10 md:grid-cols-[0.18fr_0.82fr] md:py-12"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/35">
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <div>
                    <h3 className="text-3xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-5xl">
                      {faq.question}
                    </h3>

                    <p className="mt-6 max-w-3xl text-lg leading-8 text-black/62">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#07090b] py-28 text-white md:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(201,143,115,.15),transparent_34%),linear-gradient(to_bottom,#07090b,#0c1016)]" />

        <Container className="relative z-10">
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-[#e2a98e]">
              Still exploring?
            </p>

            <h2 className="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-7xl">
              The full model is explained in the whitepaper.
            </h2>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-white/62">
              The whitepaper covers the investment philosophy, Treasury model,
              staking structure, governance approach, token economics, roadmap
              and risk considerations in more detail.
            </p>

            <div className="mt-10">
              <Button href="/whitepaper">Read whitepaper</Button>
            </div>
          </div>
        </Container>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}