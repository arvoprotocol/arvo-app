import {requireSameOrigin,readJson,limitRequest,securityFailure,RequestError,validEmail} from "@/lib/security/request";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendPlatformSignupEmails } from "@/lib/mail/platform";

export const runtime = "nodejs";

type SignupType = "email" | "telegram";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_PATTERN = /^[a-zA-Z0-9_]{5,32}$/;

function normalize(type: SignupType, value: string) {
  const trimmed = value.trim();

  if (type === "email") {
    return trimmed.toLowerCase();
  }

  return trimmed.replace(/^@/, "").toLowerCase();
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);await limitRequest(request,"signup",10);
    const body = (await readJson(request,8192)) as {
      type?: unknown;
      contact?: unknown;
      website?: unknown;
    };

    // Honeypot. Real users never see or complete this field.
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true });
    }

    if (body.type !== "email" && body.type !== "telegram") {
      return NextResponse.json(
        { error: "Choose email or Telegram." },
        { status: 400 }
      );
    }

    if (typeof body.contact !== "string") {
      return NextResponse.json(
        { error: "Enter your contact details." },
        { status: 400 }
      );
    }

    const type: SignupType = body.type;
    const contact = body.contact.trim();

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

    const normalized = normalize(type, contact);

    const existing = await prisma.platformSignup.findUnique({
      where: {
        type_normalized: {
          type,
          normalized,
        },
      },
    });

    if (existing) {
      if (!existing.notifiedAt) {
        try {
          await sendPlatformSignupEmails({
            type,
            contact: existing.contact,
            createdAt: existing.createdAt,
          });

          await prisma.platformSignup.update({
            where: {
              id: existing.id,
            },
            data: {
              notifiedAt: new Date(),
            },
          });
        } catch (mailError) {
          console.error(
            "Existing platform signup email retry failed:",
            mailError
          );
        }
      }

      return NextResponse.json({
        ok: true,
        existing: true,
      });
    }

    const signup = await prisma.platformSignup.create({
      data: {
        type,
        contact: type === "telegram" ? `@${telegram}` : contact,
        normalized,
        source: "platform",
      },
    });

    try {
      await sendPlatformSignupEmails({
        type,
        contact: signup.contact,
        createdAt: signup.createdAt,
      });

      await prisma.platformSignup.update({
        where: {
          id: signup.id,
        },
        data: {
          notifiedAt: new Date(),
        },
      });
    } catch (mailError) {
      console.error(
        "Platform signup saved but email notification failed:",
        mailError
      );
    }

    return NextResponse.json(
      {
        ok: true,
        existing: false,
      },
      { status: 201 }
    );
  } catch (error) {
    if(error instanceof RequestError)return securityFailure(error);
    console.error("Platform signup failed:", error);

    return NextResponse.json(
      { error: "Unable to save your details. Please try again." },
      { status: 500 }
    );
  }
}
