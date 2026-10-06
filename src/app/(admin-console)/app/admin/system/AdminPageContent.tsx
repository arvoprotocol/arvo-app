import {
  Activity,
  Boxes,
  CheckCircle2,
  CircleOff,
  Clock3,
  Coins,
  Network,
  Server,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import {
  PageTitle,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
} from "@/components/protocol/ProtocolUI";

export default function AdminSystemPage() {
  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <PageTitle
        eyebrow="Protocol infrastructure"
        title="System."
        copy="Verify the connected network, staking deployment, token contracts and governance infrastructure."
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Network"
          value="Not connected"
          detail="Expected Robinhood Chain testnet"
          icon={<Network size={16} />}
        />

        <StatCard
          label="Chain ID"
          value="—"
          detail="Expected 46630 on testnet"
          icon={<Server size={16} />}
        />

        <StatCard
          label="Staking proxy"
          value="—"
          detail="Not deployed"
          icon={<Boxes size={16} />}
        />

        <StatCard
          label="Protocol state"
          value="—"
          detail="Awaiting contract connection"
          icon={<Activity size={16} />}
        />
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <Panel>
          <PanelHeader
            eyebrow="Network"
            title="Chain connection"
            action={<StatusPill>Unverified</StatusPill>}
          />

          <div className="divide-y divide-black/[0.06] px-5 md:px-6">
            <SystemRow
              label="Expected network"
              value="Robinhood Chain Testnet"
            />
            <SystemRow label="Expected chain ID" value="46630" />
            <SystemRow label="Connected chain ID" value="—" />
            <SystemRow label="Latest block" value="—" />
            <SystemRow label="RPC status" value="—" />
            <SystemRow label="Explorer" value="Not connected" />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Deployment"
            title="Staking contract"
          />

          <div className="divide-y divide-black/[0.06] px-5 md:px-6">
            <SystemRow label="Proxy address" value="—" />
            <SystemRow label="Implementation" value="—" />
            <SystemRow label="Paused" value="—" />
            <SystemRow label="Next pool ID" value="—" />
            <SystemRow label="Next position ID" value="—" />
            <SystemRow label="Deployment status" value="Not deployed" />
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Assets"
            title="Token configuration"
          />

          <div className="grid gap-px bg-black/[0.06] lg:grid-cols-2">
            <TokenCard
              symbol="ARVO"
              expectedDecimals="18"
              purpose="Staking principal and optional reward asset"
            />

            <TokenCard
              symbol="USDC"
              expectedDecimals="6"
              purpose="Staking principal and reward asset"
            />
          </div>
        </Panel>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            eyebrow="Governance infrastructure"
            title="Authorities"
          />

          <div className="divide-y divide-black/[0.06] px-5 md:px-6">
            <AuthorityRow
              icon={<WalletCards size={15} />}
              label="Governance Safe"
              value="—"
            />

            <AuthorityRow
              icon={<ShieldCheck size={15} />}
              label="Emergency authority"
              value="—"
            />

            <AuthorityRow
              icon={<Clock3 size={15} />}
              label="Timelock"
              value="—"
            />

            <AuthorityRow
              icon={<Clock3 size={15} />}
              label="Timelock minimum delay"
              value="—"
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Verification"
            title="Deployment checks"
          />

          <div className="divide-y divide-black/[0.06] px-5 md:px-6">
            <VerificationRow label="Correct network" />
            <VerificationRow label="Proxy has contract code" />
            <VerificationRow label="Implementation resolved" />
            <VerificationRow label="ARVO token verified" />
            <VerificationRow label="USDC token verified" />
            <VerificationRow label="Token decimals verified" />
            <VerificationRow label="Governance topology verified" />
            <VerificationRow label="Deployment EOA privileges removed" />
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Environment"
            title="Deployment registry"
          />

          <div className="p-5 md:p-6">
            <div className="overflow-hidden rounded-xl border border-black/[0.07]">
              <RegistryRow
                label="Network"
                testnet="Robinhood Chain Testnet"
                mainnet="Robinhood Chain"
              />

              <RegistryRow
                label="Chain ID"
                testnet="46630"
                mainnet="4663"
              />

              <RegistryRow
                label="Staking proxy"
                testnet="—"
                mainnet="—"
              />

              <RegistryRow
                label="Implementation"
                testnet="—"
                mainnet="—"
              />

              <RegistryRow
                label="ARVO"
                testnet="—"
                mainnet="—"
              />

              <RegistryRow
                label="USDC"
                testnet="—"
                mainnet="—"
              />

              <RegistryRow
                label="Timelock"
                testnet="—"
                mainnet="—"
                last
              />
            </div>

            <p className="mt-3 text-[11px] leading-5 text-black/35">
              Addresses will only be populated from confirmed deployments.
              Mainnet values remain empty until independently verified.
            </p>
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <div className="rounded-2xl bg-[#07090b] p-5 text-white md:p-6">
          <div className="flex gap-3">
            <CircleOff
              size={18}
              className="mt-0.5 shrink-0 text-[#e2a98e]"
            />

            <div>
              <p className="text-sm font-semibold">
                Wrong-network writes will be blocked.
              </p>

              <p className="mt-1.5 max-w-3xl text-xs leading-5 text-white/45">
                Once wallet integration is enabled, the admin console should
                read the active chain ID before preparing any transaction and
                refuse writes when the wallet is connected to an unexpected
                network.
              </p>
            </div>
          </div>
        </div>
      </section>
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
    <div className="flex items-center justify-between gap-5 py-3.5">
      <span className="text-xs text-black/40">{label}</span>
      <span className="max-w-[60%] truncate text-right text-xs font-semibold">
        {value}
      </span>
    </div>
  );
}

function TokenCard({
  symbol,
  expectedDecimals,
  purpose,
}: {
  symbol: string;
  expectedDecimals: string;
  purpose: string;
}) {
  return (
    <div className="bg-white/70 p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9846a]/10 text-[#a9654f]">
          <Coins size={17} />
        </div>

        <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-black/35">
          Unverified
        </span>
      </div>

      <p className="mt-4 text-lg font-semibold">{symbol}</p>

      <p className="mt-1 text-xs leading-5 text-black/38">
        {purpose}
      </p>

      <div className="mt-5 divide-y divide-black/[0.05] border-t border-black/[0.05]">
        <SystemRow label="Address" value="—" />
        <SystemRow label="Expected decimals" value={expectedDecimals} />
        <SystemRow label="On-chain decimals" value="—" />
      </div>
    </div>
  );
}

function AuthorityRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.035] text-black/40">
        {icon}
      </div>

      <span className="min-w-0 flex-1 text-xs text-black/42">
        {label}
      </span>

      <span className="max-w-[50%] truncate text-xs font-semibold">
        {value}
      </span>
    </div>
  );
}

function VerificationRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="text-xs text-black/42">{label}</span>

      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-black/30">
        <CheckCircle2 size={13} />
        Awaiting verification
      </span>
    </div>
  );
}

function RegistryRow({
  label,
  testnet,
  mainnet,
  last = false,
}: {
  label: string;
  testnet: string;
  mainnet: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[.8fr_1.1fr_1.1fr] gap-3 px-4 py-3 ${
        last ? "" : "border-b border-black/[0.06]"
      }`}
    >
      <span className="text-[11px] font-semibold text-black/40">
        {label}
      </span>

      <span className="truncate text-[11px] font-semibold">
        {testnet}
      </span>

      <span className="truncate text-[11px] font-semibold">
        {mainnet}
      </span>
    </div>
  );
}
