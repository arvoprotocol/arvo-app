import {requireSameOrigin,readJson,limitRequest,securityFailure,RequestError,validEmail} from "@/lib/security/request";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user,
      pass,
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fromAddress() {
  const name = process.env.MAIL_FROM_NAME || "Arvo Protocol";
  const address =
    process.env.MAIL_FROM_ADDRESS || "team@arvoprotocol.com";

  return `"${name}" <${address}>`;
}

function isValidEmail(value: string) {
  return validEmail(value);
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);await limitRequest(request,"contact",5);
    const body = await readJson(request,32768);

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim() : "";
    const subject =
      typeof body.subject === "string" ? body.subject.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    const website =
      typeof body.website === "string" ? body.website.trim() : "";

    // Honeypot. Real users never see or complete this field.
    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please complete all fields." },
        { status: 400 }
      );
    }

    if(/[\r\n]/.test(name)||/[\r\n]/.test(subject))return NextResponse.json({error:"Enter a valid name and subject."},{status:400});
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (
      name.length > 120 ||
      email.length > 254 ||
      subject.length > 200 ||
      message.length > 5000
    ) {
      return NextResponse.json(
        { error: "One or more fields are too long." },
        { status: 400 }
      );
    }

    const transport = getTransport();

    const teamAddress =
      process.env.MAIL_TEAM_ADDRESS || "team@arvoprotocol.com";

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    await transport.sendMail({
      from: fromAddress(),
      to: teamAddress,
      replyTo: {address:email},
      subject: `Arvo website enquiry: ${subject}`,
      html: `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#07090b;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#07090b;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;">
            <tr>
              <td style="padding:0 0 24px;">
                <img
                  src="https://arvoprotocol.com/arvo-email-logo.png"
                  width="150"
                  alt="Arvo"
                  style="display:block;width:150px;max-width:100%;height:auto;border:0;"
                >
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #292426;border-radius:18px;background:#0d0d0e;padding:42px 40px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d9997b;">
                  Website enquiry
                </div>

                <h1 style="margin:18px 0 0;font-size:32px;line-height:38px;letter-spacing:-1.2px;color:#ffffff;">
                  New contact message.
                </h1>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:30px;">
                  <tr>
                    <td style="padding:13px 0;border-bottom:1px solid #242426;font-size:12px;color:#6f6f74;">
                      Name
                    </td>
                    <td align="right" style="padding:13px 0;border-bottom:1px solid #242426;font-size:13px;font-weight:700;color:#ffffff;">
                      ${safeName}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:13px 0;border-bottom:1px solid #242426;font-size:12px;color:#6f6f74;">
                      Email
                    </td>
                    <td align="right" style="padding:13px 0;border-bottom:1px solid #242426;font-size:13px;font-weight:700;color:#ffffff;">
                      ${safeEmail}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:13px 0;font-size:12px;color:#6f6f74;">
                      Subject
                    </td>
                    <td align="right" style="padding:13px 0;font-size:13px;font-weight:700;color:#ffffff;">
                      ${safeSubject}
                    </td>
                  </tr>
                </table>

                <div style="margin-top:28px;padding-top:26px;border-top:1px solid #242426;">
                  <div style="font-size:10px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;color:#66666b;">
                    Message
                  </div>

                  <p style="margin:14px 0 0;font-size:15px;line-height:25px;color:#d0d0d2;">
                    ${safeMessage}
                  </p>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 8px 0;font-size:11px;line-height:18px;color:#69696d;">
                ARVO PROTOCOL<br>
                Website contact form
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
      `,
      text: [
        "New Arvo website enquiry",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if(error instanceof RequestError)return securityFailure(error);
    console.error("Contact form email error:", error);

    return NextResponse.json(
      { error: "We couldn't send your message. Please try again." },
      { status: 500 }
    );
  }
}
