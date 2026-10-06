import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="bg-[#fbf4ef] py-28 text-[#07090b]">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-[#07090b] p-10 text-white md:p-16">

          {/* Background glow */}

          <div className="absolute inset-0">
            <div className="absolute -right-24 top-[-120px] h-[420px] w-[420px] rounded-full bg-[#cf9578]/18 blur-[130px]" />

            <div className="absolute -left-24 bottom-[-140px] h-[340px] w-[340px] rounded-full bg-[#8b5cf6]/12 blur-[120px]" />

            <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-[90px]" />
          </div>

          {/* subtle grid */}

          <div className="absolute inset-0 opacity-[0.035]">
            <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.9)_1px,transparent_1px)] bg-[size:42px_42px]" />
          </div>

          <div className="relative z-10">

            <h2 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl">
              The Arvo investment thesis.
            </h2>

            <p className="mt-7 max-w-2xl text-xl leading-8 text-white/60">
              Read the whitepaper to understand the operating model, Treasury strategy and long-term expansion plans behind Arvo.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button href="https://arvo.gitbook.io/arvo">
                Read whitepaper
              </Button>

              <Button href="/contact" variant="secondary">
                Contact Arvo
              </Button>
            </div>

          </div>

        </div>
      </Container>
    </section>
  );
}