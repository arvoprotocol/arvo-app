import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { hasAppAccess } from "@/lib/app-access/session";
import { getAdminSession } from "@/lib/admin/session";
import { foundingPoolId, foundingStakers, vaultActivity } from "@/lib/staking/activity";
import { limitRequest, securityFailure } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET ?pool=ID → stakers, deposits, recent deposits.
// GET ?founding=1&wallet=0x… → whether the wallet is a founding staker.
export async function GET(request: Request) {
  try {
    if (!await hasAppAccess() && !await getAdminSession()) return NextResponse.json({ error: "Access required." }, { status: 401 });
    await limitRequest(request, "vault-activity", 120);
    const url = new URL(request.url);
    const headers = { "Cache-Control": "no-store" };
    if (url.searchParams.get("founding") === "1") {
      const wallet = url.searchParams.get("wallet") || "";
      const pool = foundingPoolId();
      if (pool === null || !isAddress(wallet)) return NextResponse.json({ founding: false, pool }, { headers });
      const list = await foundingStakers(pool);
      const me = list.find(r => r.address.toLowerCase() === wallet.toLowerCase());
      return NextResponse.json({ founding: Boolean(me), pool, rank: me ? list.indexOf(me) + 1 : null }, { headers });
    }
    const pool = Number(url.searchParams.get("pool"));
    if (!Number.isSafeInteger(pool) || pool < 0 || pool > 4_294_967_295) return NextResponse.json({ error: "Invalid vault." }, { status: 400 });
    const a = await vaultActivity(pool);
    return NextResponse.json({
      stakers: a.stakers, deposits: a.deposits,
      recent: a.recent.map(r => ({ user: `${r.user.slice(0, 6)}…${r.user.slice(-4)}`, arvo: r.arvo.toString(), usdc: r.usdc.toString(), at: r.at })),
    }, { headers });
  } catch (error) {
    return securityFailure(error);
  }
}
