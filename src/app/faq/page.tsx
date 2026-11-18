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
    title: "Understanding Arvo | FAQ",
    description:
      "Answers to common questions about Arvo, the $ARVO token, Treasury, vaults, governance, Robinhood Chain and the protocol's business-led model.",
    images: [
      {
        url: "/og-faq-v3.png",
        width: 2400,
        height: 1260,
        alt: "Understanding Arvo. The token, the Treasury and how it all works.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Understanding Arvo | FAQ",
    description:
      "Answers to common questions about Arvo, the $ARVO token, Treasury, vaults, governance, Robinhood Chain and the protocol's business-led model.",
    images: ["/og-faq-v3.png"],
  },
};

const faqSections = [
  {
    "id": "about",
    "title": "About Arvo",
    "items": [
      {
        "question": "What is Arvo?",
        "answer": "Arvo is a business-led protocol connecting on-chain participation with operating businesses. Its first operating model is land acquisition and sales, with business profits supporting the Treasury and further acquisitions."
      },
      {
        "question": "Why does Arvo start with land?",
        "answer": "The founding team has direct experience in land and property transactions. The first operating model involves acquiring land, legally subdividing it where appropriate and selling plots through established auction channels. Each acquisition has its own costs, timetable and risks."
      },
      {
        "question": "Will Arvo only operate in land?",
        "answer": "No. Land is the first operating model. Arvo's expansion framework also covers software, AI, digital infrastructure, ecommerce and established private businesses. New investments depend on available capital, suitable opportunities and due diligence."
      },
      {
        "question": "Does holding ARVO mean owning land or shares in the businesses?",
        "answer": "No. ARVO does not represent shares, equity or legal ownership of land or operating businesses. Holding the token does not create a guaranteed entitlement to business profits or a right to redeem tokens against Treasury assets."
      }
    ]
  },
  {
    "id": "token-treasury",
    "title": "Token & Treasury",
    "items": [
      {
        "question": "What is the ARVO token used for?",
        "answer": "Holding ARVO unlocks access to ARVO staking rewards and eligibility for USDC reward vaults, subject to each vault’s requirements. The utility roadmap also includes Arvo Intelligence, holder features built around verified project data, priority holder campaigns and future governance participation. Availability and eligibility are published as each feature launches."
      },
      {
        "question": "What is the total ARVO supply?",
        "answer": "ARVO has a fixed total supply of 1 billion tokens. Total supply is different from circulating supply: some allocations are subject to vesting or other release conditions. The tokenomics documentation explains the allocations and release schedules."
      },
      {
        "question": "What does the Treasury do?",
        "answer": "The Treasury provides capital for the protocol's development and operating model. Uses can include acquisitions, business growth, reserves, liquidity, development, strategic initiatives and eligible Treasury-funded rewards. Allocations depend on available resources and protocol priorities."
      },
      {
        "question": "How do business profits support Arvo?",
        "answer": "Under the land operating model, approximately 50% of distributable operating profit is allocated to the Treasury. Distributable profit is calculated after relevant costs and obligations, rather than from gross sale proceeds. Treasury capital supports further acquisitions, protocol development and eligible USDC rewards. Business performance does not guarantee rewards or an increase in the token price."
      },
      {
        "question": "Where do ARVO and USDC rewards come from?",
        "answer": "ARVO rewards are funded through the designated Staking Rewards allocation. USDC rewards are funded through the Treasury, supported by available capital and operating contributions. They are separate funding sources, and each vault's availability depends on its funding and published terms."
      },
      {
        "question": "What is the ACF and how is capital released?",
        "answer": "The ACF forms part of ARVO's Virtuals launch structure. Capital is released in stages under Virtuals' applicable milestone conditions, rather than becoming available in full at launch. The majority of released capital is allocated to support acquisitions. Unreleased amounts are not cash already available to the Treasury."
      }
    ]
  },
  {
    "id": "vaults",
    "title": "Vaults & Rewards",
    "items": [
      {
        "question": "How do staking vaults work?",
        "answer": "Vaults allow participants to commit the specified token for a defined term under published conditions. Before staking, check the deposit token, reward token, term, minimum entry, capacity and withdrawal rules. The platform shows which vaults are available or upcoming."
      },
      {
        "question": "What is the difference between ARVO-to-ARVO and ARVO-to-USDC vaults?",
        "answer": "An ARVO-to-ARVO vault accepts ARVO and pays rewards in ARVO. An ARVO-to-USDC vault accepts ARVO and pays rewards in USDC. Their eligibility requirements, reward calculations and available capacity can differ, so review the individual vault before participating."
      },
      {
        "question": "How do I qualify for an ARVO-to-USDC vault?",
        "answer": "ARVO-to-USDC vaults have an ARVO eligibility threshold. The platform displays the amount required and whether your connected wallet meets the applicable conditions. Completing an introductory vault does not automatically guarantee a place in a later vault."
      },
      {
        "question": "Is there a minimum stake?",
        "answer": "Minimum entry requirements are displayed on each vault. They can differ between vault types and launches, so use the current details on the platform rather than figures from an older post or announcement."
      },
      {
        "question": "Does the advertised reward apply to the full term?",
        "answer": "Where a vault states a reward over a specified term, that percentage applies to that term. For example, a 10% ARVO reward over 60 days means 10 additional ARVO for every 100 ARVO staked for the full term, subject to the vault's terms. Any annualised equivalent is a comparison figure, not a promise that the same vault can be repeated throughout the year."
      },
      {
        "question": "Does a price change affect my USDC reward after I stake?",
        "answer": "For ARVO-to-USDC vaults using the fixed-at-entry model, the ARVO price is captured when the stake opens and used to calculate the USDC reward. Later ARVO price changes do not recalculate that reward. The market value of your ARVO principal can still rise or fall."
      },
      {
        "question": "Can I withdraw before the end of the term?",
        "answer": "Vaults are designed around a fixed term. Check the specific withdrawal and emergency-withdrawal conditions before staking, including any effect on rewards. Do not assume early withdrawal is available without conditions."
      },
      {
        "question": "What risks should I understand before staking?",
        "answer": "Participation involves token-price, liquidity, smart-contract, operational and reward-funding risks. A quoted token reward does not protect the market value of your deposit. Review the vault terms and Legal & Risk information before committing funds."
      }
    ]
  },
  {
    "id": "projects-security",
    "title": "Projects & Transparency",
    "items": [
      {
        "question": "How can I verify the land behind an Arvo project?",
        "answer": "Every Arvo land acquisition will be accompanied by a published HM Land Registry title number. You can use it to obtain the relevant registered property details independently through HM Land Registry. A title number identifies the registered property; it does not establish the value, profitability or outcome of a project."
      },
      {
        "question": "Where can I follow acquisition progress?",
        "answer": "The platform's Projects section brings together project information and progress, alongside operational announcements. An accepted offer is an acquisition milestone; legal completion confirms the purchase. Historical team case studies are identified separately from new Arvo-funded acquisitions."
      },
      {
        "question": "Where can I read the staking security audit?",
        "answer": "The staking contract review can be accessed through Soken's public audit index at soken.dev/audits.html. Read the report for its scope, reviewed contract version, findings and recorded statuses. An audit is a review of a particular codebase and does not eliminate all technical or operational risk. The First Edition shared bonus is paid by a separate bonus contract that is not covered by the Soken audit; it was independently tested with automated security analysis and AI review, and it cannot access staking principal."
      },
      {
        "question": "How will Arvo report progress?",
        "answer": "Arvo's reporting framework covers operational updates, Treasury activity and project progress. These updates provide visibility into capital deployment, business activity and execution. Future milestones are identified separately from results already achieved."
      }
    ]
  },
  {
    "id": "buying-access",
    "title": "Buying & Access",
    "items": [
      {
        "question": "Where can I buy ARVO?",
        "answer": "You can buy ARVO through Virtuals or Uniswap on Robinhood Chain using the links below. Check the network and token contract before confirming a transaction. ARVO's contract address is 0x6457dA6FCA3C807b7f430770DbBe8aB5a767234A."
      },
      {
        "question": "Why might ARVO not appear in my wallet after a transfer?",
        "answer": "Some wallets do not automatically display every token. Check the transaction on the Robinhood Chain explorer, confirm the recipient address and network, and inspect the wallet's token balance. You may need to import ARVO using its official contract address or use a wallet that supports the network. Do not resend solely because a token is missing from the wallet display."
      },
      {
        "question": "What does joining the waitlist provide?",
        "answer": "Waitlist members receive 48-hour early access around the public platform opening, plus earlier visibility of selected projects, vaults and future opportunities. Access is subject to eligibility, available capacity and the terms of each release; it does not guarantee a vault allocation."
      }
    ]
  }
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
          <div className="grid items-start gap-12 lg:grid-cols-[0.34fr_0.66fr] lg:gap-16">
            <div className="!mt-0 !pt-0 self-start">
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
                The essentials
              </p>

              <h2 className="!mt-0 text-balance text-4xl font-medium leading-[1.05] tracking-[-0.04em] md:text-5xl">
                A protocol built around operating businesses.
              </h2>

              <p className="mt-7 text-lg leading-8 text-black/60">
                Explore the token, the Treasury, staking vaults and the
                operating businesses behind Arvo. Select a question to read
                the answer.
              </p>
              <nav aria-label="FAQ sections" className="mt-8 flex flex-col border-t border-black/15">
                {faqSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block border-b border-black/15 py-4 text-base font-medium text-black/65 transition-colors hover:text-[#a76850]"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>

            </div>

            <div className="!mt-0 !pt-0 space-y-14 md:space-y-16">
              {faqSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-32"
                  aria-labelledby={`${section.id}-heading`}
                >
                  <h2
                    id={`${section.id}-heading`}
                    className="!mt-0 mb-6 text-sm font-medium uppercase tracking-[0.20em] text-[#a76850]"
                  >
                    {section.title}
                  </h2>

                  <div className="divide-y divide-black/10 border-y border-black/10">
                    {section.items.map((faq) => (
                      <details key={faq.question} className="group">
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-7 [&::-webkit-details-marker]:hidden">
                          <h3 className="!m-0 text-2xl font-medium leading-[1.25] tracking-[-0.025em] md:text-[1.75rem]">
                            {faq.question}
                          </h3>
                          <span
                            aria-hidden="true"
                            className="mt-1 shrink-0 text-2xl font-normal leading-none text-[#a76850] group-open:hidden"
                          >
                            +
                          </span>
                          <span
                            aria-hidden="true"
                            className="mt-1 hidden shrink-0 text-2xl font-normal leading-none text-[#a76850] group-open:inline"
                          >
                            −
                          </span>
                        </summary>

                        <p className="!mt-0 max-w-3xl pb-8 pr-6 text-lg leading-8 text-black/65">
                          {faq.answer}
                          {faq.question === "Where can I buy ARVO?" && (
                            <span className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
                              <a
                                href="https://app.virtuals.io/virtuals/139272"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-[#a76850] underline underline-offset-4"
                              >
                                Buy on Virtuals
                              </a>
                              <a
                                href="https://app.uniswap.org/explore/tokens/robinhood/0x6457dA6FCA3C807b7f430770DbBe8aB5a767234A"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-[#a76850] underline underline-offset-4"
                              >
                                Buy on Uniswap
                              </a>
                            </span>
                          )}
                          {faq.question === "Where can I read the staking security audit?" && (
                            <>
                              {" "}
                              <a
                                href="https://soken.dev/audits.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-[#a76850] underline underline-offset-4"
                              >
                                View Soken’s audit index
                              </a>
                            </>
                          )}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
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