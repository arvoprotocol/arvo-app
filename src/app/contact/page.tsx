import type { Metadata } from "next";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { ContactForm } from "@/components/contact/ContactForm";
import { Building2, Handshake, Mail, Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the Arvo team about business opportunities, acquisitions, partnerships, media enquiries or general protocol questions.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    type: "website",
    url: "/contact",
    siteName: "Arvo",
    title: "Contact | Arvo",
    description:
      "Contact the Arvo team about business opportunities, acquisitions, partnerships, media enquiries or general protocol questions.",
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
    title: "Contact | Arvo",
    description:
      "Contact the Arvo team about business opportunities, acquisitions, partnerships, media enquiries or general protocol questions.",
    images: ["/og-image.jpg"],
  },
};

const enquiryTypes = [
  {
    title: "Business opportunities",
    text: "Operating businesses, acquisitions and strategic investment opportunities.",
    icon: Building2,
  },
  {
    title: "Partnerships",
    text: "Legal, operational, ecosystem and strategic partner enquiries.",
    icon: Handshake,
  },
  {
    title: "Media",
    text: "Press, interviews, publication requests and general media enquiries.",
    icon: Newspaper,
  },
];

export default function ContactPage() {
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
              Contact
            </p>

            <h1 className="text-balance text-6xl font-semibold leading-[0.92] tracking-[-0.05em] md:text-[6.25rem]">
              Speak to the Arvo team.
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-8 text-white/64">
              For business opportunities, partnerships, media enquiries or
              questions about the protocol, use the form below.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button href="https://arvo.gitbook.io/arvo">Read whitepaper</Button>
              <Button href="/roadmap" variant="secondary">
                View roadmap
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#fbf4ef] py-28 text-[#07090b] md:py-36">
        <Container>
          <div className="mb-16 grid gap-5 md:grid-cols-3">
            {enquiryTypes.map(({ title, text, icon: Icon }) => (
              <div
                key={title}
                className="border border-black/10 bg-white/65 p-7"
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center border border-[#c9846a]/25 bg-[#c9846a]/10">
                  <Icon
                    size={24}
                    strokeWidth={1.45}
                    className="text-[#c9846a]"
                  />
                </div>

                <h3 className="text-2xl font-semibold tracking-[-0.035em]">
                  {title}
                </h3>

                <p className="mt-4 text-base leading-7 text-black/58">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-16 lg:grid-cols-[0.38fr_0.62fr]">
            <div>
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
                Get in touch
              </p>

              <h2 className="text-balance text-4xl font-semibold leading-[1] tracking-[-0.045em] md:text-6xl">
                Tell us what you want to discuss.
              </h2>

              <p className="mt-7 max-w-md text-lg leading-8 text-black/60">
                Your message will be reviewed and directed to the relevant
                person.
              </p>

              <div className="mt-10 flex items-center gap-4 border-t border-black/10 pt-8">
                <div className="flex h-11 w-11 items-center justify-center border border-black/10 bg-white/60">
                  <Mail
                    size={21}
                    strokeWidth={1.45}
                    className="text-[#c9846a]"
                  />
                </div>

                <p className="text-base leading-7 text-black/58">
                  For investor, partner and business enquiries.
                </p>
              </div>
            </div>

            <ContactForm />
          </div>
        </Container>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}