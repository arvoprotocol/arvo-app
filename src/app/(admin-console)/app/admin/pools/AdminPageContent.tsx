import { VaultDraftRegistry } from "@/components/protocol/VaultDraftRegistry";
import {PriceOracleControl} from "@/components/protocol/PriceOracleControl";
import { PoolRegistry } from "@/components/protocol/PoolRegistry";
import Link from "next/link";
import { AdminTabs } from "@/components/admin/AdminTabs";
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

export default function AdminPoolsPage({ acquisition }: { acquisition?: React.ReactNode }) {
  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <PageTitle
        eyebrow="Vaults & rewards"
        title="Vaults."
        copy="Plan vaults, then manage the ones that are live onchain."
      />

      <AdminTabs tabs={[
        { id: "live", label: "Live vaults", hint: "onchain", content: <PoolRegistry /> },
        { id: "planned", label: "Planned vaults", hint: "shown as coming soon", content: <VaultDraftRegistry /> },
        { id: "advanced", label: "Advanced", hint: "price source, acquisition, guide", content: <><PriceOracleControl />{acquisition}<Guide /></> },
      ]} />
    </div>
  );
}

function Guide() {
  return (
    <details className="group mt-8 rounded-2xl border border-black/[0.08] bg-white">
      <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold md:px-6 [&::-webkit-details-marker]:hidden">How vaults work <span className="ml-1 text-xs font-normal text-black/55">(show)</span></summary>
      <div className="border-t border-black/[0.06] p-5 md:p-6">
      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
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
              copy="ARVO and USDG each have their own public capacity. A zero cap means uncapped."
            />

            <PoolField
              icon={<Coins size={17} />}
              title="Reward budget"
              copy="Original and remaining ARVO and USDG reward budgets are tracked independently."
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

      <section className="mt-5">
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

              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
                Creating a pool does not create reward capital. Ordinary reward budgets require funds in the staking contract. Acquisition USDG vaults use a separate future reward limit and isolated escrow repayments. Configure these under Acquisition vaults below before opening.
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
    </details>
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
      <p className="mt-1.5 text-xs leading-5 text-black/60">{copy}</p>
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
      <span className="pt-0.5 text-[10px] font-bold tracking-[0.16em] text-[#ad7058]">
        {number}
      </span>

      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-black/60">{copy}</p>
      </div>
    </div>
  );
}
