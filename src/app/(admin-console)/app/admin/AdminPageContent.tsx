import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  Coins,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

import {
  PageTitle,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
} from "@/components/protocol/ProtocolUI";

export default function AdminOverviewPage() {
  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <PageTitle
        eyebrow="Protocol operations"
        title="Admin overview."
        copy="Monitor staking liabilities, reward reserves, pool capacity and protocol status."
      />

      <div className="mt-7 flex items-start gap-3 rounded-2xl border border-amber-700/15 bg-amber-50/70 p-4">
        <AlertTriangle
          size={18}
          className="mt-0.5 shrink-0 text-amber-700"
        />
        <div>
          <p className="text-sm font-semibold text-amber-950">
            Contract not connected
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-950/55">
            The admin console is in pre-deployment mode. Live balances,
            liabilities and protocol controls will become available after the
            Robinhood Chain testnet deployment is connected.
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="User principal"
          value="—"
          detail="ARVO + USDC liabilities"
          icon={<LockKeyhole size={16} />}
        />

        <StatCard
          label="Committed rewards"
          value="—"
          detail="Rewards owed to positions"
          icon={<Coins size={16} />}
        />

        <StatCard
          label="Reserved rewards"
          value="—"
          detail="Uncommitted pool budgets"
          icon={<CircleDollarSign size={16} />}
        />

        <StatCard
          label="Active pools"
          value="—"
          detail="Enabled staking pools"
          icon={<Boxes size={16} />}
        />
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Panel>
          <PanelHeader
            eyebrow="Solvency"
            title="Protocol coverage"
            action={<StatusPill>Awaiting contract</StatusPill>}
          />

          <div className="p-5 md:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <AssetCoverage
                asset="ARVO"
                balance="—"
                principal="—"
                rewards="—"
                reserved="—"
              />

              <AssetCoverage
                asset="USDC"
                balance="—"
                principal="—"
                rewards="—"
                reserved="—"
              />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-black/[0.035] p-4">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-black/40"
              />

              <div>
                <p className="text-xs font-semibold">
                  Protected balance rule
                </p>

                <p className="mt-1 text-[11px] leading-5 text-black/40">
                  Token balance must cover user principal, committed reward
                  liabilities and reserved pool reward budgets.
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Contract"
            title="System status"
          />

          <div className="divide-y divide-black/[0.06] px-5 md:px-6">
            <SystemRow
              label="Network"
              value="Not connected"
            />
            <SystemRow
              label="Staking proxy"
              value="Not deployed"
            />
            <SystemRow
              label="Protocol state"
              value="Unavailable"
            />
            <SystemRow
              label="Governance"
              value="Not configured"
            />
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Pools"
            title="Staking operations"
          />

          <div className="grid gap-px bg-black/[0.06] sm:grid-cols-2 xl:grid-cols-4">
            <OperationCard
              icon={<Boxes size={18} />}
              title="Pools"
              copy="Create, review and manage staking pools."
              href="/app/admin/pools"
            />

            <OperationCard
              icon={<Coins size={18} />}
              title="Rewards"
              copy="Fund rewards and reserve pool budgets."
              href="/app/admin/rewards"
            />

            <OperationCard
              icon={<Landmark size={18} />}
              title="Protocol allocation"
              copy="Manage Treasury capacity allocations."
              href="/app/admin/allocation"
            />

            <OperationCard
              icon={<Users size={18} />}
              title="Positions"
              copy="Inspect user positions and settlements."
              href="/app/admin/positions"
            />
          </div>
        </Panel>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            eyebrow="Treasury"
            title="Reward funding"
          />

          <div className="p-5 md:p-6">
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="ARVO available" value="—" />
              <MiniStat label="USDC available" value="—" />
            </div>

            <p className="mt-4 text-xs leading-5 text-black/38">
              Available reward funding will be calculated from contract
              balances after protected principal, committed rewards and
              reserved budgets are accounted for.
            </p>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Governance"
            title="Control status"
          />

          <div className="p-5 md:p-6">
            <div className="flex items-center gap-3 rounded-xl border border-black/[0.07] bg-black/[0.025] p-4">
              <WalletCards size={18} className="text-black/35" />

              <div>
                <p className="text-sm font-semibold">
                  Governance handoff pending
                </p>
                <p className="mt-1 text-xs leading-5 text-black/38">
                  Safe and Timelock authorities will be shown here after the
                  staged testnet governance handoff.
                </p>
              </div>
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}

function AssetCoverage({
  asset,
  balance,
  principal,
  rewards,
  reserved,
}: {
  asset: string;
  balance: string;
  principal: string;
  rewards: string;
  reserved: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white/65 p-5">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold tracking-[-0.025em]">
          {asset}
        </p>
        <StatusPill>Pending</StatusPill>
      </div>

      <div className="mt-5 space-y-3">
        <Metric label="Contract balance" value={balance} />
        <Metric label="Principal liability" value={principal} />
        <Metric label="Reward liability" value={rewards} />
        <Metric label="Reserved budget" value={reserved} />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-black/38">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function SystemRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4">
      <span className="text-xs text-black/38">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-black/[0.035] p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/28">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
        {value}
      </p>
    </div>
  );
}

function OperationCard({
  icon,
  title,
  copy,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex min-h-[170px] flex-col bg-white/70 p-5 transition hover:bg-white md:p-6"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9846a]/10 text-[#a9654f]">
        {icon}
      </div>

      <p className="mt-5 font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-black/38">{copy}</p>

      <ArrowRight
        size={15}
        className="mt-auto pt-4 box-content text-black/25 transition group-hover:translate-x-1 group-hover:text-black"
      />
    </a>
  );
}
