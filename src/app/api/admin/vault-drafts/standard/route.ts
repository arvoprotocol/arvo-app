import {StakingInputError} from "@/lib/staking/input-error";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { draftAccess, draftBody, draftFailure } from "@/lib/admin/vault-draft-api";
import { standardDrafts, validateDraft } from "@/lib/staking/vault-draft";
import { initialValues, launchMinimums } from "@/lib/staking/pool-form";
import { draftRecord } from "@/lib/staking/vault-draft-data";
export async function POST(request: Request) {
  try {
    const denied = await draftAccess(request, true); if (denied) return denied;
    const body = await draftBody(request);
    if (typeof body.referencePrice !== "string" || body.referencePrice.length > 96) throw new StakingInputError("Enter the approved ARVO reference price.");
    const values = { ...initialValues, ...launchMinimums(body.referencePrice) };
    await prisma.$transaction(standardDrafts(values).map(draft => prisma.stakingVaultDraft.upsert({ where: { seedKey: draft.seedKey }, update: {}, create: { ...draftRecord(validateDraft(draft)), seedKey: draft.seedKey } })));
    return NextResponse.json({ saved: true });
  } catch (error) { return draftFailure(error); }
}
