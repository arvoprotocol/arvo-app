import { Container } from "@/components/layout/Container";

export function LandFirst() {
  return (
    <section id="real-estate" className="bg-white py-36 text-[#07090b]">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-black/45">
              First operating business
            </p>
            <h2 className="text-balance text-5xl font-semibold tracking-[-0.025em] md:text-7xl">
              Land and real estate provide the first engine of value.
            </h2>
          </div>
          <p className="max-w-xl text-xl leading-8 text-black/60">
            Arvo begins with land acquisition, subdivision and resale because it is tangible, understandable and backed by operator experience. Over time, Arvo can expand into adjacent real estate ventures and other productive businesses where the same capital discipline applies.
          </p>
        </div>

        <div className="mt-20 grid border-y border-black/10 md:grid-cols-5">
          {[
            ["Acquire", "Source land and real estate opportunities."],
            ["Improve", "Identify ways to unlock value."],
            ["Subdivide", "Create smaller, more saleable parcels where appropriate."],
            ["Resell", "Recycle capital through completed transactions."],
            ["Compound", "Profits contribute to the Treasury and future allocation."],
          ].map(([title, text], i) => (
            <div key={title} className="border-black/10 py-10 md:border-r md:px-8 md:last:border-r-0">
              <div className="mb-8 text-sm text-black/35">0{i + 1}</div>
              <div className="text-2xl font-semibold tracking-[-0.02em]">{title}</div>
              <p className="mt-4 text-sm leading-6 text-black/52">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
