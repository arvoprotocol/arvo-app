import { NextResponse } from "next/server";
import { limitRequest, readJson, RequestError, requireSameOrigin, securityFailure, validEmail } from "@/lib/security/request";
import { formField } from "@/lib/security/form-field";
import { sendTeamEnquiry, smtpConfigured } from "@/lib/mail/team-enquiry";
import { PARTNER_INTERESTS, PARTNER_SIZES, PARTNER_TYPES } from "@/lib/partnerships";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Private Partnerships: enquiry only. Emails the team; nothing is stored, offered or accepted here.
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    await limitRequest(request, "partnership-enquiry", 5);
    const body = await readJson(request, 16384) as Record<string, unknown>;
    if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true }); // honeypot

    const name = formField(body, "name", 120, true);
    const email = formField(body, "email", 254, true);
    const organisation = formField(body, "organisation", 160);
    const country = formField(body, "country", 80, true);
    const type = formField(body, "type", 60, true);
    const interest = formField(body, "interest", 60, true);
    const size = formField(body, "size", 40, true);
    const message = formField(body, "message", 4000, true, true);
    if (!validEmail(email)) throw new RequestError("Please enter a valid email address.");
    const one = (list: readonly string[], v: string) => list.includes(v);
    if (!one(PARTNER_TYPES, type) || !one(PARTNER_INTERESTS, interest) || !one(PARTNER_SIZES, size)) throw new RequestError("Please choose from the options.");
    if (body.consent !== true) throw new RequestError("Please confirm we can contact you about your enquiry.");

    if (!smtpConfigured()) return NextResponse.json({ error: "Enquiries aren’t available here yet. Please email team@arvoprotocol.com." }, { status: 503 });
    await sendTeamEnquiry({
      to: process.env.PARTNERSHIP_ENQUIRIES_TO,
      kicker: "Private partnerships enquiry",
      heading: organisation || name,
      subject: `Private partnerships enquiry: ${organisation || name} (${interest})`,
      replyTo: email,
      rows: [["Name", name], ["Email", email], ["Organisation", organisation || "—"], ["Country", country], ["Type", type], ["Interested in", interest], ["Indicative size", size]],
      bodyLabel: "Message",
      body: message,
      footer: "Private Partnerships enquiry form in the Arvo app. The sender agreed to be contacted about this enquiry.",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RequestError) return securityFailure(error);
    console.error("Partnership enquiry email error:", error);
    return NextResponse.json({ error: "We couldn’t send your enquiry. Please try again or email team@arvoprotocol.com." }, { status: 500 });
  }
}
