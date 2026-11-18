import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { hasAppAccess } from "@/lib/app-access/session";
import { prisma } from "@/lib/prisma";
import { sendNoticeEmail } from "@/lib/mail/platform";
import { reminderLink } from "@/lib/mail/reminders";
import { limitRequest, readJson, RequestError, requireSameOrigin, securityFailure } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Subscribe an email to maturity reminders for a wallet (double opt-in).
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    if (!await hasAppAccess()) return NextResponse.json({ error: "Access required." }, { status: 401 });
    await limitRequest(request, "reminder-subscribe", 5, 3_600_000);
    const body = await readJson(request, 2048);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const wallet = typeof body.wallet === "string" ? body.wallet.trim() : "";
    if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email) || email.length > 254) throw new RequestError("Enter a valid email address.");
    if (!isAddress(wallet)) throw new RequestError("Connect your wallet first.");
    const row = await prisma.reminderSubscription.upsert({
      where: { email_wallet: { email, wallet: wallet.toLowerCase() } },
      create: { email, wallet: wallet.toLowerCase() },
      update: { stoppedAt: null },
      select: { confirmedAt: true },
    });
    if (row.confirmedAt) return NextResponse.json({ ok: true, status: "active" });
    await sendNoticeEmail({
      to: email,
      subject: "Confirm your Arvo maturity reminders",
      heading: "Confirm your reminders",
      paragraphs: [
        `You asked for email reminders before positions held by ${wallet.slice(0, 6)}…${wallet.slice(-4)} mature on Arvo.`,
        "Confirm below to switch them on. If you didn't ask for this, ignore this email and nothing will be sent.",
      ],
      button: { label: "Confirm reminders", url: reminderLink("confirm", email, wallet) },
    });
    return NextResponse.json({ ok: true, status: "confirm_sent" });
  } catch (error) {
    if (error instanceof Error && error.message === "SMTP is not configured.") return NextResponse.json({ error: "Email reminders are not available yet." }, { status: 503 });
    return securityFailure(error);
  }
}
