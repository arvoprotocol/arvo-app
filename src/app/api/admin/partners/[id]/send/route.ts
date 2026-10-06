import {requireSameOrigin,securityFailure,RequestError} from "@/lib/security/request";
import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { sendStrategicPartnerRegistrationEmail } from "@/lib/mail/platform";
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

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://arvoprotocol.com"
    ).replace(/\/+$/, "");

    const registrationUrl =
      `${siteUrl}/partner/${partner.registrationToken}`;

    await sendStrategicPartnerRegistrationEmail({
      name: partner.name,
      email: partner.email,
      registrationUrl,
    });

    await prisma.strategicPartner.update({
      where: { id: partner.id },
      data: {
        registrationSentAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      registrationUrl,
    });
  } catch (error) {
    if(error instanceof RequestError)return securityFailure(error);
    console.error("Partner registration email failed:", error);

    return NextResponse.json(
      { error: "Unable to send registration email." },
      { status: 500 }
    );
  }
}
