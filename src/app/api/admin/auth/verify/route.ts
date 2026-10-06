import {requireSameOrigin,readJson,limitRequest,securityFailure,RequestError,validEmail} from "@/lib/security/request";
import { NextResponse } from "next/server";
import {
  getAddress,
  isAddress,
  verifyMessage,
} from "viem";

import { consumeAdminChallenge } from "@/lib/admin/challenge";
import {
  createAdminSession,
  getConfiguredAdminAddress,
} from "@/lib/admin/session";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);await limitRequest(request,"admin-verify",30);
    const body = (await readJson(request,32768)) as {
      address?: unknown;
      message?: unknown;
      signature?: unknown;
    };

    if (
      typeof body.address !== "string" ||
      !isAddress(body.address) ||
      typeof body.message !== "string" ||
      typeof body.signature !== "string" ||
      body.message.length>3000 ||
      !/^0x[a-f0-9]{130}$/i.test(body.signature)
    ) {
      return NextResponse.json(
        { error: "Invalid authentication request." },
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

    const signatureValid = await verifyMessage({
      address,
      message: body.message,
      signature: body.signature as `0x${string}`,
    });

    if (!signatureValid) {
      return NextResponse.json(
        { error: "Wallet signature could not be verified." },
        { status: 401 }
      );
    }

    const challengeValid = await consumeAdminChallenge(
      address,
      body.message
    );

    if (!challengeValid) {
      return NextResponse.json(
        { error: "Challenge is invalid or has expired." },
        { status: 401 }
      );
    }

    await createAdminSession(address);

    return NextResponse.json({
      authenticated: true,
      address,
    });
  } catch (error) {
    if(error instanceof RequestError)return securityFailure(error);
    return NextResponse.json(
      { error: "Unable to authenticate admin wallet." },
      { status: 500 }
    );
  }
}
