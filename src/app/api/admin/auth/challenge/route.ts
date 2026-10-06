import {requireSameOrigin,readJson,limitRequest,securityFailure,RequestError,validEmail} from "@/lib/security/request";
import { NextResponse } from "next/server";
import { getAddress, isAddress } from "viem";

import { createAdminChallenge } from "@/lib/admin/challenge";
import { getConfiguredAdminAddress } from "@/lib/admin/session";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);await limitRequest(request,"admin-challenge",20);
    const body = (await readJson(request,32768)) as {
      address?: unknown;
    };

    if (
      typeof body.address !== "string" ||
      !isAddress(body.address)
    ) {
      return NextResponse.json(
        { error: "Invalid wallet address." },
        { status: 400 }
      );
    }

    const address = getAddress(body.address);

    if (address !== getConfiguredAdminAddress()) {
      return NextResponse.json(
        { error: "Wallet is not authorised for Arvo admin." },
        { status: 403 }
      );
    }

    const message = await createAdminChallenge(address);

    return NextResponse.json({
      address,
      message,
    });
  } catch (error) {
    if(error instanceof RequestError)return securityFailure(error);
    return NextResponse.json(
      { error: "Unable to create admin challenge." },
      { status: 500 }
    );
  }
}
