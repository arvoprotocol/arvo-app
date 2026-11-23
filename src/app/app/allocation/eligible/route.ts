import { access, failure, publicRate, response, SupportError } from "@/lib/support/server";
import { partnerForWallet } from "@/lib/partners/allocation-server";

export const dynamic = "force-dynamic";

// Whether the connected wallet should see the Partner allocation menu item. Yes/no only:
// no names or amounts, and those still need a signed wallet session (see ../me).
export async function GET(request: Request) {
  try {
    await access(request, false, false);
    await publicRate(request);
    const wallet = request.headers.get("x-arvo-wallet") || "";
    if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) throw new SupportError("Connect a wallet first.", 400);
    return response({ eligible: Boolean(await partnerForWallet(wallet)) });
  } catch (error) { return failure(error); }
}
