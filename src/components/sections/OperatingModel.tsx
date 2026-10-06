import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import {
  Bot,
  BriefcaseBusiness,
  Building2,
  MonitorSmartphone,
} from "lucide-react";

const steps = [
  ["01", "Acquire", "Source land and real estate opportunities."],
["02", "Structure", "Optimise each opportunity through structuring and positioning."],
  ["03", "Subdivide", "Create smaller, more saleable parcels."],
  [
    "03",
    "Sell",
    "Typically sold through auction, providing speed and capital recycling.",
  ],
  [
    "05",
    "Reinvest",
    "Capital is deployed into the Treasury and future investments.",
  ],
];

const futureSectors = [
  {
    title: "Software",
    text: "SaaS, business tools and platforms with recurring revenue potential.",
    icon: MonitorSmartphone,
  },
  {
    title: "AI",
    text: "Applied AI systems that solve operational or commercial problems.",
    icon: Bot,
  },
  {
    title: "Digital Infrastructure",
    text: "Platforms, automation and systems that support business operations.",
    icon: Building2,
  },
  {
    title: "Private Businesses",
    text: "Established companies with proven earnings and long-term growth potential.",
    icon: BriefcaseBusiness,
  },
];

export function OperatingModel() {
  return (
    <section
      id="real-estate"
      className="relative overflow-hidden bg-white py-28 text-[#07090b]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_8%,rgba(201,132,106,.075),transparent_28%),radial-gradient(circle_at_86%_78%,rgba(139,92,246,.045),transparent_30%)]" />

      <Container className="relative z-10">
        <div className="grid gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:items-end">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-black/45">
              First operating business
            </p>

            <h2 className="max-w-6xl text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl">
              Real estate is where Arvo begins.
            </h2>
          </div>

          <p className="max-w-2xl text-xl leading-8 text-black/60 lg:-ml-10">
            Land is a tangible asset with clear intrinsic value. Arvo begins with the same acquisition, subdivision and auction model already operated by the founding team, providing a proven foundation for long-term Treasury growth.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-sm bg-[#07090b] p-10 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(201,132,106,.28),transparent_36%),radial-gradient(circle_at_95%_85%,rgba(139,92,246,.18),transparent_34%)]" />

            <div className="relative z-10">
              <div className="text-[4.8rem] font-semibold leading-none tracking-[-0.045em] text-[#e2a98e] md:text-[6.8rem]">
                $35M+
              </div>

              <p className="mt-6 max-w-sm text-xl leading-8 text-white/70">
                Completed land and property transactions by the founding team through the same operating model that forms the foundation of Arvo.
              </p>

              <div className="mt-10">
                <Button href="/team">Meet the team</Button>
              </div>
            </div>
          </div>

          <div className="grid overflow-hidden border border-black/10 md:grid-cols-5">
            {steps.map(([num, title, text]) => (
              <div
                key={title}
                className="group border-b border-black/10 bg-white px-6 py-8 transition-all duration-300 hover:bg-[#fbf4ef] md:border-b-0 md:border-r md:last:border-r-0"
              >
                <div className="mb-7 text-[2.6rem] font-semibold leading-none tracking-[-0.05em] text-black/12 transition-colors group-hover:text-[#c9846a]/35">
                  {num}
                </div>

                <h3 className="text-[1.55rem] font-semibold tracking-[-0.015em]">
                  {title}
                </h3>

                <p className="mt-5 text-base leading-7 text-black/58">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-black/10 pt-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-black/45">
            Future Investment Sectors
          </p>

          <h3 className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Areas where the team has operating experience or strategic advantage.
          </h3>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {futureSectors.map(({ title, text, icon: Icon }) => (
              <div
                key={title}
                className="group border border-black/10 bg-white/70 p-6 backdrop-blur transition-colors duration-300 hover:bg-[#fbf4ef]"
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center border border-[#c9846a]/25 bg-[#c9846a]/8">
                  <Icon
                    size={25}
                    strokeWidth={1.45}
                    className="text-[#c9846a]"
                  />
                </div>

                <h4 className="text-xl font-semibold tracking-[-0.02em]">
                  {title}
                </h4>

                <p className="mt-4 text-base leading-7 text-black/58">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}