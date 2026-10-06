import {requireSameOrigin,readJson,limitRequest,securityFailure,RequestError,validEmail} from "@/lib/security/request";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { isAddress } from "viem";

import { getAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);await limitRequest(request,"partner-create",40);
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { error: "Admin authentication required." },
        { status: 401 }
      );
    }

    const body = (await readJson(request,32768)) as {
      name?: unknown;
      email?: unknown;
      originalWallet?: unknown;
      notes?: unknown;
    };

    if (
      typeof body.name !== "string" ||
      typeof body.email !== "string"
    ) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const name = body.name.trim();
    const email = body.email.trim().toLowerCase();

    const originalWallet =
      typeof body.originalWallet === "string"
        ? body.originalWallet.trim()
        : "";

    const notes =
      typeof body.notes === "string"
        ? body.notes.trim()
        : "";

    if (notes.length>5000)return NextResponse.json({error:"Notes are too long."},{status:400});
    if (!name || name.length > 120) {
      return NextResponse.json(
        { error: "Enter a valid partner name." },
        { status: 400 }
      );
    }

    if (!validEmail(email) || email.length > 254) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (originalWallet && !isAddress(originalWallet)) {
      return NextResponse.json(
        { error: "The existing wallet is not a valid EVM address." },
        { status: 400 }
      );
    }

    const existing = await prisma.strategicPartner.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A partner with this email already exists." },
        { status: 409 }
      );
    }

    const partner = await prisma.strategicPartner.create({
      data: {
        name,
        email,
        originalWallet: originalWallet || null,
        notes: notes || null,
        registrationToken: randomBytes(32).toString("hex"),
      },
    });

    return NextResponse.json(
      {
        ok: true,
        partner: {
          id: partner.id,
          name: partner.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if(error instanceof RequestError)return securityFailure(error);
    console.error("Partner creation failed:", error);

    return NextResponse.json(
      { error: "Unable to create partner." },
      { status: 500 }
    );
  }
}
