import { NextResponse } from "next/server";
import { requireSameOrigin, readJson, limitRequest, securityFailure, RequestError } from "@/lib/security/request";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/session";
import { invitationCodeFor } from "@/lib/admin/invitations";
import { appUrl } from "@/lib/protocol/app-url";

export const runtime = "nodejs";

/**
 * Gives a Telegram waitlist signup their personal invite code and returns a ready-to-paste message.
 * Telegram cannot be messaged from here, so the admin copies the message and opens the chat.
 * Re-running for the same person returns the same code.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    requireSameOrigin(request);
    await limitRequest(request, "telegram-invite", 120);
    const payload = await readJson(request, 1024);
    const id = Number(payload.id);
    if (!Number.isSafeInteger(id) || id <= 0) throw new RequestError("Choose a signup.", 400);
    const signup = await prisma.platformSignup.findUnique({ where: { id } });
    if (!signup || signup.type !== "telegram") throw new RequestError("That signup is not a Telegram contact.", 400);
    if (signup.unsubscribedAt) throw new RequestError("This person has unsubscribed.", 400);
    const handle = signup.contact.trim().replace(/^@/, "");
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(handle)) throw new RequestError("This Telegram username is not valid.", 400);
    const code = await invitationCodeFor(`tg:@${handle.toLowerCase()}`);
    const message = `Hi! You're on the Arvo waitlist, so you get early access before the public launch.\n\nYour personal invite code: ${code}\n\nOpen ${appUrl("/app")} and enter the code to get started. Please keep it to yourself.\n\nThe Arvo Team`;
    await prisma.platformSignup.update({ where: { id }, data: { notifiedAt: new Date() } });
    return NextResponse.json({ ok: true, code, message, chat: `https://t.me/${handle}` });
  } catch (error) {
    return securityFailure(error);
  }
}
