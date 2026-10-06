import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

const vaults = ["Flexible", "60 Day", "180 Day", "365 Day"];

export function StakingPreview() {
  return (
    <section className="bg-white py-32 text-[#07090b]">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-black/45">
              Staking
            </p>
            <h2 className="text-balance text-5xl font-semibold tracking-[-0.025em] md:text-7xl">
              Designed for long-term alignment.
            </h2>
            <p className="mt-7 text-xl leading-8 text-black/60">
              Arvo staking is designed around alignment, not hype. Future vaults may support ARVO rewards, stablecoin rewards and governance participation.
            </p>
            <div className="mt-10">
              <Button href="/vaults" variant="dark">Explore staking</Button>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-[#fbf4ef] p-5">
            <div className="grid gap-4">
              {vaults.map((vault) => (
                <div key={vault} className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-6">
                  <span className="text-xl font-semibold">{vault}</span>
                  <span className="text-sm font-medium text-black/45">Vault</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
