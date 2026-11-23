import { access, failure, publicRate, response, SupportError } from "@/lib/support/server";
import { requireWalletSession } from "@/lib/wallet/session";
import { partnerForWallet, partnerView } from "@/lib/partners/allocation-server";

export const dynamic = "force-dynamic";

// The signed-in wallet's Strategic Partner allocation, in ARVO only. Requires a signed wallet session,
// so one wallet can't look up another's allocation.
export async function GET(request: Request) {
  try {
    await access(request, false, false);
    const session = await requireWalletSession(request);
    if (Number(request.headers.get("x-arvo-chain")) !== session.chainId) throw new SupportError("Sign in with your connected wallet and network.", 401);
    await publicRate(request);
    const partner = await partnerForWallet(session.address);
    const view = partner ? partnerView(partner) : null;
    if (!partner || !view) return response({ found: false });
    return response({ found: true, name: partner.name.split(/\s+/)[0], wallet: partner.registeredWallet, ...view });
  } catch (error) { return failure(error); }
}
