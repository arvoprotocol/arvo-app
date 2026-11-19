import {
  AlertTriangle,
  Boxes,
  Landmark,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  PageTitle,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
} from "@/components/protocol/ProtocolUI";

export default function AdminAllocationPage() {
  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <PageTitle
        eyebrow="Treasury operations"
        title="Protocol allocation."
        copy="Allocate defined pool capacity to the protocol without creating a staking position, principal liability or reward entitlement."
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="ARVO allocated"
          value="–"
          detail="Across all pools"
          icon={<Landmark size={16} />}
        />

        <StatCard
          label="USDG allocated"
          value="–"
          detail="Across all pools"
          icon={<Landmark size={16} />}
        />

        <StatCard
          label="Pools with allocation"
          value="–"
          detail="Protocol capacity assigned"
          icon={<Boxes size={16} />}
        />

        <StatCard
          label="Available capacity"
          value="–"
          detail="Across capped pools"
          icon={<ShieldCheck size={16} />}
        />
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel>
          <PanelHeader
            eyebrow="Allocation"
            title="Increase protocol allocation"
            action={<StatusPill>Vault manager</StatusPill>}
          />

          <div className="p-5 md:p-6">
            <p className="max-w-2xl text-sm leading-6 text-black/45">
              Select a pool and assign unused ARVO or USDG capacity to the
              protocol. Allocation is additive and cannot be reduced through
              the staking contract.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/45">
              For a USDG vault, the USDG allocation is shown publicly as
              &ldquo;committed outside the app&rdquo;. Record only real, signed
              commitments. It fills capacity but earns no onchain reward, so
              any return on it is paid outside the contract.
            </p>

            <div className="mt-6 space-y-5">
              <Field
                label="Pool ID"
                placeholder="Enter pool ID"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="ARVO allocation"
                  placeholder="0"
                  suffix="ARVO"
                />

                <Field
                  label="USDG allocation"
                  placeholder="0"
                  suffix="USDG"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <PoolMetric label="ARVO capacity remaining" value="–" />
                <PoolMetric label="USDG capacity remaining" value="–" />
              </div>

              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#07090b] px-4 py-3 text-sm font-semibold text-white opacity-35"
              >
                <Landmark size={14} />
                Review allocation
              </button>

              <p className="text-[11px] leading-5 text-black/35">
                Transaction controls will become available after the staking
                contract and authorised Vault Manager wallet are connected.
              </p>
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel>
            <PanelHeader
              eyebrow="Selected pool"
              title="Capacity"
            />

            <div className="divide-y divide-black/[0.06] px-5">
              <SummaryRow label="Pool" value="–" />
              <SummaryRow label="Status" value="–" />
              <SummaryRow label="ARVO maximum" value="–" />
              <SummaryRow label="ARVO user principal" value="–" />
              <SummaryRow label="ARVO protocol allocation" value="–" />
              <SummaryRow label="USDG maximum" value="–" />
              <SummaryRow label="USDG user principal" value="–" />
              <SummaryRow label="USDG protocol allocation" value="–" />
            </div>
          </Panel>

          <div className="rounded-2xl bg-[#07090b] p-5 text-white">
            <div className="flex items-center gap-2">
              <LockKeyhole size={15} className="text-[#e2a98e]" />
              <p className="text-xs font-semibold">
                Capacity accounting only
              </p>
            </div>

            <p className="mt-3 text-xs leading-5 text-white/45">
              Protocol allocation does not transfer tokens into the staking
              contract and does not create a user position or reward-bearing
              stake.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Pool registry"
            title="Current allocations"
          />

          <div className="p-5 md:p-6">
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.12] bg-black/[0.018] px-6 text-center">
              <Landmark size={20} className="text-black/25" />

              <p className="mt-4 text-sm font-semibold">
                No contract data yet.
              </p>

              <p className="mt-1.5 max-w-md text-xs leading-5 text-black/38">
                Pool capacity and protocol allocations will be read directly
                from the staking contract after Robinhood testnet deployment.
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-50/70 p-5">
          <div className="flex gap-3">
            <AlertTriangle
              size={17}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <div>
              <p className="text-sm font-semibold text-amber-950">
                Allocation is permanent within a pool.
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-900/60">
                Protocol allocation can only increase. It cannot exceed the
                pool&apos;s configured capacity together with real user
                principal, and an uncapped asset cannot receive protocol
                allocation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  placeholder,
  suffix,
}: {
  label: string;
  placeholder: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-black/60">{label}</span>

      <div className="mt-2 flex overflow-hidden rounded-xl border border-black/[0.09] bg-white">
        <input
          type="text"
          inputMode={suffix ? "decimal" : undefined}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-black/20"
        />

        {suffix && (
          <span className="flex items-center border-l border-black/[0.06] bg-black/[0.02] px-3 text-[10px] font-semibold text-black/35">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function PoolMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-black/[0.025] px-4 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/30">
        {label}
      </p>
      <p className="mt-1.5 text-base font-semibold">{value}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="text-xs text-black/40">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}
