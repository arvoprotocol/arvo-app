import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export function TrackRecord() {
  return (
    <section className="bg-[#07090b] py-32 text-white">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#e2a98e]">
              Operator led
            </p>
            <h2 className="text-balance text-5xl font-semibold tracking-[-0.025em] md:text-7xl">
              Built by a team with real transaction experience.
            </h2>
          </div>

          <div>
            <div className="text-[6rem] font-semibold leading-none tracking-[-0.07em] text-[#e2a98e] md:text-[9rem]">
              $35M+
            </div>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-white/62">
              The founding team has completed more than $35 million in land and property transactions. Arvo begins with real estate because the team understands how to source, structure and execute these opportunities.
            </p>
            <div className="mt-10">
              <Button href="/team" variant="secondary">Meet the team</Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
