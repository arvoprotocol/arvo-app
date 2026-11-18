import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normaliseEmail, verifyUnsubscribeToken } from "@/lib/mail/unsubscribe";
import { limitRequest, RequestError, securityFailure, siteOrigin } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST only: GET links in emails open the confirmation page instead, so mail
// scanners that prefetch links cannot unsubscribe anyone. Handles both the
// confirmation form and RFC 8058 one-click requests from mail providers.
// The signed token authorises the request, so no same-origin check applies.
export async function POST(request: Request) {
  try {
    await limitRequest(request, "unsubscribe", 30);
    const url = new URL(request.url);
    const email = normaliseEmail(url.searchParams.get("e") || "");
    const token = url.searchParams.get("t") || "";
    if (!verifyUnsubscribeToken(email, token)) throw new RequestError("This unsubscribe link is invalid or has expired.", 400);

    await prisma.platformSignup.updateMany({
      where: { type: "email", normalized: email, unsubscribedAt: null },
      data: { unsubscribedAt: new Date() },
    });

    // The same response whether or not the address was on the list.
    const form = request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded");
    const oneClick = form && (await request.clone().text()).includes("List-Unsubscribe=One-Click");
    if (form && !oneClick) {
      return NextResponse.redirect(new URL("/unsubscribe?done=1", siteOrigin()), 303);
    }
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return securityFailure(error);
  }
}
