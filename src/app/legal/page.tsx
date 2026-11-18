import { restrictedJurisdictionList } from "@/lib/legal/jurisdictions";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Legal & Risk Disclosure",
  description:
    "Important legal information, eligibility requirements and risk disclosures relating to Arvo, $ARVO and participation in the Arvo ecosystem.",
  alternates: {
    canonical: "/legal",
  },
  openGraph: {
    type: "website",
    url: "/legal",
    siteName: "Arvo",
    title: "Legal & Risk Disclosure | Arvo",
    description:
      "Important legal information, eligibility requirements and risk disclosures relating to Arvo, $ARVO and participation in the Arvo ecosystem.",
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
    title: "Legal & Risk Disclosure | Arvo",
    description:
      "Important legal information, eligibility requirements and risk disclosures relating to Arvo, $ARVO and participation in the Arvo ecosystem.",
    images: ["/og-image.jpg"],
  },
};

const sections = [
  {
    number: "01",
    title: "About Arvo",
    content: (
      <>
        <p>
          Arvo is a business-led protocol designed to connect on-chain
          participation with investments into operating businesses and
          real-world opportunities.
        </p>

        <p>
          $ARVO is the native token of the Arvo ecosystem and is intended to
          provide access to functionality including staking, rewards and
          defined governance participation.
        </p>

        <p>
          The $ARVO token does not represent shares or equity in Arvo, any
          company within the Arvo structure, any underlying business, property
          or other asset.
        </p>

        <p>
          Holding $ARVO does not give the holder any direct ownership interest
          in the Arvo Treasury or any business, property or investment held
          directly or indirectly within the Arvo structure.
        </p>
      </>
    ),
  },
  {
    number: "02",
    title: "No investment advice",
    content: (
      <>
        <p>
          Information provided through the Arvo website, application,
          whitepaper, social channels or other communications is provided for
          general information only.
        </p>

        <p>
          Nothing provided by Arvo constitutes financial, investment, legal,
          tax or other professional advice, nor should it be relied upon as a
          recommendation to acquire, hold or dispose of any digital asset.
        </p>

        <p>
          You are responsible for carrying out your own assessment and
          obtaining independent professional advice where appropriate.
        </p>
      </>
    ),
  },
  {
    number: "03",
    title: "Restricted jurisdictions",
    content: (
      <>
        <p>
          Arvo products and services are not offered or made available to
          persons located in, resident in, or ordinarily resident in
          jurisdictions designated by Arvo as Restricted Jurisdictions.
        </p>

        <p>The current Restricted Jurisdictions are:</p>

        <p>
          <strong>{restrictedJurisdictionList()}.</strong>
        </p>

        <p>
          This list represents Arvo&apos;s minimum internal restriction
          framework and may be amended at any time in response to legal,
          regulatory, sanctions, compliance or operational requirements.
        </p>

        <p>
          The inclusion of a jurisdiction does not necessarily mean that all
          virtual asset activity is prohibited within that jurisdiction.
          Similarly, the absence of a jurisdiction from this list does not mean
          that participation in $ARVO or any Arvo product or service is
          necessarily lawful in that jurisdiction.
        </p>

        <p>
          Users are responsible for determining whether their participation is
          permitted under the laws and regulations applicable to them.
        </p>

        <p>
          Arvo reserves the right to restrict or refuse access based on
          location, residency, sanctions exposure, compliance requirements or
          other relevant factors.
        </p>
      </>
    ),
  },
  {
    number: "04",
    title: "Eligibility",
    content: (
      <>
        <p>
          By accessing or using Arvo products or services, you represent that:
        </p>

        <ul>
          <li>
            you are at least 18 years old and legally capable of entering into
            binding agreements;
          </li>
          <li>
            you are not located in, resident in, or ordinarily resident in a
            Restricted Jurisdiction;
          </li>
          <li>
            your participation does not breach any law or regulation applicable
            to you;
          </li>
          <li>
            you are not subject to applicable sanctions or acting on behalf of
            a sanctioned person or entity; and
          </li>
          <li>
            any funds or digital assets used in connection with Arvo are
            derived from lawful sources.
          </li>
        </ul>

        <p>
          Arvo may implement geographic restrictions, wallet screening,
          identity verification, source-of-funds checks or other compliance
          measures where considered necessary.
        </p>
      </>
    ),
  },
  {
    number: "05",
    title: "$ARVO token risks",
    content: (
      <>
        <p>
          $ARVO is a digital asset and participation involves significant risk.
        </p>

        <p>
          The market value of $ARVO may increase or decrease substantially and
          may be affected by market conditions, liquidity, trading activity,
          adoption, regulatory developments, technology risks and other factors
          outside Arvo&apos;s control.
        </p>

        <p>
          There is no guarantee that $ARVO will maintain any particular value or
          that a liquid market for $ARVO will continue to exist.
        </p>

        <p>
          You should not acquire or hold $ARVO unless you understand the risks
          associated with digital assets and are able to bear the potential
          loss of the full value involved.
        </p>

        <p>
          Past performance, projections, targets or examples are not guarantees
          of future performance.
        </p>
      </>
    ),
  },
  {
    number: "06",
    title: "Staking and rewards",
    content: (
      <>
        <p>
          Arvo may provide staking functionality through fixed-term or other
          vault structures.
        </p>

        <p>
          Any rewards displayed through the Arvo platform are subject to the
          applicable vault conditions and should not be interpreted as
          guaranteed returns.
        </p>

        <p>
          Reward rates, reward assets, eligibility requirements and other
          conditions may vary between vaults and may change over time.
        </p>

        <p>
          Participation in staking may involve lock-up periods during which
          deposited assets cannot ordinarily be withdrawn. Specific terms
          applicable to a vault should be reviewed before participation.
        </p>
      </>
    ),
  },
  {
    number: "07",
    title: "Treasury and business activity",
    content: (
      <>
        <p>
          Arvo&apos;s model involves deploying capital into operating
          businesses, acquisitions and other opportunities.
        </p>

        <p>
          Business and investment activity carries risk. Businesses may
          underperform, investments may decline in value, transactions may not
          complete and expected returns may not materialise.
        </p>

        <p>
          References to operating profits contributing to the Arvo Treasury
          describe the intended economic model and should not be interpreted as
          a guarantee of Treasury growth or $ARVO token performance.
        </p>

        <p>
          $ARVO holders do not have a direct entitlement to the revenues,
          profits or assets of businesses within the Arvo structure unless
          expressly provided under the terms of a specific product.
        </p>
      </>
    ),
  },
  {
    number: "08",
    title: "Stablecoin vaults",
    content: (
      <>
        <p>
          Arvo may introduce stablecoin-only vaults associated with specific
          business or investment opportunities.
        </p>

        <p>
          Stablecoin vaults may operate under separate eligibility
          requirements, terms, risk disclosures, participation periods and
          return or redemption conditions.
        </p>

        <p>
          The availability of a stablecoin vault within the Arvo application
          should not be interpreted as a guarantee of return or preservation of
          capital.
        </p>

        <p>
          Users must review the specific terms and disclosures applicable to
          each vault before participating.
        </p>
      </>
    ),
  },
  {
    number: "09",
    title: "Smart contract and blockchain risks",
    content: (
      <>
        <p>
          Arvo uses blockchain technology and smart contracts. Participation
          may therefore involve technical and operational risks.
        </p>

        <p>
          These risks may include smart-contract vulnerabilities, network
          disruption, blockchain congestion, wallet compromise, loss of private
          keys, third-party infrastructure failure and other technical events.
        </p>

        <p>Blockchain transactions may be irreversible.</p>

        <p>
          While Arvo may implement security reviews and other safeguards, no
          blockchain system or smart contract can be guaranteed to be
          completely free from vulnerabilities or failure.
        </p>
      </>
    ),
  },
  {
    number: "10",
    title: "Third-party services",
    content: (
      <>
        <p>
          Arvo may interact with third-party blockchain networks, wallets,
          exchanges, liquidity providers, technology providers and other
          services.
        </p>

        <p>
          These services operate independently of Arvo and may be subject to
          their own terms, risks and availability.
        </p>

        <p>
          Arvo does not control third-party services and cannot guarantee their
          continued availability, security or performance.
        </p>
      </>
    ),
  },
  {
    number: "11",
    title: "AML, sanctions and compliance",
    content: (
      <>
        <p>
          Arvo may apply know-your-customer, anti-money-laundering, sanctions,
          source-of-funds, wallet-screening and other compliance procedures
          where required or considered appropriate.
        </p>

        <p>
          Arvo reserves the right to refuse, restrict, suspend or terminate
          participation where necessary to comply with applicable legal or
          compliance requirements or where activity presents an unacceptable
          risk.
        </p>
      </>
    ),
  },
  {
    number: "12",
    title: "Governance",
    content: (
      <>
        <p>
          $ARVO may enable participation in defined protocol governance matters.
        </p>

        <p>
          Governance rights do not provide $ARVO holders with ownership or
          management rights over Arvo or its underlying operating businesses.
        </p>

        <p>
          Core business, investment and operational decisions remain subject to
          the applicable corporate and management structures.
        </p>
      </>
    ),
  },
  {
    number: "13",
    title: "Forward-looking information",
    content: (
      <>
        <p>
          The Arvo website, whitepaper, roadmap and other materials may contain
          statements relating to future plans, products, acquisitions, Treasury
          activity, staking, rewards, token utility or other anticipated
          developments.
        </p>

        <p>
          These statements reflect current intentions and expectations only.
          Actual developments may differ, and Arvo does not guarantee that any
          proposed feature, transaction, product, target or timeline will be
          completed as described.
        </p>
      </>
    ),
  },
  {
    number: "14",
    title: "Changes to this disclosure",
    content: (
      <>
        <p>
          Arvo may update this Legal & Risk Disclosure as the protocol develops
          or in response to legal, regulatory, technical or operational
          requirements.
        </p>

        <p>
          The latest version published on the Arvo website will apply.
        </p>
      </>
    ),
  },
  {
    number: "15",
    title: "Contact",
    content: (
      <>
        <p>
          Questions relating to this Legal & Risk Disclosure or Arvo&apos;s
          products and services can be submitted through the Arvo contact page.
        </p>

        <p>
          General enquiries can also be sent to{" "}
          <a href="mailto:team@arvoprotocol.com">team@arvoprotocol.com</a>.
        </p>

        <p>
          <strong>Arvo · Registered entity 3-102-066975</strong>
        </p>

        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
          <Button href="/contact">Contact Arvo</Button>
        </div>
      </>
    ),
  },
];

