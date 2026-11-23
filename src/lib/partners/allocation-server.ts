import "server-only";
import { prisma } from "@/lib/prisma";
import { ALLOCATION, lockEnds, pct, releaseSchedule, tgeDate } from "@/lib/partners/allocation";

export type TrancheStatus = "sent" | "due" | "upcoming" | "unscheduled";
export type TrancheView = { tranche: number; due: string | null; amountArvo: string; status: TrancheStatus; txHash: string | null; sentAt: string | null };

type PartnerWithReleases = { allocationArvo: string | null; releases: { tranche: number; txHash: string | null; sentAt: Date }[] };

export function partnerView(partner: PartnerWithReleases, now = Date.now()) {
  if (!partner.allocationArvo) return null;
  const tge = tgeDate(), total = BigInt(partner.allocationArvo);
  const sent = new Map(partner.releases.map(r => [r.tranche, r]));
  const tranches: TrancheView[] = releaseSchedule(total, tge).map(t => {
    const r = sent.get(t.tranche);
    const status: TrancheStatus = r ? "sent" : !t.due ? "unscheduled" : Date.parse(t.due) <= now ? "due" : "upcoming";
    return { ...t, status, txHash: r?.txHash ?? null, sentAt: r?.sentAt.toISOString() ?? null };
  });
  const released = tranches.filter(t => t.status === "sent").reduce((a, t) => a + BigInt(t.amountArvo), 0n);
  return {
    totalArvo: String(total), releasedArvo: String(released), remainingArvo: String(total - released),
    tge: tge?.toISOString() ?? null, lockEnds: lockEnds(tge), tranches,
    next: tranches.find(t => t.status !== "sent") ?? null,
  };
}

/** The confirmed partner whose registered wallet matches, with an allocation recorded. */
export async function partnerForWallet(address: string) {
  const wallet = address.toLowerCase();
  const partners = await prisma.strategicPartner.findMany({ where: { status: "confirmed", allocationArvo: { not: null }, registeredWallet: { not: null } }, include: { releases: true } });
  return partners.find(p => p.registeredWallet!.toLowerCase() === wallet) ?? null;
}

export async function programSummary() {
  const partners = await prisma.strategicPartner.findMany({ where: { allocationArvo: { not: null } }, select: { allocationUsd: true, allocationArvo: true } });
  const total = partners.reduce((a, p) => a + BigInt(p.allocationArvo!), 0n);
  const usdCents = partners.reduce((a, p) => { if (!p.allocationUsd) return a; const [w, c = "0"] = p.allocationUsd.split("."); return a + BigInt(w) * 100n + BigInt(c.padEnd(2, "0")); }, 0n);
  return {
    count: partners.length,
    usd: `${usdCents / 100n}.${String(usdCents % 100n).padStart(2, "0")}`,
    totalArvo: String(total),
    ofSupply: pct(total, ALLOCATION.totalSupply),
    ofAvailable: pct(total, ALLOCATION.availableArvo),
    ofBucket: pct(total, ALLOCATION.bucketArvo),
    availableAfter: String(ALLOCATION.availableArvo - total),
  };
}
