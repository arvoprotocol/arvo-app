import {
  CheckCircle2,
  Clock3,
  KeyRound,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { InvitationTools } from "./InvitationTools";
import {
  PageTitle,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
} from "@/components/protocol/ProtocolUI";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) return "–";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminInvitationsPage() {
  const invitations = await prisma.invitationCode.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const available = invitations.filter(
    (item) => item.isActive && item.useCount < item.maxUses
  ).length;

  // Used = opened the app with it (accessAt) or registered on the waitlist with it.
  const claimed = invitations.filter(
    (item) => item.useCount > 0 || item.accessAt !== null
  ).length;

  const disabled = invitations.filter(
    (item) => !item.isActive
  ).length;

  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <PageTitle
        eyebrow="App access"
        title="Invitations."
        copy="Manage invitation codes for early access to the Arvo app."
      />

      <InvitationTools />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Invitation codes"
          value={`${invitations.length}`}
          detail="Total generated"
          icon={<KeyRound size={16} />}
        />

        <StatCard
          label="Available"
          value={`${available}`}
          detail="Ready to use"
          icon={<ShieldCheck size={16} />}
        />

        <StatCard
          label="Used"
          value={`${claimed}`}
          detail="Opened the app or joined the waitlist"
          icon={<UserCheck size={16} />}
        />

        <StatCard
          label="Disabled"
          value={`${disabled}`}
          detail="No longer available"
          icon={<Clock3 size={16} />}
        />
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Access management"
            title="Invitation codes"
            action={<StatusPill>{invitations.length} records</StatusPill>}
          />

          {invitations.length === 0 ? (
            <div className="p-5 md:p-6">
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.12] bg-black/[0.018] px-6 text-center">
                <KeyRound size={22} className="text-black/50" />

                <p className="mt-4 text-sm font-semibold">
                  No invitation codes yet.
                </p>

                <p className="mt-1.5 max-w-md text-xs leading-5 text-black/60">
                  Generate an invitation when you are ready to provide early
                  access to the Arvo app.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.06]">
              {invitations.map((invitation) => {
                const exhausted =
                  invitation.useCount >= invitation.maxUses;

                const status = !invitation.isActive
                  ? "Disabled"
                  : exhausted
                    ? "Claimed"
                    : "Available";

                return (
                  <div
                    key={invitation.id}
                    className="grid gap-5 p-5 md:p-6 xl:grid-cols-[1.2fr_.65fr_.8fr_.8fr] xl:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                            status === "Available"
                              ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-700"
                              : status === "Claimed"
                                ? "border-[#c9846a]/15 bg-[#c9846a]/8 text-[#a9654f]"
                                : "border-black/[0.08] bg-black/[0.035] text-black/55"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="mt-3 font-mono text-sm font-semibold tracking-[0.04em]">
                        {invitation.code}
                      </p>

                      <p className="mt-1.5 text-xs text-black/60">
                        {invitation.label || "Invitation"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <InvitationDatum
                        label="Used in app"
                        value={invitation.accessAt ? `First ${formatDate(invitation.accessAt)}` : "Not used yet"}
                      />
                      <InvitationDatum
                        label="Waitlist sign-ups"
                        value={`${invitation.useCount} / ${invitation.maxUses}`}
                      />
                    </div>

                    <InvitationDatum
                      label="Claimed by"
                      value={
                        invitation.claimedBy
                          ? invitation.claimedType === "telegram"
                            ? `@${invitation.claimedBy}`
                            : invitation.claimedBy
                          : "–"
                      }
                    />

                    <div>
                      <InvitationDatum
                        label={invitation.claimedAt ? "Claimed" : "Created"}
                        value={formatDate(
                          invitation.claimedAt ?? invitation.createdAt
                        )}
                      />

                      {invitation.claimedAt && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle2 size={11} />
                          Invitation registered
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}

function InvitationDatum({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/50">
        {label}
      </p>
      <p className="mt-1.5 truncate text-xs font-semibold text-black/60">
        {value}
      </p>
    </div>
  );
}