export default function LegalPage() {
  return (
    <main>
      <div className="noise" />
      <Header />

      <section className="relative overflow-hidden bg-[#07090b] pb-28 pt-56 text-white md:pb-36 md:pt-64">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(201,143,115,.20),transparent_34%),radial-gradient(circle_at_22%_36%,rgba(139,92,246,.12),transparent_30%),linear-gradient(to_bottom,#07090b,#090d12_60%,#0c1016)]" />

        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:80px_80px]" />

        <Container className="relative z-10">
          <div className="max-w-6xl">
            <p className="mb-7 text-sm font-semibold uppercase tracking-[0.24em] text-[#e2a98e]">
              Legal
            </p>

            <h1 className="max-w-5xl text-balance text-6xl font-semibold leading-[0.92] tracking-[-0.05em] md:text-[6.25rem]">
              Legal &amp; Risk Disclosure.
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-8 text-white/64">
              Important information about eligibility, participation and the
              risks associated with Arvo, $ARVO and the Arvo platform.
            </p>

            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
              Last updated: 21 September 2026
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-[#fbf4ef] py-24 text-[#07090b] md:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-24">
            <aside className="hidden lg:block">
              <div className="sticky top-32 border-t border-black/10 pt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-black/40">
                  Legal &amp; Risk
                </p>

                <nav className="mt-7">
                  <ul className="space-y-4">
                    {sections.map((section) => (
                      <li key={section.number}>
                        <Link
                          href={`#section-${section.number}`}
                          className="flex items-start gap-4 text-sm leading-6 text-black/50 transition hover:text-black"
                        >
                          <span className="font-semibold text-[#c9846a]">
                            {section.number}
                          </span>

                          <span>{section.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>

            <div className="border-t border-black/10">
              {sections.map((section) => (
                <article
                  key={section.number}
                  id={`section-${section.number}`}
                  className="scroll-mt-32 border-b border-black/10 py-12 md:py-16"
                >
                  <div className="grid gap-7 md:grid-cols-[80px_minmax(0,1fr)] md:gap-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9846a]">
                      {section.number}
                    </p>

                    <div>
                      <h2 className="text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-5xl">
                        {section.title}
                      </h2>

                      <div className="privacy-content mt-8 max-w-3xl space-y-6 text-lg leading-8 text-black/62 [&_p_a]:font-medium [&_p_a]:text-black [&_p_a]:underline [&_p_a]:decoration-black/30 [&_p_a]:underline-offset-4 [&_li_a]:font-medium [&_li_a]:text-black [&_li_a]:underline [&_li_a]:decoration-black/30 [&_li_a]:underline-offset-4 [&_li]:pl-2 [&_li]:marker:text-[#c9846a] [&_strong]:font-semibold [&_strong]:text-black/80 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-3">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-white py-24 text-[#07090b] md:py-32">
        <Container>
          <div className="grid gap-10 border-y border-black/10 py-12 md:grid-cols-[0.64fr_0.36fr] md:items-center md:py-16">
            <div>
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-black/40">
                Questions about Arvo?
              </p>

              <h2 className="max-w-3xl text-balance text-4xl font-semibold leading-[1] tracking-[-0.045em] md:text-6xl">
                Contact the Arvo team.
              </h2>
            </div>

            <div className="flex md:justify-end">
              <Button href="/contact">Contact Arvo</Button>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
