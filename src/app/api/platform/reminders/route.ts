import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { prisma } from "@/lib/prisma";
import { verifyReminderToken } from "@/lib/mail/reminders";
import { limitRequest, securityFailure, siteOrigin } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function params(url: URL) {
  return { email: (url.searchParams.get("e") || "").toLowerCase().slice(0, 254), wallet: (url.searchParams.get("w") || "").toLowerCase(), token: url.searchParams.get("t") || "" };
}

// GET: confirm link from the email (switching reminders on is harmless if a scanner opens it).
export async function GET(request: Request) {
  try {
    await limitRequest(request, "reminder-link", 30);
    const url = new URL(request.url);
    const { email, wallet, token } = params(url);
    const valid = url.searchParams.get("a") === "confirm" && isAddress(wallet) && verifyReminderToken("confirm", email, wallet, token);
    if (valid) await prisma.reminderSubscription.updateMany({ where: { email, wallet }, data: { confirmedAt: new Date(), stoppedAt: null } });
    return NextResponse.redirect(new URL(`/reminders?status=${valid ? "confirmed" : "invalid"}`, siteOrigin()), 303);
  } catch (error) {
    return securityFailure(error);
  }
}

// POST: stop reminders (from the confirmation page form, so link scanners cannot stop them).
export async function POST(request: Request) {
  try {
    await limitRequest(request, "reminder-link", 30);
    const url = new URL(request.url);
    const { email, wallet, token } = params(url);
    const valid = isAddress(wallet) && verifyReminderToken("stop", email, wallet, token);
    if (valid) await prisma.reminderSubscription.updateMany({ where: { email, wallet }, data: { stoppedAt: new Date() } });
    return NextResponse.redirect(new URL(`/reminders?status=${valid ? "stopped" : "invalid"}`, siteOrigin()), 303);
  } catch (error) {
    return securityFailure(error);
  }
}
