import { VaultDraftRegistry } from "@/components/protocol/VaultDraftRegistry";
import {PriceOracleControl} from "@/components/protocol/PriceOracleControl";
import { PoolRegistry } from "@/components/protocol/PoolRegistry";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Coins,
  Landmark,
  LockKeyhole,
} from "lucide-react";

import {
  PageTitle,
  Panel,
  PanelHeader,
} from "@/components/protocol/ProtocolUI";

export default function AdminPoolsPage() {
  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <PageTitle
        eyebrow="Staking operations"
        title="Pools."
        copy="Create and monitor staking pools, capacity, reward budgets and lifecycle status."
      />

      <VaultDraftRegistry />
      <PoolRegistry />
      <PriceOracleControl />

      <section className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Panel>
          <PanelHeader
            eyebrow="Pool model"
            title="What each pool tracks"
          />

          <div className="grid gap-px bg-black/[0.06] sm:grid-cols-2">
            <PoolField
              icon={<CalendarClock size={17} />}
              title="Opening & closing"
              copy="Each pool has an opening timestamp. Closing may be scheduled or left open-ended."
            />

            <PoolField
              icon={<LockKeyhole size={17} />}
              title="Principal capacity"
              copy="ARVO and USDC each have their own public capacity. A zero cap means uncapped."
            />

            <PoolField
              icon={<Coins size={17} />}
              title="Reward budget"
              copy="Original and remaining ARVO and USDC reward budgets are tracked independently."
            />

            <PoolField
              icon={<Landmark size={17} />}
              title="Protocol allocation"
              copy="Treasury allocation consumes capacity but is not a deposit, position or reward-bearing stake."
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Lifecycle"
            title="Pool controls"
          />

          <div className="divide-y divide-black/[0.06] px-5 md:px-6">
            <LifecycleRow
              number="01"
              title="Create"
              copy="Create Standard or Custom pool terms."
            />
            <LifecycleRow
              number="02"
              title="Fund & reserve"
              copy="Fund contract rewards and reserve the pool budget before opening."
            />
            <LifecycleRow
              number="03"
              title="Open"
              copy="Pool accepts eligible stakes once its opening time is reached."
            />
            <LifecycleRow
              number="04"
              title="Close"
              copy="Disable the pool or allow its scheduled closing time to pass."
            />
            <LifecycleRow
              number="05"
              title="Finalize"
              copy="Permanently close and release unused reward budget."
            />
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <div className="relative overflow-hidden rounded-2xl bg-[#07090b] p-6 text-white md:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#c9846a]/15 blur-3xl" />

          <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2a98e]">
                Operational safeguard
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                Pool funding is deliberately separate from pool creation.
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/42">
                Creating a pool does not create reward capital. Ordinary reward budgets require funds in the staking contract. Acquisition USDC vaults use a separate future reward limit and isolated escrow repayments. Configure these under Acquisition vaults below before opening.
              </p>
            </div>

            <Link
              href="/app/admin/rewards"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.1]"
            >
              Reward funding
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PoolField({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="bg-white/70 p-5 md:p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9846a]/10 text-[#a9654f]">
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold">{title}</p>
      <p className="mt-1.5 text-xs leading-5 text-black/38">{copy}</p>
    </div>
  );
}

function LifecycleRow({
  number,
  title,
  copy,
}: {
  number: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex gap-4 py-4">
      <span className="pt-0.5 text-[9px] font-bold tracking-[0.16em] text-[#ad7058]">
        {number}
      </span>

      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-black/38">{copy}</p>
      </div>
    </div>
  );
}
