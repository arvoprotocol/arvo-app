import {
  ArrowRight,
  GitBranch,
  LockKeyhole,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  PageTitle,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
} from "@/components/protocol/ProtocolUI";

export default function AdminPositionsPage() {
  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <PageTitle
        eyebrow="Staking operations"
        title="Positions."
        copy="Inspect user staking positions, maturity, rewards, settlement status and restaking lineage."
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total positions"
          value="–"
          detail="Created on-chain"
          icon={<WalletCards size={16} />}
        />

        <StatCard
          label="Active"
          value="–"
          detail="Not yet settled"
          icon={<ShieldCheck size={16} />}
        />

        <StatCard
          label="Settled"
          value="–"
          detail="Completed positions"
          icon={<LockKeyhole size={16} />}
        />

        <StatCard
          label="Wallets"
          value="–"
          detail="Unique position owners"
          icon={<UserRound size={16} />}
        />
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            eyebrow="Position lookup"
            title="Search by position ID"
          />

          <div className="p-5 md:p-6">
            <p className="text-sm leading-6 text-black/45">
              Retrieve a single staking position directly from the contract.
            </p>

            <div className="mt-5 flex gap-3">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Position ID"
                className="min-w-0 flex-1 rounded-xl border border-black/[0.09] bg-white px-4 py-3 text-sm outline-none placeholder:text-black/20"
              />

              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white opacity-35"
              >
                <Search size={14} />
                Search
              </button>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Wallet lookup"
            title="Search by owner"
          />

          <div className="p-5 md:p-6">
            <p className="text-sm leading-6 text-black/45">
              Retrieve every staking position ID associated with a wallet.
            </p>

            <div className="mt-5 flex gap-3">
              <input
                type="text"
                placeholder="0x..."
                className="min-w-0 flex-1 rounded-xl border border-black/[0.09] bg-white px-4 py-3 text-sm outline-none placeholder:text-black/20"
              />

              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white opacity-35"
              >
                <Search size={14} />
                Search
              </button>
            </div>
          </div>
        </Panel>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Panel>
          <PanelHeader
            eyebrow="Position detail"
            title="Selected position"
            action={<StatusPill>Read only</StatusPill>}
          />

          <div className="grid gap-px bg-black/[0.06] sm:grid-cols-2">
            <DetailGroup
              title="Identity"
              rows={[
                ["Position ID", "–"],
                ["Owner", "–"],
                ["Pool ID", "–"],
                ["Status", "–"],
              ]}
            />

            <DetailGroup
              title="Configuration"
              rows={[
                ["Stake mode", "–"],
                ["Reward mode", "–"],
                ["Dual boost", "–"],
                ["Loyalty boost", "–"],
              ]}
            />

            <DetailGroup
              title="Principal"
              rows={[
                ["ARVO principal", "–"],
                ["USDG principal", "–"],
                ["ARVO reward", "–"],
                ["USDG reward", "–"],
              ]}
            />

            <DetailGroup
              title="Lifecycle"
              rows={[
                ["Opened", "–"],
                ["Matures", "–"],
                ["Settled", "–"],
                ["Emergency exit", "–"],
              ]}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Lineage"
            title="Position chain"
            action={<GitBranch size={15} className="text-black/30" />}
          />

          <div className="p-5 md:p-6">
            <p className="text-xs leading-5 text-black/40">
              Restakes and compound settlements create a linked history between
              the previous and next position IDs.
            </p>

            <div className="mt-6 space-y-3">
              <LineageItem
                label="Previous position"
                value="–"
              />

              <div className="flex justify-center text-black/20">
                <ArrowRight size={15} className="rotate-90" />
              </div>

              <div className="rounded-xl border border-[#c9846a]/30 bg-[#c9846a]/[0.06] px-4 py-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#a9654f]">
                  Selected
                </p>
                <p className="mt-1 text-sm font-semibold">Position –</p>
              </div>

              <div className="flex justify-center text-black/20">
                <ArrowRight size={15} className="rotate-90" />
              </div>

              <LineageItem
                label="Next position"
                value="–"
              />
            </div>
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Results"
            title="Wallet positions"
          />

          <div className="p-5 md:p-6">
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.12] bg-black/[0.018] px-6 text-center">
              <Search size={20} className="text-black/25" />

              <p className="mt-4 text-sm font-semibold">
                No wallet selected.
              </p>

              <p className="mt-1.5 max-w-md text-xs leading-5 text-black/38">
                Enter a wallet address above to retrieve its position IDs and
                inspect individual staking positions.
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <div className="rounded-2xl bg-[#07090b] p-5 text-white md:p-6">
          <div className="flex gap-3">
            <LockKeyhole
              size={17}
              className="mt-0.5 shrink-0 text-[#e2a98e]"
            />

            <div>
              <p className="text-sm font-semibold">
                Administrators cannot alter user positions.
              </p>

              <p className="mt-1.5 max-w-3xl text-xs leading-5 text-white/45">
                This section is intentionally read-only. Position ownership,
                principal, rewards and settlement are controlled by the staking
                contract. The admin console does not provide an override for
                another user&apos;s stake.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailGroup({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <div className="bg-white/70 p-5 md:p-6">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#ad7058]">
        {title}
      </p>

      <div className="mt-3 divide-y divide-black/[0.05]">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 py-2.5"
          >
            <span className="text-xs text-black/38">{label}</span>
            <span className="max-w-[60%] truncate text-xs font-semibold">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineageItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-black/[0.07] px-4 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-black/30">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
