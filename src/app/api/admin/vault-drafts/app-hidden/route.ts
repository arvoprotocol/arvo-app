import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StakingInputError } from "@/lib/staking/input-error";
import { draftAccess, draftBody, draftFailure } from "@/lib/admin/vault-draft-api";
import { stakingConnection } from "@/lib/staking/pool-transactions";

/**
 * Hides or shows a LIVE vault in the app's lists (display only). The contract is not changed:
 * the vault still exists onchain and existing stakers keep seeing and claiming their positions.
 */
export async function POST(request: Request) {
  try {
    const denied = await draftAccess(request, true); if (denied) return denied;
    const body = await draftBody(request);
    const poolId = Number(body.poolId);
    if (!Number.isSafeInteger(poolId) || poolId < 0) throw new StakingInputError("Choose a live vault.");
    if (typeof body.hidden !== "boolean") throw new StakingInputError("Choose hide or show.");
    const c = stakingConnection();
    if (!c) throw new StakingInputError("The staking contract is not configured.");
    const row = await prisma.stakingVaultDraft.findFirst({ where: { linkedChainId: c.chain.id, linkedProxy: c.address.toLowerCase(), linkedPoolId: poolId } });
    if (!row) return NextResponse.json({ error: "This vault has no saved name in admin, so it can only be hidden onchain." }, { status: 404 });
    const values = JSON.parse(row.valuesJson) as Record<string, unknown>;
    if (body.hidden) values.appHidden = "1"; else delete values.appHidden;
    await prisma.stakingVaultDraft.update({ where: { id: row.id }, data: { valuesJson: JSON.stringify(values), revision: { increment: 1 } } });
    return NextResponse.json({ ok: true, hidden: body.hidden });
  } catch (error) { return draftFailure(error); }
}
