import {requireSameOrigin,readJson,limitRequest,securityFailure,RequestError,validEmail} from "@/lib/security/request";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/session";
import { sendAdminBroadcastEmail } from "@/lib/mail/platform";
import { unsubscribeUrls } from "@/lib/mail/unsubscribe";
import { invitationCodeFor } from "@/lib/admin/invitations";

export const runtime = "nodejs";

type Recipient = {
  email: string;
  name?: string | null;
};


function normaliseRecipients(input: unknown): Recipient[] {
  if (!Array.isArray(input)) return [];

  const seen = new Set<string>();
  const recipients: Recipient[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") continue;

    const record = item as Record<string, unknown>;
    const email =
      typeof record.email === "string"
        ? record.email.trim().toLowerCase()
        : "";

    const name =
      typeof record.name === "string" ? record.name.trim() : null;

    if (!validEmail(email) || seen.has(email)) continue;

    seen.add(email);
    recipients.push({
      email,
      name: name || null,
    });
  }

  return recipients;
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    requireSameOrigin(request);await limitRequest(request,"broadcast",10);
    const payload = await readJson(request,262144);

    const subject =
      typeof payload.subject === "string" ? payload.subject.trim() : "";

    const body =
      typeof payload.body === "string" ? payload.body.trim() : "";

    const mode = payload.mode === "test" ? "test" : "send";
    // Waitlist (marketing) mail carries unsubscribe links and skips anyone who
    // has unsubscribed. Partner/transactional mail is unchanged.
    const waitlist = payload.audience === "waitlist";
    let skipped = 0;

    if(subject.length>200||/[\r\n]/.test(subject)||body.length>20000)return NextResponse.json({error:"Email subject or content is too long or invalid."},{status:400});
    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required." },
        { status: 400 }
      );
    }

    if (!body) {
      return NextResponse.json(
        { error: "Email content is required." },
        { status: 400 }
      );
    }

    let recipients: Recipient[] = [];

    if (mode === "test") {
      const testEmail =
        typeof payload.testEmail === "string"
          ? payload.testEmail.trim().toLowerCase()
          : "";

      if (!validEmail(testEmail)) {
        return NextResponse.json(
          { error: "Enter a valid test email address." },
          { status: 400 }
        );
      }

      recipients = [
        {
          email: testEmail,
          name:
            typeof payload.testName === "string" && payload.testName.trim()
              ? payload.testName.trim()
              : "Test",
        },
      ];
    } else {
      recipients = normaliseRecipients(payload.recipients);
      if (waitlist && recipients.length) {
        const blocked = await prisma.platformSignup.findMany({
          where: { type: "email", normalized: { in: recipients.map(r => r.email) }, unsubscribedAt: { not: null } },
          select: { normalized: true },
        });
        const skip = new Set(blocked.map(row => row.normalized));
        const before = recipients.length;
        recipients = recipients.filter(r => !skip.has(r.email));
        skipped = before - recipients.length;
        if (!recipients.length) return NextResponse.json({ ok: true, sent: 0, skipped, mode });
      }

      if (!recipients.length) {
        return NextResponse.json(
          { error: "Add at least one recipient." },
          { status: 400 }
        );
      }
    }

    if(recipients.length>100)return NextResponse.json({error:"Send up to 100 recipients per batch."},{status:400});
    const failures: string[] = [];

    for (const recipient of recipients) {
      try {
        // [Invite code] gives each waitlist recipient their own reusable code.
        const personalBody = waitlist && /\[Invite code\]/i.test(body)
          ? body.replace(/\[Invite code\]/gi, await invitationCodeFor(recipient.email))
          : body;
        await sendAdminBroadcastEmail({
          recipient,
          subject,
          body: personalBody,
          unsubscribe: waitlist ? unsubscribeUrls(recipient.email) : undefined,
        });
      } catch (error) {
        console.error(
          `Broadcast email failed for ${recipient.email}:`,
          error
        );
        failures.push(recipient.email);
      }
    }

    const successful = recipients.filter(
      (recipient) => !failures.includes(recipient.email)
    );

    // Mark real waitlist sends so the Waitlist page can show who has been invited.
    if (successful.length && waitlist && mode !== "test") {
      await prisma.platformSignup.updateMany({ where: { type: "email", normalized: { in: successful.map(r => r.email) } }, data: { notifiedAt: new Date() } }).catch(() => undefined);
    }

    if (successful.length) {
      await prisma.adminBroadcastEmail.create({
        data: {
          subject,
          body,
          recipientCount: successful.length,
          recipientsJson: JSON.stringify(successful),
          isTest: mode === "test",
        },
      });
    }

    if (failures.length) {
      return NextResponse.json(
        {
          error:
            successful.length > 0
              ? `Sent to ${successful.length} recipient(s), but ${failures.length} failed.`
              : "The email could not be sent.",
          sent: successful.length,
          skipped,
          failed: failures,
        },
        { status: successful.length > 0 ? 207 : 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      sent: successful.length,
      skipped,
      mode,
    });
  } catch (error) {
    if(error instanceof RequestError)return securityFailure(error);
    console.error("Broadcast email error:", error);

    return NextResponse.json(
      { error: "Unable to send email." },
      { status: 500 }
    );
  }
}
