import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Landmark, LockKeyhole } from "lucide-react";

const model = [
  {
    title: "Governance",
    text: "Vote on Treasury policies, capital allocation proposals and future protocol initiatives.",
    icon: "governance",
  },
  {
    title: "Staking",
    text: "Lock ARVO into fixed-term vaults to earn protocol rewards.",
    icon: "staking",
  },
  {
    title: "Alignment",
    text: "As the Treasury grows, ARVO coordinates participation across the wider ecosystem.",
    icon: "token",
  },
];
export function TreasuryToken() {
  return (
    <section
      id="treasury"
      className="relative overflow-hidden bg-[#07090b] py-36 text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(201,132,106,.16),transparent_32%),radial-gradient(circle_at_18%_78%,rgba(139,92,246,.14),transparent_34%)]" />

      <Container className="relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#e2a98e]">
  The ARVO Token
</p>

<h2 className="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl">
  Treasury creates discipline.
  <br />
  Token creates alignment.
</h2>

<p className="mx-auto mt-7 max-w-3xl text-xl leading-8 text-white/60">
  ARVO is the coordination layer of the protocol. It enables governance, staking and long-term participation as the Treasury and ecosystem develop.
</p>
        </div>

        <div className="relative mx-auto mt-20 max-w-6xl">
          <div className="absolute left-[12%] right-[12%] top-[44px] hidden h-px bg-white/16 md:block" />

          <div className="grid gap-12 md:grid-cols-3">
            {model.map((item) => (
              <div key={item.title} className="relative text-center">
                <div className="mx-auto mb-8 flex h-[88px] w-[88px] items-center justify-center border border-white/14 bg-white/[.035] backdrop-blur-xl">

                  {item.icon === "governance" && (
  <Landmark
    size={38}
    strokeWidth={1.5}
    className="text-[#e2a98e]"
  />
)}

{item.icon === "staking" && (
  <LockKeyhole
    size={38}
    strokeWidth={1.5}
    className="text-[#e2a98e]"
  />
)}

                  {item.icon === "token" && (
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e2a98e]/45">
                      <div className="absolute inset-[4px] rounded-full border border-white/10" />

                      <span className="relative -mt-[1px] text-[15px] leading-none text-[#e2a98e]">
                        ▲
                      </span>
                    </div>
                  )}

                </div>

                <h3 className="text-3xl font-semibold tracking-[-0.015em]">
                  {item.title}
                </h3>

                <p className="mx-auto mt-5 max-w-xs text-base leading-7 text-white/55">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-14 flex max-w-5xl flex-col items-center justify-center gap-4 sm:flex-row">
  <Button href="/token">
    Explore Token
  </Button>

  <Button href="/treasury" variant="secondary">
    Explore Treasury
  </Button>
</div>
      </Container>
    </section>
  );
}