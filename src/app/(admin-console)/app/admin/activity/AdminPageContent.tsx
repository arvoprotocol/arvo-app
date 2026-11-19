import {
  Activity,
  ArrowDownToLine,
  Boxes,
  Coins,
  ExternalLink,
  Filter,
  Landmark,
  LockKeyhole,
  Search,
  ShieldAlert,
  WalletCards,
} from "lucide-react";

import {
  PageTitle,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
} from "@/components/protocol/ProtocolUI";

export default function AdminActivityPage() {
  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <PageTitle
        eyebrow="Protocol audit trail"
        title="Activity."
        copy="Review staking, settlement, pool, reward, Treasury and administrative activity recorded on-chain."
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Transactions"
          value="–"
          detail="Indexed protocol activity"
          icon={<Activity size={16} />}
        />

        <StatCard
          label="User activity"
          value="–"
          detail="Stake and settlement events"
          icon={<WalletCards size={16} />}
        />

        <StatCard
          label="Pool operations"
          value="–"
          detail="Pool lifecycle events"
          icon={<Boxes size={16} />}
        />

        <StatCard
          label="Treasury operations"
          value="–"
          detail="Funding and allocation events"
          icon={<Landmark size={16} />}
        />
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Explorer"
            title="Protocol events"
            action={<StatusPill>On-chain</StatusPill>}
          />

          <div className="border-b border-black/[0.06] p-5 md:p-6">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/50"
                />

                <input
                  type="text"
                  placeholder="Transaction, wallet, position or pool ID"
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-black/[0.08] bg-white py-3 pl-10 pr-4 text-sm opacity-55 outline-none placeholder:text-black/25"
                />
              </div>

              <div className="relative">
                <Filter
                  size={13}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/50"
                />

                <select
                  disabled
                  className="w-full cursor-not-allowed appearance-none rounded-xl border border-black/[0.08] bg-white py-3 pl-10 pr-4 text-sm text-black/55 opacity-55 outline-none"
                  defaultValue="all"
                >
                  <option value="all">All activity</option>
                  <option value="positions">Positions</option>
                  <option value="pools">Pools</option>
                  <option value="rewards">Rewards</option>
                  <option value="treasury">Treasury</option>
                  <option value="emergency">Emergency</option>
                  <option value="governance">Governance</option>
                </select>
              </div>

              <select
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-black/55 opacity-55 outline-none"
                defaultValue="newest"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.12] bg-black/[0.018] px-6 text-center">
              <Activity size={21} className="text-black/50" />

              <p className="mt-4 text-sm font-semibold">
                No contract activity connected.
              </p>

              <p className="mt-1.5 max-w-lg text-xs leading-5 text-black/38">
                After Robinhood testnet deployment, this screen will read
                contract events and transaction data directly from the
                deployed protocol.
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Event coverage"
            title="Tracked protocol activity"
          />

          <div className="grid gap-px bg-black/[0.06] md:grid-cols-2 xl:grid-cols-4">
            <EventGroup
              icon={<WalletCards size={17} />}
              title="Positions"
              events={[
                "Staked",
                "PositionClaimed",
                "PositionRestaked",
                "PositionCompounded",
                "EmergencyExited",
                "EmergencyUsdcDeferred",
                "EmergencyUsdcClaimed",
              ]}
            />

            <EventGroup
              icon={<Boxes size={17} />}
              title="Pools"
              events={[
                "PoolCreated",
                "PoolStatusChanged",
                "PoolRewardBudgetReserved",
                "PoolFinalized",
              ]}
            />

            <EventGroup
              icon={<Coins size={17} />}
              title="Treasury"
              events={[
                "RewardReserveFunded",
                "ProtocolAllocationIncreased",
                "SurplusWithdrawn",
              ]}
            />

            <EventGroup
              icon={<ShieldAlert size={17} />}
              title="Administration"
              events={[
                "Paused / Unpaused",
                "Role changes",
                "Upgrade activity",
              ]}
            />
          </div>
        </Panel>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            eyebrow="Event detail"
            title="Selected transaction"
          />

          <div className="divide-y divide-black/[0.06] px-5 md:px-6">
            <DetailRow label="Event" value="–" />
            <DetailRow label="Transaction" value="–" />
            <DetailRow label="Block" value="–" />
            <DetailRow label="Timestamp" value="–" />
            <DetailRow label="Caller / user" value="–" />
            <DetailRow label="Position ID" value="–" />
            <DetailRow label="Pool ID" value="–" />
          </div>

          <div className="border-t border-black/[0.06] p-5 md:p-6">
            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-black/[0.08] px-4 py-3 text-xs font-semibold text-black/55"
            >
              <ExternalLink size={13} />
              View transaction on explorer
            </button>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Source of truth"
            title="On-chain audit trail"
          />

          <div className="p-5 md:p-6">
            <div className="flex gap-3">
              <LockKeyhole
                size={17}
                className="mt-0.5 shrink-0 text-[#ad7058]"
              />

              <div>
                <p className="text-sm font-semibold">
                  Activity is not manually editable.
                </p>

                <p className="mt-1.5 text-xs leading-5 text-black/55">
                  Protocol activity is derived from confirmed transactions and
                  emitted contract events. The admin console does not maintain
                  a separate mutable record of on-chain actions.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <SourceRow
                icon={<ArrowDownToLine size={14} />}
                label="Contract events"
                copy="Decode Arvo staking and inherited security events."
              />

              <SourceRow
                icon={<Activity size={14} />}
                label="Transaction receipts"
                copy="Confirm transaction status, block and transaction hash."
              />

              <SourceRow
                icon={<ExternalLink size={14} />}
                label="Robinhood explorer"
                copy="Provide independent transaction verification."
              />
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}

function EventGroup({
  icon,
  title,
  events,
}: {
  icon: React.ReactNode;
  title: string;
  events: string[];
}) {
  return (
    <div className="bg-white/70 p-5 md:p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9846a]/10 text-[#a9654f]">
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold">{title}</p>

      <div className="mt-3 space-y-1.5">
        {events.map((event) => (
          <p
            key={event}
            className="font-mono text-[10px] leading-4 text-black/38"
          >
            {event}
          </p>
        ))}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-3.5">
      <span className="text-xs text-black/55">{label}</span>
      <span className="max-w-[60%] truncate text-right text-xs font-semibold">
        {value}
      </span>
    </div>
  );
}

function SourceRow({
  icon,
  label,
  copy,
}: {
  icon: React.ReactNode;
  label: string;
  copy: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-black/[0.025] px-4 py-3">
      <div className="mt-0.5 text-black/50">{icon}</div>

      <div>
        <p className="text-xs font-semibold">{label}</p>
        <p className="mt-0.5 text-[10px] leading-4 text-black/55">
          {copy}
        </p>
      </div>
    </div>
  );
}
