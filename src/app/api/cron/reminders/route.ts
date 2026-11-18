import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { createPublicClient, http, isAddress, type Address } from "viem";
import { prisma } from "@/lib/prisma";
import { sendNoticeEmail } from "@/lib/mail/platform";
import { reminderLink } from "@/lib/mail/reminders";
import stakingArtifact from "@/lib/staking/ArvoStaking.abi.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hourly job (called by cron on the server with x-cron-secret). Sends at most one
// "matures soon" (≤3 days) and one "ready to claim" email per position.
const stakingAbi = ((stakingArtifact as { abi?: unknown }).abi ?? stakingArtifact) as readonly unknown[];
const SOON = 3 * 86_400, READY_WINDOW = 7 * 86_400;

function authorised(request: Request) {
  const expected = process.env.CRON_SECRET, supplied = request.headers.get("x-cron-secret") || "";
  if (!expected || expected.length < 32) return false;
  const a = createHash("sha256").update(expected).digest(), b = createHash("sha256").update(supplied).digest();
  return timingSafeEqual(a, b);
}
const when = (s: bigint) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(Number(s) * 1000)) + " UTC";

export async function POST(request: Request) {
  if (!authorised(request)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const rpc = process.env.NEXT_PUBLIC_STAKING_RPC_URL, proxy = process.env.NEXT_PUBLIC_STAKING_PROXY_ADDRESS;
  if (!rpc || !proxy || !isAddress(proxy)) return NextResponse.json({ error: "Staking not configured." }, { status: 503 });
  const client = createPublicClient({ transport: http(rpc, { timeout: 15_000 }) });
  const read = (functionName: string, args: readonly unknown[]) => client.readContract({ address: proxy as Address, abi: stakingAbi as never, functionName: functionName as never, args: args as never }) as Promise<unknown>;
  const app = (process.env.NEXT_PUBLIC_APP_URL || `${process.env.NEXT_PUBLIC_SITE_URL || "https://arvoprotocol.com"}/app`).replace(/\/+$/, "");
  const portfolio = `${app}/portfolio`;
  const now = BigInt(Math.floor(Date.now() / 1000));

  const subs = await prisma.reminderSubscription.findMany({ where: { confirmedAt: { not: null }, stoppedAt: null }, take: 1000, select: { id: true, email: true, wallet: true, sent: { select: { positionId: true, kind: true } } } });
  let emails = 0, failures = 0;
  for (const sub of subs) {
    try {
      const ids = await read("userPositionIds", [sub.wallet]) as bigint[];
      const done = new Set(sub.sent.map(s => `${s.positionId}:${s.kind}`));
      const items: { id: string; kind: "soon" | "ready"; maturesAt: bigint }[] = [];
      for (const id of ids) {
        const p = await read("position", [id]) as { settled: boolean; maturesAt: bigint };
        if (p.settled) continue;
        const left = p.maturesAt - now;
        if (left > 0n && left <= BigInt(SOON) && !done.has(`${id}:soon`)) items.push({ id: id.toString(), kind: "soon", maturesAt: p.maturesAt });
        if (left <= 0n && -left <= BigInt(READY_WINDOW) && !done.has(`${id}:ready`)) items.push({ id: id.toString(), kind: "ready", maturesAt: p.maturesAt });
      }
      if (!items.length) continue;
      const ready = items.filter(i => i.kind === "ready"), soon = items.filter(i => i.kind === "soon");
      await sendNoticeEmail({
        to: sub.email,
        subject: ready.length ? "Your Arvo position is ready to claim" : "Your Arvo position matures soon",
        heading: ready.length ? "Ready to claim" : "Maturing soon",
        paragraphs: [
          ...ready.map(i => `Position #${i.id} matured on ${when(i.maturesAt)}. You can now claim your principal and reward, and any shared bonus.`),
          ...soon.map(i => `Position #${i.id} matures on ${when(i.maturesAt)}.`),
          "Arvo will never ask for your seed phrase or ask you to send tokens anywhere. Only use the official app.",
        ],
        button: { label: "Open your portfolio", url: portfolio },
        footer: { text: `Reminders for ${sub.wallet.slice(0, 6)}…${sub.wallet.slice(-4)}.`, linkLabel: "Stop reminders", url: reminderLink("stop", sub.email, sub.wallet) },
      });
      await prisma.reminderSent.createMany({ data: items.map(i => ({ subscriptionId: sub.id, positionId: i.id, kind: i.kind })) });
      emails++;
    } catch (error) {
      failures++;
      console.error("Reminder failed for subscription", sub.id, error instanceof Error ? error.message : error);
    }
  }
  return NextResponse.json({ ok: true, subscriptions: subs.length, emails, failures });
}
