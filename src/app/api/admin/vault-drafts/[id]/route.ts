import {StakingInputError} from "@/lib/staking/input-error";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { draftAccess, draftBody, draftFailure, draftId } from "@/lib/admin/vault-draft-api";
import { validateDraft } from "@/lib/staking/vault-draft";
import { serializeDraft, draftRecord, verifyDraftPool } from "@/lib/staking/vault-draft-data";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const denied = await draftAccess(request); if (denied) return denied;
    const row = await prisma.stakingVaultDraft.findUnique({ where: { id: draftId((await context.params).id) } });
    if (!row) return NextResponse.json({ error: "Draft not found." }, { status: 404 });
    return NextResponse.json({ draft: serializeDraft(row) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return draftFailure(error); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const denied = await draftAccess(request, true); if (denied) return denied;
    const id = draftId((await context.params).id), body = await draftBody(request);
    if (!Number.isInteger(body.revision) || Number(body.revision) < 1) throw new StakingInputError("Reload the current draft before saving.");
    const row = await prisma.stakingVaultDraft.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Draft not found." }, { status: 404 });
    if (row.linkedPoolId !== null) return NextResponse.json({ error: "Linked vault terms are locked. Create a new draft for different terms." }, { status: 409 });
    const draft = serializeDraft(row);
    const link = body.action === "link";
    if (link && (typeof body.poolId !== "string" || !/^\d+$/.test(body.poolId))) throw new StakingInputError("Enter a valid on-chain pool ID.");
    const changes = link ? await verifyDraftPool(draft, Number(body.poolId)) : draftRecord(validateDraft(body));
    const result = await prisma.stakingVaultDraft.updateMany({ where: { id, revision: Number(body.revision), linkedPoolId: null }, data: { ...changes, revision: { increment: 1 } } });
    if (!result.count) return NextResponse.json({ error: "This draft changed in another session. Reload before saving." }, { status: 409 });
    const saved = await prisma.stakingVaultDraft.findUniqueOrThrow({ where: { id } });
    return NextResponse.json({ draft: serializeDraft(saved) });
  } catch (error) { return draftFailure(error); }
}
