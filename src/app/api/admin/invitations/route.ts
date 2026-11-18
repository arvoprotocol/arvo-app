import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { createInvitationCodes } from "@/lib/admin/invitations";
import { prisma } from "@/lib/prisma";
import { limitRequest, readJson, RequestError, requireSameOrigin, securityFailure } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin: generate early-access invitation codes, or switch a code on/off.
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    await limitRequest(request, "invitation-admin", 30);
    if (!await getAdminSession()) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
    const body = await readJson(request, 4096);

    if (body.action === "create") {
      const count = Number(body.count), maxUses = Number(body.maxUses ?? 1);
      if (!Number.isSafeInteger(count) || count < 1 || count > 500) throw new RequestError("Create between 1 and 500 codes at a time.");
      if (!Number.isSafeInteger(maxUses) || maxUses < 1 || maxUses > 1000) throw new RequestError("Maximum uses must be between 1 and 1,000.");
      const label = typeof body.label === "string" && body.label.trim() ? body.label.trim().slice(0, 120) : null;
      const codes = await createInvitationCodes(count, label, maxUses);
      return NextResponse.json({ ok: true, codes }, { headers: { "Cache-Control": "no-store" } });
    }

    if (body.action === "activate" || body.action === "deactivate") {
      const code = typeof body.code === "string" ? body.code.trim().toUpperCase().replace(/\s+/g, "") : "";
      if (!code || code.length > 64) throw new RequestError("Enter an invitation code.");
      const result = await prisma.invitationCode.updateMany({ where: { code }, data: { isActive: body.action === "activate" } });
      if (result.count !== 1) throw new RequestError("Invitation code not found.", 404);
      return NextResponse.json({ ok: true });
    }

    throw new RequestError("Unknown action.");
  } catch (error) {
    return securityFailure(error);
  }
}
