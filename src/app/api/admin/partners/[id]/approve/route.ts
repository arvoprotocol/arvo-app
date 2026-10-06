import {requireSameOrigin,securityFailure,RequestError} from "@/lib/security/request";
import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { sendStrategicPartnerConfirmationEmail } from "@/lib/mail/platform";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    requireSameOrigin(request);
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { error: "Admin authentication required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const partnerId = Number(id);

    if (!Number.isInteger(partnerId) || partnerId <= 0) {
      return NextResponse.json(
        { error: "Invalid partner." },
        { status: 400 }
      );
    }

    const partner = await prisma.strategicPartner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found." },
        { status: 404 }
      );
    }

    if (
      partner.status !== "change_requested" ||
      !partner.registeredWallet
    ) {
      return NextResponse.json(
        { error: "There is no wallet change awaiting approval." },
        { status: 400 }
      );
    }

    const now = new Date();

    const updated=await prisma.$transaction(async tx=>{
      const changed=await tx.strategicPartner.updateMany({where:{id:partner.id,status:"change_requested",registeredWallet:partner.registeredWallet,changeRequestedAt:partner.changeRequestedAt},data:{status:"confirmed",robinhoodConfirmed:true,confirmedAt:now,changeApprovedAt:now}});
      if(changed.count!==1)throw new RequestError("Partner details changed. Reload before approving.",409);
      return tx.strategicPartner.findUniqueOrThrow({where:{id:partner.id}});
    });

    try {
      await sendStrategicPartnerConfirmationEmail({
        name: updated.name,
        email: updated.email,
        wallet: updated.registeredWallet!,
      });
    } catch (emailError) {
      console.error(
        "Partner change approved but confirmation email failed:",
        emailError
      );

      return NextResponse.json({
        ok: true,
        emailWarning:
          "Wallet approved, but the confirmation email could not be sent.",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if(error instanceof RequestError)return securityFailure(error);
    console.error("Partner wallet approval failed:", error);

    return NextResponse.json(
      { error: "Unable to approve wallet change." },
      { status: 500 }
    );
  }
}
