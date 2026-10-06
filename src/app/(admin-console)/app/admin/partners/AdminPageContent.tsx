import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  PageTitle,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
} from "@/components/protocol/ProtocolUI";

import { PartnerCreateForm } from "./PartnerCreateForm";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function shortWallet(value: string | null) {
  if (!value) return "Not supplied";

  if (value.length <= 16) return value;

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function walletTypeLabel(value: string | null) {
  switch (value) {
    case "metamask":
      return "MetaMask";
    case "self_custody":
      return "Self-custody";
    case "exchange":
      return "Exchange";
    case "unsure":
      return "Unsure";
    default:
      return "Not confirmed";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "confirmed":
      return "Confirmed";
    case "change_requested":
      return "Change requested";
    case "needs_help":
      return "Needs help";
    default:
      return "Awaiting";
  }
}

function StatusBadge({ status }: { status: string }) {
  const label = statusLabel(status);

  const classes =
    status === "confirmed"
      ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-700"
      : status === "change_requested"
        ? "border-amber-500/20 bg-amber-500/8 text-amber-700"
        : status === "needs_help"
          ? "border-red-500/15 bg-red-500/7 text-red-700"
          : "border-black/[0.08] bg-black/[0.035] text-black/40";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${classes}`}
    >
      {label}
    </span>
  );
}

export default async function AdminPartnersPage() {
  const partners = await prisma.strategicPartner.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const awaiting = partners.filter(
    (partner) => partner.status === "awaiting"
  ).length;

  const confirmed = partners.filter(
    (partner) => partner.status === "confirmed"
  ).length;

  const attention = partners.filter(
    (partner) =>
      partner.status === "change_requested" ||
      partner.status === "needs_help"
  ).length;

  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <PageTitle
          eyebrow="Strategic allocation"
          title="Partners."
          copy="Register Strategic Partners and Advisors, confirm their Robinhood-compatible wallet and maintain the allocation record."
        />

        <PartnerCreateForm />
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Partners"
          value={`${partners.length}`}
          detail="Total records"
          icon={<Users size={16} />}
        />

        <StatCard
          label="Awaiting"
          value={`${awaiting}`}
          detail="Wallet confirmation pending"
          icon={<Clock3 size={16} />}
        />

        <StatCard
          label="Confirmed"
          value={`${confirmed}`}
          detail="Wallet registered"
          icon={<CheckCircle2 size={16} />}
        />

        <StatCard
          label="Needs attention"
          value={`${attention}`}
          detail="Change or help required"
          icon={<AlertCircle size={16} />}
        />
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Wallet registration"
            title="Strategic Partners & Advisors"
            action={<StatusPill>{partners.length} records</StatusPill>}
          />

          {partners.length === 0 ? (
            <div className="p-5 md:p-6">
              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.12] bg-black/[0.018] px-6 text-center">
                <Wallet size={23} className="text-black/25" />

                <p className="mt-4 text-sm font-semibold">
                  No partners added yet.
                </p>

                <p className="mt-1.5 max-w-md text-xs leading-5 text-black/38">
                  Add each Strategic Partner or Advisor together with the wallet
                  address you currently have on record.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.06]">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="grid gap-5 p-5 md:p-6 xl:grid-cols-[1.25fr_1fr_.65fr_.75fr]"
                >
                  <div className="min-w-0">
                    <StatusBadge status={partner.status} />

                    <h3 className="mt-3 truncate text-base font-semibold tracking-[-.02em]">
                      {partner.name}
                    </h3>

                    <p className="mt-1 truncate text-xs text-black/40">
                      {partner.email}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <Datum
                      label={
                        partner.registeredWallet
                          ? "Registered wallet"
                          : "Existing wallet"
                      }
                      value={shortWallet(
                        partner.registeredWallet ??
                          partner.originalWallet
                      )}
                      mono
                    />

                    {partner.registeredWallet &&
                      partner.originalWallet &&
                      partner.registeredWallet.toLowerCase() !==
                        partner.originalWallet.toLowerCase() && (
                        <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-amber-700">
                          <RefreshCw size={10} />
                          Different from original
                        </p>
                      )}
                  </div>

                  <Datum
                    label="Wallet type"
                    value={walletTypeLabel(partner.walletType)}
                  />

                  <div>
                    <Datum
                      label="Registered"
                      value={formatDate(partner.registeredAt)}
                    />

                    {partner.robinhoodConfirmed && (
                      <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle2 size={10} />
                        Robinhood confirmed
                      </p>
                    )}

                    <Link
                      href={`/app/admin/partners/${partner.id}`}
                      className="mt-3 inline-flex items-center rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[10px] font-semibold transition hover:border-black/20"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Allocation"
            title="Next stage"
          />

          <div className="grid gap-px bg-black/[0.06] md:grid-cols-3">
            <Stage
              number="01"
              title="Register wallet"
              copy="Confirm a compatible wallet for each Strategic Partner and Advisor."
            />

            <Stage
              number="02"
              title="Assign allocation"
              copy="Token allocations will be added after the allocation basis has been finalised."
            />

            <Stage
              number="03"
              title="Track vesting"
              copy="Vested, available and distributed balances will be added to the same partner record."
            />
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Datum({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-black/28">
        {label}
      </p>

      <p
        className={`mt-1.5 truncate text-xs font-semibold text-black/60 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Stage({
  number,
  title,
  copy,
}: {
  number: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="bg-white/70 p-5 md:p-6">
      <p className="font-mono text-[10px] font-semibold text-[#b9775d]">
        {number}
      </p>

      <p className="mt-3 text-sm font-semibold">{title}</p>

      <p className="mt-1.5 text-xs leading-5 text-black/40">
        {copy}
      </p>
    </div>
  );
}
