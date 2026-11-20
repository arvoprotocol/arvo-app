import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { limitRequest, readJson, RequestError, requireSameOrigin, securityFailure, validEmail } from "@/lib/security/request";
import { PROJECT_SEEKING, PROJECT_STAGES } from "@/lib/projects/submission";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// "Bring your land project to Arvo": emails the submission to the team inbox.
// Nothing is stored and nothing is listed; the team reviews and replies by email.
// Without SMTP (staging) it answers 503 and sends nothing.

const esc = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

function field(body: Record<string, unknown>, key: string, max: number, required = false, multiline = false) {
  const value = typeof body[key] === "string" ? (body[key] as string).trim() : "";
  if (required && !value) throw new RequestError("Please complete the required fields.");
  if (value.length > max) throw new RequestError("One or more fields are too long.");
  if (!multiline && /[\r\n]/.test(value)) throw new RequestError("Please check your details.");
  return value;
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    await limitRequest(request, "project-submission", 5);
    const body = await readJson(request, 16384) as Record<string, unknown>;
    if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true }); // honeypot

    const name = field(body, "name", 120, true);
    const email = field(body, "email", 254, true);
    const company = field(body, "company", 160);
    const location = field(body, "location", 160, true);
    const stage = field(body, "stage", 60, true);
    const size = field(body, "size", 80);
    const seeking = field(body, "seeking", 60, true);
    const value = field(body, "value", 80);
    const link = field(body, "link", 500);
    const description = field(body, "description", 4000, true, true);
    if (!validEmail(email)) throw new RequestError("Please enter a valid email address.");
    if (!(PROJECT_STAGES as readonly string[]).includes(stage) || !(PROJECT_SEEKING as readonly string[]).includes(seeking)) throw new RequestError("Please choose from the options.");
    if (link) { let ok = false; try { ok = new URL(link).protocol === "https:"; } catch {} if (!ok) throw new RequestError("Links must start with https://"); }
    if (body.consent !== true) throw new RequestError("Please confirm we can contact you about this project.");

    const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) return NextResponse.json({ error: "Project submissions aren’t available here yet. Please email team@arvoprotocol.com." }, { status: 503 });
    const transport = nodemailer.createTransport({ host, port: Number(process.env.SMTP_PORT || "465"), secure: process.env.SMTP_SECURE === "true", auth: { user, pass } });

    const rows: [string, string][] = [["Name", name], ["Email", email], ["Company", company || "—"], ["Location", location], ["Stage", stage], ["Site size", size || "—"], ["Looking for", seeking], ["Value or amount", value || "—"], ["Link", link || "—"]];
    const html = `<!doctype html><html><body style="margin:0;background:#07090b;font-family:Arial,Helvetica,sans-serif;color:#fff;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07090b;"><tr><td align="center" style="padding:40px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;"><tr><td style="padding:0 0 24px;"><img src="https://arvoprotocol.com/arvo-email-logo.png" width="150" alt="Arvo" style="display:block;width:150px;height:auto;border:0;"></td></tr><tr><td style="border:1px solid #292426;border-radius:18px;background:#0d0d0e;padding:40px;"><div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d9997b;">Project submission</div><h1 style="margin:18px 0 0;font-size:30px;line-height:36px;letter-spacing:-1px;color:#fff;">${esc(location)}</h1><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">${rows.map(([k, v]) => `<tr><td style="padding:12px 0;border-bottom:1px solid #242426;font-size:12px;color:#6f6f74;">${k}</td><td align="right" style="padding:12px 0;border-bottom:1px solid #242426;font-size:13px;font-weight:700;color:#fff;">${esc(v)}</td></tr>`).join("")}</table><div style="margin-top:26px;font-size:10px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;color:#66666b;">About the project</div><p style="margin:12px 0 0;font-size:15px;line-height:25px;color:#d0d0d2;">${esc(description).replace(/\n/g, "<br>")}</p></td></tr><tr><td style="padding:22px 8px 0;font-size:11px;line-height:18px;color:#69696d;">ARVO PROTOCOL<br>Projects page submission form. The sender agreed to be contacted about this project.</td></tr></table></td></tr></table></body></html>`;

    await transport.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "Arvo Protocol"}" <${process.env.MAIL_FROM_ADDRESS || "team@arvoprotocol.com"}>`,
      to: process.env.PROJECT_SUBMISSIONS_TO || process.env.MAIL_TEAM_ADDRESS || "team@arvoprotocol.com",
      replyTo: { address: email },
      subject: `Project submission: ${location}${company ? ` (${company})` : ""}`,
      html,
      text: ["New Arvo project submission", "", ...rows.map(([k, v]) => `${k}: ${v}`), "", "About the project:", description].join("\n"),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RequestError) return securityFailure(error);
    console.error("Project submission email error:", error);
    return NextResponse.json({ error: "We couldn’t send your project. Please try again or email team@arvoprotocol.com." }, { status: 500 });
  }
}
