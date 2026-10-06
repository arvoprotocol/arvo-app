import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export function TokenPreview() {
  return (
    <section className="bg-[#0c1016] py-32 text-white">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#e2a98e]">
              ARVO token
            </p>
            <h2 className="text-balance text-5xl font-semibold tracking-[-0.025em] md:text-7xl">
              Access, alignment and future governance.
            </h2>
          </div>

          <div className="border-l border-white/10 pl-8">
            <p className="text-xl leading-8 text-white/62">
              The ARVO token is designed to connect participants to the Arvo ecosystem. The token page will explain utility, staking, governance, liquidity and how to buy ARVO once available.
            </p>
            <div className="mt-10">
              <Button href="/token" variant="secondary">Explore the token</Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
