import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Meet the team behind Arvo, bringing together experience across property, business operations, technology, product and long-term capital allocation.",
  alternates: {
    canonical: "/team",
  },
  openGraph: {
    type: "website",
    url: "/team",
    siteName: "Arvo",
    title: "Team | Arvo",
    description:
      "Meet the team behind Arvo, bringing together experience across property, business operations, technology, product and long-term capital allocation.",
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
    title: "Team | Arvo",
    description:
      "Meet the team behind Arvo, bringing together experience across property, business operations, technology, product and long-term capital allocation.",
    images: ["/og-image.jpg"],
  },
};

const leaders = [
  {
    name: "Zad Siadatan",
    title: "Chief Executive Officer",
    secondary: "Real Estate, Investment & Business Operations",
    image: "/zad.jpg",
    imagePosition: "object-center",
    linkedin: "https://www.linkedin.com/in/zad-siadatan-3188281b5/",
    intro:
      "With more than 30 years of experience, Zad has built, acquired and grown multiple successful property businesses across investment, development, auctions and asset management.",
    body:
      "As CEO, Zad is responsible for the strategic direction of Arvo, overseeing business operations, acquisitions and long-term growth. His experience buying, selling and operating property businesses provides the commercial foundation on which Arvo is being built.",
  },
  {
    name: "Marc Goodwin",
    title: "Executive Director",
    secondary: "Technology, Product & Blockchain",
    image: "/marc.jpg",
    imagePosition: "object-center",
    linkedin: "https://www.linkedin.com/in/mr-marc-goodwin/",
    x: "https://x.com/mrg_313",
    intro:
      "Marc brings more than 20 years of experience designing and delivering technology platforms across property, software, AI and blockchain.",
    body:
      "At Arvo, Marc leads the technical vision of the platform, overseeing product development, blockchain integrations and the technology strategy required to support the protocol as it grows.",
  },
  {
    name: "Louis Siadatan",
    title: "Executive Director",
    secondary: "Property Operations & Acquisitions",
    image: "/louis.jpg",
    imagePosition: "object-center",
    linkedin:
      "https://www.linkedin.com/in/louis-m-siadatan-955533192/",
    intro:
      "Louis has spent more than 15 years sourcing opportunities, managing projects and delivering property transactions across the UK real estate sector.",
    body:
      "He oversees the operational side of Arvo's property activities and works closely with the wider team to identify opportunities and execute acquisitions. Through his wider property network, Louis also works alongside a portfolio of around 900 landlords, providing valuable market insight and industry relationships.",
  },
];

export default function TeamPage() {
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
              Leadership
            </p>

            <h1 className="text-balance text-6xl font-semibold leading-[0.92] tracking-[-0.05em] md:text-[6.25rem]">
              Built on experience.
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-8 text-white/64">
              Arvo is led by people who build, buy, sell and operate businesses.
              The leadership team combines decades of property experience with
              technology, product development and commercial execution.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button href="https://arvo.gitbook.io/arvo">
                Read whitepaper
              </Button>

              <Button href="/roadmap" variant="secondary">
                View roadmap
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#fbf4ef] py-28 text-[#07090b] md:py-36">
        <Container>
          <div className="mb-20 grid gap-12 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
            <div>
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
                Real operating experience
              </p>

              <h2 className="text-balance text-4xl font-semibold leading-[1] tracking-[-0.045em] md:text-6xl">
                A team grounded in property, technology and execution.
              </h2>

              <p className="mt-8 max-w-xl text-lg leading-8 text-black/62">
                Arvo starts with land and property because the team already works
                in that market. The leadership brings practical experience in
                sourcing opportunities, structuring transactions, buying, selling,
                managing assets and building the systems needed to scale.
              </p>
            </div>

            <div className="w-full lg:pt-1">
              <div className="overflow-hidden rounded-[22px] border border-black/10 bg-black shadow-[0_22px_60px_rgba(0,0,0,.12)]">
                <div className="aspect-video w-full bg-black">
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    className="h-full w-full object-contain"
                  >
                    <source
                      src="https://video.twimg.com/amplify_video/2103055032950083585/vid/avc1/1920x1080/dJ1VdKED3Ctgpu5O.mp4?tag=29#t=4"
                      type="video/mp4"
                    />
                    Your browser does not support the video element.
                  </video>
                </div>
              </div>

              <p className="mt-4 max-w-xl text-sm leading-6 text-black/45">
                An introduction to Arvo, the experience behind the team and what
                we are building.
              </p>
            </div>
          </div>

          <div className="divide-y divide-black/10 border-y border-black/10">
            {leaders.map((person) => (
              <article
                key={person.name}
                className="grid gap-10 py-14 lg:grid-cols-[260px_1fr] lg:items-start"
              >
                <div className="w-full max-w-[280px] lg:max-w-[240px]">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[30px] border border-black/10 bg-black/5">
                    <Image
                      src={person.image}
                      alt={`${person.name}, ${person.title} at Arvo`}
                      fill
                      sizes="(max-width: 1023px) 280px, 240px"
                      className={`object-cover ${person.imagePosition}`}
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                  </div>
                </div>

                <div className="lg:pt-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/40">
                    {person.title}
                  </p>

                  <h3 className="mt-5 text-5xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-6xl">
                    {person.name}
                  </h3>

                  <p className="mt-4 text-xl font-medium tracking-[-0.02em] text-black/50">
                    {person.secondary}
                  </p>

                  <p className="mt-8 max-w-3xl text-[1.75rem] font-medium leading-[1.45] tracking-[-0.035em] text-black">
                    {person.intro}
                  </p>

                  <p className="mt-7 max-w-3xl text-lg leading-8 text-black/60">
                    {person.body}
                  </p>

                  <div className="mt-8 flex items-center gap-2">
                    <Link
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${person.name} on LinkedIn`}
                      className="group flex h-11 w-11 items-center justify-center rounded-lg border border-black/15 text-black/55 transition hover:border-black/30 hover:bg-black/[0.035] hover:text-black"
                    >
                      <span className="text-[14px] font-bold leading-none">
                        in
                      </span>
                    </Link>

                    {"x" in person && person.x && (
                      <Link
                        href={person.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${person.name} on X`}
                        className="group flex h-11 w-11 items-center justify-center rounded-lg border border-black/15 text-black/55 transition hover:border-black/30 hover:bg-black/[0.035] hover:text-black"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="h-[15px] w-[15px] fill-current"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}