import { prisma } from "@/lib/prisma";
import { readJson, RequestError, requireSameOrigin, securityFailure } from "@/lib/security/request";
import { adminJson, adminPartnerId } from "@/lib/partners/admin-route";
import { ALLOCATION, releaseSchedule, tgeDate } from "@/lib/partners/allocation";

export const runtime = "nodejs";

// Records (POST) or removes (DELETE) a manual release. Recording does not send anything onchain:
// the admin sends ARVO from their own wallet first, then records it here with the transaction hash.
async function input(request: Request, context: { params: Promise<{ id: string }> }) {
  requireSameOrigin(request);
  const id = await adminPartnerId(context);
  const body = await readJson(request, 1024) as Record<string, unknown>;
  const tranche = Number(body.tranche);
  if (!Number.isInteger(tranche) || tranche < 1 || tranche > ALLOCATION.releaseMonths) throw new RequestError("Invalid release.", 400);
  return { id, tranche, body };
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id, tranche, body } = await input(request, context);
    const txHash = typeof body.txHash === "string" ? body.txHash.trim() : "";
    if (txHash && !/^0x[0-9a-fA-F]{64}$/.test(txHash)) throw new RequestError("The transaction hash should be 0x followed by 64 characters.", 400);
    const partner = await prisma.strategicPartner.findUnique({ where: { id } });
    if (!partner?.allocationArvo) throw new RequestError("Set this partner’s allocation first.", 400);
    const amount = releaseSchedule(BigInt(partner.allocationArvo), tgeDate())[tranche - 1].amountArvo;
    const existing = await prisma.partnerRelease.findUnique({ where: { partnerId_tranche: { partnerId: id, tranche } } });
    if (existing) throw new RequestError("This release is already recorded.", 409);
    await prisma.partnerRelease.create({ data: { partnerId: id, tranche, amountArvo: amount, txHash: txHash ? txHash.toLowerCase() : null, sentAt: new Date() } });
    return adminJson({ ok: true });
  } catch (error) {
    if (error instanceof RequestError) return securityFailure(error);
    console.error("Partner release record failed:", error);
    return adminJson({ error: "Unable to record the release." }, 500);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id, tranche } = await input(request, context);
    const removed = await prisma.partnerRelease.deleteMany({ where: { partnerId: id, tranche } });
    if (!removed.count) throw new RequestError("That release isn’t recorded.", 404);
    return adminJson({ ok: true });
  } catch (error) {
    if (error instanceof RequestError) return securityFailure(error);
    console.error("Partner release removal failed:", error);
    return adminJson({ error: "Unable to undo the release." }, 500);
  }
}
