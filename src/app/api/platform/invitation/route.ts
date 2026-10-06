import {requireSameOrigin,readJson,limitRequest,securityFailure,RequestError,validEmail} from "@/lib/security/request";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type SignupType = "email" | "telegram";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_PATTERN = /^[a-zA-Z0-9_]{5,32}$/;

function normalizeContact(type: SignupType, value: string) {
  const trimmed = value.trim();

  if (type === "email") {
    return trimmed.toLowerCase();
  }

  return trimmed.replace(/^@/, "").toLowerCase();
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);await limitRequest(request,"invitation",10);
    const body = (await readJson(request,8192)) as {
      code?: unknown;
      type?: unknown;
      contact?: unknown;
      website?: unknown;
    };

    // Honeypot.
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true });
    }

    if (body.type !== "email" && body.type !== "telegram") {
      return NextResponse.json(
        { error: "Choose email or Telegram." },
        { status: 400 }
      );
    }

    if (
      typeof body.code !== "string" ||
      typeof body.contact !== "string"
    ) {
      return NextResponse.json(
        { error: "Enter your invitation code and contact details." },
        { status: 400 }
      );
    }

    const type: SignupType = body.type;
    const code = normalizeCode(body.code);
    const contact = body.contact.trim();

    if (!code || code.length > 64) {
      return NextResponse.json(
        { error: "Enter a valid invitation code." },
        { status: 400 }
      );
    }

    if (!contact || contact.length > 254) {
      return NextResponse.json(
        { error: "Enter valid contact details." },
        { status: 400 }
      );
    }

    if (type === "email" && !validEmail(contact)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const telegram = contact.replace(/^@/, "");

    if (type === "telegram" && !TELEGRAM_PATTERN.test(telegram)) {
      return NextResponse.json(
        { error: "Enter a valid Telegram username." },
        { status: 400 }
      );
    }

    const normalizedContact = normalizeContact(type, contact);

    const invitation = await prisma.invitationCode.findUnique({
      where: { code },
    });

    if (
      !invitation ||
      !invitation.isActive ||
      invitation.useCount >= invitation.maxUses
    ) {
      return NextResponse.json(
        { error: "This invitation code is invalid or no longer available." },
        { status: 400 }
      );
    }

    const now = new Date();

    await prisma.$transaction(async tx=>{
      const used=await tx.invitationCode.updateMany({where:{id:invitation.id,isActive:true,useCount:{lt:invitation.maxUses},maxUses:invitation.maxUses},data:{useCount:{increment:1},claimedBy:normalizedContact,claimedType:type,claimedAt:now}});
      if(used.count!==1)throw new RequestError("This invitation code is invalid or no longer available.",409);
      await tx.platformSignup.upsert({where:{type_normalized:{type,normalized:normalizedContact}},update:{source:"invitation"},create:{type,contact:type==="telegram"?`@${telegram}`:contact,normalized:normalizedContact,source:"invitation"}});
    });

    return NextResponse.json({
      ok: true,
      message: "Invitation confirmed.",
    });
  } catch (error) {
    if(error instanceof RequestError)return securityFailure(error);
    console.error("Invitation claim failed:", error);

    return NextResponse.json(
      { error: "Unable to confirm your invitation. Please try again." },
      { status: 500 }
    );
  }
}
