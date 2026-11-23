import { prisma } from "@/lib/prisma";
import { readJson, RequestError, requireSameOrigin, securityFailure } from "@/lib/security/request";
import { adminJson, adminPartnerId } from "@/lib/partners/admin-route";
import { arvoForUsd, ALLOCATION, parseUsd } from "@/lib/partners/allocation";

export const runtime = "nodejs";

// Sets or clears a partner’s agreed USD amount and locks in the ARVO amount at the agreed price.
// Refused once any release has been recorded, so a partner's ARVO can't change after payments start.
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const id = await adminPartnerId(context);
    const body = await readJson(request, 1024) as Record<string, unknown>;
    const clear = body.allocationUsd === null || body.allocationUsd === "";
    const usd = clear ? null : parseUsd(body.allocationUsd);
    if (!clear && !usd) throw new RequestError("Enter a USD amount like 9827.18.", 400);
    const partner = await prisma.strategicPartner.findUnique({ where: { id }, include: { _count: { select: { releases: true } } } });
    if (!partner) throw new RequestError("Partner not found.", 404);
    if (partner._count.releases > 0) throw new RequestError("Releases have already been recorded for this partner, so the amount can’t be changed here.", 409);
    const arvo = usd ? String(arvoForUsd(usd)) : null;
    if (arvo === "0") throw new RequestError("That amount is too small to convert to ARVO.", 400);
    await prisma.strategicPartner.update({ where: { id }, data: { allocationUsd: usd, allocationArvo: arvo, allocationPrice: usd ? ALLOCATION.priceUsd : null } });
    return adminJson({ ok: true, allocationUsd: usd, arvo });
  } catch (error) {
    if (error instanceof RequestError) return securityFailure(error);
    console.error("Partner allocation update failed:", error);
    return adminJson({ error: "Unable to save the allocation." }, 500);
  }
}
