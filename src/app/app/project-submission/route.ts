import { NextResponse } from "next/server";
import { limitRequest, readJson, RequestError, requireSameOrigin, securityFailure, validEmail } from "@/lib/security/request";
import { PROJECT_SEEKING, PROJECT_STAGES } from "@/lib/projects/submission";
import { formField } from "@/lib/security/form-field";
import { sendTeamEnquiry, smtpConfigured } from "@/lib/mail/team-enquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// "Bring your land project to Arvo": emails the submission to the team inbox.
// Nothing is stored and nothing is listed; the team reviews and replies by email.
// Without SMTP (staging) it answers 503 and sends nothing.

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    await limitRequest(request, "project-submission", 5);
    const body = await readJson(request, 16384) as Record<string, unknown>;
    if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true }); // honeypot

    const name = formField(body, "name", 120, true);
    const email = formField(body, "email", 254, true);
    const company = formField(body, "company", 160);
    const location = formField(body, "location", 160, true);
    const stage = formField(body, "stage", 60, true);
    const size = formField(body, "size", 80);
    const seeking = formField(body, "seeking", 60, true);
    const value = formField(body, "value", 80);
    const link = formField(body, "link", 500);
    const description = formField(body, "description", 4000, true, true);
    if (!validEmail(email)) throw new RequestError("Please enter a valid email address.");
    if (!(PROJECT_STAGES as readonly string[]).includes(stage) || !(PROJECT_SEEKING as readonly string[]).includes(seeking)) throw new RequestError("Please choose from the options.");
    if (link) { let ok = false; try { ok = new URL(link).protocol === "https:"; } catch {} if (!ok) throw new RequestError("Links must start with https://"); }
    if (body.consent !== true) throw new RequestError("Please confirm we can contact you about this project.");

    if (!smtpConfigured()) return NextResponse.json({ error: "Project submissions aren’t available here yet. Please email team@arvoprotocol.com." }, { status: 503 });
    const rows: [string, string][] = [["Name", name], ["Email", email], ["Company", company || "—"], ["Location", location], ["Stage", stage], ["Site size", size || "—"], ["Looking for", seeking], ["Value or amount", value || "—"], ["Link", link || "—"]];
    await sendTeamEnquiry({
      to: process.env.PROJECT_SUBMISSIONS_TO, kicker: "Project submission", heading: location, rows, bodyLabel: "About the project", body: description, replyTo: email,
      subject: `Project submission: ${location}${company ? ` (${company})` : ""}`,
      footer: "Projects page submission form. The sender agreed to be contacted about this project.",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RequestError) return securityFailure(error);
    console.error("Project submission email error:", error);
    return NextResponse.json({ error: "We couldn’t send your project. Please try again or email team@arvoprotocol.com." }, { status: 500 });
  }
}
