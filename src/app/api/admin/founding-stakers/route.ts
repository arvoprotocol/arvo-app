import { NextResponse } from "next/server";
import { formatUnits } from "viem";
import { getAdminSession } from "@/lib/admin/session";
import { foundingPoolId, foundingStakers } from "@/lib/staking/activity";
import { limitRequest, securityFailure } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin CSV of First Edition founding stakers (from onchain events), e.g. for
// planning Genesis priority. Excludes emergency-exited positions.
export async function GET(request: Request) {
  try {
    await limitRequest(request, "founding-export", 20);
    if (!await getAdminSession()) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
    const pool = foundingPoolId();
    if (pool === null) return NextResponse.json({ error: "Set NEXT_PUBLIC_FOUNDING_POOL_ID first." }, { status: 400 });
    const rows = await foundingStakers(pool);
    const csv = ["rank,wallet,arvo_staked,positions,first_block", ...rows.map((r, i) => `${i + 1},${r.address},${formatUnits(r.arvo, 18)},${r.positions},${r.firstBlock}`)].join("\n");
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="arvo-founding-stakers-vault-${pool}.csv"`, "Cache-Control": "no-store" } });
  } catch (error) {
    return securityFailure(error);
  }
}
