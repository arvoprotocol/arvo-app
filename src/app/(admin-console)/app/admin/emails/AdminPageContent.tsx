import {
  Mail,
  Send,
  TestTube2,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  PageTitle,
  StatCard,
} from "@/components/protocol/ProtocolUI";

import { EmailComposer } from "./EmailComposer";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminEmailsPage() {
  const [partners, history] = await Promise.all([
    prisma.strategicPartner.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
    prisma.adminBroadcastEmail.findMany({
      orderBy: {
        sentAt: "desc",
      },
      take: 20,
    }),
  ]);

  const realEmails = history.filter((item) => !item.isTest);
  const tests = history.filter((item) => item.isTest);

  return (
    <div className="px-4 py-7 md:px-7 lg:px-9 lg:py-9 xl:px-11">
      <PageTitle
        eyebrow="Communications"
        title="Emails"
        copy="Create, test and send branded Arvo updates."
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Strategic partners"
          value={String(partners.length)}
          icon={<Users size={17} />}
        />
        <StatCard
          label="Broadcasts sent"
          value={String(realEmails.length)}
          icon={<Send size={17} />}
        />
        <StatCard
          label="Tests sent"
          value={String(tests.length)}
          icon={<TestTube2 size={17} />}
        />
        <StatCard
          label="Email system"
          value="Ready"
          icon={<Mail size={17} />}
        />
      </div>

      <div className="mt-7">
        <EmailComposer partners={partners} />
      </div>

      <div className="mt-7 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm md:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">
            History
          </p>
          <h2 className="mt-1 text-lg font-semibold">
            Recent emails
          </h2>
        </div>

        <div className="mt-5 divide-y divide-black/[0.06]">
          {history.length === 0 ? (
            <div className="py-8 text-center text-sm text-black/55">
              No emails have been sent yet.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      {item.subject}
                    </p>

                    {item.isTest && (
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/[0.07] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                        Test
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[11px] text-black/55">
                    {formatDate(item.sentAt)}
                  </p>
                </div>

                <p className="text-xs font-semibold text-black/60">
                  {item.recipientCount} recipient
                  {item.recipientCount === 1 ? "" : "s"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
