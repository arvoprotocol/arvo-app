import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { draftAccess, draftBody, draftFailure } from "@/lib/admin/vault-draft-api";
import { validateDraft } from "@/lib/staking/vault-draft";
import { serializeDraft, draftRecord } from "@/lib/staking/vault-draft-data";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const denied = await draftAccess(request); if (denied) return denied;
    const rows = await prisma.stakingVaultDraft.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 200 });
    return NextResponse.json({ drafts: rows.map(serializeDraft) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return draftFailure(error); }
}
export async function POST(request: Request) {
  try {
    const denied = await draftAccess(request, true); if (denied) return denied;
    const draft = validateDraft(await draftBody(request));
    const count = await prisma.stakingVaultDraft.count();
    if (count >= 200) return NextResponse.json({ error: "The draft registry is limited to 200 vaults." }, { status: 409 });
    const row = await prisma.stakingVaultDraft.create({ data: draftRecord(draft) });
    return NextResponse.json({ draft: serializeDraft(row) }, { status: 201 });
  } catch (error) { return draftFailure(error); }
}
