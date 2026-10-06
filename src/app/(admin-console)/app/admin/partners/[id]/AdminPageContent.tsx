import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  PageTitle,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/protocol/ProtocolUI";

import { PartnerActions } from "./PartnerActions";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) return "Not yet";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(value);
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

function walletTypeLabel(value: string | null) {
  switch (value) {
    case "metamask":
      return "MetaMask";
    case "self_custody":
      return "Another self-custody wallet";
    case "exchange":
      return "Exchange account";
    case "unsure":
      return "Unsure";
    default:
      return "Not selected";
  }
}

export default async function PartnerManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partnerId = Number(id);

  if (!Number.isInteger(partnerId) || partnerId <= 0) {
    notFound();
  }

  const partner = await prisma.strategicPartner.findUnique({
    where: { id: partnerId },
  });

  if (!partner) {
    notFound();
  }

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://arvoprotocol.com"
  ).replace(/\/+$/, "");

  const registrationUrl =
    `${siteUrl}/partner/${partner.registrationToken}`;

  const walletChanged =
    Boolean(partner.originalWallet) &&
    Boolean(partner.registeredWallet) &&
    partner.originalWallet!.toLowerCase() !==
      partner.registeredWallet!.toLowerCase();

  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <Link
        href="/app/admin/partners"
        className="mb-7 inline-flex items-center gap-2 text-xs font-semibold text-black/40 transition hover:text-black"
      >
        <ArrowLeft size={14} />
        Partners
      </Link>

      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <PageTitle
          eyebrow="Strategic Partner"
          title={`${partner.name}.`}
          copy="Manage wallet registration and review the partner record."
        />

        <StatusPill>
          {statusLabel(partner.status)}
        </StatusPill>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Panel>
            <PanelHeader
              eyebrow="Partner"
              title="Contact record"
            />

            <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
              <Datum label="Name" value={partner.name} />
              <Datum label="Email" value={partner.email} />
              <Datum
                label="Wallet type"
                value={walletTypeLabel(partner.walletType)}
              />
              <Datum
                label="Status"
                value={statusLabel(partner.status)}
              />

              {partner.notes && (
                <div className="md:col-span-2">
                  <Datum label="Internal notes" value={partner.notes} />
                </div>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              eyebrow="Wallet"
              title="Registration"
            />

            <div className="space-y-6 p-5 md:p-6">
              <WalletRecord
                label="Original wallet"
                wallet={partner.originalWallet}
              />

              <WalletRecord
                label={
                  partner.status === "change_requested"
                    ? "Requested wallet"
                    : "Registered wallet"
                }
                wallet={partner.registeredWallet}
                highlight={partner.status === "change_requested"}
              />

              {walletChanged && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-50 p-4">
                  <p className="text-xs font-semibold text-amber-900">
                    Wallet address differs from the original record.
                  </p>

                  <p className="mt-1.5 text-[11px] leading-5 text-amber-900/60">
                    Review the requested address carefully before approval.
                    The original wallet will remain stored for the audit trail.
                  </p>
                </div>
              )}

              {partner.walletChangeReason && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-black/28">
                    Change reason
                  </p>

                  <p className="mt-2 text-sm leading-6 text-black/55">
                    {partner.walletChangeReason}
                  </p>
                </div>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              eyebrow="History"
              title="Registration activity"
            />

            <div className="divide-y divide-black/[0.06] px-5 md:px-6">
              <HistoryRow
                icon={<Mail size={14} />}
                label="Registration email"
                value={formatDate(partner.registrationSentAt)}
              />

              <HistoryRow
                icon={<Wallet size={14} />}
                label="Registration submitted"
                value={formatDate(partner.registeredAt)}
              />

              <HistoryRow
                icon={<Clock3 size={14} />}
                label="Wallet change requested"
                value={formatDate(partner.changeRequestedAt)}
              />

              <HistoryRow
                icon={<CheckCircle2 size={14} />}
                label="Wallet confirmed"
                value={formatDate(partner.confirmedAt)}
              />

              <HistoryRow
                icon={<ShieldCheck size={14} />}
                label="Change approved"
                value={formatDate(partner.changeApprovedAt)}
              />
            </div>
          </Panel>
        </div>

        <div className="space-y-6 xl:sticky xl:top-[96px] xl:self-start">
          <Panel>
            <PanelHeader
              eyebrow="Registration"
              title="Actions"
            />

            <div className="p-5 md:p-6">
              <PartnerActions
                partnerId={partner.id}
                registrationUrl={registrationUrl}
                canApprove={partner.status === "change_requested"}
                sentBefore={Boolean(partner.registrationSentAt)}
              />
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              eyebrow="Private link"
              title="Registration URL"
            />

            <div className="p-5 md:p-6">
              <p className="break-all rounded-xl bg-black/[0.025] p-4 font-mono text-[10px] leading-5 text-black/45">
                {registrationUrl}
              </p>

              <p className="mt-3 text-[10px] leading-4 text-black/30">
                Treat this URL as private. Anyone with the link can access
                this partner's wallet registration page.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Datum({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-black/28">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-semibold text-black/65">
        {value}
      </p>
    </div>
  );
}

function WalletRecord({
  label,
  wallet,
  highlight = false,
}: {
  label: string;
  wallet: string | null;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-black/28">
        {label}
      </p>

      <div
        className={`mt-2 break-all rounded-xl border p-4 font-mono text-xs leading-6 ${
          highlight
            ? "border-amber-500/20 bg-amber-50 text-amber-950/70"
            : "border-black/[0.07] bg-black/[0.025] text-black/55"
        }`}
      >
        {wallet || "Not supplied"}
      </div>
    </div>
  );
}

function HistoryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/[0.035] text-black/35">
        {icon}
      </div>

      <p className="min-w-0 flex-1 text-xs font-semibold">
        {label}
      </p>

      <p className="text-right text-[11px] text-black/35">
        {value}
      </p>
    </div>
  );
}
