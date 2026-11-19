import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  HandCoins,
  LockKeyhole,
  PauseCircle,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import {
  PageTitle,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
} from "@/components/protocol/ProtocolUI";

export default function AdminEmergencyPage() {
  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <PageTitle
        eyebrow="Protocol security"
        title="Emergency controls."
        copy="Monitor protocol pause state and use the approved emergency process without compromising user custody."
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Protocol state"
          value="–"
          detail="Awaiting contract connection"
          icon={<PauseCircle size={16} />}
        />

        <StatCard
          label="Pause authority"
          value="–"
          detail="PAUSER_ROLE"
          icon={<ShieldAlert size={16} />}
        />

        <StatCard
          label="Unpause authority"
          value="–"
          detail="Timelock / Default Admin"
          icon={<Clock3 size={16} />}
        />

        <StatCard
          label="Emergency exits"
          value="–"
          detail="User initiated"
          icon={<UserRound size={16} />}
        />
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <Panel>
          <PanelHeader
            eyebrow="Immediate control"
            title="Pause protocol"
            action={<StatusPill>Emergency authority</StatusPill>}
          />

          <div className="p-5 md:p-6">
            <div className="flex gap-3">
              <AlertOctagon
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold">
                  Stop new staking commitments.
                </p>

                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-black/42">
                  The authorised PAUSER_ROLE wallet can immediately pause the
                  staking contract when an incident requires new staking
                  activity to stop.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-red-500/15 bg-red-50/60 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-red-700/70">
                Current state
              </p>

              <div className="mt-2 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold">
                  Not connected
                </p>

                <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-black/35">
                  Unverified
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white opacity-35"
            >
              <PauseCircle size={15} />
              Pause protocol
            </button>

            <p className="mt-3 text-[11px] leading-5 text-black/35">
              This control will only become available to the connected
              PAUSER_ROLE authority on the correct network.
            </p>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Recovery"
            title="Unpause protocol"
            action={<StatusPill>Timelock</StatusPill>}
          />

          <div className="p-5 md:p-6">
            <div className="flex gap-3">
              <Clock3
                size={19}
                className="mt-0.5 shrink-0 text-[#ad7058]"
              />

              <div>
                <p className="text-sm font-semibold">
                  Recovery is deliberately slower.
                </p>

                <p className="mt-1.5 text-xs leading-5 text-black/42">
                  Unpause requires DEFAULT_ADMIN_ROLE. Under the final
                  governance topology that authority belongs to the Timelock,
                  not the emergency wallet.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <ProcessStep
                number="01"
                text="Incident resolved and contract state reviewed."
              />
              <ProcessStep
                number="02"
                text="Governance Safe proposes the Timelock operation."
              />
              <ProcessStep
                number="03"
                text="Required Timelock delay completes."
              />
              <ProcessStep
                number="04"
                text="Authorised operation executes unpause."
              />
            </div>

            <button
              type="button"
              disabled
              className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#07090b] px-4 py-3 text-sm font-semibold text-white opacity-35"
            >
              <LockKeyhole size={14} />
              Timelock process required
            </button>
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="User protection"
            title="What happens while paused"
          />

          <div className="grid gap-px bg-black/[0.06] md:grid-cols-2 xl:grid-cols-4">
            <ProtectionCard
              icon={<HandCoins size={17} />}
              title="Matured claims continue"
              copy="A matured position can still claim its principal and earned rewards while the protocol is paused."
              status="Available"
            />

            <ProtectionCard
              icon={<UserRound size={17} />}
              title="Emergency exit"
              copy="The owner of an unmatured position can recover their own principal while the protocol is paused."
              status="User initiated"
            />

            <ProtectionCard
              icon={<AlertTriangle size={17} />}
              title="Rewards forfeited"
              copy="An unmatured emergency exit forfeits that position's snapshotted rewards and releases the associated reward liability."
              status="Emergency only"
            />

            <ProtectionCard
              icon={<LockKeyhole size={17} />}
              title="New commitments stop"
              copy="Actions that create new staking commitments, including restaking, remain unavailable while paused."
              status="Blocked"
            />
          </div>
        </Panel>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            eyebrow="Emergency procedure"
            title="Incident checklist"
          />

          <div className="divide-y divide-black/[0.06] px-5 md:px-6">
            <ChecklistRow text="Confirm the incident and affected contract/network." />
            <ChecklistRow text="Verify the connected wallet holds PAUSER_ROLE." />
            <ChecklistRow text="Review the exact pause transaction before signing." />
            <ChecklistRow text="Pause the staking contract." />
            <ChecklistRow text="Verify paused state on-chain after confirmation." />
            <ChecklistRow text="Communicate user claim and emergency-exit options." />
            <ChecklistRow text="Resolve and independently review the underlying issue." />
            <ChecklistRow text="Use the Timelock governance process before unpausing." />
          </div>
        </Panel>

        <div className="space-y-5">
          <div className="rounded-2xl bg-[#07090b] p-5 text-white md:p-6">
            <div className="flex gap-3">
              <LockKeyhole
                size={18}
                className="mt-0.5 shrink-0 text-[#e2a98e]"
              />

              <div>
                <p className="text-sm font-semibold">
                  User principal remains user-controlled.
                </p>

                <p className="mt-1.5 text-xs leading-5 text-white/45">
                  There is no administrator emergency-withdraw function for
                  user positions. Emergency exits are pulled by the position
                  owner and funds are transferred directly back to that owner.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-50/70 p-5 md:p-6">
            <div className="flex gap-3">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <div>
                <p className="text-sm font-semibold text-amber-950">
                  Do not unpause simply because the immediate incident has stopped.
                </p>

                <p className="mt-1.5 text-xs leading-5 text-amber-900/60">
                  Contract state, solvency, affected integrations and the
                  proposed recovery should be verified before the Timelock
                  unpause process begins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProcessStep({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-black/[0.025] px-4 py-3">
      <span className="text-[9px] font-bold tracking-[0.12em] text-[#ad7058]">
        {number}
      </span>

      <p className="text-xs leading-5 text-black/50">
        {text}
      </p>
    </div>
  );
}

function ProtectionCard({
  icon,
  title,
  copy,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  status: string;
}) {
  return (
    <div className="bg-white/70 p-5 md:p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9846a]/10 text-[#a9654f]">
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold">{title}</p>

      <p className="mt-2 text-[11px] leading-5 text-black/38">
        {copy}
      </p>

      <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-black/30">
        {status}
      </p>
    </div>
  );
}

function ChecklistRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <CheckCircle2 size={14} className="shrink-0 text-black/20" />

      <p className="text-xs leading-5 text-black/48">
        {text}
      </p>
    </div>
  );
}
