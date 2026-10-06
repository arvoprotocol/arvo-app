"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";

type StakeAsset = "ARVO" | "USDC";

const vaults = [
  {
    name: "60 Days",
    period: "Build",
    days: 60,
    arvoRate: 3,
    usdcRate: 2,
  },
  {
    name: "90 Days",
    period: "Advance",
    days: 90,
    arvoRate: 4,
    usdcRate: 3,
  },
  {
    name: "180 Days",
    period: "Compound",
    days: 180,
    arvoRate: 10,
    usdcRate: 6.5,
  },
  {
    name: "365 Days",
    period: "Foundation",
    days: 365,
    arvoRate: 22,
    usdcRate: 14,
  },
];

export default function VaultsPage() {
  const [amount, setAmount] = useState("10000");
  const [stakeAsset, setStakeAsset] = useState<StakeAsset>("ARVO");
  const [selected, setSelected] = useState(vaults[3]);

  const calc = useMemo(() => {
    const principal = Number(amount) || 0;

    const rate =
      stakeAsset === "ARVO" ? selected.arvoRate : selected.usdcRate;

    const reward = principal * (rate / 100);
    const total = principal + reward;

    return {
      principal,
      rate,
      reward,
      total,
    };
  }, [amount, stakeAsset, selected]);

  const formatAmount = (value: number) =>
    value.toLocaleString(undefined, {
      maximumFractionDigits: stakeAsset === "USDC" ? 2 : 4,
    });

  return (
    <main>
      <div className="noise" />
      <Header />

      <section className="relative overflow-hidden bg-[#07090b] pt-56 pb-28 text-white md:pt-64 md:pb-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(201,143,115,.20),transparent_34%),radial-gradient(circle_at_22%_36%,rgba(139,92,246,.12),transparent_30%),linear-gradient(to_bottom,#07090b,#090d12_60%,#0c1016)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:80px_80px]" />

        <Container className="relative z-10">
          <div className="grid gap-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="mb-7 text-sm font-semibold uppercase tracking-[0.24em] text-[#e2a98e]">
                ARVO Vaults
              </p>

              <h1 className="text-balance text-6xl font-semibold leading-[0.92] tracking-[-0.05em] md:text-[6.25rem]">
                Participation, rewarded.
              </h1>

              <p className="mt-8 max-w-2xl text-xl leading-8 text-white/64">
                Stake ARVO, USDC or both across fixed-term vaults. Each live
                position has defined terms, a fixed maturity date and rewards
                committed when the position is opened.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button href="#calculator">Estimate rewards</Button>

                <Button
                  href="https://arvo.gitbook.io/arvo"
                  variant="secondary"
                >
                  Read whitepaper
                </Button>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.035] p-10 backdrop-blur-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/40">
                Foundation vault
              </p>

              <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-6">
                <div>
                  <div className="text-[5.8rem] font-semibold leading-none tracking-[-0.065em] text-[#e2a98e]">
                    22%
                  </div>

                  <p className="mt-3 text-sm uppercase tracking-[0.16em] text-white/40">
                    ARVO cycle reward
                  </p>
                </div>

                <div>
                  <div className="text-[5.8rem] font-semibold leading-none tracking-[-0.065em] text-white">
                    14%
                  </div>

                  <p className="mt-3 text-sm uppercase tracking-[0.16em] text-white/40">
                    USDC cycle reward
                  </p>
                </div>
              </div>

              <p className="mt-8 max-w-lg text-lg leading-8 text-white/60">
                Illustrative rewards for the 365-day Foundation vault. Final
                rates, capacity and terms will be confirmed before each vault
                opens. Rewards shown apply to the full cycle and are not
                annualised APY.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="calculator"
        className="relative overflow-hidden bg-[#fbf4ef] py-28 text-[#07090b] md:py-36"
      >
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
              Reward Calculator
            </p>

            <h2 className="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.045em] md:text-7xl">
              Choose how you want to stake.
            </h2>

            <p className="mx-auto mt-7 max-w-3xl text-xl leading-8 text-black/60">
              Compare estimated ARVO and USDC rewards across each fixed-term
              vault.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-10 lg:grid-cols-[0.38fr_0.62fr]">
            <div className="border border-black/10 bg-white/65 p-8 backdrop-blur">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-black/40">
                  Stake with
                </label>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {(["ARVO", "USDC"] as StakeAsset[]).map((asset) => (
                    <button
                      key={asset}
                      type="button"
                      onClick={() => setStakeAsset(asset)}
                      className={`border px-5 py-4 text-sm font-semibold transition ${
                        stakeAsset === asset
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white/50 text-black hover:bg-white"
                      }`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-black/40">
                  {stakeAsset} amount
                </label>

                <div className="mt-4 flex items-center border-b border-black/15 pb-4">
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="decimal"
                    className="w-full bg-transparent text-5xl font-semibold tracking-[-0.055em] outline-none"
                  />

                  <span className="ml-4 text-lg font-semibold text-black/30">
                    {stakeAsset}
                  </span>
                </div>
              </div>

              <div className="mt-10 border-t border-black/10 pt-6">
                <p className="text-sm leading-6 text-black/50">
                  Rates shown are illustrative. Final reward rates, supported
                  assets, capacity and reward modes are set for each vault
                  before it opens.
                </p>
              </div>
            </div>

            <div className="border border-black/10 bg-[#07090b] p-8 text-white shadow-[0_28px_90px_rgba(7,9,11,.20)]">
              <div className="grid gap-3 md:grid-cols-4">
                {vaults.map((vault) => {
                  const rate =
                    stakeAsset === "ARVO"
                      ? vault.arvoRate
                      : vault.usdcRate;

                  return (
                    <button
                      key={vault.name}
                      type="button"
                      onClick={() => setSelected(vault)}
                      className={`border p-5 text-left transition ${
                        selected.name === vault.name
                          ? "border-[#e2a98e] bg-[#e2a98e]/10"
                          : "border-white/10 bg-white/[0.025] hover:bg-white/[0.055]"
                      }`}
                    >
                      <p className="text-sm font-semibold text-white">
                        {vault.name}
                      </p>

                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/35">
                        {vault.period}
                      </p>

                      <p className="mt-7 text-4xl font-semibold tracking-[-0.05em] text-[#e2a98e]">
                        {rate}%
                      </p>

                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">
                        {stakeAsset} cycle reward
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-2">
                <div className="border border-white/10 bg-white/[0.035] p-7">
                  <p className="text-sm uppercase tracking-[0.18em] text-white/35">
                    Principal
                  </p>

                  <p className="mt-4 text-5xl font-semibold tracking-[-0.055em]">
                    {formatAmount(calc.principal)}
                  </p>

                  <p className="mt-3 text-sm text-white/42">
                    {stakeAsset} staked
                  </p>
                </div>

                <div className="border border-[#e2a98e]/20 bg-[#e2a98e]/10 p-7">
                  <p className="text-sm uppercase tracking-[0.18em] text-white/45">
                    Estimated cycle reward
                  </p>

                  <p className="mt-4 text-5xl font-semibold tracking-[-0.055em] text-[#e2a98e]">
                    +{formatAmount(calc.reward)}
                  </p>

                  <p className="mt-3 text-sm text-white/42">
                    {stakeAsset} over {selected.days} days
                  </p>
                </div>
              </div>

              <div className="mt-5 border border-white/10 bg-white/[0.035] p-7">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-white/35">
                      Principal + estimated reward
                    </p>

                    <p className="mt-4 text-6xl font-semibold tracking-[-0.06em]">
                      {formatAmount(calc.total)}
                    </p>

                    <p className="mt-2 text-sm text-white/42">
                      {stakeAsset}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-sm uppercase tracking-[0.16em] text-white/35">
                      Selected vault
                    </p>

                    <p className="mt-2 text-lg font-semibold text-white">
                      {selected.period} · {selected.days} days
                    </p>
                  </div>
                </div>

                <p className="mt-6 max-w-2xl text-sm leading-6 text-white/42">
                  Estimates are based on the illustrative rates shown and do
                  not represent a guaranteed return or live vault quote. Final
                  rates, capacity and terms will be confirmed before each vault
                  opens.
                </p>
              </div>

              <div className="mt-5 border border-[#e2a98e]/20 bg-[#e2a98e]/[0.07] p-7">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-[#e2a98e]">
                    Dual staking
                  </p>

                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
                    Stake ARVO + USDC together.
                  </h3>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                    Eligible Dual vaults may include an enhanced reward
                    structure. The applicable reward, boost, capacity and terms
                    will be defined when each Dual vault opens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-white py-28 text-[#07090b] md:py-36">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
            <div>
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
                How vaults work
              </p>

              <h2 className="text-balance text-4xl font-semibold leading-[1] tracking-[-0.045em] md:text-6xl">
                Defined terms. Backed rewards. Clear settlement.
              </h2>

              <p className="mt-7 max-w-xl text-lg leading-8 text-black/55">
                Once a live position is opened, its principal, committed reward
                and maturity are recorded. Pool capacity and reward backing are
                checked before a new position can be opened.
              </p>
            </div>

            <div className="divide-y divide-black/10 border-y border-black/10">
              {[
                [
                  "Choose your position",
                  "Select an available vault and stake ARVO, USDC or both where Dual staking is enabled. Supported assets, reward modes and capacity are defined for each live vault.",
                ],
                [
                  "Rewards are reserved",
                  "Reward capital is funded and reserved against vaults. A new position cannot be opened unless sufficient capacity and reward budget are available.",
                ],
                [
                  "Fixed-term commitment",
                  "When a position opens, its principal, committed reward and maturity are recorded. Standard positions do not have a normal early-withdrawal option.",
                ],
                [
                  "Claim, restake or compound",
                  "At maturity, eligible positions can be claimed or rolled into another available position through restaking or compounding.",
                ],
              ].map(([title, text]) => (
                <div key={title} className="py-8">
                  <h3 className="text-3xl font-semibold tracking-[-0.04em]">
                    {title}
                  </h3>

                  <p className="mt-4 text-lg leading-8 text-black/58">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#0b0e12] py-28 text-white md:py-36">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.55fr_0.45fr] lg:items-end">
            <div>
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-[#e2a98e]">
                Built-in protection
              </p>

              <h2 className="max-w-4xl text-balance text-4xl font-semibold leading-[1] tracking-[-0.045em] md:text-6xl">
                Principal, committed rewards and pool reserves are accounted for
                separately.
              </h2>
            </div>

            <p className="max-w-xl text-lg leading-8 text-white/55">
              User principal is not treated as spare reward capital. Rewards
              committed to positions and budgets reserved for vaults remain
              protected by the protocol&apos;s solvency accounting.
            </p>
          </div>

          <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-3">
            {[
              [
                "At maturity",
                "Claim principal and earned rewards, or use an eligible restake or compound route into another available position.",
              ],
              [
                "During an emergency",
                "If the protocol is paused before maturity, the position owner can recover their principal through Emergency Exit and forfeit the unearned reward.",
              ],
              [
                "Admin safeguards",
                "Admin can pause the protocol but cannot use Emergency Exit to take user funds. Each holder withdraws their own principal directly from the contract.",
              ],
            ].map(([title, text]) => (
              <div key={title} className="bg-[#0b0e12] p-8 md:p-10">
                <h3 className="text-2xl font-semibold tracking-[-0.035em]">
                  {title}
                </h3>

                <p className="mt-4 text-base leading-7 text-white/50">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-sm leading-6 text-white/38">
            Reward figures displayed on this page are illustrative and are not
            guaranteed. Final rates, supported assets, capacity and reward modes
            are determined for each vault before it opens. Once a position is
            opened, its applicable terms are recorded for that position.
          </p>
        </Container>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}
