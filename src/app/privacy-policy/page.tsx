import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Arvo Privacy Policy and learn how personal information is collected, used, stored and protected across Arvo websites and services.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    type: "website",
    url: "/privacy-policy",
    siteName: "Arvo",
    title: "Privacy Policy | Arvo",
    description:
      "Read the Arvo Privacy Policy and learn how personal information is collected, used, stored and protected across Arvo websites and services.",
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
    title: "Privacy Policy | Arvo",
    description:
      "Read the Arvo Privacy Policy and learn how personal information is collected, used, stored and protected across Arvo websites and services.",
    images: ["/og-image.jpg"],
  },
};

const sections = [
  {
    number: "01",
    title: "About this policy",
    content: (
      <>
        <p>
          This Privacy Policy explains how Arvo Protocol (“Arvo”, “we”, “us” or
          “our”) collects, uses, stores and protects personal information when
          you visit arvoprotocol.com, contact us, subscribe to communications or
          interact with Arvo’s websites, applications and services.
        </p>

        <p>
          This policy applies to information collected through the Arvo website
          and any related digital services that link to this policy.
        </p>

        <p>
          Arvo may update this policy as the protocol, its services and its
          legal or operational structure develop. The latest version will
          always be published on this page.
        </p>
      </>
    ),
  },
  {
    number: "02",
    title: "Information we may collect",
    content: (
      <>
        <p>
          The information we collect depends on how you interact with Arvo. It
          may include:
        </p>

        <ul>
          <li>
            <strong>Identity information</strong>, such as your name, job title
            or organisation.
          </li>

          <li>
            <strong>Contact information</strong>, such as your email address,
            telephone number or other details you provide when contacting us.
          </li>

          <li>
            <strong>Enquiry information</strong>, including messages,
            correspondence, feedback and other information submitted through
            forms or sent directly to us.
          </li>

          <li>
            <strong>Technical information</strong>, such as your IP address,
            browser type, device information, operating system, referring URLs
            and general website usage data.
          </li>

          <li>
            <strong>Usage information</strong>, including pages viewed,
            interactions, approximate visit duration and navigation through the
            website.
          </li>

          <li>
            <strong>Communication preferences</strong>, including whether you
            have asked to receive or stop receiving particular communications.
          </li>

          <li>
            <strong>Wallet information</strong>, such as a public blockchain
            address, where you choose to connect a compatible wallet to an Arvo
            application.
          </li>
        </ul>

        <p>
          We do not ask you to provide wallet private keys, seed phrases or
          recovery phrases. You should never disclose this information to us or
          to anyone claiming to represent Arvo.
        </p>
      </>
    ),
  },
  {
    number: "03",
    title: "How information is collected",
    content: (
      <>
        <p>We may collect information:</p>

        <ul>
          <li>directly from you when you contact us or submit a form;</li>
          <li>
            when you subscribe to updates or request information about Arvo;
          </li>
          <li>
            automatically when you access or interact with our website or
            applications;
          </li>
          <li>
            when you connect a digital wallet to an Arvo application; and
          </li>
          <li>
            from service providers that help us operate, secure and understand
            the use of our services.
          </li>
        </ul>

        <p>
          Information recorded on a public blockchain may also be publicly
          accessible. Blockchain records are not created or controlled solely
          by Arvo and may not be capable of being altered or deleted.
        </p>
      </>
    ),
  },
  {
    number: "04",
    title: "How we use your information",
    content: (
      <>
        <p>We may use personal information to:</p>

        <ul>
          <li>operate, maintain and improve the Arvo website and applications;</li>
          <li>respond to enquiries, requests and correspondence;</li>
          <li>provide information that you have requested;</li>
          <li>manage subscriptions and communication preferences;</li>
          <li>
            understand how visitors use our websites and improve performance,
            content and usability;
          </li>
          <li>
            protect our systems, users and services against fraud, misuse,
            security incidents and unlawful activity;
          </li>
          <li>
            establish, exercise or defend legal rights and comply with legal
            obligations;
          </li>
          <li>
            support governance, staking or other protocol functionality where
            those services become available; and
          </li>
          <li>
            carry out other purposes that we clearly explain when information
            is collected.
          </li>
        </ul>

        <p>
          We will not sell your personal information to third parties for their
          own marketing purposes.
        </p>
      </>
    ),
  },
  {
    number: "05",
    title: "Our lawful bases",
    content: (
      <>
        <p>
          Where UK data protection law applies, we rely on one or more lawful
          bases when processing personal information. These may include:
        </p>

        <ul>
          <li>
            <strong>Legitimate interests</strong>, where processing is necessary
            to operate, improve, secure or communicate about Arvo and those
            interests are not overridden by your rights.
          </li>

          <li>
            <strong>Consent</strong>, where you have freely given permission for
            a particular use, such as certain marketing communications or
            non-essential cookies.
          </li>

          <li>
            <strong>Contract</strong>, where processing is necessary to take
            steps at your request or provide a service under an agreement.
          </li>

          <li>
            <strong>Legal obligation</strong>, where we need to process
            information to comply with applicable law or regulation.
          </li>
        </ul>

        <p>
          Where we rely on consent, you may withdraw it at any time. Withdrawal
          does not affect the lawfulness of processing carried out before
          consent was withdrawn.
        </p>
      </>
    ),
  },
  {
    number: "06",
    title: "Cookies and analytics",
    content: (
      <>
        <p>
          Arvo may use cookies and similar technologies to operate the website,
          remember preferences, protect the website and understand how visitors
          interact with it.
        </p>

        <p>These technologies may include:</p>

        <ul>
          <li>
            <strong>Strictly necessary technologies</strong> required for
            security, core functionality or network management.
          </li>

          <li>
            <strong>Preference technologies</strong> that remember choices or
            settings.
          </li>

          <li>
            <strong>Analytics technologies</strong> that help us understand
            traffic, performance and use of the website.
          </li>
        </ul>

        <p>
          Where required, non-essential cookies or similar technologies will
          not be used unless you have provided the necessary consent. You can
          also manage cookies through your browser settings, although disabling
          certain technologies may affect website functionality.
        </p>
      </>
    ),
  },
  {
    number: "07",
    title: "Sharing personal information",
    content: (
      <>
        <p>
          We may share personal information with trusted organisations that
          provide services to Arvo, including:
        </p>

        <ul>
          <li>website hosting and infrastructure providers;</li>
          <li>security, monitoring and fraud-prevention providers;</li>
          <li>analytics and website-performance providers;</li>
          <li>email, communications and customer-support providers;</li>
          <li>professional advisers, including lawyers and accountants;</li>
          <li>
            companies within the Arvo organisational structure, where necessary
            for legitimate operational purposes; and
          </li>
          <li>
            regulators, authorities, courts or other parties where disclosure
            is required by law or necessary to protect legal rights.
          </li>
        </ul>

        <p>
          Service providers are permitted to process personal information only
          for the purposes for which it has been provided and subject to
          appropriate contractual and security obligations.
        </p>

        <p>
          We may also transfer relevant information as part of a restructuring,
          merger, acquisition, financing arrangement or transfer of all or part
          of the Arvo project or its operations.
        </p>
      </>
    ),
  },
  {
    number: "08",
    title: "International transfers",
    content: (
      <>
        <p>
          Arvo and some of its service providers may operate across different
          countries. This means personal information may be accessed, processed
          or stored outside the country in which you are located.
        </p>

        <p>
          Where applicable law requires additional protection for an
          international transfer, we will use an appropriate safeguard. This
          may include an adequacy regulation, approved contractual provisions
          or another legally recognised transfer mechanism.
        </p>
      </>
    ),
  },
  {
    number: "09",
    title: "Data retention",
    content: (
      <>
        <p>
          We retain personal information only for as long as reasonably
          necessary for the purpose for which it was collected, including to
          satisfy legal, regulatory, accounting, security or reporting
          requirements.
        </p>

        <p>
          The appropriate retention period depends on the nature and sensitivity
          of the information, the purpose for which it is used, the risk
          associated with retaining it and any applicable legal obligations.
        </p>

        <p>
          Public blockchain information may remain available indefinitely due
          to the permanent and decentralised nature of blockchain networks.
          Arvo may be unable to modify or erase information recorded directly
          on a public blockchain.
        </p>
      </>
    ),
  },
  {
    number: "10",
    title: "How we protect information",
    content: (
      <>
        <p>
          We use reasonable technical and organisational measures designed to
          protect personal information against unauthorised access, disclosure,
          alteration, loss or misuse.
        </p>

        <p>
          However, no website, network, storage system or method of transmission
          can be guaranteed to be completely secure. You should take appropriate
          steps to protect your own devices, accounts and wallet credentials.
        </p>

        <p>
          Arvo will never ask you to send a private key, seed phrase or wallet
          recovery phrase.
        </p>
      </>
    ),
  },
  {
    number: "11",
    title: "Your information rights",
    content: (
      <>
        <p>
          Depending on your location and the law that applies, you may have the
          right to:
        </p>

        <ul>
          <li>request access to personal information held about you;</li>
          <li>request correction of inaccurate or incomplete information;</li>
          <li>request deletion of personal information in certain circumstances;</li>
          <li>request restriction of processing;</li>
          <li>object to processing based on legitimate interests;</li>
          <li>withdraw consent where processing is based on consent;</li>
          <li>
            receive certain information in a structured, commonly used and
            machine-readable format; and
          </li>
          <li>
            complain to an applicable data-protection authority.
          </li>
        </ul>

        <p>
          These rights are not absolute and may be subject to legal limitations.
          We may need to verify your identity before responding to a request.
        </p>

        <p>
          Rights relating to correction or deletion may not be technically
          enforceable against data recorded directly on a public blockchain.
          We will nevertheless consider any request relating to information
          controlled by Arvo.
        </p>
      </>
    ),
  },
  {
    number: "12",
    title: "Marketing communications",
    content: (
      <>
        <p>
          We may send you updates where you have requested them, consented to
          receive them or where another lawful basis permits us to do so.
        </p>

        <p>
          You can unsubscribe from marketing emails at any time by using the
          unsubscribe link included in the communication or by contacting us.
          We may retain limited information necessary to record and respect your
          opt-out request.
        </p>
      </>
    ),
  },
  {
    number: "13",
    title: "Third-party websites and services",
    content: (
      <>
        <p>
          Our website may contain links to third-party websites, social media
          platforms, wallet providers, blockchain explorers or other services.
          Those services operate independently and have their own privacy
          policies and practices.
        </p>

        <p>
          Arvo is not responsible for the content, availability, security or
          privacy practices of external websites and services. You should review
          the relevant privacy information before providing personal
          information to a third party.
        </p>
      </>
    ),
  },
  {
    number: "14",
    title: "Children",
    content: (
      <>
        <p>
          Arvo’s website and services are not directed at children. We do not
          knowingly collect personal information from anyone under the age of
          18.
        </p>

        <p>
          Please contact us if you believe a child has provided personal
          information through an Arvo service so that we can investigate and
          take appropriate action.
        </p>
      </>
    ),
  },
  {
    number: "15",
    title: "Contact and complaints",
    content: (
      <>
        <p>
          Questions, requests or concerns about this Privacy Policy or our use
          of personal information can be submitted through the Arvo contact
          page.
        </p>

        <p>
          We encourage you to contact us first so that we have an opportunity to
          address your concern.
        </p>

        <p>
          Where UK data protection law applies, you may also have the right to
          complain to the Information Commissioner’s Office or another
          applicable supervisory authority.
        </p>

        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
  <Button href="/contact">Contact Arvo</Button>

  
</div>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
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

            <h1 className="text-balance text-6xl font-semibold leading-[0.92] tracking-[-0.05em] md:text-[6.25rem]">
              Privacy Policy.
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-8 text-white/64">
              This policy explains how Arvo collects, uses, stores and protects
              personal information when you interact with our website and
              digital services.
            </p>

            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
              Last updated: 20 July 2026
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
                  Privacy Policy
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
                Questions about your information?
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