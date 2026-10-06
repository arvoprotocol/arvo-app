import { Container } from "@/components/layout/Container";

const areas = [
  ["Adjacent real estate ventures", "Opportunities connected to land, property, planning, development and real estate infrastructure."],
  ["Software and digital infrastructure", "Businesses with scalable margins, recurring revenue potential and operational leverage."],
  ["AI-enabled operations", "Practical systems that improve efficiency, decision-making and productivity inside operating businesses."],
];

export function BeyondLand() {
  return (
    <section className="bg-[#fff9f5] py-36 text-[#07090b]">
      <Container>
        <div className="max-w-5xl">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-black/45">
            Expansion strategy
          </p>
          <h2 className="text-balance text-5xl font-semibold tracking-[-0.025em] md:text-7xl">
            Arvo does not abandon its first business. It compounds from it.
          </h2>
          <p className="mt-7 max-w-3xl text-xl leading-8 text-black/60">
            The first operating business creates the base. Future expansion should build from the same principle: acquire or build productive businesses that can contribute durable value to the Treasury.
          </p>
        </div>

        <div className="mt-20 divide-y divide-black/10 border-y border-black/10">
          {areas.map(([title, text]) => (
            <div key={title} className="grid gap-8 py-10 md:grid-cols-[0.45fr_1fr]">
              <h3 className="text-4xl font-semibold tracking-[-0.02em]">{title}</h3>
              <p className="max-w-3xl text-xl leading-8 text-black/58">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
