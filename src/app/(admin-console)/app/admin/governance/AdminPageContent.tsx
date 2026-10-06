import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  KeyRound,
  LockKeyhole,
  Shield,
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

export default function AdminGovernancePage() {
  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <PageTitle
        eyebrow="Protocol security"
        title="Governance."
        copy="Verify administrative roles, Safe authorities, Timelock configuration and completion of the deployment handoff."
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Governance status"
          value="—"
          detail="Topology verification"
          icon={<ShieldCheck size={16} />}
        />

        <StatCard
          label="Timelock"
          value="—"
          detail="Minimum execution delay"
          icon={<Clock3 size={16} />}
        />

        <StatCard
          label="Deployment wallet"
          value="—"
          detail="Residual staking roles"
          icon={<KeyRound size={16} />}
        />

        <StatCard
          label="Role holders"
          value="—"
          detail="Verified on-chain"
          icon={<WalletCards size={16} />}
        />
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Expected topology"
            title="Staking contract roles"
            action={<StatusPill>Read only</StatusPill>}
          />

          <div className="grid gap-px bg-black/[0.06] lg:grid-cols-5">
            <RoleCard
              role="DEFAULT ADMIN"
              expected="Timelock"
              purpose="Administrative control and unpause authority."
            />

            <RoleCard
              role="UPGRADER"
              expected="Timelock"
              purpose="Authorises UUPS implementation upgrades."
            />

            <RoleCard
              role="VAULT MANAGER"
              expected="Governance Safe"
              purpose="Creates and manages pools and protocol allocation."
            />

            <RoleCard
              role="REWARD MANAGER"
              expected="Governance Safe"
              purpose="Funds rewards, reserves budgets and manages surplus."
            />

            <RoleCard
              role="PAUSER"
              expected="Emergency authority"
              purpose="Immediate emergency pause authority."
            />
          </div>
        </Panel>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Panel>
          <PanelHeader
            eyebrow="Authorities"
            title="Governance addresses"
          />

          <div className="divide-y divide-black/[0.06] px-5 md:px-6">
            <AuthorityRow
              icon={<WalletCards size={15} />}
              label="Governance Safe"
              value="Not configured"
              detail="Vault Manager, Reward Manager and Timelock authority"
            />

            <AuthorityRow
              icon={<Shield size={15} />}
              label="Emergency authority"
              value="Not configured"
              detail="Immediate PAUSER_ROLE holder"
            />

            <AuthorityRow
              icon={<Clock3 size={15} />}
              label="Timelock"
              value="Not deployed"
              detail="Default Admin and Upgrader"
            />

            <AuthorityRow
              icon={<KeyRound size={15} />}
              label="Deployment wallet"
              value="Not connected"
              detail="Must hold no staking roles after final handoff"
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Timelock"
            title="Configuration"
          />

          <div className="divide-y divide-black/[0.06] px-5 md:px-6">
            <CheckRow label="Contract deployed" />
            <CheckRow label="Minimum delay verified" />
            <CheckRow label="Self-administered" />
            <CheckRow label="Governance Safe proposer" />
            <CheckRow label="Governance Safe canceller" />
            <CheckRow label="Governance Safe executor" />
            <CheckRow label="Open execution disabled" />
          </div>
        </Panel>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            eyebrow="Deployment handoff"
            title="Privilege removal"
          />

          <div className="p-5 md:p-6">
            <p className="text-sm leading-6 text-black/45">
              Once the destination authorities have been independently
              verified, the original deployment wallet must renounce every
              staking role.
            </p>

            <div className="mt-5 space-y-2">
              <HandoffRole role="PAUSER_ROLE" />
              <HandoffRole role="VAULT_MANAGER_ROLE" />
              <HandoffRole role="REWARD_MANAGER_ROLE" />
              <HandoffRole role="UPGRADER_ROLE" />
              <HandoffRole
                role="DEFAULT_ADMIN_ROLE"
                note="Renounced last"
              />
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Governance boundary"
            title="Admin console permissions"
          />

          <div className="p-5 md:p-6">
            <div className="flex gap-3">
              <LockKeyhole
                size={17}
                className="mt-0.5 shrink-0 text-[#ad7058]"
              />

              <div>
                <p className="text-sm font-semibold">
                  No generic role editor.
                </p>

                <p className="mt-1.5 text-xs leading-5 text-black/40">
                  The console verifies the approved governance architecture
                  rather than exposing unrestricted grant or revoke controls.
                  Governance changes should follow the established Safe and
                  Timelock process.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-black/[0.025] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-black/30">
                Upgrade path
              </p>

              <p className="mt-2 text-sm font-semibold">
                Governance Safe → Timelock → Staking proxy
              </p>

              <p className="mt-1.5 text-xs leading-5 text-black/38">
                Dangerous implementation upgrades are subject to the Timelock
                delay before execution.
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-50/70 p-5 md:p-6">
          <div className="flex gap-3">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <div>
              <p className="text-sm font-semibold text-amber-950">
                Governance handoff not yet verified.
              </p>

              <p className="mt-1.5 max-w-3xl text-xs leading-5 text-amber-900/60">
                Until the Robinhood Chain deployment is connected, the console
                cannot verify role holders, Timelock configuration or whether
                the deployment wallet retains privileges. Mainnet operations
                should not begin until the final topology passes every check.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RoleCard({
  role,
  expected,
  purpose,
}: {
  role: string;
  expected: string;
  purpose: string;
}) {
  return (
    <div className="bg-white/70 p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9846a]/10 text-[#a9654f]">
        <ShieldCheck size={16} />
      </div>

      <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.14em] text-black/30">
        {role}
      </p>

      <p className="mt-1 text-sm font-semibold">{expected}</p>

      <p className="mt-2 text-[11px] leading-4 text-black/38">
        {purpose}
      </p>

      <div className="mt-4 border-t border-black/[0.05] pt-3">
        <p className="text-[10px] text-black/30">
          Actual holder: —
        </p>
      </div>
    </div>
  );
}

function AuthorityRow({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex gap-3 py-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.035] text-black/40">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold">{label}</p>
          <p className="truncate text-xs font-semibold text-black/45">
            {value}
          </p>
        </div>

        <p className="mt-1 text-[11px] leading-4 text-black/35">
          {detail}
        </p>
      </div>
    </div>
  );
}

function CheckRow({ label }: { label: string }) {
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

function HandoffRole({
  role,
  note,
}: {
  role: string;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-black/[0.06] px-4 py-3">
      <div>
        <p className="text-xs font-semibold">{role}</p>
        {note && (
          <p className="mt-0.5 text-[10px] text-black/35">{note}</p>
        )}
      </div>

      <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-black/35">
        Unverified
      </span>
    </div>
  );
}
