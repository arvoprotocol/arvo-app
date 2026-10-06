import { Container } from "@/components/layout/Container";

export function ValueTransition() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0c1016] via-[#23231f] to-[#fbf4ef] py-40 text-white">
      <Container>
        <div className="max-w-5xl">
          <p className="mb-8 text-sm font-semibold uppercase tracking-[0.22em] text-[#e2a98e]">
            Why Arvo exists
          </p>

          <h2 className="text-balance text-5xl font-semibold tracking-[-0.06em] md:text-8xl">
            Blockchain made value visible. Arvo is designed to make it productive.
          </h2>

          <p className="mt-8 max-w-3xl text-xl leading-8 text-white/65">
            Many digital assets rely on speculation or emissions. Arvo starts from a different place: businesses, cash flow, Treasury discipline and long-term stewardship.
          </p>
        </div>
      </Container>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#fbf4ef]" />
    </section>
  );
}
