import {requireSameOrigin,readJson,limitRequest,securityFailure,RequestError,validEmail} from "@/lib/security/request";
import { NextResponse } from "next/server";
import { isAddress } from "viem";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type WalletType =
  | "metamask"
  | "self_custody"
  | "exchange"
  | "unsure";

const VALID_WALLET_TYPES = new Set<WalletType>([
  "metamask",
  "self_custody",
  "exchange",
  "unsure",
]);

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    requireSameOrigin(request);await limitRequest(request,"partner-register",20);
    const { token } = await context.params;

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json(
        { error: "Invalid registration link." },
        { status: 404 }
      );
    }

    const partner = await prisma.strategicPartner.findUnique({
      where: {
        registrationToken: token,
      },
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Invalid registration link." },
        { status: 404 }
      );
    }

    const body = (await readJson(request,16384)) as {
      walletType?: unknown;
      action?: unknown;
      wallet?: unknown;
      changeReason?: unknown;
      robinhoodConfirmed?: unknown;
    };

    if (
      typeof body.walletType !== "string" ||
      !VALID_WALLET_TYPES.has(body.walletType as WalletType)
    ) {
      return NextResponse.json(
        { error: "Please select your wallet type." },
        { status: 400 }
      );
    }

    const walletType = body.walletType as WalletType;

    /*
     * Exchange/custodial wallets must not be confirmed blindly.
     * Unsure users are also routed to manual support.
     */
    if (walletType === "exchange" || walletType === "unsure") {
      await prisma.strategicPartner.update({
        where: {
          id: partner.id,
        },
        data: {
          walletType,
          status: "needs_help",
          robinhoodConfirmed: false,
          registeredAt: partner.registeredAt ?? new Date(),
        },
      });

      return NextResponse.json({
        ok: true,
        status: "needs_help",
      });
    }

    if (body.action !== "confirm" && body.action !== "change") {
      return NextResponse.json(
        { error: "Please confirm your wallet or request a change." },
        { status: 400 }
      );
    }

    if (body.action === "confirm") {
      if (!partner.originalWallet) {
        return NextResponse.json(
          { error: "No existing wallet is available to confirm." },
          { status: 400 }
        );
      }

      if (body.robinhoodConfirmed !== true) {
        return NextResponse.json(
          {
            error:
              "Please confirm that your wallet is ready to use on Robinhood Chain.",
          },
          { status: 400 }
        );
      }

      const now = new Date();

      await prisma.strategicPartner.update({
        where: {
          id: partner.id,
        },
        data: {
          walletType,
          registeredWallet: partner.originalWallet,
          status: "confirmed",
          robinhoodConfirmed: true,
          registeredAt: partner.registeredAt ?? now,
          confirmedAt: now,
          walletChangeReason: null,
          changeRequestedAt: null,
        },
      });

      return NextResponse.json({
        ok: true,
        status: "confirmed",
      });
    }

    const wallet =
      typeof body.wallet === "string"
        ? body.wallet.trim()
        : "";

    if (!wallet || !isAddress(wallet)) {
      return NextResponse.json(
        { error: "Enter a valid EVM wallet address." },
        { status: 400 }
      );
    }

    const reason =
      typeof body.changeReason === "string"
        ? body.changeReason.trim()
        : "";

    if (
      partner.originalWallet &&
      wallet.toLowerCase() === partner.originalWallet.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "This is the wallet already on record. Choose Confirm this wallet instead.",
        },
        { status: 400 }
      );
    }

    if(reason.length>2000)return NextResponse.json({error:"Change reason is too long."},{status:400});
    const now = new Date();

    await prisma.strategicPartner.update({
      where: {
        id: partner.id,
      },
      data: {
        walletType,
        registeredWallet: wallet,
        status: "change_requested",
        robinhoodConfirmed: false,
        walletChangeReason: reason || null,
        registeredAt: partner.registeredAt ?? now,
        changeRequestedAt: now,
        changeApprovedAt: null,
        confirmedAt: null,
      },
    });

    return NextResponse.json({
      ok: true,
      status: "change_requested",
    });
  } catch (error) {
    if(error instanceof RequestError)return securityFailure(error);
    console.error("Partner registration failed:", error);

    return NextResponse.json(
      {
        error: "Unable to save your wallet registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
