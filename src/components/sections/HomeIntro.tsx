import { Container } from "@/components/layout/Container";

const metrics = [
  ["30+", "Years Experience"],
  ["$35M+", "Completed Transactions"],
  ["1B", "Fixed Token Supply"],
  ["35%", "Growth & Treasury"],
];

export function HomeIntro() {
  return (
    <section
      id="what"
      className="relative overflow-hidden bg-[#0c1016] py-44"
    >
      <Container className="max-w-6xl">
        <div className="mx-auto max-w-5xl">
          <p className="mb-10 text-sm font-semibold uppercase tracking-[0.22em] text-[#e2a98e]">
            Operating Model
          </p>

          <h2 className="max-w-5xl text-balance text-6xl font-semibold leading-[0.92] tracking-[-0.05em] text-white md:text-8xl">
            Operating businesses drive long-term treasury growth.
          </h2>

          {/* Metrics */}
          <div className="mt-16 grid gap-6 md:grid-cols-4">
            {metrics.map(([value, label]) => (
              <div
                key={label}
                className="border border-white/10 bg-white/[0.03] p-8"
              >
                <div className="text-4xl font-semibold tracking-[-0.04em] text-[#e2a98e]">
                  {value}
                </div>

                <p className="mt-3 text-sm uppercase tracking-[0.18em] text-white/55">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Operating flow */}
          <div className="mt-20">
            <div className="grid gap-12 md:grid-cols-4 md:gap-12">
              {[
                {
                  title: "Businesses",
                  text: "Established businesses generate recurring operating profits.",
                },
                {
                  title: "Treasury",
                  text: "Operating profits strengthen the Treasury.",
                },
                {
                  title: "Allocation",
                  text: "Allocated capital supports acquisitions, strategic growth, liquidity and protocol development.",
                },
                {
                  title: "Growth",
                  text: "Future investments expand the operating portfolio.",
                },
              ].map((item) => (
                <div key={item.title} className="min-w-0">
                  <h3 className="mb-5 text-3xl font-semibold tracking-[-0.03em] text-white">
                    {item.title}
                  </h3>

                  <p className="w-full leading-8 text-white/55 md:max-w-[230px]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}