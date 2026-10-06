import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/animations/Reveal";
import { HeroFlow } from "@/components/flow/HeroFlow";
import { AnimatedHeadline } from "@/components/animations/AnimatedHeadline";

const credibilityItems = [
  {
    name: "RWA Association",
    src: "/rwa.svg",
    subtitle: "Member of the RWA Association",
    href: "https://www.rwa.io/",
  },
  {
    name: "Business Insider",
    src: "/business-insider.png",
    subtitle: "Featured In",
  },
  {
    name: "GLC Legal",
    src: "/glc-legal-logo.svg",
    subtitle: "Appointed Legal Partner",
    href: "https://glclegal.com/",
  },
  {
    name: "CUK Group",
    src: "/CUK-Group-Logo.png",
    subtitle: "Existing Operating Business",
    href: "https://connectukgroup.co.uk/",
  },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#07090b] pt-40 sm:pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_42%,rgba(201,143,115,.18),transparent_32%),radial-gradient(circle_at_68%_52%,rgba(82,105,128,.22),transparent_34%),radial-gradient(circle_at_18%_28%,rgba(255,255,255,.055),transparent_28%),linear-gradient(to_bottom,#07090b,#080b0f_58%,#0c1016)]" />
      <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:80px_80px]" />

      <Container className="relative z-10">
        <div className="grid min-h-[calc(100vh-150px)] items-center gap-x-10 gap-y-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10">
            <AnimatedHeadline />

            <Reveal delay={0.16}>
              <p className="mt-8 max-w-xl text-xl leading-8 text-white/64">
                Arvo acquires and invests in established businesses, with
                operating profits strengthening the Treasury and funding future
                investments.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-6 max-w-xl text-xl leading-8">
                <span className="text-[#e2a98e]">Backed by a </span>
                <Link
                  href="/team"
                  className="text-[#e2a98e] underline decoration-[#e2a98e]/60 underline-offset-4 transition hover:text-white hover:decoration-white/60"
                >
                  team
                </Link>
                <span className="text-[#e2a98e]"> with </span>
                <span className="text-white">
                  30+ years of operating experience.
                </span>
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button href="#what">How it works</Button>

                <Button href="https://arvo.gitbook.io/arvo" variant="secondary">
                  Read whitepaper
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <HeroFlow />
          </Reveal>

          <Reveal delay={0.34} className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-5 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
                {credibilityItems.map((item, index) => {
                  const imageWidth =
                    item.name === "Business Insider"
                      ? 165
                      : item.name === "RWA Association"
                      ? 165
                      : item.name === "GLC Legal"
                      ? 170
                      : item.name === "CUK Group"
                      ? 125
                      : 160;

                  const imageClass =
                    item.name === "Business Insider"
                      ? "max-h-9 opacity-55"
                      : item.name === "RWA Association"
                        ? "max-h-9 opacity-65"
                        : item.name === "GLC Legal"
                          ? "max-h-7 opacity-60"
                          : item.name === "CUK Group"
                            ? "max-h-8 opacity-55"
                            : "max-h-8 opacity-60";

                  const content = (
                    <>
                      <Image
                        src={item.src}
                        alt={item.name}
                        width={imageWidth}
                        height={42}
                        className={`mb-4 h-auto w-auto max-w-[150px] object-contain brightness-0 invert transition-all duration-300 group-hover:opacity-90 group-hover:scale-[1.03] ${imageClass}`}
                      />

                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45 transition-colors duration-300 group-hover:text-white/60">
                        {item.subtitle}
                      </p>
                    </>
                  );

                  return (
                    <div
                      key={item.name}
                      className={`flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 ${
                        index !== credibilityItems.length - 1
                          ? "lg:border-r lg:border-white/10"
                          : ""
                      }`}
                    >
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col items-center justify-center transition duration-300"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="group flex flex-col items-center justify-center">
                          {content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}